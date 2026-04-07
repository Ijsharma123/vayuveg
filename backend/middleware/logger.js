module.exports = (req, res, next) => {
    const startTime = process.hrtime();
    res.on("finish", () => {
        const [seconds, nanoseconds] = process.hrtime(startTime);
        const durationMs = (seconds * 1000 + nanoseconds / 1e6).toFixed(1);
        console.info(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${durationMs}ms`);
    });
    next();
};
