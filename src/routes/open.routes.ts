import Router from 'express';
import UserController from '@src/app/controllers/UserController';
import { ensureAuthenticated } from '@src/app/middlewares/ensureAuthenticated';
import { ensureProfile } from '@middlewares/ensureProfile';
import OpenAIController from '@controllers/OpenAIController';

const routes = Router();
// routes.get('/', ensureAuthenticated, UserController.findUsers);
routes.post('/user/', UserController.create);
routes.post('/create/:id', OpenAIController.createAssistant);
// Start widget
routes.get('/widget/threads/:email/', OpenAIController.findThreadsOfWidget);
routes.get('/widget/thread/:threadId/', OpenAIController.getMessagesChatOfWidget);
routes.get('/widget/workspace/:id/', OpenAIController.findWidgetAssistant);
// end widget
// routes.post('/:workspaceId/', OpenAIController.createThread);
// routes.post('/:workspaceId/:id', OpenAIController.continueThread);

export default routes;

