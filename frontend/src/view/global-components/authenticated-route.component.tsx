import { FC, ReactNode } from "react";
import { Redirect, Route } from "react-router-dom";
import { useAuthService } from "../../services/auth";

export const AuthenticatedRoute: FC<{ children?: ReactNode } & any> = ({ children, ...params }) => {
  const { context } = useAuthService();
  return (
    <Route { ...params }
           render={ ({ location }) =>
             context.token ? (children) : (<Redirect to={ { pathname: "/login", state: { from: location } } }/>)
           }/>
  )
}