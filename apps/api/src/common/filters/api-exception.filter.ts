import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const payload =
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse &&
      typeof (exceptionResponse as { message: unknown }).message === 'object' &&
      (exceptionResponse as { message: unknown }).message !== null
        ? ((exceptionResponse as { message: Record<string, unknown> }).message as {
            code?: string;
            message?: string;
            details?: unknown;
          })
        : (exceptionResponse as Record<string, unknown>);

    if (payload.code && payload.message) {
      response.status(status).json({
        statusCode: status,
        code: payload.code,
        message: payload.message,
        details: payload.details,
      });
      return;
    }

    response.status(status).json(exceptionResponse);
  }
}
