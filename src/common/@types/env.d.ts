
namespace NodeJS {
  interface ProcessEnv {
    APP_PORT: string;
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
    // SMTP
    SMTP_HOST: string;
    SMTP_PORT: number;
    SMTP_SECURE: boolean;
    SMTP_PASSWORD: string;
    SMTP_USERNAME: string;
    // ZarinPal
    ZARINPAL_MERCHANT_ID: string;
    ZARINPAL_PAYMENT_REQUEST_URL: string;
    ZARINPAL_PAYMENT_VERIFY_URL: string;
    ZARINPAL_START_PAY_URL: string;
    ZARINPAL_CALLBACK_URL:string
  }
}