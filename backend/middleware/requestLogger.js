const logger = require("../Utils/logger");

module.exports = (req, res, next) => {
  res.on("finish", () => {
    logger.info({
      action: "HTTP_REQUEST",
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      userId: req.userId || "guest",
      ip: req.ip,
    });
  });
  next();
};
