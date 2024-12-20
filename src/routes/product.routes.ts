
import Router from 'express';
import ProductController from '@src/app/controllers/ProductController';
import { ensureAuthenticated } from '@src/app/middlewares/ensureAuthenticated';

const routes = Router();

routes.get('/products/:id', ProductController.findAll);
routes.get('/:id', ensureAuthenticated, ProductController.findById);
routes.post('/import/:id', ensureAuthenticated, ProductController.import);
routes.post('/:id', ensureAuthenticated, ProductController.create);
routes.put('/:id', ensureAuthenticated, ProductController.update);
routes.delete('/:id', ensureAuthenticated, ProductController.delete);

export default routes;
