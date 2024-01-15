interface EnvVariables {
  MONGO_CONNECTION_URL: string | undefined;
  JWT_SECRET: string | undefined;
  BCRYPT_SALT: string | undefined;
  CLOUDINARY_API_SECRET: string | undefined;
  CLOUDNAME: string | undefined;
  CLOUDINARY_API_KEY: string | undefined;
  REDIS_URL: string | undefined;
  SERVER_URL: string | undefined;
  ADMIN_EMAIL: string | undefined;
  EMAIL_FROM: string | undefined;
  EMAIL_PASSWORD: string | undefined;
  EMAIL_HOST: string | undefined;
}
declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvVariables {}
  }
}

export {};
