import { FC, ReactNode, useEffect, useState } from "react";
import { Redirect, Route } from "react-router-dom";
import { useAuthService } from "../../services/auth";

export const AuthenticatedRoute: FC<{ children?: ReactNode } & any> = ({ children, ...params }) => {
  const auth = useAuthService();
  const [canAccess, setCanAccess] = useState<boolean>(true);

  useEffect(() => {
    setCanAccess(auth.isConnected());
  }, [auth]);

  return (
      <Route { ...params }
             render={ ({ location }) =>
                 canAccess ? (children) : (<Redirect to={ { pathname: "/login", state: { from: location } } }/>)
             }/>
  )
}
