import { ComicCategoryService } from '@services/comic_category.service';
import Container from 'typedi';
import { NextFunction, Request, Response } from 'express';

export class ComicCategoryController {
  public comic_catrgory = Container.get(ComicCategoryService);

  public getComicCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rs = await this.comic_catrgory.getComicCategories();
      res.status(200).json({ status: true, message: 'success', data: rs });
    } catch (error) {
      next(error);
    }
  };
}
