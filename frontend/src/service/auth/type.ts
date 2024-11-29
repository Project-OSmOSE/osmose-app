import { User } from '@/service/user';

export type Token = string | undefined;

export type AuthState = {
  token: Token,
  user: User | undefined,
}