import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { Repository } from 'typeorm';
import GoogleJwtPayload from '../interfaces/google-jwt-payload.interface';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  async validateApiKey(apiKey: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { apiKey } });
  }

  async validateGoogleToken(
    token: string,
  ): Promise<{ success: string | boolean }> {
    try {
      // Verificar el token con Google
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      // Obtener la carga útil del token
      const payload = ticket.getPayload() as GoogleJwtPayload;

      // Verificar que el correo esté confirmado
      if (!payload.email_verified) {
        return { success: false };
      }

      // Verificar que el dominio del correo sea el correcto
      const allowedDomain = this.configService.get<string>(
        'GOOGLE_ALLOWED_DOMAIN',
      );
      if (payload.hd !== allowedDomain) {
        return { success: false };
      }

      // Buscar si el usuario ya existe
      const user = await this.usersRepository.findOne({
        where: { id: payload.sub },
      });

      // Si el usuario existe, devolver éxito
      if (user) {
        return { success: user.apiKey };
      }

      // Registrar al nuevo usuario
      const newUser = new User();
      newUser.id = payload.sub;
      newUser.name = payload.name;
      newUser.email = payload.email;
      newUser.apiKey = crypto.randomBytes(32).toString('hex');

      try {
        await this.usersRepository.save(newUser);
        return { success: newUser.apiKey };
      } catch (error) {
        console.error('Error al guardar el usuario:', error);
        return { success: false };
      }
    } catch (error) {
      console.error('Error al validar token de Google:', error);
      return { success: false };
    }
  }
}
