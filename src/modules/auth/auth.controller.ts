import {
    Body,
    Controller,
    Get,
    Headers,
    NotImplementedException,
    Patch,
    Post,
    Request,
    UseGuards,
    Version,
  } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
// import { Public } from '@prisma/client/runtime/library';
import { AuthService } from './auth.service';
import { EmailLoginDto } from './dtos/email-login.dto';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { Public } from 'src/common/constants/routes.constant';
  
 
  
  @ApiTags('Authentication')
  @ApiBearerAuth()
  @Controller('auth')
  export class AuthController {
    constructor(
      private readonly authService: AuthService,
    ) {}
  
    @Public()
    @Version('1')
    @Post('login/email')
    @UseGuards(LocalAuthGuard)
    async emailLogin(@Request() req, @Body() emailLogin: EmailLoginDto) {
      console.log(req.user);
      return this.authService.login(req.user);
    }
  
    // @Public()
    // @Version('1')
    // @Post('login/phone')
    // @UseGuards(LocalAuthGuard)
    // async phoneLogin(@Request() req) {
    //   console.log(req.user);
    //   throw new NotImplementedException();
    // }
  
    @Version('1')
    @Get('session')
    getSession(@Request() req) {
      return req.user;
    }
  
    @Version('1')
    @Post('refresh-token')
    refresh(@Request() req) {
      return true;
    }
  
    @Version('1')
    @Post('logout')
    async logout(@Headers('authorization') authorizationHeader: string) {
      const accessToken = authorizationHeader.split(' ')[1]; // Extract the token
  
      // Add the token to the blacklist
      await this.authService.logout(accessToken);
  
      // Respond with a success message
      return { message: 'Logged out successfully' };
    }
  }
  //   @Public()
  //   @Version('1')
  //   @Post('password/request-reset/')
  //   async requestPasswordReset(
  //     @Body() requestPasswordResetDto: RequestPasswordResetDto,
  //   ): Promise<string> {
  //     await this.passwordService.requestPasswordReset(
  //       requestPasswordResetDto.email,
  //     );
  //     return `Password reset requested successfully`;
  //   }
  
  //   @Public()
  //   @Version('1')
  //   @Patch('password/reset')
  //   async resetPassword(
  //     @Body() passwordResetDto: PasswordResetDto,
  //   ): Promise<void> {
  //     await this.passwordService.resetPasswordWithToken(
  //       passwordResetDto.email,
  //       passwordResetDto.resetToken,
  //       passwordResetDto.newPassword,
  //     );
  //   }
  
  //   @Public()
  //   @Version('1')
  //   @Post('password/validate-token')
  //   async validatePasswordResetToken(
  //     @Body() validatePasswordResetDto: ValidatePasswordResetDto,
  //   ) {
  //     const isTokenValid = await this.passwordService.isResetTokenValid(
  //       validatePasswordResetDto.email,
  //       validatePasswordResetDto.resetToken,
  //     );
  
  //     if (isTokenValid) {
  //       return { status: 'success', message: 'Reset token is valid.' };
  //     } else {
  //       return { status: 'error', message: 'Reset token is invalid.' };
  //     }
  //   }
  
  //   @Post('password/change')
  //   async changePassword(
  //     @Body('email') email: string,
  //     @Body('oldPassword') oldPassword: string,
  //     @Body('newPassword') newPassword: string,
  //   ): Promise<any> {
  //     const passwordValid = await this.authService.validateUser(
  //       email,
  //       oldPassword,
  //     );
  
  //     if (!!passwordValid) {
  //       await this.passwordService.changePassword(email, newPassword);
  
  //       return {
  //         status: 'success',
  //         message: 'Password changed successfully',
  //       };
  //     } else {
  //       return {
  //         status: 'error',
  //         message: 'Invalid password',
  //       };
  //     }
  //   }
  // }
  