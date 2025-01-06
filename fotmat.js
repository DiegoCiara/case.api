function formatJSON(input) {
  function transformObject(node) {
    if (node.type === "object") {
      const properties = {};
      const required = [];

      node.children.forEach((child) => {
        const transformedChild = transformObject(child);
        properties[child.property] = transformedChild;
        if (child.required) {
          required.push(child.property);
        }
      });

      return {
        type: "object",
        description: node.description,
        required: required.length ? required : undefined,
        properties,
        additionalProperties: false,
      };
    } else {
      return {
        type: node.type,
        description: node.description,
      };
    }
  }

  const formatted = input.map((item) => transformObject(item));
  return formatted[0]; // Retorna o primeiro elemento formatado (ou toda a lista, conforme necessidade)
}

// Exemplo de entrada
const input = [
  {
    type: "object",
    property: "customer",
    required: true,
    description: "Informações do cliente",
    children: [
      {
        type: "object",
        property: "contato",
        required: true,
        description: "Contato do cliente",
        children: [
          {
            type: "string",
            property: "email",
            required: true,
            description: "Email do cliente",
          },
          {
            type: "object",
            property: "telefones",
            required: false,
            description: "Telefones do cliente",
            children: [],
          },
        ],
      },
      {
        type: "string",
        property: "phone",
        required: false,
        description: "Número de telefone do cliente",
      },
    ],
  },
];

// Transformando o JSON
const output = formatJSON(input);
console.log(JSON.stringify(output, null, 2));