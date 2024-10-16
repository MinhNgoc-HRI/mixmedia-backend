import { Comic } from '@interfaces/comic.interface';
import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany, Relation } from 'typeorm';
import { ComicCategoryEntity } from '@entities/comic_category.entity';
import { ChapterEntity } from '@entities/chapter.entity';

@Entity('comic')
export class ComicEntity extends BaseEntity implements Comic {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  slug: string;

  @Column('simple-array', { nullable: true })
  origin_name: string[];

  @Column({ nullable: true })
  content: string;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  thumb_url: string;

  @Column({ nullable: true })
  sub_docquyen: boolean;

  @Column('simple-array', { nullable: true })
  author: string[];

  @ManyToMany(() => ComicCategoryEntity)
  @JoinTable()
  category: Relation<ComicCategoryEntity>[];

  @OneToMany(() => ChapterEntity, chapter => chapter.comic)
  chapters: Relation<ChapterEntity>[];

  @Column({ nullable: true })
  updatedAt: Date;

  @Column({ nullable: true })
  created: Date;
}
