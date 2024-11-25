/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './auth.validation';
import { CreateUserDto } from 'src/user/user.validation';
import { DecodedToken } from './auth.interface';

import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { GitHubStrategy } from './strategy/github.strategy';
import { UserService } from 'src/user/user.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let userService: UserService;
  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    getProfile: jest.fn(),
    validateOAuthUser: jest.fn(),
    githubLogin: jest.fn(),
  };

  const mockUserService = {
    getUser: jest.fn(),
    createUser: jest.fn(),
    findByEmail: jest.fn(),
    validateForLogin: jest.fn(),
    findById: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    findAllUsers: jest.fn(),
  };

  const mockGithubStrategy = {
    validate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UserModule, PassportModule],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: GitHubStrategy,
          useValue: mockGithubStrategy,
        },
      ],
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return a token for valid credentials', async () => {
      const user = { id: '1', email: 'test@example.com' };
      const token = { accessToken: 'token' };
      mockAuthService.validateUser.mockResolvedValue(user);
      mockAuthService.login.mockReturnValue(token);

      const result = await controller.login({
        email: 'test@example.com',
        password: 'password',
      } as AuthLoginDto);
      expect(result).toEqual(token);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        'test@example.com',
        'password',
      );
      expect(mockAuthService.login).toHaveBeenCalledWith(user);
    });
  });

  describe('register', () => {
    it('should register a user and return a token', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
        fullName: 'Test User',
      };
      const createdUser = { id: '1', email: 'test@example.com' };
      const token = { accessToken: 'token' };
      mockAuthService.register.mockResolvedValue(createdUser);
      mockAuthService.login.mockReturnValue(token);

      const result = await controller.register(createUserDto);
      expect(result).toEqual(token);
      expect(mockAuthService.register).toHaveBeenCalledWith(createUserDto);
      expect(mockAuthService.login).toHaveBeenCalledWith({
        ...createdUser,
        password: createUserDto.password,
      });
    });
  });

  describe('githubCallback', () => {
    it('should return a token after GitHub authentication', async () => {
      const user = { id: '1', email: 'test@example.com' };
      const token = { accessToken: 'token' };
      mockAuthService.login.mockReturnValue(token);

      const result = await controller.githubCallback({ user });
      expect(result).toEqual({ token });
      expect(mockAuthService.login).toHaveBeenCalledWith(user);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const userId = '1';
      const userProfile = {
        id: '1',
        email: 'test@example.com',
        fullName: 'Test User',
        accessToken: 'token',
      };
      const decodedToken: DecodedToken = {
        id: userId,
        email: 'test@example.com',
        accessToken: 'token',
      };
      mockAuthService.getProfile.mockResolvedValue(userProfile);

      const result = await controller.getProfile({ user: decodedToken });
      expect(result).toEqual(userProfile);
      expect(mockAuthService.getProfile).toHaveBeenCalledWith(userId);
    });
  });
});
