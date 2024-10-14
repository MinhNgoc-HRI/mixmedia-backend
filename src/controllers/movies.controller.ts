import { MovieService } from '@services/movie.service';
import Container from 'typedi';
import { NextFunction, Request, Response } from 'express';

export class MovieController {
  public movie = Container.get(MovieService);

  public getMovies = async (req: Request<{}, {}, {}, { page?: number; total?: number }>, res: Response, next: NextFunction): Promise<void> => {
    const { page, total } = req.query;
    try {
      const rs = await this.movie.getMovies(page, total);
      res.status(200).json({ status: true, message: 'success', ...rs });
    } catch (erros) {
      next(erros);
    }
  };

  public getMovieBySlug = async (req: Request<{ slug?: string }, {}, {}, {}>, res: Response, next: NextFunction): Promise<void> => {
    const { slug } = req.params;
    try {
      const rs = await this.movie.getMovieBySlug(slug);
      res.status(200).json({ status: true, message: 'success', ...rs });
    } catch (erros) {
      next(erros);
    }
  };

  public getMoviesByBody = async (
    req: Request<{}, {}, { page?: number; total?: number; country?: string[]; category?: string[]; slug?: string; asc?: boolean }, {}>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { page, total, category, country, asc, slug } = req.body;
    try {
      const rs = await this.movie.getMovieByQuery(page, total, country, category, slug, asc);
      res.status(200).json({ status: true, message: 'success', ...rs });
    } catch (erros) {
      next(erros);
    }
  };
}
