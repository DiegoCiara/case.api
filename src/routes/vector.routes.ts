
import Router, { RequestHandler } from 'express';
import VectorController from '@src/app/controllers/VectorController';
import { ensureAuthenticated } from '@src/app/middlewares/ensureAuthenticated';
import upload from '@middlewares/ensureMulter';

const uploadMiddleware = upload.array('files') as unknown as RequestHandler;

const routes = Router();

routes.get('/vectors/:id', VectorController.findAll);
routes.get('/:id/:vectorId', VectorController.findById);
routes.post('/:id', uploadMiddleware, VectorController.create);
routes.put('/:id/:vectorId', VectorController.update);
routes.post('/:id/upload/:vectorId', uploadMiddleware, VectorController.uploadFiles);
routes.delete('/:id/:vectorId', VectorController.delete);
routes.delete('/:id/file/:fileId', VectorController.deleteFile);


export default routes;
