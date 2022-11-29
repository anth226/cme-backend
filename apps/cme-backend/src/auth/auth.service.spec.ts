import * as _ from 'lodash';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserRepository } from '../users/user.repository';
import { mock } from 'jest-mock-extended';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity';

describe('AuthService', () => {
  let service: AuthService;

  const user = {
    username: 'cryptomonkey',
    email: 'crypto@monkey.com',
    password: 'banana',
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mock<JwtService>(),
        },
        {
          provide: UserRepository,
          useValue: mock<UserRepository>(),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should return the user (positive)', async () => {
    const hashed =
      '$2b$10$B7m2QH2fF4XxoApMgqjbVOelt2E7ytKWtFR4M09xYD9AlO/JCVm1a';
    const findSpy = jest
      .spyOn(service['userRepository'], 'findOneByUsername')
      .mockResolvedValue({
        ...user,
        password: hashed,
      });

    const result = await service.validateUser(user.username, user.password);

    expect(findSpy).toHaveBeenCalledWith(user.username);
    expect(result).toMatchObject({ ..._.omit(user, 'password') });
  });

  it('should return undefined (no user)', async () => {
    const findSpy = jest.spyOn(service['userRepository'], 'findOneByUsername');

    const result = await service.validateUser(user.username, user.password);

    expect(findSpy).toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it("should return undefined (passwords don't match)", async () => {
    const findSpy = jest
      .spyOn(service['userRepository'], 'findOneByUsername')
      .mockResolvedValue(user);

    const result = await service.validateUser(user.username, 'brute-forced');

    expect(findSpy).toHaveBeenCalled();
    expect(result).toBeUndefined();
  });
});
