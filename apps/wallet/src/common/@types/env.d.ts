
namespace NodeJS {
  interface ProcessEnv {
   
    // Auth
    OTP_EXPIRATION_MINUTES: number;
    JWT_SECRET_KEY: string;
    // Redis
    REDIS_URL:string
    // Database
    POSTGRES_HOST: string;
    POSTGRES_PORT: number;
    POSTGRES_USERNAME: string;
    POSTGRES_PASSWORD: string;
    POSTGRES_DATABASE: string;
  
  
  }
}