import Router from 'express';
import DocumentController from '@src/app/controllers/DocumentController';
import { ensureAuthenticated } from '@middlewares/ensureAuthenticated';

const routes = Router();

routes.get('/', ensureAuthenticated, DocumentController.findAll);
routes.get('/:id', ensureAuthenticated, DocumentController.findById);
routes.get('/file/:id', ensureAuthenticated, DocumentController.getFile);
routes.post('/batch/', ensureAuthenticated, DocumentController.deleteBatchFiles);
routes.delete('/:id', ensureAuthenticated, DocumentController.deleteFile);

export default routes;
