import pathFixer from "@splash-cli/path-fixer";
import Unsplash from "unsplash-js";
import fetch from 'isomorphic-fetch';

export const defaultSettings = {
  directory: pathFixer("~/Pictures/splash_photos"),
  userFolder: false,
  aliases: [],
  counter: 0
};

const keys = {
  applicationId: "a70f2ffae3634a7bbb5b3f94998e49ccb2e85922fa3215ccb61e022cf57ca72c",
  secret: "0a86783ec8a023cdfa38a39e9ffab7f1c974e48389dc045a8e4b3978d6966e94",
  callbackUrl: "https://federicovitale.me/auth/splash-cli"
};

export const unsplash = new Unsplash(keys);

export const commandsList = {};