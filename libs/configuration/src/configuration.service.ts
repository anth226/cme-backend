import * as path from 'path';
import * as yaml from 'js-yaml';
import { readFileSync } from 'fs';
import * as op from 'object-path';
import { Inject, Injectable } from '@nestjs/common';

const YAML_CONFIG_FILENAME = `${process.env.NODE_ENV}.yml`;

@Injectable()
export class ConfigurationService {
  private readonly config: any;

  constructor(@Inject('CONFIG_OPTIONS') private options) {
    const filePath = path.resolve(options.configRoot, YAML_CONFIG_FILENAME);
    console.log('---- the config file is: ', filePath);
    this.config = yaml.load(readFileSync(filePath, 'utf8'));
  }

  get<T>(setting: string): T {
    return op.get(this.config, setting);
  }
}
