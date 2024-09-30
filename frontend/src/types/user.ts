export type ExpertiseLevel =
  "Expert" |
  "Average" |
  "Novice";

export type User = {
  id: number,
  username: string,
  email: string,
  first_name: string,
  last_name: string,
  expertise_level: ExpertiseLevel,
}

export const getDisplayName = (user?: User, withExpertise: boolean = true) => {
  if (!user) return '';
  const displayName = (user.first_name && user.last_name) ? `${ user.first_name } ${ user.last_name }` : user.username;
  if (withExpertise && user.expertise_level) return `${ displayName } (${ user.expertise_level })`
  return displayName;
}
