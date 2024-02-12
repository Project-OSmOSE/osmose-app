import { FC, ReactNode, Reducer, useReducer } from "react";
import { AuthContext, AuthDispatchContext, Auth, AuthAction } from "./auth.context.tsx";

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
      };
  }
}

export const ProvideAuth: FC<{ children?: ReactNode }> = ({ children }) => {
  const [auth, dispatch] = useReducer(authReducer, {});

  return (
    <AuthContext.Provider value={ auth }>
      <AuthDispatchContext.Provider value={ dispatch }>
        { children }
      </AuthDispatchContext.Provider>
    </AuthContext.Provider>
  )
}
