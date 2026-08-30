import { ArrayMaxSize, ArrayUnique, IsArray, IsDateString, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class HeartbeatDto {
  @IsIn(['survival', 'creative']) serverKey!: string;
  @IsDateString() serverStartedAt!: string;
  @IsString() version!: string;
  @IsInt() @Min(0) playersOnline!: number;
  @IsInt() @Min(1) @Max(10000) playersMax!: number;
  @IsArray() @ArrayMaxSize(10000) @ArrayUnique() @IsUUID('4', { each: true }) onlinePlayerUuids!: string[];
}
export class JoinDto { @IsUUID('4') uuid!: string; @IsString() username!: string; @IsDateString() joinedAt!: string; }
export class QuitDto { @IsUUID('4') uuid!: string; @IsString() username!: string; @IsDateString() leftAt!: string; @IsInt() @Min(0) @Max(31536000) sessionPlaytimeSeconds!: number; }
export class StartDto { @IsIn(['survival', 'creative']) serverKey!: string; @IsDateString() serverStartedAt!: string; @IsOptional() @IsString() version?: string; }
export class StopDto { @IsIn(['survival', 'creative']) serverKey!: string; }
export class PlayerServerDto { @IsUUID('4') uuid!: string; @IsIn(['survival', 'creative']) serverKey!: string; @IsDateString() connectedAt!: string; }
export class PlayerQueryDto { @IsOptional() @IsString() search?: string; @IsOptional() @IsString() sort?: 'recentlyJoined'|'firstJoined'|'recentlySeen'|'playtime'|'alphabetical'; @IsOptional() @IsString() online?: string; }
