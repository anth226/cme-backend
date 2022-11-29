import 'source-map-support/register';
import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { env } from 'process';

import { AppModule } from './app.module';
import { CmeAuthGuard } from './auth/cme-auth.guard';
import { RedisIoAdapter } from './redis-io.adapter';
import { TransformInterceptor } from './transform.interceptor';
import { MainClusteringService } from './clustering.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useWebSocketAdapter(new RedisIoAdapter(app));
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new CmeAuthGuard(reflector));
  app.useGlobalInterceptors(new TransformInterceptor());

  const options = new DocumentBuilder()
    .setTitle('ME API')
    .setDescription('Monkey Empire API')
    .setVersion('1.0')
    .addTag('me')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}

if (env.NODE_ENV === 'dev') {
  console.log('-> Dev env, starting one api node.');
  bootstrap();
} else {
  console.log('-> Prod env, starting api in cluster mode.');
  MainClusteringService.clusterize(bootstrap);
}
