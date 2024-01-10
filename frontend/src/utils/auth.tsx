import { Context, createContext, Dispatch, FC, ReactNode, Reducer, useContext, useEffect, useReducer } from "react";
import { Redirect, Route } from "react-router-dom";
import { post } from "superagent";
import { Response } from "./requests.tsx";

const URI = '/api/token/';

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

const authReducer: Reducer<Auth, AuthAction> = (_: Auth, action: AuthAction): Auth => {
  switch (action.type) {
    case 'logout':
      document.cookie = 'token=;max-age=0;path=/';
      return {};
    case 'login':
      // Cookie is set to expire a bit before 8 hours
      document.cookie = `token=${ action.token };max-age=28000;path=/`;
      return {
        token: action.token,
        bearer: `Bearer ${ action.token }`
      };
  }
}

export const ProvideAuth: FC<{ children?: ReactNode }> = ({ children }) => {
  const [auth, dispatch] = useReducer(authReducer, {});

  useEffect(() => {
    if (!document.cookie) return;
    const value = document.cookie.split(';').filter((item) => item.trim().startsWith('token='))[0];
    const token = value?.split('=').pop()
    if (!token) return;
    dispatch({ type: 'login', token })
  }, [])

  return (
    <AuthContext.Provider value={ auth }>
      <AuthDispatchContext.Provider value={ dispatch }>
        { children }
      </AuthDispatchContext.Provider>
    </AuthContext.Provider>
  )
}

export const AuthenticatedRoute: FC<{ children?: ReactNode } & any> = ({ children, ...params }) => {
  const auth: Auth = useContext(AuthContext);
  return (
    <Route { ...params }
           render={ ({ location }) =>
             auth.token ? (children) : (<Redirect to={ { pathname: "/login", state: { from: location } } }/>)
           }/>
  )
}

export function login(username: string, password: string): Response<string> {
  const request = post(URI).send({ username, password });
  const response = new Promise<string>((resolve, reject) => {
    request.then(r => resolve(r.body.access)).catch(reject);
  });
  return { request, response }
}

export const useAuth = () => useContext(AuthContext);
export const useAuthDispatch = () => useContext(AuthDispatchContext);
