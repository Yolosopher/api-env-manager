import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { User } from '@prisma/client';
import { IUser } from 'src/user/user.interface';
import { CreateUserDto } from 'src/user/user.validation';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.validateForLogin({ email, password });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  login(user: User): { accessToken: string } {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  async register(createUserDto: CreateUserDto): Promise<IUser> {
    return this.userService.createUser(createUserDto);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findOrCreateGitHubUser(profile: any): Promise<IUser> {
    const { id: providerId, emails, displayName, photos } = profile;
    const email = emails?.[0]?.value;
    const avatar = photos?.[0]?.value;

    let user: IUser | null = await this.userService.findByEmail(email);

    if (!user) {
      user = await this.userService.createUser({
        email,
        fullName: displayName,
        provider: 'github',
        providerId,
        avatar,
      });
    } else if (user.provider !== 'github' || user.providerId !== providerId) {
      throw new ConflictException(
        'This email is already registered with another provider',
      );
    }

    return user;
  }

  async getProfile(userId: string): Promise<IUser> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = await this.userService.findById(userId);

    return rest;
  }

  async regenerateToken(userId: string): Promise<{ accessToken: string }> {
    const user = await this.userService.findById(userId);
    return this.login(user);
  }
}
