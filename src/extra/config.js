require('babel-polyfill');
require("regenerator-runtime");

import path from 'path';

import got from 'got';
import normalize from 'normalize-url';
import pathFixer from '@splash-cli/path-fixer';

export default async function() {
  if (!process.env.SPLASH_TOKEN) {
    try {
      const response = await got('https://federicovitale.me/splash-cli?token=true');
      apiToken = JSON.parse(response.body).token
      return {
        
      }
    } catch (error) {
      throw error;
    }
  }
}

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

export const actions = {
  list: () => {},
  alias: () => {},
  settings: () => {},
};

export const keys = {
  api: {
    getToken: async () => {
      if ( process.env.SPLASH_TOKEN ) {
        // config.set('splash-token', process.env.SPLASH_TOKEN);
        return process.env.SPLASH_TOKEN;
      }

      try {
        const { body } = await got('https://federicovitale.me/splash');
        // config.set('splash-token', JSON.parse(body).token);

        return JSON.parse(body).token;
      } catch (error) {
        throw error;
      }
    },
    base: normalize('https://api.unsplash.com')
  },
};

// normalize(`https://unsplash.com/oauth/authorize?client_id=${process.env.TOKEN}&redirect_uri=urn:ietf:wg:oauth:2.0:oob&response_type=code&scope=public`)