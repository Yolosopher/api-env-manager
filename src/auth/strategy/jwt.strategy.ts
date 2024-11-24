import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { DecodedToken } from '../auth.interface';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    exp: number;
  }): Promise<DecodedToken> {
    // if token expires in less than one day, refresh it
    const oneDayInSeconds = 86400;
    const expiresIn: number = (payload.exp - Date.now() / 1000) * 1000;
    if (expiresIn < oneDayInSeconds) {
      // Logic to refresh the token can be added here
      const newToken = await this.authService.regenerateToken(payload.sub);
      return {
        id: payload.sub,
        email: payload.email,
        accessToken: newToken.accessToken,
      };
    }
    return { id: payload.sub, email: payload.email };
  }
}
