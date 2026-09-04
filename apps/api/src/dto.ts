import 'reflect-metadata';
import { ArrayMaxSize, ArrayUnique, IsArray, IsDateString, IsIn, IsInt, IsOptional, IsString, Matches, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { serverKeys } from './server-keys';

const minecraftUuidPattern = /^(?!00000000-0000-0000-0000-000000000000$)[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class OnlinePlayerDto {
  @Matches(minecraftUuidPattern) uuid!: string;
  @IsString() username!: string;
}

export class HeartbeatDto {
  @IsIn(serverKeys) serverKey!: string;
  @IsDateString() serverStartedAt!: string;
  @IsString() version!: string;
  @IsInt() @Min(0) playersOnline!: number;
  @IsInt() @Min(1) @Max(10000) playersMax!: number;
  @IsOptional() @IsArray() @ArrayMaxSize(10000) @ArrayUnique() @Matches(minecraftUuidPattern, { each: true }) onlinePlayerUuids?: string[];
  @IsOptional() @IsArray() @ArrayMaxSize(10000) @ValidateNested({ each: true }) @Type(() => OnlinePlayerDto) onlinePlayers?: OnlinePlayerDto[];
}
export class JoinDto { @Matches(minecraftUuidPattern) uuid!: string; @IsString() username!: string; @IsDateString() joinedAt!: string; @IsOptional() @IsIn(serverKeys) serverKey?: string; @IsOptional() @IsString() skinTextureHash?: string; }
export class PlayerSkinDto { @Matches(minecraftUuidPattern) uuid!: string; @IsString() skinTextureHash!: string; }
export class QuitDto { @Matches(minecraftUuidPattern) uuid!: string; @IsString() username!: string; @IsDateString() leftAt!: string; @IsInt() @Min(0) @Max(31536000) sessionPlaytimeSeconds!: number; }
export class StartDto { @IsIn(serverKeys) serverKey!: string; @IsDateString() serverStartedAt!: string; @IsOptional() @IsString() version?: string; }
export class StopDto { @IsIn(serverKeys) serverKey!: string; }
export class PlayerServerDto { @Matches(minecraftUuidPattern) uuid!: string; @IsString() username!: string; @IsIn(serverKeys) serverKey!: string; @IsDateString() connectedAt!: string; }
export class PlayerQueryDto { @IsOptional() @IsString() search?: string; @IsOptional() @IsString() sort?: 'recentlyJoined'|'firstJoined'|'recentlySeen'|'playtime'|'alphabetical'; @IsOptional() @IsString() online?: string; }
