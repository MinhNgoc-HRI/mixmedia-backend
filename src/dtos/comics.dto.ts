import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min, IsArray, IsBoolean, IsString } from 'class-validator';

export class ComicQueryDto {
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

export class ComicQueryBodyDto {
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
