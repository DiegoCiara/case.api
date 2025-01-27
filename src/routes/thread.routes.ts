
import Router from 'express';
import ThreadController from '@controllers/ThreadController';

const routes = Router();

routes.get('/', ThreadController.findPlaygrounds);
routes.get('/thread/:id', ThreadController.findPlayground);
routes.get('/:threadId', ThreadController.listPlaygroundMessages);
routes.get('/file/:fileId', ThreadController.retrieveFile);
routes.post('/', ThreadController.createPlayground);
routes.post('/:threadId', ThreadController.sendMessage);
routes.delete('/:id', ThreadController.deleteThread);


export default routes;
