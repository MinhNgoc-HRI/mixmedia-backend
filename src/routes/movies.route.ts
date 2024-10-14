import { MovieController } from '@controllers/movies.controller';
import { Routes } from '@interfaces/routes.interface';
import { Router } from 'express';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { MovieQueryBodyDto, MovieQueryDto } from '@dtos/movies.dto';

export class MovieRoute implements Routes {
  public path = '/movies';
  public router = Router();
  public movie = new MovieController();

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get(`${this.path}`, ValidationMiddleware(MovieQueryDto, 'query'), this.movie.getMovies);
    this.router.get(`${this.path}/:slug`, this.movie.getMovieBySlug);
    this.router.post(`${this.path}/search`, ValidationMiddleware(MovieQueryBodyDto, 'body'), this.movie.getMoviesByBody);
  }
}
