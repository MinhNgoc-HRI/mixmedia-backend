import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class MovieQueryDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  public page: number;

  @IsInt()
  @Min(20)
  @IsOptional()
  @Type(() => Number)
  public total: number;
}

export class MovieQueryBodyDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  public page: number;

  @IsInt()
  @Min(20)
  @IsOptional()
  @Type(() => Number)
  public total: number;

  @IsArray()
  @IsOptional()
  @Type(() => String)
  public country: string[];

  @IsArray()
  @IsOptional()
  @Type(() => String)
  public category: string[];

  @IsString()
  @IsOptional()
  @Type(() => String)
  public slug: string;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  public asc: boolean;
}
