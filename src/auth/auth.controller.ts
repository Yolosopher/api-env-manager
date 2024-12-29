import {
  Body,
  Controller,
  Get,
  Post,
  Redirect,
  Request,
  UseGuards,
} from '@nestjs/common';
import { RequestWithUser } from 'src/types/global';
import { CreateUserDto } from 'src/user/user.validation';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './auth.validation';
import { GitHubAuthGuard } from './guards/github-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

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
  @Redirect(process.env.GITHUB_CALLBACK_FRONTEND_REDIRECT, 302)
  async githubCallback(@Request() req) {
    const { accessToken } = this.authService.login(req.user);
    const redirectUrl = this.authService.redirectToFrontend(accessToken);
    return { url: redirectUrl };
  }

  @Get('github')
  @UseGuards(GitHubAuthGuard)
  async githubLogin() {
    // Redirect to GitHub for authentication
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: RequestWithUser) {
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
