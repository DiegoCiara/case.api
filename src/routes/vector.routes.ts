
import Router, { RequestHandler } from 'express';
import VectorController from '@src/app/controllers/VectorController';
import { ensureAuthenticated } from '@src/app/middlewares/ensureAuthenticated';
import upload from '@middlewares/ensureMulter';

const uploadMiddleware = upload.array('files') as unknown as RequestHandler;

const routes = Router();

routes.get('/', VectorController.findById);
routes.post('/:id/upload/:vectorId', uploadMiddleware, VectorController.uploadFiles);
routes.delete('/:id/file/:fileId', VectorController.deleteFile);


export default routes;
