import { User } from './type';

export const getDisplayName = (user?: User, withExpertise: boolean = true) => {
  if (!user) return '';
  const displayName = (user.first_name && user.last_name) ? `${ user.first_name } ${ user.last_name }` : user.username;
  if (withExpertise && user.expertise_level) return `${ displayName } (${ user.expertise_level })`
  return displayName;
}
