import * as config from 'config';

const saltRound = config.get<string>('app.salt_round');
const accessTokenSecret = config.get<string>('app.jwt_access_token_secret');
const accessTokenExpiry = config.get<string>('app.jwt_access_token_expiration_time');
const refreshTokenSecret = config.get<string>('app.jwt_refresh_token_secret');
const refreshTokenExpiry = config.get<string>('app.jwt_refresh_token_expiration_time');
const verifyEmailTokenSecret = config.get<string>('app.jwt_verify_email_token_secret');
const verifyEmailTokenExpiry = config.get<string>('app.jwt_verify_email_token_expiration_time');

export const jwtConstants = {
  accessTokenSecret: accessTokenSecret, // access token
  accessTokenExpiry: accessTokenExpiry, // access token
  refreshTokenSecret: refreshTokenSecret,
  refreshTokenExpires: refreshTokenExpiry,
  verifyEmailTokenSecret: verifyEmailTokenSecret,
  verifyEmailTokenExpiry: verifyEmailTokenExpiry,
  saltRound: Number(saltRound),
};

export enum AuthErrorStatus {
  InvalidGoogleCaptcha = 'INVALID_GOOGLE_CAPTCHA',
}
