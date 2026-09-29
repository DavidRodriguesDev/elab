require('./src/config/env'); // valida .env antes de qualquer coisa
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./src/routes/auth.routes');
const oportunidadesRoutes = require('./src/routes/oportunidades.routes');
const perfilRoutes = require('./src/routes/perfil.routes');
const tratarErros = require('./src/middlewares/error.middleware');
const { port, nodeEnv } = require('./src/config/env');

const app = express();

app.use(helmet());                 // headers de segurança (XSS, sniffing, etc.)
app.use(cors());                   // TODO: restringir 'origin' se o front for hospedado em outro domínio
app.use(express.json({ limit: '10kb' })); // limita payload — mitiga abuso simples
app.use(morgan(nodeEnv === 'production' ? 'combined' : 'dev'));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/oportunidades', oportunidadesRoutes);
app.use('/api/v1/perfil', perfilRoutes);
app.get('/api/v1/status', (req, res) => res.json({ status: 'ELAB API rodando' }));

// Front servido pelo próprio Express: mesma origem, sem CORS. Com o CSP padrão do helmet,
// o front não pode usar scripts/handlers inline (todo JS fica em frontend/js).
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Rota inexistente
app.use((req, res) => res.status(404).json({ sucesso: false, erro: 'Rota não encontrada' }));

app.use(tratarErros); // sempre por último

app.listen(port, () => console.log(`Servidor rodando em http://localhost:${port}`));
