
import Router from 'express';
import OriginController from '@src/app/controllers/OriginController';
import { ensureAuthenticated } from '@src/app/middlewares/ensureAuthenticated';
import LandingPageController from '@controllers/LandingPageController';
import GroupController from '@controllers/GroupController';


const routes = Router();

routes.get('/campaings/:id', LandingPageController.getLandingPage);
routes.post('/campaings/:id', LandingPageController.createLead);
routes.get('/groups/:id', GroupController.findExternalAll);


export default routes;
