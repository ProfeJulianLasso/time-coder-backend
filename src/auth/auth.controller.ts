import { Controller, Get, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('login')
  async googleLogin(
    @Headers('authorization') authHeader?: string,
  ): Promise<{ success: string | boolean }> {
    if (!authHeader?.startsWith('Bearer ')) {
      return { success: false };
    }

    const token = authHeader.substring(7); // Remover "Bearer "
    const result = await this.authService.validateGoogleToken(token);

    return { success: result.success };
  }
}
