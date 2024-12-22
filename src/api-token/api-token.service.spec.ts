import { Test, TestingModule } from '@nestjs/testing';
import { ApiTokenService } from './api-token.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateApiTokenDto } from './api-token.validation';

describe('ApiTokenService', () => {
  let service: ApiTokenService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    apiToken: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiTokenService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ApiTokenService>(ApiTokenService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createApiToken', () => {
    const userId = 'user123';
    const mockDto: CreateApiTokenDto = { name: 'Test Token' };
    const mockCreatedToken = {
      id: 'token123',
      apiToken: 'generated-token',
      name: 'Test Token',
      createdAt: new Date(),
    };

    it('should create a token with provided name', async () => {
      mockPrismaService.apiToken.create.mockResolvedValue(mockCreatedToken);

      const result = await service.createApiToken(userId, mockDto);

      expect(result).toEqual(mockCreatedToken);
      expect(prismaService.apiToken.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Test Token',
          user: { connect: { id: userId } },
        }),
        select: {
          id: true,
          apiToken: true,
          name: true,
          createdAt: true,
        },
      });
    });

    it('should create a token with default name if not provided', async () => {
      mockPrismaService.apiToken.create.mockResolvedValue({
        ...mockCreatedToken,
        name: 'default',
      });

      const result = await service.createApiToken(userId, { name: 'default' });

      expect(result.name).toBe('default');
      expect(prismaService.apiToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'default',
          }),
        }),
      );
    });
  });

  describe('getApiTokens', () => {
    const userId = 'user123';
    const mockTokens = [
      {
        id: 'token1',
        apiToken: 'token-1',
        name: 'Token 1',
        createdAt: new Date(),
      },
      {
        id: 'token2',
        apiToken: 'token-2',
        name: 'Token 2',
        createdAt: new Date(),
      },
    ];

    it('should return all tokens for a user', async () => {
      mockPrismaService.apiToken.findMany.mockResolvedValue(mockTokens);

      const result = await service.getApiTokens(userId);

      expect(result).toEqual(mockTokens);
      expect(prismaService.apiToken.findMany).toHaveBeenCalledWith({
        where: { userId },
        select: {
          id: true,
          apiToken: true,
          name: true,
          createdAt: true,
        },
      });
    });
  });

  describe('deleteApiToken', () => {
    const userId = 'user123';
    const tokenId = 'token123';
    const mockToken = {
      id: tokenId,
      apiToken: 'test-token',
      name: 'Test Token',
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should delete an existing token', async () => {
      mockPrismaService.apiToken.findFirst.mockResolvedValue(mockToken);
      mockPrismaService.apiToken.delete.mockResolvedValue(mockToken);

      const result = await service.deleteApiToken(userId, tokenId);

      expect(result).toEqual(mockToken);
      expect(prismaService.apiToken.delete).toHaveBeenCalledWith({
        where: { id: tokenId },
      });
    });

    it('should throw NotFoundException if token not found', async () => {
      mockPrismaService.apiToken.findFirst.mockResolvedValue(null);

      await expect(service.deleteApiToken(userId, tokenId)).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaService.apiToken.delete).not.toHaveBeenCalled();
    });
  });

  describe('validateApiToken', () => {
    const apiToken = 'test-token';
    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
    };

    it('should return user data if token is valid', async () => {
      mockPrismaService.apiToken.findUnique.mockResolvedValue({
        user: mockUser,
      });

      const result = await service.validateApiToken(apiToken);

      expect(result).toEqual(mockUser);
      expect(prismaService.apiToken.findUnique).toHaveBeenCalledWith({
        where: { apiToken },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });
    });

    it('should return null if token is invalid', async () => {
      mockPrismaService.apiToken.findUnique.mockResolvedValue(null);

      const result = await service.validateApiToken(apiToken);

      expect(result).toBeNull();
    });
  });
});
