import { Body, Controller, Post } from '@nestjs/common';
import { AuthService, LoginResponse } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { User } from 'src/users/user.entity';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto): Promise<User> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(loginDto);
  }

  @Post('refresh-token')
  refreshNewToken(@Body() { refreshToken }): Promise<any> {
    return this.authService.refreshNewToken(refreshToken);
  }
}
