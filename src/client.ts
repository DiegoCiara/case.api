require('dotenv').config(); // Substitua pelo caminho correto do arquivo

const ClientService = {
  logo: `${process.env.CLIENT_CONNECTION}/logo.png`,
  name: 'Softspace BR',
  email: 'contato@softspace.com.br',
  colorPlate: {
    primary: '#0048fc',
    secondary: '#4000BF',
    dark: '#0e0e0e',
    light: '#fafafa',
  },
  client_access: process.env.CLIENT_CONNECTION,
};

export default ClientService;

