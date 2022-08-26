import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { pg } from 'pg';
import * as fs from 'fs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../../users/user.entity';
import { ConfigModule } from '../../../config/config.module';
import { ConfigService } from '../../../config/config.service';
import { GuildModule } from '../../guild.module';
import { Guild } from '../../guild.entity';

describe('Guilds integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule,
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) =>
            configService.get('typeorm'),
          inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([Guild]),
        GuildModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const query = fs.readFileSync('./fixtures/fixture.sql').toString();
    const client = await pg.connect('pg://postgres:example@localhost/cme');
    await client.query(query);
  });

  it('should create guild', async () => {
    const response = await request(app.getHttpServer())
      .post('/guild')
      .send({
        name: 'Demo Guild',
      })
      .set(
        'Authorization',
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRvc2hzYW4iLCJzdWIiOjEsImlhdCI6MTYxODMzODk3MywiZXhwIjoxNjE4MzM5MDMzfQ.lu78vLqJ8Fs1EvilJuzDNCub66dVZODz0EWocYFAmiQ',
      )
      .expect(201);
  });

  it('should invite members to guild', async () => {
    const response = await request(app.getHttpServer())
      .post('/guild/1/invite')
      .send({
        id: 1,
        members: [2],
      })
      .set(
        'Authorization',
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRvc2hzYW4iLCJzdWIiOjEsImlhdCI6MTYxODMzODk3MywiZXhwIjoxNjE4MzM5MDMzfQ.lu78vLqJ8Fs1EvilJuzDNCub66dVZODz0EWocYFAmiQ',
      )
      .expect(201);
  });

  it('should leave guild', async () => {
    const response = await request(app.getHttpServer())
      .delete('/guild/1/leave')
      .set(
        'Authorization',
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRvc2hzYW4iLCJzdWIiOjEsImlhdCI6MTYxODMzODk3MywiZXhwIjoxNjE4MzM5MDMzfQ.lu78vLqJ8Fs1EvilJuzDNCub66dVZODz0EWocYFAmiQ',
      )
      .expect(200);
  });

  it('should delete guild', async () => {
    const response = await request(app.getHttpServer())
      .delete('/guild/1')
      .set(
        'Authorization',
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRvc2hzYW4iLCJzdWIiOjEsImlhdCI6MTYxODMzODk3MywiZXhwIjoxNjE4MzM5MDMzfQ.lu78vLqJ8Fs1EvilJuzDNCub66dVZODz0EWocYFAmiQ',
      )
      .expect(200);
  });
});
