import winston from "winston";

const { combine, timestamp, printf, colorize, json } = winston.format;

// تنسيق مخصص للـ console
const consoleFormat = combine(
    colorize(),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    printf(({ level, message, timestamp, ...meta }) => {
        return `[${timestamp}] ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ""}`;
    })
);

// تنسيق للملفات بدون ألوان
const fileFormat = combine(
    timestamp(),
    json()
);

const logger = winston.createLogger({
    level: "info",
    transports: [
        // ✅ Console في بيئة التطوير
        ...(process.env.NODE_ENV !== "production"
            ? [new winston.transports.Console({ format: consoleFormat })]
            : []),

        // ✅ ملف مشترك
        new winston.transports.File({
            filename: "logs/combined.log",
            format: fileFormat,
        }),
    ],
});

export default logger;
