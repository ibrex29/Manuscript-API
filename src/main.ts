import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { VersioningType } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import * as compression from 'compression';

const corsOptions: CorsOptions = {
  origin: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'], 
  allowedHeaders: ['*'], 
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(compression()); // Use compression to improve response time
  app.enableCors(corsOptions); // Enable CORS with the specified options

  app.setGlobalPrefix('api'); // Set a global prefix for all routes
  app.enableVersioning({ type: VersioningType.URI }); // Enable API versioning

  // Global validation pipe with custom settings
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that do not have any decorators
      transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are found
    }),
  );

  // // Global interceptor for class serialization
  // app.useGlobalInterceptors(
  //   new ClassSerializerInterceptor(app.get('Reflector')),
  // );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Manuscript management API')
    .setDescription('API')
    .setVersion('1.0')
    .addBearerAuth() 
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document); // Set up the Swagger module

  const port = process.env.PORT || 4000;
  // app.useGlobalGuards(new JwtAuthGuard(Reflect));
  await app.listen(port); 
}

bootstrap();
