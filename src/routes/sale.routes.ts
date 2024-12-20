
import Router from 'express';
import SaleController from '@src/app/controllers/SaleController';
import { ensureAuthenticated } from '@src/app/middlewares/ensureAuthenticated';

const routes = Router();

routes.get('/sales/:id', ensureAuthenticated, SaleController.findAll);
routes.get('/:id', ensureAuthenticated, SaleController.findById);

export default routes;
