
import Router from 'express';
import LandingPageController from '@src/app/controllers/LandingPageController';
import { ensureAuthenticated } from '@src/app/middlewares/ensureAuthenticated';


const routes = Router();

routes.get('/landingpages/:id', LandingPageController.findAll);
routes.get('/:id', LandingPageController.findById);
routes.post('/:id', LandingPageController.create);
routes.put('/:id', LandingPageController.update);
routes.delete('/:id', LandingPageController.delete);


export default routes;
