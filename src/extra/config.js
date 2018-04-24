require('babel-polyfill');
require("regenerator-runtime");

import path from 'path';

import got from 'got';
import normalize from 'normalize-url';
import pathFixer from '@splash-cli/path-fixer';

import { errorHandler } from '../extra/utils';

export const defaultSettings = {
  aliases: [],
  size: 'full',
  userAuth: false,
  authKey: undefined,
  downloadsCounter: 0,
  lastAlias: undefined,
  directory: pathFixer(path.join('~', 'Pictures', 'splash_photos')),
};

export const commandsList = {
  list: 'list',
  alias: 'alias',
  restore: 'restore',
  settings: 'settings',
  'get-settings': 'get-settings',
};

export const keys = {
  api: {
    getToken: async () => {
      if ( process.env.SPLASH_TOKEN ) {
        return process.env.SPLASH_TOKEN;
      }

      try {
        const { body } = await got('https://federicovitale.me/splash');
        return JSON.parse(body).token;
      } catch (error) {
        errorHandler(error);
      }
    },
    base: normalize('https://api.unsplash.com')
  },
};

// normalize(`https://unsplash.com/oauth/authorize?client_id=${process.env.TOKEN}&redirect_uri=urn:ietf:wg:oauth:2.0:oob&response_type=code&scope=public`)