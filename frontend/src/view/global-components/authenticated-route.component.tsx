import { FC, ReactNode } from "react";
import { Redirect, Route } from "react-router-dom";
import { useAppSelector } from '@/slices/app.ts';
import { selectIsConnected } from '@/service/auth/slice.ts';

export const AuthenticatedRoute: FC<{ children?: ReactNode } & any> = ({ children, ...params }) => {
  const isConnected = useAppSelector(selectIsConnected);

  return (
    <Route { ...params }
           render={ ({ location }) =>
             isConnected ? (children) : (<Redirect to={ { pathname: "/login", state: { from: location } } }/>)
           }/>
  )
}
