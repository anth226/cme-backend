import { EntityRepository, Repository } from 'typeorm';
import { User } from './user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  // constructor() {
  //   super();
  //
  //   const rep = new Repository();
  //   console.log(this);
  // }

  async findAll(): Promise<Array<User>> {
    return await this.find();
  }

  async findOneByUsername(username: string): Promise<User> {
    return this.findOne({ username });
  }

  async findOneByToken(email_verification_token: string): Promise<User> {
    return this.findOne({ email_verification_token });
  }

  async updateUserEmailVerified(user: User): Promise<User> {
    user.email_confirmed_at = new Date();
    user.email_confirmed = true;
    this.save(user);

    return user;
  }
}
