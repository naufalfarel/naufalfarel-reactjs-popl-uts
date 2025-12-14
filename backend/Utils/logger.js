const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file path
const logFile = path.join(logsDir, 'app.log');

/**
 * Structured logger utility
 * Writes logs in JSON format for Promtail to parse
 */
class Logger {
  constructor(service = 'backend') {
    this.service = service;
  }

  /**
   * Format log entry as JSON
   */
  formatLog(level, message, metadata = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      service: this.service,
      message,
      ...metadata,
    }) + '\n';
  }

  /**
   * Write log to file
   */
  writeLog(level, message, metadata) {
    const logEntry = this.formatLog(level, message, metadata);
    
    // Write to file
    fs.appendFileSync(logFile, logEntry, 'utf8');
    
    // Also output to console with colors for development
    if (process.env.NODE_ENV !== 'production') {
      const colors = {
        INFO: '\x1b[36m',    // Cyan
        WARN: '\x1b[33m',    // Yellow
        ERROR: '\x1b[31m',   // Red
        DEBUG: '\x1b[35m',   // Magenta
        RESET: '\x1b[0m',
      };
      const color = colors[level.toUpperCase()] || colors.RESET;
      console.log(`${color}[${level.toUpperCase()}]${colors.RESET} ${message}`, metadata && Object.keys(metadata).length > 0 ? metadata : '');
    }
  }

  info(message, metadata) {
    this.writeLog('info', message, metadata);
  }

  warn(message, metadata) {
    this.writeLog('warn', message, metadata);
  }

  error(message, metadata) {
    this.writeLog('error', message, metadata);
  }

  debug(message, metadata) {
    if (process.env.NODE_ENV === 'development') {
      this.writeLog('debug', message, metadata);
    }
  }
}

// Export singleton instance
module.exports = new Logger('backend');

