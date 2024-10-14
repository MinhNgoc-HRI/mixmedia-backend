import { CategoryService } from '@services/category.service';
import { NextFunction, Request, Response } from 'express';
import Container from 'typedi';

export class CategoryController {
  public category = Container.get(CategoryService);

  public getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rs = await this.category.getCategories();
      res.status(200).json({ status: true, message: 'success', data: rs });
    } catch (error) {
      next(error);
    }
  };
}
