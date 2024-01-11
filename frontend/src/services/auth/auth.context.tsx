import { Context, createContext, Dispatch, useContext } from "react";

export interface Auth {
  token?: string;
  bearer?: string;
}

export interface AuthAction {
  type: 'login' | 'logout';
  token?: string;
}

const _AuthContext: Context<Auth> = createContext<Auth>({});
const _AuthDispatchContext: Context<Dispatch<AuthAction> | undefined> = createContext<Dispatch<AuthAction> | undefined>(undefined);

export const useAuthContext = () => useContext(_AuthContext);
export const useAuthDispatch = () => useContext(_AuthDispatchContext);