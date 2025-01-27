
import Router from 'express';
import ThreadController from '@controllers/ThreadController';

const routes = Router();

routes.get('/', ThreadController.findThreads);
routes.get('/thread/:id', ThreadController.findThread);
routes.get('/:threadId', ThreadController.listThreadMessages);
routes.get('/file/:fileId', ThreadController.retrieveFile);
routes.post('/', ThreadController.createThread);
routes.post('/:threadId', ThreadController.sendMessage);
routes.delete('/:id', ThreadController.deleteThread);


export default routes;
