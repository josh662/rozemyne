import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { EUserRole, PrismaService } from 'src/prisma';

import { JwtDto } from 'src/interfaces';
import { TEnv } from 'src/utils';

import { CacheService } from './cache.service';
import { EOriginRoutes } from 'src/routes';

interface IAuthenticatedSuccess {
  success: true;
  userId: string;
  userRole: EUserRole;
}

interface IAuthenticatedFailure {
  success: false;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<TEnv>,
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}
  private origin = EOriginRoutes.AUTH_GUARD;
  private readonly logger = new Logger(this.origin);

  async authenticate(
    authorization: string | undefined,
  ): Promise<IAuthenticatedSuccess | IAuthenticatedFailure> {
    if (!authorization) {
      this.logger.debug(`Access denied: no authorization token provided`);
      return { success: false };
    }

    try {
      // Extrai o token do cabeçalho
      const splitted = authorization.split(' ');
      const token = splitted.length > 1 ? splitted[1] : splitted[0];

      const { sub, jti }: JwtDto = this.jwtService.verify(token, {
        secret: this.configService.get<string>('SYSTEM_KEY'),
      });

      // Busca usuário no cache
      let session = await this.cacheService.get<{
        id: string;
        expiredAt: Date | null;
        user: {
          id: string;
          role: EUserRole;
        };
      }>(this.origin, `user:${sub}:session:${jti}`);

      if (!session) {
        session = await this.prisma.session.findUnique({
          where: {
            id: jti,
            success: true,
            expiredAt: {
              gte: new Date(),
            },
            user: {
              id: sub,
            },
          },
          select: {
            id: true,
            expiredAt: true,
            user: {
              select: {
                id: true,
                role: true,
              },
            },
          },
        });

        if (!session) {
          this.logger.debug(`Access denied: user not found`);
          return { success: false };
        }

        const now = new Date().getTime();
        const end = session.expiredAt
          ? new Date(session.expiredAt).getTime()
          : now;

        let ttl = Math.floor((end - now) / 1000);
        if (ttl < 0) ttl = 0;

        await this.cacheService.set(
          this.origin,
          `user:${sub}:session:${jti}`,
          session,
          {
            ttl,
          },
        );
      }

      return {
        success: true,
        userId: session.user.id,
        userRole: session.user.role,
      };
    } catch (err) {
      this.logger.warn(`Access denied: invalid authorization token`);
      return { success: false };
    }
  }
}
