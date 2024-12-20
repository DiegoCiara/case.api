import axios from 'axios';
import { Request, Response } from 'express';
import queryBuilder from '@utils/queryBuilder';
import Workspace from '@entities/Workspace';
import Contact from '@entities/Contact';
import Deal from '@entities/Deal';
import Thread from '@entities/Thread';
import { getRepository } from 'typeorm';
import Customer from '@entities/Customer';
import { hasContact } from '@utils/openai/checks/checkContact';
import User from '@entities/User';
import AWS from 'aws-sdk';
import fs from 'fs';
import Document from '@entities/Document';
import Group from '@entities/Group';
import { log } from '@utils/createLog';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import crypto from 'crypto';
import Origin from '@entities/Origin';
import Profile from '@entities/Profile';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import sendMail from '@src/services/sendEmail';
import generatePassword from '@utils/generatePassword';
import { firstName } from '@utils/format';
import { sendToQueue } from '@utils/rabbitMq/send';
import Assistant from '@entities/Assistant';
import { checkThread } from '@utils/openai/checks/checkThread';
import { decrypt } from '@utils/encrypt';
import OpenAI from 'openai';
import { processThreads } from '@utils/rabbitMq/chat/thread/thread';

interface CustomerInterface {
  id?: string;
  name?: string;
  cpfCnpj?: string;
  phone?: string;
  email?: string;
  contact?: Contact;
  origin?: Origin;
  groups?: Group[];
  profiles?: Profile[];
  contactId?: string;
  userId?: string;
  date?: Date;
}

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-2',
});

const bucketName = process.env.AWS_BUCKET_NAME;

const s3 = new AWS.S3();

function generateToken(params = {}) {
  return jwt.sign(params, `${process.env.SECRET}`, { expiresIn: 84600 });
}

class CustomerController {
  public async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      const workspace = await Workspace.findOne(id);

      if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

      const customers = await getRepository(Customer)
        .createQueryBuilder('customer')
        .leftJoinAndSelect('customer.contact', 'contact')
        .leftJoinAndSelect('customer.groups', 'groups')
        .leftJoinAndSelect('customer.profiles', 'profiles')
        .leftJoinAndSelect('customer.origin', 'origin')
        .where('customer.workspace = :workspaceId', { workspaceId: workspace.id })
        .orderBy('contact.updatedAt', 'DESC') // Ordena pela data de atualização em ordem decrescente
        .getMany();



      const customerResponse = customers?.map((e) => {
        const groupNames = e.groups.map((e) => {
          return e.name;
        });
        const profileNames = e.profiles.map((e) => {
          return e.name;
        });
        return {
          id: e?.id,
          customerName: e?.name,
          customerCpfCnpj: e?.cpfCnpj,
          contactPhone: e?.contact?.phone,
          profileNames: profileNames || [],
          groupNames: groupNames || [],
          originName: e?.origin?.name,
          createdAt: e?.createdAt,
          active: e?.active ? true : false,
        }
      })

