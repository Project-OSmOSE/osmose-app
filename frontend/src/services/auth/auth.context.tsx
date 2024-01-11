import { Context, createContext, Dispatch, useContext } from "react";

export interface Auth {
  token?: string;
  bearer?: string;
}

export interface AuthAction {
  type: 'login' | 'logout';
  token?: string;
}

const AuthContext: Context<Auth> = createContext<Auth>({});
const AuthDispatchContext: Context<Dispatch<AuthAction> | undefined> = createContext<Dispatch<AuthAction> | undefined>(undefined);

export const useAuthContext = () => useContext(AuthContext);
export const useAuthDispatch = () => useContext(AuthDispatchContext);