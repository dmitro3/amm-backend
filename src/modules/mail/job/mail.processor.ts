import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { forwardRef, Inject, Logger } from '@nestjs/common';
import { MailService } from 'src/modules/mail/mail.service';

@Processor('mail')
export class MailProcessor {
  private readonly logger = new Logger(MailProcessor.name);
  @Inject(forwardRef(() => MailService))
  private readonly mailService: MailService;

  @Process('sendVerifyEmail')
  async sendVerifyEmail(job: Job): Promise<number> {
    this.logger.debug('Start job: sendVerifyEmail');
    const { email, verifyEmailUrl, publicLink } = job.data;
    try {
      await this.mailService.sendVerifyEmail(email, verifyEmailUrl, publicLink);
    } catch (e) {
      this.logger.debug(e);
    }
    this.logger.debug('Done job: sendVerifyEmail');
    return 1;
  }

  @Process('sendPasswordChangedEmail')
  async sendPasswordChangedEmail(job: Job): Promise<number> {
    this.logger.debug('Start job: sendPasswordChangedEmail');
    const { email, publicLink } = job.data;
    try {
      await this.mailService.sendPasswordChangedEmail(email, publicLink);
    } catch (e) {
      this.logger.debug(e);
    }
    this.logger.debug('Done job: sendPasswordChangedEmail');
    return 1;
  }

  @Process('sendUserConfirmation')
  async sendUserConfirmation(job: Job): Promise<number> {
    this.logger.debug('Start job: sendUserConfirmation');
    const { user, token } = job.data;
    try {
      await this.mailService.sendUserConfirmation(user, token);
    } catch (e) {
      this.logger.debug(e);
    }
    this.logger.debug('Done job: sendUserConfirmation');
    return 1;
  }

  @Process('sendForgotPasswordEmail')
  async sendForgotPasswordEmail(job: Job): Promise<number> {
    this.logger.debug('Start job: sendForgotPasswordEmail');
    const { email, token, publicLink } = job.data;
    try {
      await this.mailService.sendForgotPasswordEmail(email, token, publicLink);
    } catch (e) {
      this.logger.debug(e);
    }
    this.logger.debug('Done job: sendForgotPasswordEmail');
    return 1;
  }

  @Process('sendPasswordAdmin')
  async sendPasswordAdmin(job: Job): Promise<number> {
    this.logger.debug('Start job: sendForgotPasswordEmail');
    const { email, password } = job.data;
    try {
      await this.mailService.sendPasswordAdmin(email, password);
    } catch (e) {
      this.logger.debug(e);
    }
    this.logger.debug('Done job: sendForgotPasswordEmail');
    return 1;
  }

  @Process('sendMailDisableAccount')
  async sendMailDisableAccount(job: Job): Promise<number> {
    this.logger.debug('Start job: sendMailDisableAccount');
    const { email, supportEmail } = job.data;
    try {
      await this.mailService.sendMailDisableAccountJob(email, supportEmail);
    } catch (e) {
      this.logger.debug(e);
    }
    this.logger.debug('Done job: sendMailDisableAccount');
    return 1;
  }

  @Process('sendMailEnableAccount')
  async sendMailEnableAccount(job: Job): Promise<number> {
    this.logger.debug('Start job: sendMailEnableAccount');
    const { email, signinLink } = job.data;
    try {
      await this.mailService.sendMailEnableAccountJob(email, signinLink);
    } catch (e) {
      this.logger.debug(e);
    }
    this.logger.debug('Done job: sendMailEnableAccount');
    return 1;
  }
}
