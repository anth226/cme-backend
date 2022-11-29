import * as bcrypt from 'bcrypt';
import { mock } from 'jest-mock-extended';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { MailService } from '../mail/mail.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: mock<UserRepository>(),
        },
        {
          provide: MailService,
          useValue: mock<MailService>(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it("should handle user's password properly", async () => {
    const user = {
      username: 'cryptomonkey',
      email: 'crypto@monkey.com',
      password: 'banana',
    } as CreateUserDto;

    const hashSpy = jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed');
    const saveSpy = jest.spyOn(service['usersRepository'], 'save');

    await service.create(user);

    expect(hashSpy).toHaveBeenCalledWith('banana', expect.any(Number));
    expect(saveSpy.mock.calls[0][0]).toMatchObject({
      ...user,
      password: 'hashed',
    });

    jest.restoreAllMocks();
  });

  it('should reject long user names', async () => {
    const dto = {
      username: 'W'.repeat(16),
      password: 'string',
    } as CreateUserDto;
    await expect(service.create(dto)).rejects.toThrow("Name can't be longer");
  });
});
