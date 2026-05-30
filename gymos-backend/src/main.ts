import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
} from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { exec } from 'child_process';
import { v4 as uuidv4 } from 'uuid';

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    new FastifyAdapter() as any,
  );

  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api/v1', {
    exclude: ['docs'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors({
    origin: configService.get('CORS_ORIGINS', '*'),
    credentials: true,
  });

  const fastify = app.getHttpAdapter().getInstance();
  fastify.addHook('onRequest', (request, reply, done) => {
    const incomingRequestId = request.headers['x-request-id'];
    const requestId = Array.isArray(incomingRequestId)
      ? incomingRequestId[0]
      : incomingRequestId || uuidv4();

    request.requestId = requestId;
    reply.header('x-request-id', requestId);
    done();
  });

  const frontendPath = resolve(process.cwd(), '..', 'gymos-admin-panel.html');
  const sendFrontend = async (_request: unknown, reply: { type: (value: string) => { send: (body: string) => unknown } }) => {
    if (!existsSync(frontendPath)) {
      return reply.type('text/plain').send('Frontend file not found');
    }
    return reply.type('text/html; charset=utf-8').send(readFileSync(frontendPath, 'utf8'));
  };

  fastify.get('/', sendFrontend);
  fastify.get('/gymos-admin-panel.html', sendFrontend);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('GymOS API')
    .setDescription('Backend API for GymOS - Gym Administration SaaS')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('members', 'Member management')
    .addTag('memberships', 'Membership and plan management')
    .addTag('checkins', 'Check-in operations')
    .addTag('dashboard', 'Dashboard and reports')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get('PORT', 3000);
  await app.listen(port, '0.0.0.0');

  const appUrl = `http://127.0.0.1:${port}`;
  if (process.env['OPEN_BROWSER'] === 'true') {
    setTimeout(() => {
      exec(`cmd /c start "" "${appUrl}"`);
    }, 600);
  }

  console.log(`GymOS Backend running on port ${port}`);
  console.log(`GymOS Admin Panel available at ${appUrl}`);
}

bootstrap();