      await log('customers', req, 'findAll', 'success', JSON.stringify(workspace), id);
      return res.status(200).json(customerResponse);
    } catch (error) {
      console.error(error);
      await log('customers', req, 'findAll', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find customers, try again' });
    }
  }
  public async findById(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      if (!id) return res.status(400).json({ message: 'Please send a customer id' });
      const customer = await Customer.findOne(id, {
        relations: [
          'contact',
          'deals',
          'deals.pipeline',
          'deals.workspace',
          'deals.customer',
          'deals.user',
          'deals.sales',
          'deals.tasks',
          'origin',
          'profiles',
          'groups',
          'documents',
        ],
      });

      console.log(customer?.deals)

      await log('customers', req, 'findById', 'success', JSON.stringify(id), id);
      return res.status(200).json(customer);
    } catch (error) {
      console.error(error);
      await log('customers', req, 'findById', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find customers, try again' });
    }
  }

  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const { name, cpfCnpj, phone, email, contactId, origin, profiles, userId, groups, date }: CustomerInterface = req.body;



      const workspaceFind = await Workspace.findOne(id);

      const hasCustomerCreated = await Customer.findOne({ cpfCnpj: cpfCnpj!.replace(/\D/g, '') , workspace: workspaceFind})

      if (hasCustomerCreated)
        return res.status(400).json({
          message: 'Já existe um cliente com este CPF/CNPJ, forneça dados diferentes ou atualize o cliente existente.',
          contact: hasCustomerCreated,
        });


      const user = await User.findOne(req.userId);

      if (!workspaceFind) return res.status(404).json({ message: 'Assistente não encontrado' });

      if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

      if (!name) return res.status(400).json({ message: 'Nome do cliente não informado' });

      const hasContactCreated = await hasContact(phone, email, workspaceFind);

      if (hasContactCreated)
        return res.status(400).json({
          message: 'Já existe um contato com estes dados, forneça dados diferentes ou atualize o contato do cliente existente',
          contact: hasContactCreated,
        });

      let contact = null;

      if (!contactId) {
        contact = await Contact.create({ phone: phone!.replace(/\D/g, ''), email, workspace: workspaceFind }).save();
      } else {
        contact = await Contact.findOne(contactId);
      }

      const hasCustomer = await Customer.findOne({ where: { contact: contact } });

      if (hasCustomer)
        return res
          .status(401)
          .json({ message: 'Já existe um cliene para este contato, escolha um contato diferente ou atualize o cliente existente' });

      if (!contact) return res.status(400).json({ message: 'Cannot create contact for customer' });

      const customer = await Customer.create({
        name,
        origin,
        cpfCnpj: cpfCnpj?.replace(/\D/g, '') || '',
        contact,
        workspace: workspaceFind,
        activity: [],
        groups,
        profiles
      }).save();

      if (!customer) return res.status(400).json({ message: 'Cannot create customer' });

      const {
        activity: _,
        workspace: __,
        contact: { workspace, ...contactWithoutAssistant },
        ...customerWithoutActivityAndUser
      } = customer;
      const { passwordHash, passwordResetToken, passwordResetExpires, ...userWithoutPasswordHash } = user;
      const customerForJson = {
        ...customerWithoutActivityAndUser,
        contact: contactWithoutAssistant, // Usar contact sem workspace
        user: userWithoutPasswordHash,
      };
      const activityCreated = {
        name: 'Contato criado',
        description: `Contato criado pelo usuário ${user.name}`,
        createdBy: user!,
        json: JSON.stringify(req.body, null, 2),
        createdAt: date!,
      };
      customer?.activity?.push(activityCreated);
      await customer.save();

      await log('customers', req, 'create', 'success', JSON.stringify(req.body), customer);
      return res.status(201).json({ id: customer.id, message: 'Customer created successfully' });
    } catch (error) {
      console.error(error);
      await log('customers', req, 'create', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Create faileds, try again' });
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { name, cpfCnpj, phone, email, origin, userId, profiles, groups, date }: CustomerInterface = req.body;
      const id = req.params.id;

      const customerRepository = getRepository(Customer);
      const customer = await customerRepository.findOne(id, { relations: ['workspace', 'contact', 'origin'] });



      if (!customer) return res.status(404).json({ message: 'Este cliente não existe' });

      customer.name = name || customer.name;
      customer.cpfCnpj = cpfCnpj?.replace(/\D/g, '') || customer?.cpfCnpj;
      customer.origin = origin || customer?.origin;

      if (groups) {
        const groupRepository = getRepository(Group);
        customer.groups = await groupRepository.findByIds(groups);
      }



      if (profiles) {
        const profileRepository = getRepository(Profile);
        customer.profiles = await profileRepository.findByIds(profiles);
      }

      const user = await User.findOne(req.userId);


      if (!name || !user) return res.status(400).json({ message: 'Bad request' });

      const valuesToUpdate: CustomerInterface = {
        phone: phone!.replace(/\D/g, '') || customer.contact.phone.replace(/\D/g, ''),
        email: email || customer.contact.email,
        // origin: origin || customer.origin
      };

      await Contact.update(customer.contact.id, { ...valuesToUpdate });

      if(!customer.activity){
        customer.activity = []
      }

      const {
        activity: _,
        workspace: __,
        contact: { workspace, ...contactWithoutAssistant },
        ...customerWithoutActivityAndUser
      } = customer;
      const { passwordHash, passwordResetToken, passwordResetExpires, ...userWithoutPasswordHash } = user;
      const customerForJson = {
        name,
        cpfCnpj,
        phone,
        email,
        groups,
      };

      const activityCreated = {
        name: 'Contato Atualizado',
        description: `O usuário ${user.name} atualizou os dados do contato`,
        createdBy: user!,
        json: JSON.stringify(customerForJson, null, 2),
        createdAt: date!,
      };

      customer.activity?.push(activityCreated);

      await customer.save();

      console.log(customer)
      await log('customers', req, 'update', 'success', JSON.stringify(req.body), customer);
      return res.status(200).json({ message: 'Usuário atualizado com sucesso' });
    } catch (error) {
      console.error(error);
      await log('customers', req, 'update', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ error: 'Falha na atualização, tente novamente.' });
    }
  }

  public async updateContact(req: Request, res: Response): Promise<Response> {
    try {
      const { phone, email }: CustomerInterface = req.body;
      const id = req.params.id;

      const customer = await Customer.findOne(id, { relations: ['contact'] });

      if (!customer) return res.status(404).json({ message: 'Customer does not exist' });

      await log('customers', req, 'updateContact', 'success', JSON.stringify(req.body), customer);
      return res.status(200).json({ message: 'Customer updated successfully' });
    } catch (error) {
      console.error(error);
      await log('customers', req, 'updateContact', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ error: 'Update failed, try again' });
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Please send a customer id' });

      const customer = await Customer.findOne(id, { relations: ['contact', 'contact.threads', 'deals'] });

      if (!customer) return res.status(404).json({ message: 'Cannot find customer' });

      const contact = customer.contact;
      const deals = customer.deals;
      const threads = contact.threads;

      const isArchiveCustomer = customer.active === true;
      if (isArchiveCustomer) {
        for (const deal of deals) {
          await Deal.update(deal.id, { status: 'ARCHIVED' });
        }

        for (const thread of threads) {
          await Thread.update(thread.id, { chatActive: false });
        }

        await Customer.update(customer.id, { active: false });
      } else {
        await Customer.update(customer.id, { active: true });
      }
      // await Contact.softRemove(customer.contact);

      //Deals do customer
      //Threads do contact

      // const { activity: _, workspace:__, contact: { workspace, ...contactWithoutAssistant }, ...customerWithoutActivityAndUser } = customer;
      // const { passwordHash, passwordResetToken, passwordResetExpires, ...userWithoutPasswordHash } = user;
      // const customerForJson = {
      //   ...customerWithoutActivityAndUser,
      //   // workspace: workspaceWithoutApiKey,
      //   contact: contactWithoutAssistant,  // Usar contact sem workspace
      //   user: userWithoutPasswordHash,
      // };
      // const activityCreated = {
      //   name: 'Contato arquivado',
      //   description: `Contato criado pelo usuário ${user.name}`,
      //   createdBy: user!,
      //   json: JSON.stringify(customerForJson, null, 2),
      //   createdAt: new Date(),
      // };
      // customer?.activity?.push(activityCreated);
      // await customer.save();

      await log('customers', req, 'archive', 'success', JSON.stringify(id), customer);
      return res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (error) {
      console.error(error);
      await log('customers', req, 'archive', 'failed', JSON.stringify(error), null);
      return res.status(500).json({ error: 'Remove failed, try again' });
    }
  }
  public async getDocuments(req: Request, res: Response): Promise<Response> {
    const id = req.params.id;

    try {
      const customer = await Customer.findOne(id, { relations: ['documents'] });

      if (!customer) return res.status(404).json({ message: 'Contato não encontrado' });

      await log('customers', req, 'getDocuments', 'success', JSON.stringify(customer?.documents), customer);
      return res.status(200).json(customer?.documents);
    } catch (error) {
      console.error(error);
      await log('customers', req, 'getDocuments', 'failed', JSON.stringify(error), null);
      return res.status(500).json({ message: 'Cannot find data for AI, try again' });
    }
  }
  public async uploadFile(req: Request, res: Response): Promise<Response> {
    const { id, workspaceId } = req.params;
    try {
      const file = req.file; // 'file' deve ser a chave usada no multer ou middleware equivalente
      if (!file) {
        return res.status(400).json({ message: 'Documento não informado' });
      }

      const body = JSON.parse(req.body.body);
      const { name } = body;

      const workspace = await Workspace.findOne(workspaceId);

      const customer = await Customer.findOne(id, { where: { workspace: workspace } });

      if (!workspace || !customer) {
        return res.status(400).json({ message: 'Assistente ou Contato não encontrados' });
      }
      if (!name) {
        return res.status(400).json({ message: 'Nome do arquivo não informado' });
      }

      const fileId = uuidv4();

      const fileContent = fs.readFileSync(file.path);

      // Configurar parâmetros para o upload do S3
      const params = {
        Bucket: bucketName!,
        Key: `workspace:${workspace.id}/customers/customer:${customer.id}/file:${fileId}`, // Nome do arquivo no bucket
        Body: fileContent,
        ContentType: file.mimetype,
      };

      // Fazer o upload do arquivo para o bucket S3
      const s3Response = await s3.upload(params).promise();
      // Deletar o arquivo temporário

      const document = await Document.create({
        name: name,
        link: s3Response.Location,
        customer: customer,
        fileId,
        workspace: workspace,
      }).save();

      fs.unlinkSync(file.path);

      await log('customers', req, 'uploadFile', 'success', JSON.stringify(document), document);
      return res.status(200).json(document);
    } catch (error) {
      console.error(error);
      await log('customers', req, 'uploadFile', 'failed', JSON.stringify(error), null);
      return res.status(500).json({ message: 'Falha ao realizar upload, tente novamente.' });
    }
  }
  public async deleteFile(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const file = req.body; // 'file' deve ser a chave usada no multer ou middleware equivalente
      if (!file) {
        return res.status(400).json({ message: 'No file for delete' });
      }
      const workspaceFind = await Workspace.findOne(id);

      if (!workspaceFind) {
        return res.status(400).json({ message: 'No file for delete' });
      }
      const deleteDocument = await Document.findOne(file.id, { where: { workspace: workspaceFind }, relations: ['customer'] });

      if (!deleteDocument) {
        return res.status(404).json({ message: 'No file found' });
      }

      const params = {
        Bucket: bucketName!,
        Key: `workspace:${workspaceFind.id}/customers/customer:${deleteDocument.customer.id}/file:${deleteDocument.fileId}`, // Nome do arquivo no bucket, // The key of the object to delete
      };
      await s3.deleteObject(params).promise();
      console.log(`Object deleted successfully from ${bucketName}`);
      await Document.softRemove(deleteDocument!);
      await log('customers', req, 'deleteFile', 'success', JSON.stringify(deleteDocument), deleteDocument);
      return res.status(200).json(deleteDocument);
    } catch (error) {
      console.error(error);
      await log('customers', req, 'deleteFile', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find data for AI, try again' });
    }
  }
  public async editFile(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const file = req.body; // 'file' deve ser a chave usada no multer ou middleware equivalente

      if (!file) {
        return res.status(400).json({ message: 'No file for change' });
      }
      const workspaceFind = await Workspace.findOne(id);

      if (!workspaceFind) {
        return res.status(400).json({ message: 'Workspace Found' });
      }

      const document = await Document.findOne(file.id, { where: { workspace: workspaceFind } });

      if (!document) {
        return res.status(400).json({ message: 'No document found' });
      }

      await Document.update(document.id, { name: file.name });

      await log('customers', req, 'editFile', 'success', JSON.stringify(document), document);
      return res.status(200).json({ message: 'Update success' });
    } catch (error) {
      console.error(error);
      await log('customers', req, 'editFile', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find data for AI, try again' });
    }
  }
  public async createPass(req: Request, res: Response): Promise<Response> {
    try {
      const {id, workspaceId, url} = req.body;

      if (!id || !uuidValidate(id) || !workspaceId || !uuidValidate(workspaceId)) return res.status(400).json({ message: 'Invalid values for Workspace' });

      console.log(req.body)

      const customerRepository = getRepository(Customer);
      const customer = await customerRepository.findOne(id, { relations: ['contact', 'workspace']});

      if(!customer) res.status(404).json({ message: 'Customer not found' });

      if(!customer!.contact || !customer?.contact.email) res.status(404).json({ message: 'Customer not found' });

      const workspace = await Workspace.findOne(workspaceId);

      if(!workspace || workspace.id !== customer?.workspace.id) res.status(404).json({ message: 'Customer not found' });

      const token = crypto.randomBytes(20).toString('hex'); // token que será enviado via email.

      const password = generatePassword();

      const passwordHash = await bcrypt.hash(password, 10);

      const now = new Date();
      now.setHours(now.getHours() + 1);

      const access = {
        passwordHash: passwordHash,
        passwordResetToken: token,
        passwordResetExpires: now,
        hasResetPass: false,//Guarda se o usuário resetou a senha
        picture: '', //foto da conta do usuário no workspace
      }

      customer!.auth = access;

      await customer!.save()
      const userName = firstName(customer!.name);

      sendMail('newUserCustomer.html', 'acesso', `Bem vindo ${userName}`, { url, workspacePicture: workspace.picture, name: customer!.name, email: customer!.contact.email, password });

      await log('customers', req, 'createPass', 'success', JSON.stringify(customer), customer);
      return res.status(200).json({ message: 'Update success' });
    } catch (error) {
      console.error(error);
      await log('customers', req, 'createPass', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find data for AI, try again' });
    }
  }

  public async authenticate(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ message: 'Invalid values for User' });

      const contact = await Contact.findOne({ where:{ email: email }, relations: ['customer']});

      if (!contact) return res.status(404).json({ message: 'E-mail inválido!' });

      const customer = contact.customer

      if (!customer) return res.status(404).json({ message: 'Cliente não encontrado inválido!' });

      const workspaceCustomer = customer.auth;

      if (!workspaceCustomer) return res.status(404).json({ message: 'Acesso não encontrado' });

      if (!(await bcrypt.compare(password, workspaceCustomer.passwordHash))) return res.status(404).json({ message: 'Senha inválida!' });

      return res.status(200).json({
        id: customer.id,
        email: contact.email,
        name: customer.name,
        picture: customer.auth.picture,
        token: generateToken({ id: customer.id }),
        passwordResetToken: customer.auth.passwordResetToken,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Authenticate failed, try again' });
    }
  }

  public async forgotPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.body;

      if (!email) return res.status(400).json({ message: 'Invalid values for forgot password' });

      const contact = await Contact.findOne({ email });

      if (!contact) return res.status(404).json({ message: 'No user found' });

      const token = crypto.randomBytes(20).toString('hex'); // token que será enviado via email.

      const customer = contact.customer;

      if(!customer) return res.status(404).json({ message: 'No user found' });

      const now = new Date();
      now.setHours(now.getHours() + 1);

      await Customer.update(customer.id, { auth: {
        passwordResetToken: token,
        passwordResetExpires: now,
      }
      });

      const client = process.env.CLIENT_CONNECTION;
      // Envie o email e aguarde a conclusão antes de enviar a resposta
      await sendMail('forgotPassword.html', 'contato', 'Recuperação de Senha', { client, name: customer.name, token, email: contact.email });
      // Envie a resposta após o envio do email
      return res.status(200).json({ message: 'Password reset sent' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Forgot password failed, try again' });
    }
  }

  public async resetPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password, token } = req.body;

      if (!email || !password || !token) return res.status(400).json({ message: 'Invalid values for User reset password' });

      const contact = await Contact.findOne({ where:{ email: email }, relations: ['customer']});

      const customer = contact?.customer

      if (!contact || !customer) return res.status(404).json({ message: 'Invalid values for Customer reset password' });


      if (token !== customer.auth.passwordResetToken) return res.status(400).json({ message: 'Token is invalid' });

      const now = new Date();
      if (now > customer.auth.passwordResetExpires) return res.status(400).json({ message: 'Token expired' });

      const passwordHash = await bcrypt.hash(password, 10);

      await Customer.update(customer.id, {
        auth: {
           ...customer.auth,
           passwordHash: passwordHash,
           passwordResetExpires: undefined,
           passwordResetToken: undefined
          }
      });

      return res.status(200).json();
    } catch (error) {
      console.log(error)
      return res.status(400).json({ error: 'Cannot reset password, try again' });
    }
  }


  public async createThread(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      const { content } = req.body;

      if(!content) return res.status(400).json({ message: 'Por favor, escreva alguma mensagem.' });

      const assistantId = req.header('assistantId');

      if (!assistantId) return res.status(400).json({ message: 'Id da assistente não fornecido' })

        console.log(assistantId)
      const assistant = await Assistant.findOne(assistantId);


      if (!assistant) return res.status(404).json({ message: 'Assistente não encontrado' });

      const customerId = req.header('customerId');

      if (!customerId) return res.status(400).json({ message: 'Id da assistente não fornecido' });

      const customer = await Customer.findOne(id, { relations: ['contact', 'workspace']})

      if (!customer) return res.status(404).json({ message: 'Usuário não autorizado' });

      const contact = customer.contact;

      if (!contact) return res.status(404).json({ message: 'Usuário não autorizado' });

      const apiKey = await decrypt(customer.workspace!.openaiApiKey);
      const openai = new OpenAI({ apiKey });

      const newThread = await openai.beta.threads.create();

      const thread = await Thread.create({
        name: '',
        threadId: newThread.id,
        contact: contact,
        assistant,
        workspace: customer.workspace,
        usage: 'chat',
        chatActive: true,
      }).save();

      const msg = [{ type: 'text', text: content }];

      const followUpPayload = {
        workspaceId: customer.workspace.id,
        assistantId: assistant.id,
        threadId: thread.id,
        contactId: contact.id,
        message: msg
      }

      await sendToQueue(`chats`, (followUpPayload));

      await processThreads()

      await log('playgrounds', req, 'create', 'success', JSON.stringify({ id: id, ...req.body }), '');
      return res.status(201).json(thread);
    } catch (error) {
      console.error(error);
      await log('playgrounds', req, 'create', 'failed', JSON.stringify(error), null);
      return res.status(500).json({ message: 'Algo deu errado, tente novamente mais tarde.' });
    }
  }

  public async findThread(req: Request, res: Response): Promise<Response> {
    try {

      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Please send a partner id' });

      const playground = await Thread.findOne(id);

      if (!playground) return res.status(400).json({ message: 'Playground not found' });

      await log('playgrounds', req, 'findById', 'success', JSON.stringify({ id: id }), id);

      return res.status(200).json(playground);

    } catch (error) {
      await log('playgrounds', req, 'findById', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find groups, try again' });
    }
  }
  public async findThreads(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Please send a partner id' });

      const customer = await Customer.findOne(id, { relations: ['contact']});

      if (!customer) return res.status(400).json({ message: 'Playground not found' });

      const threads = await Thread.find({ where: { contact: customer.contact, usage: 'chat' }});

      if (!customer) return res.status(400).json({ message: 'Playground not found' });

      await log('customers', req, 'findById', 'success', JSON.stringify({ id: id }), id);

      return res.status(200).json(threads);

    } catch (error) {
      console.log(error)
      await log('playgrounds', req, 'findById', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find groups, try again' });
    }
  }
  public async findThreadMessages(req: Request, res: Response): Promise<Response> {
    try {

      const id = req.params.id;

      if (!id) return res.status(400).json({ message: 'Please send a partner id' });

      const playground = await Thread.findOne(id, { relations: ['messages']});

      if (!playground) return res.status(400).json({ message: 'Playground not found' });

      await log('playgrounds', req, 'findById', 'success', JSON.stringify({ id: id }), id);

      return res.status(200).json(playground.messages);

    } catch (error) {
      await log('playgrounds', req, 'findById', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Cannot find groups, try again' });
    }
  }
}

export default new CustomerController();

