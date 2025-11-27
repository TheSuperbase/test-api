import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true, // 이상한 필드 들어오면 에러
      transform: true, // string → number 같은 기본 변환
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('Badminton Tournament Calendar API')
    .setDescription('배드민턴 토너먼트 캘린더 API 문서')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
