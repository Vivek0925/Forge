import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';




async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  app.use(cookieParser());

  const port = process.env.PORT || 4000;

  await app.listen(port, '0.0.0.0');

  console.log(`Forge API listening on port ${port}`);
}

bootstrap();
