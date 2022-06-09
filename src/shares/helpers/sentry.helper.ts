import * as Sentry from '@sentry/node';
export class SentryHelper {
  // eslint-disable-next-line
  public static captureException(err): boolean {
    Sentry.captureException(err);
    return true;
  }
}
