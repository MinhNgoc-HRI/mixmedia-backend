import { ComicCategory } from '@interfaces/comic_category.interface';
import { Chapter } from '@interfaces/chapter.interface';

export interface Comic {
  _id: string;
  name: string;
  slug: string;
  origin_name: string[];
  content: string;
  status: string;
  thumb_url: string;
  sub_docquyen: boolean;
  author: string[];
  category: ComicCategory[];
  chapters: Chapter[];
  updatedAt: Date;
  created: Date;
}
