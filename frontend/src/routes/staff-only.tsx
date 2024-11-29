import { FC, ReactNode, useEffect, useState } from "react";
import { Redirect, Route } from "react-router-dom";
import { selectCurrentUser, useGetCurrentUserMutation } from '@/service/user';
import { useAppSelector } from '@/slices/app.ts';

export const StaffOnlyRoute: FC<{ children?: ReactNode } & any> = ({ children, ...params }) => {
  const currentUser = useAppSelector(selectCurrentUser);

  const [ canAccess, setCanAccess ] = useState<boolean>(currentUser?.is_staff ?? false);

  const [ getCurrentUser ] = useGetCurrentUserMutation()

  useEffect(() => {
    if (currentUser) return;
    getCurrentUser().unwrap().then(u => setCanAccess(u.is_staff)).catch(console.warn)
  }, [])

  return (
    <Route { ...params }
           render={ ({ location }) =>
             canAccess ? (children) : (
               <Redirect to={ { pathname: "/annotation-campaign", state: { from: location } } }/>)
           }/>
  )
}
