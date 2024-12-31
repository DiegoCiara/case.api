import Router from 'express';
import IntegrationController from '@controllers/IntegrationController';

const routes = Router();
routes.get('/', IntegrationController.findAll);
routes.get('/:id', IntegrationController.findById);
routes.post('/', IntegrationController.createIntegration);
routes.put('/:id', IntegrationController.updateIntegration);
routes.delete('/:id', IntegrationController.deleteIntegration);
routes.post('/batch/', IntegrationController.deleteBatchIntegrations);

export default routes;

