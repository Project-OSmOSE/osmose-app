export type Token = string | undefined;

export type User = {
  id: number,
  username: string,
  email: string,
  first_name: string,
  last_name: string,
  expertise_level: ExpertiseLevel,
  is_staff: boolean,
  is_superuser: boolean

  // Front only
  display_name: string,
  display_name_with_expertise: string,
}

export type ExpertiseLevel =
  "Expert" |
  "Average" |
  "Novice";

export type UserGroup = {
  readonly id: number,
  readonly name: string,
  readonly annotators: User[]
}