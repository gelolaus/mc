import { Module } from '@nestjs/common'; import { DatabaseService } from './database.service'; import { ServerService } from './server.service'; import { PlayersService } from './players.service'; import { IngestionService } from './ingestion.service'; import { PublicController, IngestionController } from './controllers';
@Module({ controllers: [PublicController, IngestionController], providers: [DatabaseService, ServerService, PlayersService, IngestionService] }) export class AppModule {}

