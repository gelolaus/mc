import 'reflect-metadata'; import { config } from 'dotenv'; import { resolve } from 'node:path'; import { ValidationPipe } from '@nestjs/common'; import { NestFactory } from '@nestjs/core'; import { AppModule } from './app.module';
config({ path: resolve(process.cwd(), '../../.env') });
export async function createApp() { const app = await NestFactory.create(AppModule, { cors: true, logger: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : undefined }); app.setGlobalPrefix(''); app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true })); return app; }
async function bootstrap() { const app = await createApp(); await app.listen(process.env.PORT ?? 3001); } if (require.main === module) void bootstrap();
