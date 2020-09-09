//Important: Set the env to either development or production to use the appropriate config
/****************************************/
const env = "development"; // 'development' or 'production'
/*******************************************/

let appRoot = require("app-root-path");
const { format } = require("winston");
//const { combine, timestamp, printf } = format;
const timestampFormat = 'YYYY-MM-DD HH:mm:ss.SSS';

//All Configurations
const development = {
  simulationMode: 'off',
  traversal:'on',
  traversalFilename: `C:/AGC_Data/traversal/traversal`,
  server: {
    port: 9010,
    timeoutMs: 10000,
    usessl: 'on'
  },
  sms:{
    mobileNumber:'',
    otp:'',
    passwordResetSms:'',
    username:'',
    password:'',
    source:''
  },
  logs: {
    file: {
      level: 'debug',
      filename: `C:/AGC_Data/Logs/HelpdeskWebhook/%DATE%-trace.log`,
      datePattern: "YYYY-MM-DD",
      zippedArchive: false,
      maxSize: '10m',
      maxFiles: '30',
      format: format.combine(
          format.timestamp({format: timestampFormat}),
          format.printf(
              info => `${info.timestamp} [${info.logId}] ${info.level}: ${info.message}`
          )
      ),
    },
    console: {
      level: 'info',
      datePattern: "YYYY-MM-DD",
      format: format.combine(
        format.colorize(),
        format.timestamp({format: timestampFormat}),
        format.printf(
        info => `${info.timestamp} [${info.logId}] ${info.level}: ${info.message}`
        )
      ),
    },
    morgan: {
      format: ":method :url :status :res[content-length] - :response-time ms"
    }
  }
};

const production = {
  simulationMode: 'off',  
  traversal:'on',
  traversalFilename: `D:/AGC_Data/traversal/traversal`,
  server: {
    port: 9000,
    timeoutMs: 10000,
    usessl: 'on'
  },
    logs: {
      file: {
        level: 'debug',
        filename: `D:/AGC_Data/Logs/Webhook/%DATE%-trace.log`,
        datePattern: "YYYY-MM-DD",
        zippedArchive: false,
        maxSize: '10m',
        maxFiles: '30',
        format: format.combine(
            format.timestamp({format: timestampFormat}),
            format.printf(
                info => `${info.timestamp} [${info.logId}] ${info.level}: ${info.message}`
            )
        ),
      },
      console: {
        level: 'info',
        datePattern: "YYYY-MM-DD",
        format: format.combine(
          format.colorize(),
          format.timestamp({format: timestampFormat}),
          format.printf(
          info => `${info.timestamp} [${info.logId}] ${info.level}: ${info.message}`
          )
        ),
      },
      morgan: {
        format: ":method :url :status :res[content-length] - :response-time ms"
      }
    }
  };

const config = {
  development,
  production
};

module.exports = config[env];
