import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TurnstileService {
  private readonly secretKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.secretKey = this.configService.get<string>('TURNSTILE_SECRET_KEY');
  }

  async verifyToken(token: string): Promise<boolean> {
    const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

    const response = await firstValueFrom(
      this.httpService.post(url, null, {
        params: {
          secret: this.secretKey,
          response: token,
        },
      })
    );

    return response.data.success;
  }
}
