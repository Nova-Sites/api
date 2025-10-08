import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import fs from 'fs';
import path from 'path';
import { ENV } from '@/lib';

const logDir = path.join(process.cwd(), 'logs');

// 🏗️ Create logs directory if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const { combine, timestamp, printf, colorize, errors, json } = format;

// 🧾 Format console (dev)
const consoleFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  printf(({ level, message, timestamp }) => `[${timestamp}] ${level}: ${message}`)
);

// 🪵 Format file (prod)
const fileFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  json()
);

// 🌀 Daily Rotate File (automatically create new file by day)
const dailyRotateTransport = new DailyRotateFile({
  filename: path.join(logDir, 'app-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d', // giữ log 14 ngày
  zippedArchive: true,
});

// 🧯 File log for error
const dailyErrorTransport = new DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '30d',
  level: 'error',
  zippedArchive: true,
});

// 🛡️ Main Logger
const baseLogger = createLogger({
  level: ENV.NODE_ENV === 'production' ? 'info' : 'debug',
  format: fileFormat,
  transports: [
    dailyRotateTransport,
    dailyErrorTransport,
  ],
  exceptionHandlers: [
    new transports.File({ filename: path.join(logDir, 'exceptions.log') }),
  ],
  rejectionHandlers: [
    new transports.File({ filename: path.join(logDir, 'rejections.log') }),
  ],
  exitOnError: false, // NO crash when exception
});

// 🔍 Add console transport for development
if (ENV.NODE_ENV !== 'production') {
  baseLogger.add(new transports.Console({ format: consoleFormat }));
}

export const Logger = {
  info: (msg: string) => baseLogger.info(msg),
  warn: (msg: string) => baseLogger.warn(msg),
  error: (msg: string) => baseLogger.error(msg),
};

export default baseLogger;
