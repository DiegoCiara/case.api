import User from '@entities/User';
import { vectors } from './dataMock';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import Workspace from '@entities/Workspace';
import OpenAI from 'openai';
import { generateColor } from './functions/generateColor';
import Access from '@entities/Access';

import dotenv from 'dotenv';
import { createCustomer } from './stripe/customer/createCustomer';
import { FunctionTool } from 'openai/resources/beta/assistants';
dotenv.config();

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

    const user = {
      name: 'Diego Ciara',
      email: 'diegociara.dev@gmail.com',
      picture: 'https://case-endurance.vercel.app/spider-logo.png',
      role: 'FREE',
      password: 'die140401',
    };

    const customer = await createCustomer({ name: user.name, email: user.email });

    if (!customer) {
      console.log('Cliente não criado');
      return;
    }

    const pass = await bcrypt.hash(user.password, 10);

    const newUser = await User.create({ ...user, customerId: customer.id, passwordHash: pass }).save();

    console.log(`Usuário ${newUser.name} criado`);

    const tools: any = [{ type: 'file_search' }];

    const openaiVector = await openai.beta.vectorStores.create({
      name: 'Base de conhecimento',
    });

    const assistant = await openai.beta.assistants.create({
      name: 'Edite',
      instructions: '',
      description: null,
      temperature: 0.5,
      model: 'gpt-4o-mini',
      tools,
      tool_resources: {
        file_search: { vector_store_ids: [openaiVector.id] },
      },
      top_p: 1,
      metadata: {},
      response_format: 'auto',
    });

    const workspace = await Workspace.create({
      name: 'Endurance Tecnologia',
      subscriptionId: 'sub_1Qa3RJCEMWzJZjFdw1bxphVv',
      assistantId: assistant.id,
      vectorId: openaiVector.id,
      assistantPicture: 'https://case-endurance.vercel.app/spider-logo.png',
      logo: 'https://endurancetecnologia.com.br/logo-dark.svg',
      logoDark: 'https://endurancetecnologia.com.br/logo.svg',
      colorTheme: generateColor(),
    }).save();
    console.log(`Assistente ${workspace.name} criado`);

    await Access.create({
      user: newUser,
      role: 'OWNER',
      workspace: workspace,
    }).save();
  } catch (error) {
    console.log('Erro ao rodar mocks!', error);
  }
};

export default mocks;

