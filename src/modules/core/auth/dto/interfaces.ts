import { User } from 'src/prisma';
import { IResponse } from 'src/interfaces';
import { EOriginRoutes } from 'src/routes';

import { RegisterDto, LoginDto, VerifyDto, RecoveryDto } from './classes';

export const origin = EOriginRoutes.AUTH as string;

// Default
export type IDefault = User;

// Register
export type TRegisterRequest = RegisterDto;
export type TRegisterResponse = IResponse;

// Login
export type TLoginRequest = LoginDto;
export type TLoginResponse = IResponse;

// Recovery
export type TRecoveryRequest = RecoveryDto;
export type TRecoveryResponse = IResponse;

// Verify
export type TVerifyRequest = VerifyDto;
export type TVerifyResponse = IResponse;
