import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BaseEntity } from 'typeorm';
import { MovieEntity } from '@entities/movie.entity';
import { Episode } from '@interfaces/episode.interface';

@Entity('episode')
export class EpisodeEntity extends BaseEntity implements Episode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  server_name: string;

  @Column('simple-json')
  server_data: { name: string; slug: string; filename: string; link_embed: string; link_m3u8: string }[];

  @ManyToOne(() => MovieEntity, movie => movie.episodes)
  movie: MovieEntity;
}
