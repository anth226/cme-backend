import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import {config} from '../scripts/generate-ormconfig'

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  private logger: Logger = new Logger('AppController');

  async sendAttemptLoginEmail(email) {
    
    this.logger.log(`Sending email to => ${email}`);

    await this.mailerService.sendMail({
      to: email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Welcome to MonkeyEmpire',
      template: './apps/cme-backend/src/mail/templates/login_attempt_notification', // `.hbs` extension is appended automatically
      context: { // ✏️ filling curly brackets with content
        name: email,
        date : new Date(Date.now())
      },
    });
  }

  async sendVerificationEmail(user) {
    
    this.logger.log(`Sending email to => ${user.username} for verification with link ${user.email_verification_token}`);
    
    await this.mailerService.sendMail({
      to: user.username,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Email verification for MonkeyEmpire',
      template: './apps/cme-backend/src/mail/templates/email_verification_message', // `.hbs` extension is appended automatically
      context: { // ✏️ filling curly brackets with content
        name: user.username,
        link : config.url+"/auth/email/verify/"+encodeURIComponent(user.email_verification_token),
        date : new Date(Date.now())
      },
    });
  }

}