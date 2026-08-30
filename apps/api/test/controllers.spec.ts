import { describe, expect, it } from 'vitest'; import { IngestAuthGuard } from '../src/controllers';
describe('IngestAuthGuard',()=>{it('rejects a missing ingestion secret',()=>{process.env.MINECRAFT_INGEST_SECRET='secret';const context={switchToHttp:()=>({getRequest:()=>({headers:{}})})} as any;expect(()=>new IngestAuthGuard().canActivate(context)).toThrow('Unauthorized ingestion request')})});

