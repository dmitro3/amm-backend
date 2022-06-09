import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { join } from 'path';
import { BullModule } from '@nestjs/bull';
import { MailProcessor } from 'src/modules/mail/job/mail.processor';
import { MailService } from 'src/modules/mail/mail.service';
import * as config from 'config';

const mailHost = config.get<number>('mail.host');
const mailPort = config.get<number>('mail.port');
const mailAccount = config.get<number>('mail.account');
const mailPassword = config.get<number>('mail.password');
@Module({
  imports: [
    MailerModule.forRoot({
      // transport: 'smtps://user@example.com:topsecret@smtp.example.com',
      // or
      transport: {
        host: mailHost,
        port: mailPort,
        secure: true,
        auth: {
          user: mailAccount,
          pass: mailPassword,
        },
      },
      defaults: {
        from: '"No Reply" <noreply@example.com>',
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    BullModule.registerQueue({
      name: 'mail',
    }),
  ],
  providers: [MailService, MailProcessor],
  exports: [MailService],
})
export class MailModule {}
