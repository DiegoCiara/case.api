
import Router from 'express';
import PipelineController from '@src/app/controllers/PipelineController';
import { ensureAuthenticated } from '@src/app/middlewares/ensureAuthenticated';

const routes = Router();

routes.get('/', ensureAuthenticated, PipelineController.findAll);
routes.get('/:id', ensureAuthenticated, PipelineController.findById);
routes.get('/funnel/:id', ensureAuthenticated, PipelineController.findByFunnel);
routes.get('/deals/:id', ensureAuthenticated, PipelineController.findDealsPipeline);
// routes.get('/deals/main/:id', ensureAuthenticated, PipelineController.findMainPipelines);
routes.post('/', ensureAuthenticated, PipelineController.create);
routes.put('/:id', ensureAuthenticated, PipelineController.update);
routes.put('/archive/:id', ensureAuthenticated, PipelineController.archive);
// routes.delete('/:id', ensureAuthenticated, PipelineController.delete);

export default routes;
