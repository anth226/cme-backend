import { RolesBuilder } from 'nest-access-control';

export enum AppRoles {
  User = 'user',
  Admin = 'admin',
}

const readOwnUserProps = ['email', 'username', 'eth_wallet_addresses'];
const readAnyVillageProps = [
  'id',
  'name',
  'x',
  'y',
  'population',
  'createdAt',
  'user.username',
];
const readOwnVillageProps = [
  ...readAnyVillageProps,
  'villagesResourceTypes',
  'facilities',
];
const readOwnAttackProps = ['id', 'createdAt', 'attackTime', 'defenderVillage'];

export const roles: RolesBuilder = new RolesBuilder();

roles
  .grant(AppRoles.User) // define new or modify existing role. also takes an array.
  .readOwn('user', readOwnUserProps)

  // TO DO : add "pseudo" column and grant reading access to that one instead of username if username is used for login
  .readAny('village', readAnyVillageProps)
  .createOwn('village') // equivalent to .createOwn('village', ['*'])
  .readOwn('village', readOwnVillageProps)
  .deleteOwn('village')

  .createOwn('attack')
  .readOwn('attack', readOwnAttackProps)

  .createOwn('facilities')
  .deleteOwn('facilities');

/* .grant(AppRoles.Admin) // switch to another role without breaking the chain
.extend(AppRoles.User) // inherit role capabilities. also takes an array
.updateAny('village', ['title']) // explicitly defined attributes
.deleteAny('village'); */
