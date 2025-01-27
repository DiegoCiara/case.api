import Router from 'express';
import IntegrationController from '@controllers/IntegrationController';
import { ensureAuthenticated } from '@middlewares/ensureAuthenticated';

const routes = Router();
routes.get('/', ensureAuthenticated, IntegrationController.findAll);
routes.get('/:id', ensureAuthenticated, IntegrationController.findById);
routes.post('/', ensureAuthenticated, IntegrationController.createIntegration);
routes.put('/:id', ensureAuthenticated, IntegrationController.updateIntegration);
routes.delete('/:id', ensureAuthenticated, IntegrationController.deleteIntegration);
routes.post('/batch/', ensureAuthenticated, IntegrationController.deleteBatchIntegrations);

export default routes;
