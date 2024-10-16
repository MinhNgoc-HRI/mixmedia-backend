import { ComicController } from '@controllers/comic.controller';
import { Routes } from '@interfaces/routes.interface';
import { Router } from 'express';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { ComicQueryBodyDto, ComicQueryDto } from '@dtos/comics.dto';

export class ComicRoute implements Routes {
  public path = '/comics';
  public router = Router();
  public comic = new ComicController();

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get(`${this.path}`, ValidationMiddleware(ComicQueryDto, 'query'), this.comic.getComis);
    this.router.get(`${this.path}/:slug`, this.comic.getComicBySlug);
    this.router.post(`${this.path}/search`, ValidationMiddleware(ComicQueryBodyDto, 'body'), this.comic.getComicsByBody);
  }
}
