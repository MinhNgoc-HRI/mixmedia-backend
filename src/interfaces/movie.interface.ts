import { Category } from '@interfaces/category.interface';
import { Country } from '@interfaces/country.interface';
import { Episode } from '@interfaces/episode.interface';

export interface Movie {
  _id: string;
  tmdb: { type: string; id: string; season: number; vote_average: number; vote_count: number };
  name: string;
  slug: string;
  origin_name: string;
  content: string;
  type: string;
  status: string;
  thumb_url: string;
  poster_url: string;
  is_copyright: boolean;
  sub_docquyen: boolean;
  chieurap: boolean;
  trailer_url: string;
  time: string;
  episode_current: string;
  episode_total: string;
  quality: string;
  lang: string;
  notify: string;
  showtimes: string;
  year: number;
  view: number;
  actor: string[];
  director: string[];
  category: Category[];
  country: Country[];
  episodes: Episode[];
  created: Date;
  modified: Date;
}

export interface MovieKphim extends Omit<Movie, 'created' | 'modified'> {
  created: {
    time: Date;
  };
  modified: {
    time: Date;
  };
}
