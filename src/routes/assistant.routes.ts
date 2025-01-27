import Router from 'express';
import AssistantController from '@controllers/AssistantController';

const routes = Router();
routes.get('/', AssistantController.findAssistant);
routes.put('/', AssistantController.updateAssistant);
routes.post('/generate/', AssistantController.generate);

export default routes;

