require('./src/config/env'); // valida .env antes de qualquer coisa
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./src/routes/auth.routes');
const oportunidadesRoutes = require('./src/routes/oportunidades.routes');
const tratarErros = require('./src/middlewares/error.middleware');
const { port, nodeEnv } = require('./src/config/env');

const app = express();

app.use(helmet());                 // headers de segurança (XSS, sniffing, etc.)
app.use(cors());                   // TODO: restringir 'origin' para o domínio do front em produção
app.use(express.json({ limit: '10kb' })); // limita payload — mitiga abuso simples
app.use(morgan(nodeEnv === 'production' ? 'combined' : 'dev'));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/oportunidades', oportunidadesRoutes);

app.get('/', (req, res) => res.json({ status: 'ELAB API rodando' }));

// Rota inexistente
app.use((req, res) => res.status(404).json({ sucesso: false, erro: 'Rota não encontrada' }));

app.use(tratarErros); // sempre por último

app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));