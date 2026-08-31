import 'reflect-metadata';
import { ArrayMaxSize, ArrayUnique, IsArray, IsDateString, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class OnlinePlayerDto {
  @IsUUID() uuid!: string;
  @IsString() username!: string;
}

export class HeartbeatDto {
  @IsIn(['survival', 'creative']) serverKey!: string;
  @IsDateString() serverStartedAt!: string;
  @IsString() version!: string;
  @IsInt() @Min(0) playersOnline!: number;
  @IsInt() @Min(1) @Max(10000) playersMax!: number;
  @IsOptional() @IsArray() @ArrayMaxSize(10000) @ArrayUnique() @IsUUID(undefined, { each: true }) onlinePlayerUuids?: string[];
  @IsOptional() @IsArray() @ArrayMaxSize(10000) @ValidateNested({ each: true }) @Type(() => OnlinePlayerDto) onlinePlayers?: OnlinePlayerDto[];
}
export class JoinDto { @IsUUID() uuid!: string; @IsString() username!: string; @IsDateString() joinedAt!: string; @IsOptional() @IsIn(['survival', 'creative']) serverKey?: string; @IsOptional() @IsString() skinTextureHash?: string; }
export class PlayerSkinDto { @IsUUID() uuid!: string; @IsString() skinTextureHash!: string; }
export class QuitDto { @IsUUID() uuid!: string; @IsString() username!: string; @IsDateString() leftAt!: string; @IsInt() @Min(0) @Max(31536000) sessionPlaytimeSeconds!: number; }
export class StartDto { @IsIn(['survival', 'creative']) serverKey!: string; @IsDateString() serverStartedAt!: string; @IsOptional() @IsString() version?: string; }
export class StopDto { @IsIn(['survival', 'creative']) serverKey!: string; }
export class PlayerServerDto { @IsUUID() uuid!: string; @IsString() username!: string; @IsIn(['survival', 'creative']) serverKey!: string; @IsDateString() connectedAt!: string; }
export class PlayerQueryDto { @IsOptional() @IsString() search?: string; @IsOptional() @IsString() sort?: 'recentlyJoined'|'firstJoined'|'recentlySeen'|'playtime'|'alphabetical'; @IsOptional() @IsString() online?: string; }
