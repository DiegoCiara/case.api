import Workspace from '@entities/Workspace';
import { Request, Response } from 'express';
import LandingPage from '@entities/LandingPage';
import { getRepository } from 'typeorm';
import { generateColor } from '@utils/generateColor';
import { log } from '@utils/createLog';
import Pipeline from '@entities/Pipeline';
import Group from '@entities/Group';
import Commission from '@entities/Commission';
import Origin from '@entities/Origin';
import { decrypt } from '@utils/encrypt';
import compareApiKey from '@utils/compareApiKey';
import { checkContact, hasContact } from '@utils/openai/checks/checkContact';
import Contact from '@entities/Contact';
import Customer from '@entities/Customer';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import Deal from '@entities/Deal';
import Sale from '@entities/Sale';
import Assistant from '@entities/Assistant';
import { openaiText } from '@utils/openai/functions/openaiText';
import { sendMessage } from '@utils/whatsapp/whatsapp';
import { assistants } from '@utils/dataMock';
import Thread from '@entities/Thread';
import eventEmitter from '@utils/emitter';
import Profile from '@entities/Profile';
import { sendToQueue } from '@utils/rabbitMq/send';
import { processQueue } from '@utils/rabbitMq/proccess';
import { formatPhone } from '@utils/format';
import { notify } from '@utils/createNotifications';
import Notification from '@entities/Notification';

interface LandingPageInterface {
  name: string;
  initialPricing?: number;
  commission?: Commission;
  group?: Group;
  profiles?: Profile[];
  origin?: Origin;
  pipeline?: Pipeline;
  workspace?: Workspace;
  assistantInstructions?: string;
  assistant: Assistant;
  redirectTo?: string;
  enableCustomerSelectProfile?: boolean;
  hasFollowUp?: boolean;
  domain?: string;
}

class LandingPageController {
  public async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      const workspace = await Workspace.findOne(id);

      if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

      const groups = await LandingPage.find({
        where: { workspace: workspace },
        relations: ['group', 'commission', 'pipeline', 'origin'],
        order: { createdAt: 'ASC' },
      });

      await log('landingpages', req, 'findAll', 'success', JSON.stringify({ id: id }), id);

