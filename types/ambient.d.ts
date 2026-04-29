// Ambient declarations to satisfy TypeScript when using dynamic imports
// for serverless Chromium and puppeteer-core in production builds.

declare module '@sparticuz/chromium' {
  const chromium: any;
  export default chromium;
}

declare module 'puppeteer-core' {
  const puppeteer: any;
  export default puppeteer;
}
