import { OldAPIService } from "./api-service.util.tsx";

export type ExpertiseLevel =
  "Expert" |
  "Average" |
  "Novice";

export interface User {
  id: number,
  username: string,
  email: string,
  first_name: string,
  last_name: string,
  expertise_level: ExpertiseLevel,
  is_staff: boolean,
  is_superuser: boolean
}

class UserAPIService extends OldAPIService<User, never> {
  self(): Promise<User> {
    return super.retrieve("", `${ this.URI }/self/`)
  }

  retrieve(): Promise<never> {
    throw 'Unimplemented';
  }

  create(): Promise<never> {
    throw 'Unimplemented';
  }
}

export const useUsersAPI = (host?: string) => {
  return new UserAPIService(`${host ?? ''}/api/user`);
}
