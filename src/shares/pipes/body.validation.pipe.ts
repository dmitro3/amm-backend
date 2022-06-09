import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export class BodyValidationPipe extends ValidationPipe {
  constructor() {
    super({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      skipMissingProperties: false,
      exceptionFactory: (errs: [ValidationError]) => {
        return new HttpException(
          {
            message: `Validation errors on these fields: ${this.getMessageFromErrs(errs)}`,
            errorCode: 400,
            statusCode: 1000,
            messageDetail: this.getPropertyAndContraints(errs),
          },
          HttpStatus.BAD_REQUEST,
        );
      },
    });
  }

  getMessageFromErrs(errs: ValidationError[], parent: string = null): string {
    return errs
      .map((e) => {
        const current = parent ? `${parent}.${e.property}` : `${e.property}`; //`${parent ? `${parent}.` : ''}${e.property}`;
        if (e.children.length > 0) return `${this.getMessageFromErrs(e.children, current)}`;
        else return current;
      })
      .join(', ');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getPropertyAndContraints(errs: ValidationError[]): any[] {
    const details = [];
    errs.forEach((e) => {
      if (e.children.length > 0) {
        this.getPropertyAndContraints(e.children).forEach((e) => details.push(e));
      } else {
        details.push({
          property: e.property,
          contraints: Object.values(e.constraints),
        });
      }
    });
    return details;
  }
}
