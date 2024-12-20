import Funnel from '@entities/Funnel';
import { accesses } from './dataMock';
import Workspace from '@entities/Workspace';
import Product from '@entities/Product';
import Group from '@entities/Group';
import Bank from '@entities/Bank';
import Pipeline from '@entities/Pipeline';
import Origin from '@entities/Origin';

export default async function createWorkspace(type: string, workspace: Workspace) {
  try {
    const findWorkspace = await accesses.find((e) => e.name === type);

    if (!findWorkspace) {
      console.log(`Access with type ${type} not found`);
      return;
    }

    const { workspaceParams } = findWorkspace;
    const { funnel } = workspaceParams;
    const funnelCreated = await Funnel.create({ ...funnel, workspace: workspace }).save();

    const pipelines = workspaceParams.funnel.pipelines; // assume that this is an array

    for (let i = 0; i < pipelines.length; i++) {
      const pipeline = pipelines[i]; // agora é um objeto Pipeline
      const createdPipeline = await Pipeline.create({
        ...pipeline,
        position: i,
        funnel: funnelCreated,
      }).save();

      console.log(`Pipeline ${createdPipeline.name} criado com sucesso.`);
    }

    for (const product of workspaceParams.products) {
      await Product.create({ ...product, workspace: workspace }).save();
    }

    for (const origin of workspaceParams.origins) {
      await Origin.create({ ...origin, workspace: workspace }).save();
    }

    for (const bank of workspaceParams.banks) {
      await Bank.create({ ...bank, workspace: workspace }).save();
    }

    for (const group of workspaceParams.groups) {
      await Group.create({ ...group, workspace: workspace }).save();
    }
  } catch (error) {
    console.log(error);
  }
}

