import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  project: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  file: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
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
