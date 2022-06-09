import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import Bull, { Queue } from 'bull';
import { User } from 'src/models/entities/users.entity';
import { getConfig } from 'src/configs';
import * as config from 'config';

const mailFrom = config.get<number>('mail.from');
const FCX_PAGE = getConfig().get<string>('fcx.page');

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService, @InjectQueue('mail') private readonly queue: Queue) {}

  sendConfirmationEmail<T>(user: User, token: string): Promise<Bull.Job<T>> {
    return this.queue.add('sendUserConfirmation', { user, token });
  }

  async sendUserConfirmation(user: User, token: string): Promise<void> {
    const url = `${getConfig().get<string>('fcx.admin')}/api/v1/users/confirm?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      // from: `"Support Team" <${mailFrom}>`, // override default from
      subject: 'Confirm your Email',
      template: 'src/modules/mail/templates/confirmation.hbs', // `.hbs` extension is appended automatically
      context: {
        name: user.fullname,
        url,
      },
    });
  }

  sendVerifyEmailJob<T>(email: string, verifyEmailUrl: string): Promise<Bull.Job<T>> {
    return this.queue.add('sendVerifyEmail', {
      email,
      verifyEmailUrl,
      publicLink: FCX_PAGE,
    });
  }

  async sendVerifyEmail(email: string, verifyEmailUrl: string, publicLink: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      from: `"Support Team" <${mailFrom}>`, // override default from
      subject: 'Verify Email',
      template: 'src/modules/mail/templates/verify-email.hbs', // `.hbs` extension is appended automatically
      context: {
        verifyEmailUrl,
        publicLink,
      },
    });
  }

  sendForgotPasswordEmailJob<T>(email: string, token: number): Promise<Bull.Job<T>> {
    return this.queue.add('sendForgotPasswordEmail', {
      email,
      token,
      publicLink: FCX_PAGE,
    });
  }

  async sendForgotPasswordEmail(email: string, token: string, publicLink: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      from: `"Support Team" <${mailFrom}>`, // override default from
      subject: 'Reset Password Email',
      template: 'src/modules/mail/templates/forgot-password.hbs', // `.hbs` extension is appended automatically
      context: {
        token: token,
        supportEmail: 'fcxadmin@velo.org',
        publicLink,
      },
    });
  }

  sendPasswordChangedEmailJob<T>(email: string): Promise<Bull.Job<T>> {
    return this.queue.add('sendPasswordChangedEmail', {
      email,
      publicLink: FCX_PAGE,
    });
  }

  async sendPasswordChangedEmail(email: string, publicLink: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      from: `"Support Team" <${mailFrom}>`, // override default from
      subject: 'Your Password Have Changed',
      template: 'src/modules/mail/templates/password-changed.hbs', // `.hbs` extension is appended automatically
      context: {
        supportEmail: 'fcxadmin@velo.org',
        publicLink,
      },
    });
  }

  async sendPasswordAdminQueue<T>(email: string, password: string): Promise<Bull.Job<T>> {
    return await this.queue.add('sendPasswordAdmin', { email, password });
  }

  async sendPasswordAdmin(email: string, password: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      from: `"Support Team" <${mailFrom}>`, // override default from
      subject: 'Welcome to FCX 2.0!',
      template: 'src/modules/mail/templates/send-password-admin.hbs', // `.hbs` extension is appended automatically
      context: {
        email,
        password,
        publicLink: FCX_PAGE,
      },
    });
  }

  async sendMailDisableAccount<T>(email: string, supportEmail: string): Promise<Bull.Job<T>> {
    return await this.queue.add('sendMailDisableAccount', { email, supportEmail });
  }

  async sendMailDisableAccountJob(email: string, supportEmail: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      from: `"Support Team" <${mailFrom}>`, // override default from
      subject: 'Disable Account',
      template: 'src/modules/mail/templates/disable-account.hbs',
      context: {
        email,
        supportEmail,
        publicLink: FCX_PAGE,
      },
    });
  }

  async sendMailEnableAccount<T>(email: string, signinLink: string): Promise<Bull.Job<T>> {
    return await this.queue.add('sendMailEnableAccount', { email, signinLink });
  }

  async sendMailEnableAccountJob(email: string, signinLink: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      from: `"Support Team" <${mailFrom}>`, // override default from
      subject: 'Enable Account',
      template: 'src/modules/mail/templates/enable-account.hbs',
      context: {
        email,
        signinLink,
        publicLink: FCX_PAGE,
      },
    });
  }
}
