import { createApp } from '../src/main';
let appPromise: ReturnType<typeof createApp> | undefined;
export default async function handler(req: any, res: any) { appPromise ??= createApp(); const app = await appPromise; return app.getHttpAdapter().getInstance()(req, res); }

