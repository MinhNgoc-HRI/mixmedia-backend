import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany, BaseEntity } from 'typeorm';
import { Movie } from '@interfaces/movie.interface';
import { CategoryEntity } from '@entities/category.entity';
import { CountryEntity } from '@entities/country.entity';
import { EpisodeEntity } from '@entities/episode.entity';

@Entity('movie')
export class MovieEntity extends BaseEntity implements Movie {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ nullable: true })
  name: string;

  @Column()
  slug: string;

  @Column({ nullable: true })
  origin_name: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  thumb_url: string;

  @Column({ nullable: true })
  poster_url: string;

  @Column({ default: false })
  is_copyright: boolean;

  @Column({ default: false })
  sub_docquyen: boolean;

  @Column({ default: false })
  chieurap: boolean;

  @Column({ nullable: true })
  trailer_url: string;

  @Column({ nullable: true })
  time: string;

  @Column({ nullable: true })
  episode_current: string;

  @Column({ nullable: true })
  episode_total: string;

  @Column({ nullable: true })
  quality: string;

  @Column({ nullable: true })
  lang: string;

  @Column({ nullable: true })
  notify: string;

  @Column({ nullable: true })
  showtimes: string;

  @Column({ nullable: true })
  year: number;

  @Column({ nullable: true })
  view: number;

  @Column('simple-array', { nullable: true })
  actor: string[];

  @Column('simple-array', { nullable: true })
  director: string[];

  @ManyToMany(() => CategoryEntity)
  @JoinTable()
  category: CategoryEntity[];

  @ManyToMany(() => CountryEntity)
  @JoinTable()
  country: CountryEntity[];

  @OneToMany(() => EpisodeEntity, episode => episode.movie)
  episodes: EpisodeEntity[];

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  modified: Date;
}
