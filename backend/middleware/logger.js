// Logs method, URL and timestamp for every incoming request
module.exports = (req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
};
