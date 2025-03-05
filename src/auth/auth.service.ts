import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<{
    username: string;
    apiKey: string;
  }> {
    const { username, password } = createUserDto;

    // Verificar si el usuario ya existe
    const userExists = await this.usersRepository.findOne({
      where: { username },
    });
    if (userExists) {
      throw new ConflictException('El nombre de usuario ya está en uso');
    }

    // Generar API key
    const apiKey = crypto.randomBytes(32).toString('hex');

    // Crear nuevo usuario
    const user = new User();
    user.username = username;
    user.password = await bcrypt.hash(password, 10);
    user.apiKey = apiKey;

    await this.usersRepository.save(user);

    return {
      username: user.username,
      apiKey: user.apiKey,
    };
  }

  async login(loginUserDto: LoginUserDto): Promise<{
    access_token: string;
    apiKey: string;
  } | null> {
    const { username, password } = loginUserDto;
    const user = await this.usersRepository.findOne({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return null;
    }

    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      apiKey: user.apiKey,
    };
  }

  async validateUser(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async validateApiKey(apiKey: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { apiKey } });
  }

  async regenerateApiKey(userId: number): Promise<string | null> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      return null;
    }

    const newApiKey = crypto.randomBytes(32).toString('hex');
    user.apiKey = newApiKey;
    await this.usersRepository.save(user);

    return newApiKey;
  }
}
