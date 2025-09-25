import {
  Injectable,
  Logger,
  Inject,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService implements OnApplicationBootstrap {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {}
  private readonly logger = new Logger(CacheService.name);

  async onApplicationBootstrap() {
    // await this.cacheManager.clear();
  }

  async get<T = any>(
    origin: string,
    key: string,
  ): Promise<T | null | undefined> {
    try {
      const payload = await this.cacheManager.get<string>(
        this.formatKey(origin, key),
      );
      return payload ? (JSON.parse(payload) as T) : undefined;
    } catch (err) {
      this.logger.error('Error getting data from cache', err);
      return undefined;
    }
  }

  async set(
    origin: string,
    key: string,
    payload: Record<string, any>,
    config?: {
      ttl?: number | false;
      lock?: boolean;
    },
  ): Promise<boolean> {
    try {
      const ttl =
        config?.ttl ||
        +(this.configService.get<number>('CACHE_DEFAULT_TTL') || 0);

      if (ttl !== undefined && ttl <= 0) {
        throw new Error('Invalid TTL value');
      }

      const formattedKey = this.formatKey(origin, key);

      let payloadString: string;
      try {
        payloadString = JSON.stringify(payload);
      } catch (err) {
        this.logger.error('Failed to serialize payload', err);
        return false;
      }

      await this.cacheManager.set(formattedKey, payloadString, ttl * 1000);
      return true;
    } catch (err) {
      this.logger.error('Error setting data on cache', err);
      return false;
    }
  }

  async setMultiple(
    origin: string,
    keyValuePairs: { key: string; payload: any }[],
    config?: {
      ttl?: number | false;
      lock?: boolean;
    },
  ): Promise<boolean> {
    try {
      for (const { key, payload } of keyValuePairs) {
        const success = await this.set(origin, key, payload, config);

        if (!success) {
          this.logger.error(`Failed to set key ${key} in setMultiple`);
          return false; // Retorna falso se qualquer inserção falhar
        }
      }

      return true; // Retorna verdadeiro se todas as inserções forem bem-sucedidas
    } catch (err) {
      this.logger.error('Error setting multiple data on cache', err);
      return false;
    }
  }

  async del(origin: string, key: string) {
    try {
      await this.cacheManager.del(this.formatKey(origin, key));
      return true;
    } catch (err) {
      this.logger.error('Error removing data from cache', err);
      return false;
    }
  }

  async mdel(origin: string, keys: string[]) {
    try {
      await this.cacheManager.mdel(keys.map((k) => this.formatKey(origin, k)));
      return true;
    } catch (err) {
      this.logger.error('Error removing data from cache', err);
      return false;
    }
  }

  private formatKey(origin: string, key?: string): string {
    if (key) return `${process.env.SERVER_NAME}:cache:${origin}:${key}`;
    return `${process.env.SERVER_NAME}:cache:${origin}`;
  }
}
