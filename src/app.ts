import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import routes from './routes/routes';
// import 'newrelic'

dotenv.config();

// Config
const app = express();

import './database';

app.use(cors());
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: '30mb', extended: true })); // Define o limite para conteúdo de formulário
app.use(routes);

export default app;
