import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailerService.name);
  constructor() {
    this.initializeTransporter();
  }
  private initializeTransporter() {
    const config = {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    };
    this.transporter = nodemailer.createTransport(config);
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error('SMTP Connection failed:', error);
      } else {
        this.logger.log('SMTP Connection successful');
      }
    });
  }
  async sendOtpForEmail(email:string,otp:string){
      const mailOptions = {
        from: process.env.SMTP_FROM_EMAIL,
        to: email,
        subject: 'Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; text-align: center;">Verification Code</h2>
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; text-align: center;">
              <p style="font-size: 16px; color: #666;">Your verification code:</p>
              <div style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 8px; margin: 20px 0;">
                ${otp}
              </div>
              <p style="font-size: 14px; color: #999;">
                This code is valid for 5 minutes and can only be used once.
              </p>
              <p style="font-size: 12px; color: #cc0000;">
                If you did not request this code, please ignore this email.
              </p>
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`OTP email sent successfully to ${email}`);
      return true;
  }
}
