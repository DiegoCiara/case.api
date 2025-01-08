
import Router from 'express';
import DocumentController from '@src/app/controllers/DocumentController';

const routes = Router();

routes.get('/', DocumentController.findAll);
routes.get('/:id', DocumentController.findById);
// routes.get('/:id', DocumentController.fileById);
routes.post('/batch/', DocumentController.deleteBatchFiles);
routes.delete('/:id', DocumentController.deleteFile);


export default routes;
