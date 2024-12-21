import { Test, TestingModule } from '@nestjs/testing';
import { ApiTokenController } from './api-token.controller';
import { ApiTokenService } from './api-token.service';
import { CreateApiTokenDto } from './api-token.validation';
import { RequestWithUser } from 'types/global';

describe('ApiTokenController', () => {
  let controller: ApiTokenController;
  let service: ApiTokenService;

  const mockApiTokenService = {
    createApiToken: jest.fn(),
    getApiTokens: jest.fn(),
    deleteApiToken: jest.fn(),
  };

  const mockRequest = {
    user: { id: 'user123' },
  } as RequestWithUser;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiTokenController],
      providers: [
        {
          provide: ApiTokenService,
          useValue: mockApiTokenService,
        },
      ],
    }).compile();

    controller = module.get<ApiTokenController>(ApiTokenController);
    service = module.get<ApiTokenService>(ApiTokenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createApiToken', () => {
    const mockDto: CreateApiTokenDto = { name: 'Test Token' };
    const mockCreatedToken = {
      id: 'token123',
      apiToken: 'generated-token',
      name: 'Test Token',
      createdAt: new Date(),
    };

    it('should create a new API token', async () => {
      mockApiTokenService.createApiToken.mockResolvedValue(mockCreatedToken);

      const result = await controller.createApiToken(mockRequest, mockDto);

      expect(result).toEqual(mockCreatedToken);
      expect(service.createApiToken).toHaveBeenCalledWith(
        mockRequest.user.id,
        mockDto,
      );
    });
  });

  describe('getApiTokens', () => {
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

    it('should return all tokens for the authenticated user', async () => {
      mockApiTokenService.getApiTokens.mockResolvedValue(mockTokens);

      const result = await controller.getApiTokens(mockRequest);

      expect(result).toEqual(mockTokens);
      expect(service.getApiTokens).toHaveBeenCalledWith(mockRequest.user.id);
    });
  });

  describe('deleteApiToken', () => {
    const tokenId = 'token123';
    const mockDeletedToken = {
      id: tokenId,
      apiToken: 'test-token',
      name: 'Test Token',
      userId: 'user123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should delete the specified token', async () => {
      mockApiTokenService.deleteApiToken.mockResolvedValue(mockDeletedToken);

      const result = await controller.deleteApiToken(mockRequest, tokenId);

      expect(result).toEqual(mockDeletedToken);
      expect(service.deleteApiToken).toHaveBeenCalledWith(
        mockRequest.user.id,
        tokenId,
      );
    });
  });
});
