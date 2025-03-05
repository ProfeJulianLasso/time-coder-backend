import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, 'api-key') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(apiKey: string): Promise<User | null> {
    const user = await this.authService.validateApiKey(apiKey);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
