import Router from 'express';
import AssistantController from '@controllers/AssistantController';
import { ensureAuthenticated } from '@middlewares/ensureAuthenticated';

const routes = Router();
routes.get('/', ensureAuthenticated, AssistantController.findAssistant);
routes.put('/', ensureAuthenticated, AssistantController.updateAssistant);
routes.post('/generate/', ensureAuthenticated, AssistantController.generate);

export default routes;

