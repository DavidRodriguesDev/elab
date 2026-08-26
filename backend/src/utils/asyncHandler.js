// Evita repetir try/catch em toda rota async — qualquer erro cai automaticamente
// no middleware de erro central.
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};