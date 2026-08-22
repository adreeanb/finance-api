import express from 'express';
import { errorHandler } from './middlewares/errorHandler'
import cors from 'cors';

import { routes } from './routes/routes';

const app = express();

app.use(cors({
  origin: '*' // Para produção isso deve ser restrito, mas para teste local é perfeito
}));
app.use(express.json());
app.use(routes);

app.use(errorHandler);

const PORT = process.env.PORT || 3334;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

