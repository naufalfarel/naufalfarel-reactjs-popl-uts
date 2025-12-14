const winston = require("winston");
const path = require("path");

const logDir = "/var/log/app";
const logFile = path.join(logDir, "app.log");

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // LOG KE FILE (ini yang dibaca Promtail)
    new winston.transports.File({
      filename: logFile,
    }),
    // LOG KE CONSOLE (biar kelihatan di docker logs)
    new winston.transports.Console(),
  ],
});

module.exports = logger;
