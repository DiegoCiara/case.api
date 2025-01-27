import Router from 'express';
import AuthRoutes from './auth.routes';
import WorkspaceRoutes from './workspace.routes';
import SubscriptionRoutes from './subscription.routes';
import IntegrationRoutes from './integration.routes';
import AssistantRoutes from './assistant.routes';
import ThreadRoutes from './thread.routes';
import VectorRoutes from './vector.routes';
import UserRoutes from './user.routes';
import PlaygroundRoutes from './thread.routes';
import DocumentRoutes from './document.routes';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express'

const routes = Router();

const env = process.env.TEST_BASE;

const dev = env === 'DEV';

const base = dev ? { 'Case Development': 'Online' } : { 'Case Platform': 'Online' };

routes.get('/', (req, res) => {
  res.json(base);
});


const swaggerOptions = {
  definition: {
      openapi: '3.0.0',
      info: {
          title: 'API Case AI',
          version: '1.0.0',
          description: 'Documentação da API',
      },
      servers: [
        {
          url: 'https://api-case.app.br',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
    apis: ['./src/app/controllers/*.ts', './src/app/routes/*.ts'],
  };

const swaggerSpec = swaggerJSDoc(swaggerOptions);
routes.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
routes.use('/auth', AuthRoutes);
routes.use('/user/', UserRoutes);
routes.use('/workspace/', WorkspaceRoutes);
routes.use('/playground/', PlaygroundRoutes);
routes.use('/assistant/', AssistantRoutes);
routes.use('/document/', DocumentRoutes);
routes.use('/subscription/', SubscriptionRoutes);
routes.use('/integration/', IntegrationRoutes);
routes.use('/vector/', VectorRoutes);
routes.use('/thread', ThreadRoutes);

export default routes;
