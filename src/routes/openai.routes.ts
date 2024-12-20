import Router from 'express';
import { ensureAuthenticated } from '@src/app/middlewares/ensureAuthenticated';
import OpenAIController from '@controllers/OpenAIController';
import upload from '@middlewares/ensureMulter';

const routes = Router();

routes.get('/:id', OpenAIController.findAll);
routes.get('/conversation/:id', OpenAIController.findAllThreads);
routes.get('/notifications/:id', OpenAIController.findAllConversations);
routes.get('/conversations/:id', OpenAIController.findAllConversations);
routes.put('/toAssume/:id', OpenAIController.toAssumeConversation);
routes.get('/findConversation/:id', OpenAIController.findConversation);
routes.get('/workspace/:id', OpenAIController.findByAssistant);
routes.get('/workspaces/:id', OpenAIController.findByIdUser);
routes.post('/createConversation/:id', OpenAIController.createConversation);
routes.get('/apiKey/:id', OpenAIController.apiKeyGenerate);
routes.post('/sendMessage/:id', OpenAIController.sendMessage);
routes.post('/deleteFile/', OpenAIController.deleteFile);
routes.put('/editFile/', OpenAIController.editFile);
routes.get('/getMessages/:id', OpenAIController.getMessagesOfThread);
routes.get('/getMessages/platform/:id', OpenAIController.getMessagesOfThreadPlatform);
routes.put('/archiveThread/:id', OpenAIController.archiveThread);
routes.delete('/deleteThread/:id', OpenAIController.deleteThread);
// routes.get('/find/:id', AssistantController.findById);
// routes.post('/', AssistantController.create);
// routes.put('/:id', AssistantController.update);
// routes.put('/picture/:id', AssistantController.updatePicture);
// routes.get('/knowbase/:id', AssistantController.getKnowBase);
// routes.post('/:id/knowbase', AssistantController.insertItemKnowbase);
// routes.post('/login/:id', AssistantController.conectionWhatsApp);
// routes.delete('/:id', AssistantController.delete);

export default routes;

