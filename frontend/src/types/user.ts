// export class User {
//   id: number;
//   username: string;
//   email: string;
//   first_name: string;
//   last_name: string;
//
//   constructor(data: { id: number, username: string, email: string, first_name: string, last_name: string }) {
//     this.id = data.id;
//     this.username = data.username;
//     this.email = data.email;
//     this.first_name = data.first_name;
//     this.last_name = data.last_name;
//   }
//
//   get display_name(): string {
//     if (this.first_name && this.last_name) return `${ this.first_name } ${ this.last_name }`;
//     else return this.username;
//   }
// }

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name: string;
}
