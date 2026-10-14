const { Logtail } = require('@logtail/node');

// Support both BETTERSTACK_SOURCE_TOKEN and LOGTAIL_SOURCE_TOKEN
const sourceToken = process.env.BETTERSTACK_SOURCE_TOKEN || process.env.LOGTAIL_SOURCE_TOKEN;

let logtail = null;
if (sourceToken) {
  try {
    logtail = new Logtail(sourceToken);
    console.log('[Better Stack] Logtail connected successfully');
  } catch (err) {
    console.warn('[Better Stack] Failed to initialize Logtail client:', err.message);
  }
} else {
  console.log('[Better Stack] No BETTERSTACK_SOURCE_TOKEN found. Logging to standard console.');
}

const logger = {
  info: (message, context = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[INFO ${timestamp}] ${message}`, Object.keys(context).length ? context : '');
    if (logtail) {
      logtail.info(message, context).catch(() => {});
    }
  },

  warn: (message, context = {}) => {
    const timestamp = new Date().toISOString();
    console.warn(`[WARN ${timestamp}] ${message}`, Object.keys(context).length ? context : '');
    if (logtail) {
      logtail.warn(message, context).catch(() => {});
    }
  },

  error: (message, context = {}) => {
    const timestamp = new Date().toISOString();
    console.error(`[ERROR ${timestamp}] ${message}`, Object.keys(context).length ? context : '');
    if (logtail) {
      logtail.error(message, context).catch(() => {});
    }
  },

  // Express HTTP Request Logging Middleware
  requestLogger: (req, res, next) => {
    // Skip logging health checks to avoid noise
    if (req.path === '/health' || req.path === '/api/health') {
      return next();
    }

    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const logData = {
        method: req.method,
        path: req.originalUrl || req.path,
        statusCode: res.statusCode,
        durationMs: duration,
        ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      };

      if (res.statusCode >= 500) {
        logger.error(`HTTP ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`, logData);
      } else if (res.statusCode >= 400) {
        logger.warn(`HTTP ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`, logData);
      } else {
        logger.info(`HTTP ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`, logData);
      }
    });

    next();
  }
};

module.exports = logger;
