import nodemailer from 'nodemailer';
import { OTP_CONSTANTS } from '@/constants';

export class EmailService {
  private static transporter: nodemailer.Transporter;

  /**
   * Initialize email transporter
   */
  static initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      host: process.env['EMAIL_HOST'] || 'smtp.gmail.com',
      port: parseInt(process.env['EMAIL_PORT'] || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env['EMAIL_USER'],
        pass: process.env['EMAIL_PASS'],
      },
    });
  }

  /**
   * Generate OTP code
   */
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send OTP email
   */
  static async sendOTPEmail(email: string, otp: string, username: string): Promise<boolean> {
    try {
      if (!this.transporter) {
        this.initializeTransporter();
      }

      const mailOptions = {
        from: process.env['EMAIL_USER'],
        to: email,
        subject: 'Xác thực tài khoản - Nova Sites',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
              <h1 style="color: #333; margin: 0;">Nova Sites</h1>
            </div>
            <div style="padding: 30px; background-color: #ffffff;">
              <h2 style="color: #333; margin-bottom: 20px;">Xin chào ${username}!</h2>
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Cảm ơn bạn đã đăng ký tài khoản tại Nova Sites. Để hoàn tất quá trình đăng ký, 
                vui lòng sử dụng mã OTP dưới đây:
              </p>
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
              </div>
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Mã OTP này sẽ hết hạn sau ${OTP_CONSTANTS.EXPIRES_IN_MINUTES} phút.
              </p>
              <p style="color: #999; font-size: 14px; margin-top: 30px;">
                Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.
              </p>
            </div>
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
              <p style="color: #666; margin: 0; font-size: 14px;">
                © 2024 Nova Sites. All rights reserved.
              </p>
            </div>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent: %s', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(email: string, resetToken: string, username: string): Promise<boolean> {
    try {
      if (!this.transporter) {
        this.initializeTransporter();
      }

      const resetUrl = `${process.env['FRONTEND_URL'] || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: process.env['EMAIL_USER'],
        to: email,
        subject: 'Đặt lại mật khẩu - Nova Sites',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
              <h1 style="color: #333; margin: 0;">Nova Sites</h1>
            </div>
            <div style="padding: 30px; background-color: #ffffff;">
              <h2 style="color: #333; margin-bottom: 20px;">Xin chào ${username}!</h2>
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình. 
                Vui lòng nhấp vào nút bên dưới để đặt lại mật khẩu:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background-color: #007bff; color: #ffffff; padding: 12px 30px; 
                          text-decoration: none; border-radius: 5px; display: inline-block;">
                  Đặt lại mật khẩu
                </a>
              </div>
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Nếu nút không hoạt động, bạn có thể copy và paste link sau vào trình duyệt:
              </p>
              <p style="color: #007bff; word-break: break-all; font-size: 14px;">
                ${resetUrl}
              </p>
              <p style="color: #999; font-size: 14px; margin-top: 30px;">
                Link này sẽ hết hạn sau 1 giờ. Nếu bạn không yêu cầu đặt lại mật khẩu, 
                vui lòng bỏ qua email này.
              </p>
            </div>
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
              <p style="color: #666; margin: 0; font-size: 14px;">
                © 2024 Nova Sites. All rights reserved.
              </p>
            </div>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent: %s', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }
  }
} 