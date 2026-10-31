/**
 * Custom Request Timing & Logging Middleware
 * Practical No. 6: RESTful CRUD API
 * Student: Ayush (PRN: 2304362)
 */

const requestLogger = (req, res, next) => {
    const start = process.hrtime();

    res.on('finish', () => {
        const diff = process.hrtime(start);
        const durationInMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);
        const status = res.statusCode;
        const color = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m';
        const reset = '\x1b[0m';

        console.log(
            `[API Log] ${req.method} ${req.originalUrl} -> ${color}${status}${reset} (${durationInMs} ms)`
        );
    });

    next();
};

module.exports = requestLogger;
