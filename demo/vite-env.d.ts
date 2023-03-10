/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

import { Faker } from '@faker-js/faker';

declare global {
  interface Window {
    faker: Faker;
  }
}