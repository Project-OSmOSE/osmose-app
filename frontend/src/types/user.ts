export class User {
  readonly id: number;
  readonly username: string;
  readonly email: string;
  readonly first_name: string;
  readonly last_name: string;
  readonly display_name: string;

  constructor(data: UserDTO) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.display_name = (data.first_name && data.last_name) ? `${ data.first_name } ${ data.last_name }` : data.username;
  }

  public get DTO(): UserDTO {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      first_name: this.first_name,
      last_name: this.last_name
    }
  }
}

export interface UserDTO {
  id: number,
  username: string,
  email: string,
  first_name: string,
  last_name: string
}
