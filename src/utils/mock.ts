import User from '@entities/User';
import { vectors } from './dataMock';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import Workspace from '@entities/Workspace';
import OpenAI from 'openai';
import { generateColor } from './functions/generateColor';
import Access from '@entities/Access';
import { encrypt } from './encrypt/encrypt';
import Vector from '@entities/Vector';

import dotenv from 'dotenv';
import { createCustomer } from './stripe/customer/createCustomer';
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
      email: 'diegociara.dev@gmail.com.br',
      picture: 'https://seeklogo.com/images/S/spider-man-comic-new-logo-322E9DE914-seeklogo.com.png',
      role: 'FREE',
      password: 'die140401',
    };

    const pass = await bcrypt.hash(user.password, 10);
    const newUser = await User.create({ ...user, passwordHash: pass }).save();
    console.log(`Usuário ${newUser.name} criado`);

    const color = generateColor();

    const customer = await await createCustomer({ name: user.name, email: user.email})

    const workspace = await Workspace.create({
      name: 'Softspace BR',
      subscriptionId: 'sub_1Qa3RJCEMWzJZjFdw1bxphVv',
      customerId: `customer.id`,
      logo: 'https://endurancetecnologia.com.br/logo-dark.svg',
      logoDark: 'https://endurancetecnologia.com.br/logo.svg',
      backgroundColor: generateColor(),
      backgroundColorDark: generateColor(),
    }).save();
    console.log(`Assistente ${workspace.name} criado`);

    const vectorStore = [];

    const openaiStore = [];

    const openaiVector = await openai.beta.vectorStores.create({
      name: 'Base de conhecimento',
    });

    openaiStore.push(openaiVector.id);

    const vectorCreated = await Vector.create({
      name: 'Base de conhecimento',
      vectorId: openaiVector.id,
      workspace,
    }).save();
    vectorStore.push(vectorCreated);

    await Access.create({
      user: newUser,
      role: 'SUPPORT',
      workspace: workspace,
    }).save();
  } catch (error) {
    console.log('Erro ao rodar mocks!', error);
  }
};

export default mocks;

