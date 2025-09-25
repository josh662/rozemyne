export enum EOriginRoutes {
  ACCOUNT = 'account',
  APP = 'app',
  AUTH_GUARD = 'authGuard',
  AUTH = 'auth',
  SESSIONS = 'sessions',
  USERS = 'users',
  VERIFICATIONS = 'verifications',
}

const singularMap: Record<EOriginRoutes, string> = {
  [EOriginRoutes.ACCOUNT]: 'account',
  [EOriginRoutes.APP]: 'app',
  [EOriginRoutes.AUTH_GUARD]: 'authGuard',
  [EOriginRoutes.AUTH]: 'auth',
  [EOriginRoutes.SESSIONS]: 'session',
  [EOriginRoutes.USERS]: 'user',
  [EOriginRoutes.VERIFICATIONS]: 'verification',
};

export function originToSingular(route: string): string {
  return singularMap[route] ?? route;
}
