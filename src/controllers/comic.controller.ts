import { ComicService } from '@services/comic.service';
import Container from 'typedi';
import { NextFunction, Request, Response } from 'express';

export class ComicController {
  public comic = Container.get(ComicService);

  public getComis = async (req: Request<{}, {}, {}, { page?: number; total?: number }>, res: Response, next: NextFunction): Promise<void> => {
    const { page, total } = req.query;
    try {
      const rs = await this.comic.getComics(page, total);
      res.status(200).json({ status: true, message: 'success', ...rs });
    } catch (erros) {
      next(erros);
    }
  };

  public getComicBySlug = async (req: Request<{ slug?: string }, {}, {}, {}>, res: Response, next: NextFunction): Promise<void> => {
    const { slug } = req.params;
    try {
      const rs = await this.comic.getComicBySlug(slug);
      res.status(200).json({ status: true, message: 'success', ...rs });
    } catch (error) {
      next(error);
    }
  };

  // Lấy danh sách comic theo body
  public getComicsByBody = async (
    req: Request<{}, {}, { page?: number; total?: number; category?: string[]; slug?: string; asc?: boolean }, {}>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { page, total, category, slug, asc } = req.body;
    try {
      const rs = await this.comic.getComicsByQuery(page, total, category, slug, asc);
      res.status(200).json({ status: true, message: 'success', ...rs });
    } catch (error) {
      next(error);
    }
  };
}
