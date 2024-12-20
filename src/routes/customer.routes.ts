import Router from 'express';
import CustomerController from '@controllers/CustomerController';
import { ensureAuthenticated } from '@src/app/middlewares/ensureAuthenticated';
import upload from '@middlewares/ensureMulter';

const routes = Router();
routes.post('/create-password', ensureAuthenticated, CustomerController.createPass);
routes.get('/customers/:id', ensureAuthenticated, CustomerController.findAll);
routes.get('/:id', ensureAuthenticated, CustomerController.findById);
routes.post('/:id', ensureAuthenticated, CustomerController.create);
routes.get('/documents/:id', CustomerController.getDocuments);
routes.put('/:id', ensureAuthenticated, CustomerController.update);
routes.post('/upload/:id/:workspaceId', upload.single('file'), CustomerController.uploadFile);
routes.post('/deleteFile/:id', CustomerController.deleteFile);
routes.put('/editFile/:id', CustomerController.editFile);
routes.delete('/:id', ensureAuthenticated, CustomerController.delete);

export default routes;

