import Integration from '@entities/Integration';
import Workspace from '@entities/Workspace';

export async function formatFunctions(workspace: Workspace) {
  try {
    const integrations = await Integration.find({ where: { workspace } });

    const functions = integrations.map((e: any) => {
      const properties = e.body.reduce((acc: any, bodyItem: any) => {

        acc[bodyItem.property] = {
          type: bodyItem.type || 'string', // Tipo dinâmico com fallback para 'string'
          description: bodyItem.description || '', // Descrição, se existir
        };
        return acc;
      }, {});

      const required = e.body.filter((i: any) => i.required === true).map((body: any) => body.property)

      const element = {
        type: "function",
        function: {
          name: e.functionName,
          description: e.description,
          strict: true,
          parameters: {
            type: "object",
            required,
            properties, // Propriedades dinâmicas geradas
            additionalProperties: false,
          },
        },
      };

      return element;
    });

    return functions;
  } catch (error) {
    console.error(error);
    throw error; // Repropaga o erro, caso necessário
  }
}