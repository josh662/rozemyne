import { SearchService } from './search.service';
import { AuthService } from './auth.service';
import { ErrorService } from './error.service';
import { EventService } from './event.service';
import { CacheService } from './cache.service';
import { BaseModuleController } from './baseModule.controller';
import { BaseModuleService } from './baseModule.service';
import { BaseHelperService } from './baseHelper.service';

export {
  SearchService,
  AuthService,
  ErrorService,
  EventService,
  CacheService,
  BaseModuleController,
  BaseModuleService,
  BaseHelperService,
};
export const services = [
  SearchService,
  AuthService,
  ErrorService,
  EventService,
  CacheService,
  BaseModuleController,
  BaseModuleService,
  BaseHelperService,
];
