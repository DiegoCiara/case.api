import Integration from '@entities/Integration';
import Workspace from '@entities/Workspace';

export async function formatFunctions(workspace: Workspace) {
  try {
    const integrations = await Integration.find({ where: { workspace } });

    const functions = integrations.map((e: any) => {
      function transformObject(node: any) {
        if (node.type === 'object') {
          const properties: any = {};
          const required: string[] = [];

          node.children.forEach((child: any) => {
            const transformedChild = transformObject(child);
            properties[child.property] = transformedChild;
            if (child.required) {
              required.push(child.property);
            }
          });

          return {
            type: node.type,
            description: node.description,
            required: required.length > 0 ? required : [],
            properties,
            additionalProperties: false, // Definido explicitamente
          };
        } else {
          return {
            type: node.type,
            description: node.description,
            additionalProperties: false, // Garantido também para outros tipos
          };
        }
      }

      // Cria o objeto `properties` como um único objeto em vez de array
      const properties = e.body.reduce((acc: any, item: any) => {
        const transformed = transformObject(item);
        if (item.property) {
          acc[item.property] = transformed;
        }
        return acc;
      }, {});

      // Define os campos obrigatórios
      const required = e.body
        .filter((i: any) => i.required === true)
        .map((body: any) => body.property);

      // Monta o esquema final para a função
      const element = {
        type: 'function',
        function: {
          name: e.functionName,
          description: e.description,
          strict: true,
          parameters: {
            type: 'object',
            required: required.length > 0 ? required : [],
            properties, // Passa o objeto de propriedades corretamente
            additionalProperties: false, // Explicitamente definido no nível mais alto
          },
        },
      };

      return element;
    });

    return functions;
  } catch (error) {
    console.error('Error in formatFunctions:', error);
    throw error;
  }
}