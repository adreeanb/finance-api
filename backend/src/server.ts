import express from 'express';
import { errorHandler } from './middlewares/errorHandler.js'
import cors from 'cors';

import { routes } from './routes/routes.js';

const app = express();

app.use(cors({
  origin: 'https://finance-api-frontend.onrender.com', 

  credentials: true, 

  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));
app.use(express.json());
app.use(routes);

app.use(errorHandler);

const PORT = process.env.PORT || 3334;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

