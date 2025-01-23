export type TestUser = {
  id: number;
  displayName: string;
  username: string;
  password: string;
  email: string;
  expertise_level: 'Expert' | 'Novice';
}

export const ANNOTATOR: TestUser = {
  id: 2,
  displayName: 'User1 Test',
  username: 'TestUser1',
  password: 'osmose29',
  email: 'TestUser1@osmose.xyz',
  expertise_level: 'Expert'
}

export const BASE_USER: TestUser = {
  id: 3,
  displayName: 'User2 Test',
  username: 'TestUser2',
  password: 'osmose29',
  email: 'TestUser2@osmose.xyz',
  expertise_level: 'Novice'
}

export const ADMIN: TestUser = {
  id: 1,
  displayName: 'admin',
  username: 'admin',
  password: 'osmose29',
  email: 'admin@osmose.xyz',
  expertise_level: 'Novice'
}