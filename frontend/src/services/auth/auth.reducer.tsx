import { Context, createContext, Dispatch, FC, ReactNode, Reducer, useEffect, useReducer } from "react";
import { Auth, AuthAction } from "./auth.context.tsx";

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
