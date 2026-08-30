import { Body, Controller, Get, HttpCode, Post, Query, UnauthorizedException, UseGuards, CanActivate, ExecutionContext, Injectable, Param } from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import { HeartbeatDto, JoinDto, PlayerQueryDto, PlayerServerDto, QuitDto, StartDto, StopDto } from './dto';
import { IngestionService } from './ingestion.service';
import { PlayersService } from './players.service';
import { ServerService } from './server.service';

@Injectable()
export class IngestAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const supplied = context.switchToHttp().getRequest().headers.authorization?.replace(/^Bearer\s+/i, '') ?? '';
    const expected = process.env.MINECRAFT_INGEST_SECRET ?? '';
    if (!expected || supplied.length !== expected.length || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) throw new UnauthorizedException('Unauthorized ingestion request');
    return true;
  }
}

@Controller('v1')
export class PublicController {
  constructor(private server: ServerService, private players: PlayersService) {}
  @Get('server') getServer() { return this.server.publicState(); }
  @Get('servers') getServers() { return this.server.publicStates(); }
  @Get('world') getWorld() { return this.server.world(); }
  @Get('players') getPlayers(@Query() query: PlayerQueryDto) { return this.players.list(query); }
  @Get('players/new') newest() { return this.players.newest(); }
  @Get('players/:uuidOrUsername') player(@Param('uuidOrUsername') id: string) { return this.players.profile(id); }
}

@UseGuards(IngestAuthGuard)
@Controller('v1/ingest')
export class IngestionController {
  constructor(private ingestion: IngestionService) {}
  @Post('heartbeat') @HttpCode(200) heartbeat(@Body() data: HeartbeatDto) { return this.ingestion.heartbeat(data); }
  @Post('players/join') @HttpCode(200) join(@Body() data: JoinDto) { return this.ingestion.join(data); }
  @Post('players/quit') @HttpCode(200) quit(@Body() data: QuitDto) { return this.ingestion.quit(data); }
  @Post('players/server') @HttpCode(200) playerServer(@Body() data: PlayerServerDto) { return this.ingestion.playerServer(data); }
  @Post('server/start') @HttpCode(200) start(@Body() data: StartDto) { return this.ingestion.start(data); }
  @Post('server/stop') @HttpCode(200) stop(@Body() data: StopDto) { return this.ingestion.stop(data); }
}
