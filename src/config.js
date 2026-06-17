import dotenv from 'dotenv';

dotenv.config();

function readBoolean(value, fallback = false) {
  if (value === undefined || value === '') {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function readNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export const appConfig = {
  port: readNumber(process.env.PORT, 3010),
  host: process.env.HOST || '127.0.0.1',
  demoMode: String(process.env.DEMO_MODE || 'auto').toLowerCase(),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  adminRegistrationCode: process.env.ADMIN_REGISTRATION_CODE || 'hope-admin-2026'
};

export function createSqlConfig() {
  const instanceName = process.env.DB_INSTANCE || '';
  const config = {
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_DATABASE || 'DaritNadezhduSchool',
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    options: {
      encrypt: readBoolean(process.env.DB_ENCRYPT, false),
      trustServerCertificate: readBoolean(process.env.DB_TRUST_SERVER_CERTIFICATE, true)
    }
  };

  if (instanceName) {
    config.options.instanceName = instanceName;
  } else if (process.env.DB_PORT !== '') {
    config.port = readNumber(process.env.DB_PORT, 1433);
  }

  return config;
}
