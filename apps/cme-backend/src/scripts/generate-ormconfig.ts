import fs = require('fs');
import path = require('path');
import * as yaml from 'js-yaml';

// TO DO: mutualize with config
const YAML_CONFIG_FILENAME = `${process.env.NODE_ENV}.yml`;
const configPath = path.join(__dirname, '..', '..', 'config', YAML_CONFIG_FILENAME);
const ormConfigPath = path.join(__dirname, '..', '..', '..', '..', 'ormconfig.json');

export const config = yaml.load(
    fs.readFileSync(configPath, 'utf8'),
) as any;

fs.writeFileSync(ormConfigPath, JSON.stringify(config.typeorm, null, 2));
