import {
  Controller,
  Post,
  Request,
  UseGuards,
  Get,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './auth.validation';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GitHubAuthGuard } from './guards/github-auth.guard';
import { DecodedToken } from './auth.interface';
import { CreateUserDto } from 'src/user/user.validation';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() { email, password }: AuthLoginDto) {
    const user = await this.authService.validateUser(email, password);
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const createdUser = await this.authService.register(createUserDto);

    // login after register
    return this.authService.login({
      ...createdUser,
      password: createUserDto.password,
    });
  }

  @Get('github/callback')
  @UseGuards(GitHubAuthGuard)
  async githubCallback(@Request() req) {
    const token = await this.authService.login(req.user);
    return { token };
  }

  @Get('github')
  @UseGuards(GitHubAuthGuard)
  async githubLogin() {
    // Redirect to GitHub for authentication
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: { user: DecodedToken }) {
    const user = await this.authService.getProfile(req.user.id);
    if (req.user.accessToken) {
      return {
        ...user,
        accessToken: req.user.accessToken,
      };
    }
    return user;
  }
}
