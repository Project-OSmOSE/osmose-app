import { FC, ReactNode } from "react";
import { Redirect, Route } from "react-router-dom";
import { useAppSelector } from '@/service/app';
import { selectIsConnected } from '@/service/auth';

export const AuthenticatedRoute: FC<{ children?: ReactNode } & any> = ({ children, ...params }) => {
  const isConnected = useAppSelector(selectIsConnected);

  return (
    <Route { ...params }
           render={ ({ location }) =>
             isConnected ? (children) : (<Redirect to={ { pathname: "/login", state: { from: location } } }/>)
           }/>
  )
}
