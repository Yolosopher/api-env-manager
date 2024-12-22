import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Request,
} from '@nestjs/common';
import { ApiTokenService } from 'src/api-token/api-token.service';

@Injectable()
export class ApiTokenGuard implements CanActivate {
  constructor(private readonly apiTokenService: ApiTokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('ApiTokenGuard');
    const request = context.switchToHttp().getRequest();
    const apiToken = this.extractTokenFromHeader(request);

    if (!apiToken) {
      throw new UnauthorizedException('API token is missing');
    }

    const user = await this.apiTokenService.validateApiToken(apiToken);
    if (!user) {
      throw new UnauthorizedException('Invalid API token');
    }

    // Attach the user to the request object for use in controllers
    request.user = user;
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers['x-api-token'];
    if (!authHeader) return undefined;

    // Otherwise return the token as is
    return authHeader;
  }
}
