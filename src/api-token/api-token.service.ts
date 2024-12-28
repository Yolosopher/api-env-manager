import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateApiTokenDto } from './api-token.validation';
import { randomBytes } from 'crypto';

@Injectable()
export class ApiTokenService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a cryptographically secure random API token.
   *
   * @returns A promise that resolves to a base64-encoded 256-bit (32-byte) random string
   * that can be used as an API token
   */
  private generateUniqueApiToken(): string {
    // Generate a random 256-bit (32-byte) string
    const buffer = randomBytes(32);
    return buffer.toString('base64');
  }

  /**
   * Creates a new API token for a user.
   *
   * @param userId - The ID of the user to create the token for
   * @param createApiTokenDto - DTO containing optional name for the token
   * @returns A promise that resolves to the created API token object with id, token value, name and creation date
   * @throws ConflictException if a token with the same name already exists
   */
  async createApiToken(
    userId: string,
    createApiTokenDto: CreateApiTokenDto,
  ): Promise<{
    id: string;
    apiToken: string;
    name: string;
    createdAt: Date;
  }> {
    // Check if token with same name already exists
    const existingToken = await this.prisma.apiToken.findFirst({
      where: {
        name: createApiTokenDto.name,
        userId: userId,
      },
    });

    if (existingToken) {
      throw new ConflictException(
        `API token with name '${createApiTokenDto.name}' already exists`,
      );
    }

    console.log('userId', userId);
    console.log('createApiTokenDto', createApiTokenDto);
    const apiToken = this.generateUniqueApiToken();

    return this.prisma.apiToken.create({
      data: {
        apiToken,
        name: createApiTokenDto.name || 'default',
        user: {
          connect: { id: userId },
        },
      },
      select: {
        id: true,
        apiToken: true,
        name: true,
        createdAt: true,
      },
    });
  }

  /**
   * Retrieves all API tokens belonging to a specific user.
   *
   * @param userId - The ID of the user whose tokens should be retrieved
   * @returns A promise that resolves to an array of API token objects, each containing id, token value, name and creation date
   */
  async getApiTokens(userId: string): Promise<
    Array<{
      id: string;
      apiToken: string;
      name: string;
      createdAt: Date;
    }>
  > {
    return this.prisma.apiToken.findMany({
      where: { userId },
      select: {
        id: true,
        apiToken: true,
        name: true,
        createdAt: true,
      },
    });
  }

  /**
   * Deletes a specific API token if it belongs to the specified user.
   *
   * @param userId - The ID of the user attempting to delete the token
   * @param tokenId - The ID of the token to delete
   * @returns A promise that resolves to the deleted token object
   * @throws NotFoundException if the token doesn't exist or doesn't belong to the user
   */
  async deleteApiToken(
    userId: string,
    tokenId: string,
  ): Promise<{
    id: string;
    apiToken: string;
    name: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  }> {
    const token = await this.prisma.apiToken.findFirst({
      where: { id: tokenId, userId },
    });

    if (!token) {
      throw new NotFoundException('API token not found');
    }

    return this.prisma.apiToken.delete({
      where: { id: tokenId },
    });
  }

  /**
   * Validates an API token and returns the associated user if valid.
   *
   * @param apiToken - The token string to validate
   * @returns A promise that resolves to the user object (with id and email) if token is valid, null otherwise
   */
  async validateApiToken(
    apiToken: string,
  ): Promise<{ id: string; email: string } | null> {
    const token = await this.prisma.apiToken.findUnique({
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

    if (!token) {
      return null;
    }

    return token.user;
  }
}
