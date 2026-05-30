import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import Pino from 'pino';

interface RequestState {
  requestId: string;
  startTime: number;
}

declare module 'fastify' {
  interface FastifyRequest {
    requestId: string;
    state: RequestState;
  }
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  private logger: Pino.Logger;

  constructor(private options: { logger: Pino.Logger; requestIdHeader: string }) {
    this.logger = options.logger;
  }

  use(req: FastifyRequest, res: FastifyReply, done: () => void) {
    const requestId = (req.headers[this.options.requestIdHeader] as string) || uuidv4();
    req.requestId = requestId;
    req.state = { requestId, startTime: Date.now() };

    this.logger.info({
      requestId,
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
    });

    res.header('x-request-id', requestId);

    done();
  }
}
