// src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule, seconds } from '@nestjs/throttler';
import { HTTP_MAX_REDIRECTS, HTTP_TIMEOUT, THROTTLE_LIMIT, THROTTLE_TTL } from './common/constants';
import { HttpModule } from '@nestjs/axios';
import { CacheConfigModule } from './cache.module'; // Ensure this module is correctly defined
import { UserModule } from './modules/user/user.module';
import { ManuscriptModule } from './modules/manuscript/manuscript.module';
import { ReviewerModule } from './modules/reviewer/reviewer.module';
import { EditorModule } from './modules/editor/editor.module';
import { AuthorModule } from './modules/author/author.module';
import { TurnstileModule } from './modules/turnstile/turnstile.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      cache: true, 
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    CacheConfigModule,
    JwtModule.register({
      global: true,
      signOptions: { expiresIn: '19000s' },
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: seconds(configService.get(THROTTLE_TTL) || 10), // default is 10 seconds
          limit: configService.get(THROTTLE_LIMIT) || 20, // default is 20 requests
        },
      ],
    }),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get(HTTP_TIMEOUT),
        maxRedirects: configService.get(HTTP_MAX_REDIRECTS),
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    AuthorModule,
    AuthModule,
    EditorModule,
    UserModule,
    ManuscriptModule,
    ReviewerModule,
    TurnstileModule,
   

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
