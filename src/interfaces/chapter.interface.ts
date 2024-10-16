import { Comic } from '@interfaces/comic.interface';

export interface Chapter {
  id: string;
  server_name: string;
  server_data: {
    filename: string;
    chapter_name: string;
    chapter_title: string;
    chapter_path: string;
    chapter_image: { image_page: number; image_file: string }[];
  };
  comic: Comic;
}
