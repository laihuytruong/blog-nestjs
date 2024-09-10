import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface Payload {
  id: number;
  email: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  private async generateToken(payload: Payload) {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET_ACCESS_TOKEN'),
      expiresIn: '1h',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET_REFRESH_TOKEN'),
      expiresIn: '1d',
    });

    await this.usersRepository.update(
      { email: payload.email },
      { refreshToken },
    );

    return { accessToken, refreshToken };
  }

  async register(registerDto: RegisterDto): Promise<User> {
    const hashedPassword = await this.hashPassword(registerDto.password);

    const user = await this.usersRepository.save({
      ...registerDto,
      password: hashedPassword,
      status: +registerDto.status,
      refreshToken: 'refresh-token-string',
    });

    return user;
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
    });
    if (!user) {
      throw new HttpException(
        'Email has been not registered',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const checkPassword = bcrypt.compareSync(loginDto.password, user.password);
    if (!checkPassword) {
      throw new HttpException('Password is incorrect', HttpStatus.UNAUTHORIZED);
    }

    // Generate access and refresh token
    const payload: Payload = { id: user.id, email: user.email };
    return this.generateToken(payload);
  }

  async refreshNewToken(refreshToken: string): Promise<any> {
    try {
      const verifyRefreshToken = await this.jwtService.verifyAsync(
        refreshToken,
        {
          secret: this.configService.get<string>('JWT_SECRET_REFRESH_TOKEN'),
        },
      );
      const checkExistRefreshToken = await this.usersRepository.findOneBy({
        email: verifyRefreshToken.email,
        refreshToken,
      });
      if (checkExistRefreshToken) {
        return this.generateToken({
          id: verifyRefreshToken.id,
          email: verifyRefreshToken.email,
        });
      } else {
        throw new HttpException(
          'Refresh token is not valid',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
