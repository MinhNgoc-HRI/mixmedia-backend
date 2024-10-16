import { ComicCategoryController } from '@controllers/comic_category.controller';
import { Routes } from '@interfaces/routes.interface';
import { Router } from 'express';

export class ComicCategoryRoute implements Routes {
  public path = '/comic-categories';
  public router = Router();
  public comic_category = new ComicCategoryController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.comic_category.getComicCategories);
  }
}
