
import Router, { RequestHandler } from 'express';
import VectorController from '@src/app/controllers/VectorController';
import { ensureAuthenticated } from '@src/app/middlewares/ensureAuthenticated';
import upload from '@middlewares/ensureMulter';

const uploadMiddleware = upload.array('files') as unknown as RequestHandler;

const routes = Router();

routes.get('/', VectorController.findById);
routes.get('/:id', VectorController.fileById);
routes.post('/', uploadMiddleware, VectorController.uploadFiles);
routes.post('/batch/', VectorController.deleteBatchFiles);
routes.get('/storage/usage', VectorController.getStorage);
routes.delete('/:id', VectorController.deleteFile);


export default routes;
