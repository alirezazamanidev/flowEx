
namespace NodeJS {
  interface ProcessEnv {
    APP_PORT: string;
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