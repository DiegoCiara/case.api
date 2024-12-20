import Router from 'express';
import ThreadController from '@controllers/ThreadController';

const routes = Router();

routes.post('/runThread', ThreadController.runThread);

export default routes;

