import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request as RequestExpress } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const result = await this.authService.login(loginUserDto);
    if (!result) {
      return { success: false, message: 'Credenciales inválidas' };
    }
    return { success: true, ...result };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('regenerate-api-key')
  async regenerateApiKey(@Request() req: RequestExpress) {
    if (!req.user) {
      return { success: false, message: 'Usuario no autenticado' };
    }
    const newApiKey = await this.authService.regenerateApiKey(
      (req.user as User).id,
    );
    return { apiKey: newApiKey };
  }
}
