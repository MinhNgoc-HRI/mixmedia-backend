import { ComicCategory } from '@interfaces/comic_category.interface';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('comic_category')
export class ComicCategoryEntity extends BaseEntity implements ComicCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  slug: string;
}
