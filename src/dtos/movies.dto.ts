import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

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
