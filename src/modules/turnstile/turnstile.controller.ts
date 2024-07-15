import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { TurnstileService } from './turnstile.service';
import { VerifyTokenDto } from './dto/turnstile.dto';



class VerifyTokenResponse {
  success: boolean;
}

@ApiTags('turnstile')
@Controller('turnstile')
export class TurnstileController {
  constructor(private readonly turnstileService: TurnstileService) {}

  @Post('verify')
  @ApiOperation({ summary: 'Verify Turnstile token' })
  @ApiBody({ description: 'Token to verify', type: VerifyTokenDto })
  @ApiResponse({ status: 200, description: 'Verification result', type: VerifyTokenResponse })
  async verify(@Body() body: VerifyTokenDto): Promise<VerifyTokenResponse> {
    const isValid = await this.turnstileService.verifyToken(body.token);
    return { success: isValid };
  }
}
