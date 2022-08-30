import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { VillagesModule } from '../../villages.module';
import { pg } from 'pg';
import * as fs from 'fs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../../users/user.entity';
import { ConfigModule } from '../../../config/config.module';
import { ConfigService } from '../../../config/config.service';

describe('Villages integration', () => {
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
        TypeOrmModule.forFeature([User]),
        VillagesModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const query = fs.readFileSync('./fixtures/fixture.sql').toString();
    const client = await pg.connect('pg://postgres:example@localhost/cme');
    await client.query(query);
  });

  it('should list villages', () => {
    return request(app.getHttpServer())
      .get('/villages')
      .expect(200)
      .expect('Hello World!');
  });

  it("should show user's village", async () => {
    return request(app.getHttpServer())
      .get('/villages/1')
      .expect(200)
      .expect('Hello World!');
  });

  it("should create user's first village", async () => {
    const response = await request(app.getHttpServer())
      .post('/villages')
      .send({
        name: 'Chimpolis',
        x: 0,
        y: 0,
      })
      .set(
        'Authorization',
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRvc2hzYW4iLCJzdWIiOjEsImlhdCI6MTYxODMzODk3MywiZXhwIjoxNjE4MzM5MDMzfQ.lu78vLqJ8Fs1EvilJuzDNCub66dVZODz0EWocYFAmiQ',
      )
      .expect(201);
  });
});
