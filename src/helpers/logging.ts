import winston from "winston"
import "winston-daily-rotate-file"
import config from "../config"
import safe from 'safe-stable-stringify';

const { combine, timestamp, json, colorize, printf, splat } = winston.format

const errorFilter = winston.format((info, opts) => {
  return info.level === "error" ? info : false
})

const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (metadata && Object.keys(metadata).length) {
    msg += ` ${safe(metadata)}`;
  }
  return msg;
});

const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: "logs/farid-server-%DATE%.log",
  datePattern: "YYYY-MM-DD",
})

const logger = winston.createLogger({
  level: config.log_level || "info",
  format: winston.format.combine(timestamp(), json()),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp(),
        splat(),
        consoleFormat
      )
    }),
    fileRotateTransport,
    new winston.transports.File({
      filename: "logs/farid-server-error.log",
      level: "error",
      format: combine(errorFilter(), timestamp(), json()),
    }),
  ],
})

export default logger
