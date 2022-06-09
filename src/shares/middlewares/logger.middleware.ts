import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import * as morgan from 'morgan';
import { getConfig } from 'src/configs';

const env = getConfig().get<string>('app.env');

morgan.token('body', (req: Request) => {
  const excludeApis = [];
  if (excludeApis.includes(req.path)) {
    return {};
  }
  return req.body;
});

function jsonFormat(tokens, req, res): string {
  return JSON.stringify({
    'remote-address': tokens['remote-addr'](req, res),
    time: tokens['date'](req, res, 'iso'),
    method: tokens['method'](req, res),
    url: tokens['url'](req, res),
    'http-version': tokens['http-version'](req, res),
    'status-code': Number(tokens['status'](req, res)),
    'content-length': Number(tokens['res'](req, res, 'content-length')),
    referrer: tokens['referrer'](req, res),
    headers: JSON.stringify(req['headers']),
    'user-agent': tokens['user-agent'](req, res),
    'response-time': (Number(tokens['response-time'](req, res)) / 1000).toFixed(3),
    body: JSON.stringify(tokens['body'](req, res)),
  });
}

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: Logger) {
    this.logger.setContext('Http');
  }

  // eslint-disable-next-line
  use(req: Request, res: Response, next: (err?: Error) => void) {
    return morgan(jsonFormat, {
      stream: {
        write: (str) => {
          const data = JSON.parse(str);
          const logInfo = {
            ...data,
            context: 'Http',
            level: 'info',
            message: str,
            timestamp: new Date().toISOString(),
          };

          if (env != 'development') {
            console.log(JSON.stringify(logInfo));
          }
        },
      },
    })(req, res, next);
  }
}
