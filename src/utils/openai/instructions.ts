import Workspace from '@entities/Workspace';
import Group from '@entities/Group';
import Funnel from '@entities/Funnel';
import Product from '@entities/Product';
import Assistant from '@entities/Assistant';

export async function getAllWorkspace(workspace: Workspace, assistant: Assistant): Promise<string> {
  try {
    const funnels = assistant.funnels;
    const funnelss = await Funnel.find({ where: { workspace: workspace, active: true }, relations: ['pipelines'] });
    const groups = await Group.find({ where: { workspace: workspace, active: true }, relations: ['profiles', 'profiles.products'] });

    const funnelDetails = funnels.filter(i=> i.active === true).map(funnel => {
      // Se houver descrição, inclui no formato "nome (descrição)"
      const pipelines = funnel.pipelines.filter(i=> i.active === true).map((pipeline, index) => {
        return `\n${index + 1}º Etapa/Pipeline: ${pipeline.name}\n Descrição do pipeline: ${pipeline?.description}`
      }).join(', ')
      return `Nome: ${funnel.name}\nDescrição do funil: ${funnel?.description}\n\n - Pipelines/Etapas:${pipelines}`;
    }).join(', ');

    const groupDetails = groups.filter(i=> i.active === true).map(group => {
      // Se houver descrição, inclui no formato "nome (descrição)"
      const profiles = group.profiles.filter(i=> i.active === true).map((profile, index) => {
        const productOfProfile = profile.products.filter(i=> i.active === true).map((product, index) => {
        return `\n${index + 1}º Produto: ${product?.name}\n Descrição do produto: ${product?.description}\n`
        }).join(', ')
        return `\n${index + 1}º Perfil: ${profile.name}\n Descrição do perfil: ${profile?.description}\nProdutos relacionados a este perfil:${productOfProfile}`
      }).join(', ')
      return `Nome: ${group.name}\nDescrição do Grupo: ${group?.description}\n\n - Perfis de clientes deste grupo:${profiles}`;
    }).join(', ');

    const result = `FUNIS DE VENDAS:\n${funnelDetails}\n\nGRUPOS DE CLIENTES\n${groupDetails}\n\n`
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}



