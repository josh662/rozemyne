export interface IProps {
  userId: string;
}

export class JwtDto {
  /**
  (Issuer - Emissor) → Identifica quem gerou o token (exemplo: um domínio ou serviço).
  */
  iss: string;
  /**
  (Not Before - Não Antes de) → Define um timestamp antes do qual o token não deve ser aceito.
  */
  nbf: number;
  /**
  (Subject - Sujeito) → O identificador do usuário ou entidade para quem o token foi emitido.
  */
  sub: string;
  /**
  (JWT ID - Identificador Único) → Um ID único para evitar reutilização do token (usado para prevenir replay attacks).
  */
  jti: string;
  /**
  (Issued At - Emitido em) → Timestamp de quando o token foi gerado.
  */
  readonly iat?: number;
  /**
  (Expiration - Expiração) → Timestamp indicando quando o token expira.
  */
  readonly exp?: number;
}

export enum EAction {
  MANAGE = 'manage',
  CREATE = 'create',
  READ = 'read',
  LIST = 'list',
  UPDATE = 'update',
  DELETE = 'delete',
}
