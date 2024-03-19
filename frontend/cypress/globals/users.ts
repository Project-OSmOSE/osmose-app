
interface User {
  id: number,
  username: string,
  displayName: string,
  password: string
  email: string
}

export const USER_ADMIN: User = {
  id: 1,
  displayName: 'admin',
  username: 'admin',
  password: 'osmose29',
  email: 'admin@osmose.xyz'
}

export const USER_COMMON = {
  id: 2,
  displayName: 'User1 Test',
  username: 'TestUser1',
  password: 'osmose29',
  email: 'TestUser1@osmose.xyz'
}

export const USERS: Array<User> = [USER_ADMIN, USER_COMMON]
