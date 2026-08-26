const rateLimit = require('express-rate-limit');

// Limita tentativas de login/registro por IP — mitiga brute-force e credential stuffing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: { sucesso: false, erro: 'Muitas tentativas. Tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { authLimiter };