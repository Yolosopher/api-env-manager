import { DecodedToken } from 'src/auth/auth.interface';

export type RequestWithUser = Request & { user: DecodedToken };
