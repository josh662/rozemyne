import { User } from 'src/prisma';
import { IResponse } from 'src/interfaces';
import { EOriginRoutes } from 'src/routes';

import { AccountChangeTotpDto, AccountDto, AccountUpdateDto } from './classes';

export const origin = EOriginRoutes.ACCOUNT as string;

// Default
export type IDefault = User;

// Account
export type TAccountRequest = AccountDto;
export type TAccountResponse = IResponse;

// Account
export type TAccountUpdateRequest = AccountUpdateDto;
export type TAccountUpdateResponse = IResponse;

// TOTP
export type TAccountChangeTotpRequest = AccountChangeTotpDto;
export type TAccountChangeTotpResponse = IResponse;
