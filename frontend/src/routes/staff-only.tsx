import { FC, ReactNode, useEffect, useState } from "react";
import { Redirect, Route } from "react-router-dom";
import { useUsersAPI } from "@/services/api/user.service.ts";

export const StaffOnlyRoute: FC<{ children?: ReactNode } & any> = ({ children, ...params }) => {
  const userService = useUsersAPI();
  const [canAccess, setCanAccess] = useState<boolean>(true);

  useEffect(() => {
    userService.self().then(u => setCanAccess(u.is_staff)).catch(console.warn)
  }, [])

  return (
    <Route { ...params }
           render={ ({ location }) =>
             canAccess ? (children) : (<Redirect to={ { pathname: "/annotation-campaign", state: { from: location } } }/>)
           }/>
  )
}
