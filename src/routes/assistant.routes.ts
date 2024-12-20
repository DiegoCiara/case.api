
import Router from 'express';
import AssistantController from '@src/app/controllers/AssistantController';
import { ensureAuthenticated } from '@src/app/middlewares/ensureAuthenticated';


const routes = Router();

routes.get('/assistants/:id', AssistantController.findAll);
routes.get('/:id/:assistantId', AssistantController.findById);
routes.post('/sendDealDetails/:id/', AssistantController.sendDealDetails);
routes.post('/:id/', AssistantController.create);
routes.put('/:id/:assistantId', AssistantController.update);
routes.delete('/:id', AssistantController.delete);


export default routes;
