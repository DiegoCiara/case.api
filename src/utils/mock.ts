import User from '@entities/User';
import { assistants, pipelines, plans, products, users, vectors } from './dataMock';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import Workspace from '@entities/Workspace';
import OpenAI from 'openai';
import { generateColor } from './functions/generateColor';
import Plan from '@entities/Plan';
import Pipeline from '@entities/Pipeline';
import Access from '@entities/Access';
import { encrypt } from './encrypt/encrypt';
import Vector from '@entities/Vector';

import dotenv from 'dotenv';
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
    const newUser = await User.create({ ...user, passwordHash: pass }).save();
    console.log(`Usuário ${newUser.name} criado`);

    const plan = await Plan.findOne();

    const color = generateColor();

    const hashApiKey = await encrypt(apiKey! as string);

    const workspace = await Workspace.create({
      name: 'Softspace BR',
      picture: 'https://wave.softspace.com.br/logo-a.svg',
      subscriptionId: 'Hello World',
      plan,
      color,
    }).save();
    console.log(`Assistente ${workspace.name} criado`);

    for (const assistant of assistants) {
      const vectorStore = [];

      const openaiStore = [];

      for (const vector of vectors) {
        const openaiVector = await openai.beta.vectorStores.create({
          name: vector.name,
        });

        openaiStore.push(openaiVector.id);

        const vectorCreated = await Vector.create({
          name: vector.name,
          vectorId: openaiVector.id,
          workspace,
        }).save();
        vectorStore.push(vectorCreated);
      }
    }

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

