
import Router, { RequestHandler } from 'express';
import PlaygroundController from '@src/app/controllers/PlaygroundController';

const routes = Router();

routes.get('/:threadId', PlaygroundController.listPlaygroundMessages);
routes.get('/file/:fileId', PlaygroundController.retrieveFile);
routes.post('/', PlaygroundController.createPlayground);
routes.post('/:threadId', PlaygroundController.sendMessage);


export default routes;
