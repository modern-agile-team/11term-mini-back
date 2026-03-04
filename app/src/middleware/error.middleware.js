("use strict");

module.exports = (err, req, res, next) => {
  const status = err.statusCode || err.status || 500;
  const message = err.message || "서버 에러";

  console.error(err);

  res.status(status).json({ message });
};
