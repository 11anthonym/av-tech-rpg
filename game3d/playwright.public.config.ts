import {defineConfig} from '@playwright/test';
import base from './playwright.config.ts';

const site=process.env.PLAYWRIGHT_PUBLIC_SITE;
const baseURL=process.env.PLAYWRIGHT_PUBLIC_URL??(site
  ?new URL('3d/',site.replace(/\/+$/,'')+'/').href
  :'https://11anthonym.github.io/av-tech-rpg/3d/');
if(process.env.CI&&!process.env.EXPECTED_BUILD)throw new Error('Public acceptance in CI requires EXPECTED_BUILD to identify the deployed commit.');

export default defineConfig({...base,testMatch:'public-release.spec.ts',webServer:undefined,
  outputDir:'public-test-results',reporter:[['list'],['html',{open:'never',outputFolder:'public-playwright-report'}]],
  use:{...base.use,baseURL},projects:[{name:'published-chromium',use:base.projects!.find(p=>p.name==='chromium')!.use}]});