      return res.status(200).json(groups);
    } catch (error) {
      console.error(error);
      await log('landingpages', req, 'findAll', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find customers, try again' });
    }
  }
  public async findById(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Please send a landingpage id' });

      const group = await LandingPage.findOne(id, {
        relations: [
          'group',
          'group.profiles',
          'profiles',
          'commission',
          'commission.product',
          'commission.partner',
          'commission.bank',
          'assistant',
          'origin',
          'pipeline',
          'pipeline.funnel',
        ],
      });


      await log('landingpages', req, 'findById', 'success', JSON.stringify({ id: id }), id);

      return res.status(200).json(group);
    } catch (error) {
      await log('landingpages', req, 'findById', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find groups, try again' });
    }
  }

  public async createLead(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!id || !uuidValidate(id))
        return res.status(400).json({ message: 'Esta página não existe, volte para página inicial para prosseguir' });


      const apiKey = req.header('apiKey');

      if (!apiKey) return res.status(401).json({ message: 'API Key not provided' });

      const keyCompared = await compareApiKey(apiKey);

      if (!keyCompared) return res.status(401).json({ message: 'API Key is not valid' });

      const { name, cpfCnpj, phone, email, date, profiles, observations, group } = req.body;

      if (!id) return res.status(400).json({ message: 'Esta página não existe, volte para página inicial para prosseguir' });

      const page = await LandingPage.findOne(id, {
        relations: ['group', 'origin', 'pipeline','pipeline.funnel', 'commission', 'workspace', 'assistant', 'assistant.session', 'profiles'],
      });

      if (!page) return res.status(404).json({ message: 'Página não encontrada' });

      if (!name || name.trim() === '') return res.status(400).json({ message: 'Nome não informado' });

      if (!phone || phone.trim() === '') return res.status(400).json({ message: 'Telefone não informado' });

      const workspace = page.workspace;

      const assistant = page.assistant;

      const hasContactCreated = await hasContact(formatPhone(phone), email, workspace);

      if (hasContactCreated) return res.status(400).json({ message: 'Telefone já cadastrado', contact: hasContactCreated });

      if(cpfCnpj){
        const hasCustomer = await Customer.findOne({ where: { cpfCnpj: cpfCnpj.replace(/\D/g, ''), workspace } });
        if (hasCustomer) return res.status(401).json({ message: 'CPF já cadastrado' });
      }

      const contact = await checkContact('wpp', formatPhone(phone), email || null, workspace!);

      if (!contact) return res.status(400).json({ message: 'Algo deu errado, tente novamente' });

      let groups = [];

      if(group){
        groups.push(group);
      } else {
        groups.push(page.group);
      }

      const customer = await Customer.create({
        name,
        origin: page.origin,
        cpfCnpj: cpfCnpj?.replace(/\D/g, '') || '',
        contact,
        workspace: page.workspace,
        profiles: page.enableCustomerSelectProfile ? profiles : page.profiles,
        activity: [],
        groups,
      }).save();

      const activityCreated = {
        name: 'Contato criado por Landing Page',
        description: `Contato criado pela Landing Page: ${page?.name}`,
        createdBy: null,
        json: JSON.stringify(req.body, null, 2),
        createdAt: date!,
      };

      customer?.activity?.push(activityCreated);
      await customer.save();

      if (!customer) return res.status(404).json({ message: 'Algo deu errado, tente novamente' });

      const deal = await Deal.create({ customer, pipeline: page.pipeline, workspace: page.workspace, activity: [], observations }).save();

      const activityDealCreated = {
        name: 'Negociação criada por Landing Page',
        description: `Contato criado pela Landing Page: ${page?.name}`,
        createdBy: null,
        json: JSON.stringify(req.body, null, 2),
        createdAt: date!,
      };

      deal?.activity?.push(activityDealCreated);

      if (page.commission) {
        await Sale.create({ commission: page.commission, value: page.initialPricing || 0, deal, workspace: page.workspace }).save();
      }

      if (page.hasFollowUp) {
        const data = `Segue os dados do cadastro: \nNome: ${name};\nCPF: ${cpfCnpj}\nTelefone:${phone}`;
        const followUpPayload = {
          workspaceId: workspace.id,
          assistantId: assistant.id,
          phone: formatPhone(phone),
          data: data,
          contactId: contact.id,
          pageId: page.id,
          followUpType: page.followUpType,
        };

        // Envia as funções openaiText e sendMessage para a fila RabbitMQ
        await sendToQueue('followUpQueue', (followUpPayload));
        eventEmitter.emit(`proccessQueue`);
        // processQueue()
      }

      await log('landingpages', req, 'findById', 'success', JSON.stringify({ id: id }), page);

      notify(workspace, {
        workspace,
        name: 'Cliente criado via Landing Page',
        description: `Cliente ${customer.name} criado pela Landing Page ${page.name}`,
        role: 'SELLER',
      } as Notification);

      eventEmitter.emit(`pipelineDeals`, page?.pipeline?.funnel?.id);

      const returned = {
        id: page.id,
        groupName: page.group.name,
      };

      return res.status(200).json(returned);
    } catch (error) {
      await log('landingpages', req, 'findById', 'failed', JSON.stringify(error), null);
      console.log('error', error);
      return res.status(500).json({ message: 'Algo deu errado, tente novamente' });
    }
  }

  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const {
        name,
        group,
        pipeline,
        commission,
        origin,
        initialPricing,
        assistantInstructions,
        assistant,
        enableCustomerSelectProfile,
        profiles,
        redirectTo,
        domain,
        hasFollowUp,
      }: LandingPageInterface = req.body;

      const workspaceFind = await Workspace.findOne(id);

      if (!name) return res.status(400).json({ message: 'Invalid product name' });

      const hasItem = await LandingPage.findOne({ name })

      if(hasItem) return res.status(400).json({ message: 'Já existe um produto cadastrado com este nome.' });

      const landingpage = await LandingPage.create({
        name,
        workspace: workspaceFind,
        group,
        pipeline,
        commission,
        initialPricing,
        origin,
        profiles,
        assistant,
        assistantInstructions,
        enableCustomerSelectProfile,
        hasFollowUp,
        redirectTo,
        domain,
      }).save();

      await log('landingpages', req, 'create', 'success', JSON.stringify({ id: id }), landingpage);

      return res.status(201).json(landingpage);
    } catch (error) {
      console.error(error);
      await log('landingpages', req, 'create', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Create failed, try again' });
    }
  }

  public async getLandingPage(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!id || !uuidValidate(id)) return res.status(400).json({ message: 'Please send a landingpage id' });

      const apiKey = req.header('apiKey'); // Agora o header é 'apiKey'

      if (!apiKey) return res.status(401).json({ message: 'API Key not provided' });

      const keyCompared = await compareApiKey(apiKey);

      if (!keyCompared) return res.status(401).json({ message: 'API Key is not valid' });

      const page = await LandingPage.findOne(id, { relations: ['group', 'profiles'] });

      if (!page) return res.status(404).json({ message: 'Page not found' });

      let returned = null;

      if (!page.enableCustomerSelectProfile) {
        returned = {
          id: page.id,
          groupName: page.group.name,
          redirect: page.redirectTo,
        };
      } else {
        returned = {
          id: page.id,
          groupName: page.group.name,
          redirect: page.redirectTo,
          profiles: page?.profiles,
        };
      }

      await log('landingpages', req, 'findById', 'success', JSON.stringify({ id: id }), returned);

      return res.status(200).json(returned);
    } catch (error) {
      await log('landingpages', req, 'findById', 'failed', JSON.stringify(error), null);
      console.log(error);
      return res.status(404).json({ message: 'Cannot find groups, try again' });
    }
  }

  // public async createLead(req: Request, res: Response): Promise<Response> {
  //   try {
  //     const id = req.params.id;
  //     const { name, group, pipeline, commission }: LandingPageInterface = req.body;

  //     const workspaceFind = await Workspace.findOne(id);

  //     const landingpage = await LandingPage.create({name, workspace: workspaceFind, group, pipeline, commission }).save()
  //     await log('landingpages', req, 'create', 'success', JSON.stringify({ id: id }), landingpage)

  //     return res.status(201).json(landingpage);
  //   } catch (error) {
  //     console.error(error)
  //     await log('landingpages', req, 'create', 'failed', JSON.stringify(error), null)
  //     return res.status(404).json({ message: 'Create failed, try again' });
  //   }
  // }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const {
        name,
        group,
        pipeline,
        origin,
        commission,
        initialPricing,
        assistant,
        assistantInstructions,
        profiles,
        enableCustomerSelectProfile,
        redirectTo,
        domain,
        hasFollowUp,
      }: LandingPageInterface = req.body;
      const id = req.params.id;



      const customer = await LandingPage.findOne(id, { relations: ['workspace'] });

      if (!customer) return res.status(404).json({ message: 'LandingPage does not exist' });


      customer.name = name || customer.name;
      customer.group = group!;
      customer.pipeline = pipeline || customer.pipeline;
      customer.origin = origin || customer.origin;
      customer.commission = commission || customer.commission;
      customer.initialPricing = initialPricing || customer.initialPricing;
      customer.assistantInstructions = assistantInstructions || customer.assistantInstructions;
      customer.redirectTo = redirectTo || customer.redirectTo;
      customer.domain = domain || customer.domain;
      customer.assistant = assistant || customer.assistant;
      (customer.enableCustomerSelectProfile = enableCustomerSelectProfile!), (customer.hasFollowUp = hasFollowUp!);
      customer.profiles = profiles!;

      await customer.save();

      await log('landingpages', req, 'update', 'success', JSON.stringify({ id: id }), customer);

      return res.status(200).json({ message: 'LandingPage updated successfully' });
    } catch (error) {
      console.error(error);
      await log('landingpages', req, 'update', 'failed', JSON.stringify(error), null);

      return res.status(404).json({ error: 'Update failed, try again' });
    }
  }
  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Please send a customer id' });

      const customer = await LandingPage.findOne(id);

      if (!customer) return res.status(404).json({ message: 'Cannot find customer' });

      await LandingPage.update(customer.id, { active: !customer.active });
      await log('landingpages', req, 'archive', 'success', JSON.stringify({ id: id }), customer);

      return res.status(200).json({ message: 'Customer archived successfully' });
    } catch (error) {
      console.error(error);
      await log('landingpages', req, 'archive', 'failed', JSON.stringify(error), null);
      return res.status(500).json({ error: 'Remove failed, try again' });
    }
  }
}

export default new LandingPageController();

