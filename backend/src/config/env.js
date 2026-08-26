// Falha rápido e com mensagem clara se faltar uma variável de ambiente crítica,
// em vez de deixar o bug aparecer silenciosamente em runtime.
require('dotenv').config();

const obrigatorias = ['JWT_SECRET'];

for (const chave of obrigatorias) {
  if (!process.env[chave]) {
    console.error(`Variável de ambiente obrigatória ausente: ${chave}`);
    process.exit(1);
  }
}

module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h',
  nodeEnv: process.env.NODE_ENV || 'development'
};