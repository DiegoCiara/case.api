import User from '@entities/User';
import {
  assistants,
  banks,
  commissions,
  groups,
  instructions,
  origins,
  partners,
  pipelines,
  plans,
  products,
  users,
  vectors,
} from './dataMock';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import Workspace from '@entities/Workspace';
import OpenAI from 'openai';
import { generateColor } from './generateColor';
import Plan from '@entities/Plan';
import Funnel from '@entities/Funnel';
import Pipeline from '@entities/Pipeline';
import Contact from '@entities/Contact';
import Deal from '@entities/Deal';
import Access from '@entities/Access';
import Product from '@entities/Product';
import Customer from '@entities/Customer';
import Partner from '@entities/Partner';
import Bank from '@entities/Bank';
import Commission from '@entities/Commission';
import Sale from '@entities/Sale';
import Group from '@entities/Group';
import { encrypt } from './encrypt';
import Origin from '@entities/Origin';
import LandingPage from '@entities/LandingPage';
import Assistant from '@entities/Assistant';
import Vector from '@entities/Vector';
import Softspacer from '@entities/Softspacer';
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


const mocks = async (): Promise<void> => {
  try {
    // Verificar se todas as entidades estão vazias antes de prosseguir

    const apiKey = process.env.OPENAI_API_KEY;

    const [hasUsers, hasAssistants] = await Promise.all([
      User.count(), // Conta quantos registros existem
      Workspace.count(),
    ]);

    if (hasUsers > 0 || hasAssistants > 0) {
      console.log('Mocks ok');
      return;
    }

    const softspacer = await Softspacer.create({
      name: 'Softspace',
      cnpj: '999999999999',
      responsibleName: 'Diego Ciara',
      responsibleEmail: 'diegociara.dev@gmail.com',
      responsiblePhone: '81997052688',
      responsibleCpf: '11621584410',
      cep: '55002506'
     }).save();

    for (const plan of plans) {
      const newPlan = await Plan.create({ ...plan }).save();
      console.log(`Plano ${newPlan.name}`);
    }

    const dealParams = {
      status: ['INPROGRESS', 'ARCHIVED', 'PENDING'],
      // includeAssistantDeals: true,
    };

    const user = {
      name: 'Suporte Técnico',
      email: 'admin@softspace.com.br',
      picture: 'https://seeklogo.com/images/S/spider-man-comic-new-logo-322E9DE914-seeklogo.com.png',
      role: 'FREE',
      password: 'die140401',
    };

    const pass = await bcrypt.hash(user.password, 10);
    const newUser = await User.create({ ...user, passwordHash: pass, softspacer }).save();
    console.log(`Usuário ${newUser.name} criado`);

    const plan = await Plan.findOne();

    const color = generateColor();

    const hashApiKey = await encrypt(apiKey! as string);

    const workspace = await Workspace.create({
      name: 'Softspace BR',
      companyType: 'Promotora de Crédito',
      picture: 'https://wave.softspace.com.br/logo-a.svg',
      openaiApiKey: hashApiKey,
      subscriptionAsaasId: 'Hello World',
      plan,
      softspacer,
      color,
    }).save();
    console.log(`Assistente ${workspace.name} criado`);

    for (const assistant of assistants) {

      const vectorStore = []

      const openaiStore = []

      for (const vector of vectors) {

        const openaiVector = await openai.beta.vectorStores.create({
          name: vector.name,
        });

        openaiStore.push(openaiVector.id)

        const vectorCreated = await Vector.create({
          name: vector.name,
          vectorId: openaiVector.id,
          workspace,
        }).save()
        vectorStore.push(vectorCreated)
      }

    }

    await Access.create({
      user: newUser,
      role: 'SUPPORT',
      workspace: workspace,
    }).save();

    const funnelCreated = await Funnel.create({
      name: 'Softspace BR',
      workspace: workspace,
      dealParams,
    }).save();
    console.log(`Funil ${funnelCreated?.name} criado com sucesso.`);

    for (const origin of origins) {
      const originCreated = await Origin.create({ name: origin.name, color: generateColor(), workspace: workspace }).save();
      console.log(`Canal de origem ${originCreated.name} criado com sucesso`);
    }

    const origin = await Origin.findOne({ where: { name: 'WhatsApp' } });

    const contactCreated = await Contact.create({
      phone: '81997052688',
      email: 'diegociara.dev@gmail.com',
      workspace: workspace,
    }).save();
    console.log(`Contato ${contactCreated.email} criado com sucesso.`);

    const customerCreated = await Customer.create({
      name: 'Diego Ciara',
      contact: contactCreated,
      workspace: workspace,
      origin,
    }).save();
    console.log(`Contato ${customerCreated?.name} criado com sucesso.`);

    for (const product of products) {
      const createdProduct = await Product.create({ ...product, workspace: workspace }).save();
      console.log(`Product ${createdProduct.name} criado com sucesso`);
    }

    for (const partner of partners) {
      const createdProduct = await Partner.create({ ...partner, workspace: workspace }).save();
      console.log(`Partner ${createdProduct.name} criado com sucesso`);
    }

    for (const bank of banks) {
      const createdProduct = await Bank.create({ ...bank, workspace: workspace }).save();
      console.log(`Bank ${createdProduct.name} criado com sucesso`);
    }

    const findBanks = await Bank.find({ where: { workspace: workspace } });

    const findPartners = await Partner.find({ where: { workspace: workspace } });

    const findProducts = await Product.find({ where: { workspace: workspace } });

    for (const group of groups) {
      const createdProduct = await Group.create({ ...group, workspace: workspace }).save();
      console.log(`Grupo ${createdProduct.name} criado com sucesso`);
    }

    for (const bank of findBanks) {
      for (const partner of findPartners) {
        for (const product of findProducts) {
          for (const commission of commissions) {
            const createdProduct = await Commission.create({ ...commission, workspace: workspace, partner, bank, product }).save();
            console.log(`Comissão ${createdProduct.name} criado com sucesso`);
          }
        }
      }
    }

    for (let i = 0; i < pipelines.length; i++) {
      const pipeline = pipelines[i];
      const createdPipeline = await Pipeline.create({
        ...pipeline,
        position: i,
        color: generateColor(),
        funnel: funnelCreated,
      }).save();

      console.log(`Pipeline ${createdPipeline.name} criado com sucesso.`);

      if (createdPipeline.name === 'Primeiro contato') {
        const bank = await Bank.findOne({ where: { name: 'Itaú' } });
        const partner = await Partner.findOne({ where: { name: 'Softspace BR' } });
        const product = await Product.findOne({ where: { name: 'Wave CRM' } });
        const commissions = await Commission.find({ where: { bank, partner, product } });

        const createdDeal = await Deal.create({
          workspace: workspace,
          customer: customerCreated,
          pipeline: createdPipeline,
          status: 'INPROGRESS',
        }).save();
        for (const commission of commissions) {
          const sale = await Sale.create({ commission, workspace: workspace, deal: createdDeal, value: 1000 }).save();
          console.log(`Sale de ${sale.commission.name} criado com sucesso.`);
        }
        console.log(`Deal de ${createdDeal.customer.name} criado com sucesso.`);
      }
    }
    const group = await Group.findOne({ where: { workspace: workspace, name: 'FGTS' } });
    const pipeline = await Pipeline.findOne({ where: { name: 'Primeiro contato' } });
    const landingpage = await LandingPage.create({
      name: 'Captação de leads FGTS',
      workspace: workspace,
      domain: 'softspace.com.br',
      group,
      pipeline
    }).save();

    console.log(`Landin-Page ${landingpage.name}`);
  } catch (error) {
    console.log('Erro ao rodar mocks!', error);
  }
};

export default mocks;

