import { Chapter } from '@interfaces/chapter.interface';
import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne, Relation } from 'typeorm';
import { ComicEntity } from '@entities/comic.entity';

@Entity('chapter')
export class ChapterEntity extends BaseEntity implements Chapter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  server_name: string;

  @Column('simple-json')
  server_data: {
    filename: string;
    chapter_name: string;
    chapter_title: string;
    chapter_path: string;
    chapter_image: { image_page: number; image_file: string }[];
  };

  @ManyToOne(() => ComicEntity, comic => comic.chapters)
  comic: Relation<ComicEntity>;
}
