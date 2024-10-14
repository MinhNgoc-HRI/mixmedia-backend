import { CategoryController } from '@controllers/category.controller';
import { Routes } from '@interfaces/routes.interface';
import { Router } from 'express';

export class CategoryRoute implements Routes {
  public path = '/categories';
  public router = Router();
  public category = new CategoryController();

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get(`${this.path}`, this.category.getCategories);
  }
}
