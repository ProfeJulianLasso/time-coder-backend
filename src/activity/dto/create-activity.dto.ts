import { IsNumber, IsString } from 'class-validator';

export class CreateActivityDto {
  @IsString()
  project: string;

  @IsString()
  file: string;

  @IsString()
  language: string;

  @IsNumber()
  startTime: number;

  @IsNumber()
  endTime: number;
}
