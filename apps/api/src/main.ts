import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';

const csrfCookieName = 'csrf_token';

function matchesCsrfToken(expected: unknown, received: unknown) {
  if (typeof expected !== 'string' || typeof received !== 'string') {
    return false;
  }

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);

  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.use((req, res, next) => {
    const isStateChangingMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(
      req.method,
    );
    const hasBearerToken =
      typeof req.headers.authorization === 'string' &&
      req.headers.authorization.startsWith('Bearer ');
    const isLoginOrRegistration =
      req.path === '/auth/login' || req.path === '/auth/register';
    const isCookieAuthenticatedMutation =
      Boolean(req.cookies?.access_token) && !hasBearerToken;

    if (
      isStateChangingMethod &&
      (isCookieAuthenticatedMutation || isLoginOrRegistration) &&
      !hasBearerToken &&
      !matchesCsrfToken(
        req.cookies[csrfCookieName],
        req.headers['x-csrf-token'],
      )
    ) {
      res.status(403).json({ message: 'Invalid CSRF token' });
      return;
    }

    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  const port = process.env.PORT || 4000;

  await app.listen(port, '0.0.0.0');

  console.log(`Forge API listening on port ${port}`);
}

bootstrap();
