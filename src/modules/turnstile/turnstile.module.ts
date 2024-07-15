import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TurnstileService } from './turnstile.service';
import { TurnstileController } from './turnstile.controller';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [TurnstileController],
  providers: [TurnstileService],
})
export class TurnstileModule {}
