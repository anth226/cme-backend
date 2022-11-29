import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigurationService } from './configuration.service';

@Global()
@Module({})
export class ConfigurationModule {
  static register(options): DynamicModule {
    return {
      module: ConfigurationModule,
      providers: [
        {
          provide: 'CONFIG_OPTIONS',
          useValue: options,
        },
        ConfigurationService,
      ],
      exports: [ConfigurationService],
    };
  }
}
