import { CountryService } from '@services/country.service';
import Container from 'typedi';
import { NextFunction, Request, Response } from 'express';

export class CountryController {
  public country = Container.get(CountryService);

  public getCountries = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rs = await this.country.getCountries();
      res.status(200).json({ status: true, message: 'success', data: rs });
    } catch (error) {
      next(error);
    }
  };
}
