import { AppState } from '@/slices/app.ts';
import { User } from './type.ts';


export const selectCurrentUser = (state: AppState): User | undefined => {
  return state.auth.user;
}