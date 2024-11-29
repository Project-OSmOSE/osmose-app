import { FC, ReactNode } from "react";
import { Redirect, Route } from "react-router-dom";
import { useGetCurrentUserQuery } from '@/service/user';

export const StaffOnlyRoute: FC<{ children?: ReactNode } & any> = ({ children, ...params }) => {

  const { data: currentUser } = useGetCurrentUserQuery()

  return (
    <Route { ...params }
           render={ ({ location }) =>
             currentUser?.is_staff ? (children) : (
               <Redirect to={ { pathname: "/annotation-campaign", state: { from: location } } }/>)
           }/>
  )
}
