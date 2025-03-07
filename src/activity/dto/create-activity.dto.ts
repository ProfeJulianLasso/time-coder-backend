import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  project: string;

  @IsString()
  @IsNotEmpty()
  file: string;

  @IsString()
  @IsNotEmpty()
  language: string;

  @IsNumber()
  startTime: number;

  @IsNumber()
  endTime: number;

  @IsString()
  @IsNotEmpty()
  branch: string;

  @IsBoolean()
  debug: boolean;

  @IsString()
  @IsNotEmpty()
  machine: string;

  @IsString()
  @IsNotEmpty()
  platform: string;
}
