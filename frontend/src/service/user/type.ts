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
  is_staff: boolean,
  is_superuser: boolean
}