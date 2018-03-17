const PROD = 'production';
const DEV = 'dev';
const TEST = 'test';

const env = process.env.NODE_ENV || DEV;

if (env === TEST || env === DEV) {
    const config = require('./processConfig.json');
    const envConfig = config[env];

    Object.keys(envConfig).forEach((k) => {
        process.env[k] = envConfig[k];
    });
}