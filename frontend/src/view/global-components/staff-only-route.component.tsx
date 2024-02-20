import { FC, ReactNode, useEffect, useState } from "react";
import { Redirect, Route } from "react-router-dom";
import { useUsersAPI } from "../../services/api";

export const StaffOnlyRoute: FC<{ children?: ReactNode } & any> = ({ children, ...params }) => {
  const userService = useUsersAPI();
  const [canAccess, setCanAccess] = useState<boolean>(true);

  useEffect(() => {
    userService.isStaff().then(setCanAccess)
  }, [])

  return (
    <Route { ...params }
           render={ ({ location }) =>
             canAccess ? (children) : (<Redirect to={ { pathname: "/annotation-campaigns", state: { from: location } } }/>)
           }/>
  )
}
