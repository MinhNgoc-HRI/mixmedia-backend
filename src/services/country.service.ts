import { CountryEntity } from '@entities/country.entity';
import { Repository, EntityRepository } from 'typeorm';
import { Service } from 'typedi';
import { Country } from '@interfaces/country.interface';
import axios from 'axios';
import { CRAWL_ENDPOINT } from '@/config';
import { logger } from '@/utils/logger';
import { NODE_ENV } from '@config';

@Service()
@EntityRepository()
export class CountryService extends Repository<CountryEntity> {
  public async insertCountries(countries: Country[]): Promise<Country[]> {
    if (!countries?.length) {
      return [];
    }

    const insertResult = await CountryEntity.createQueryBuilder()
      .insert()
      .into(CountryEntity)
      .values(countries)
      .orIgnore() // Bỏ qua các bản ghi có slug đã tồn tại
      .returning('*') // Trả về các bản ghi đã chèn
      .execute();
    return insertResult.raw;
  }
  public async fetchAndSaveCountries(): Promise<void> {
    try {
      const response = await axios.get(`${CRAWL_ENDPOINT}/v1/api/quoc-gia`, {
        timeout: 10000,
      });
      if (response.data.status === 'success') {
        const countries = response.data.data.items;
        const rs = await this.insertCountries(countries);
        logger.info(`=================================`);
        logger.info(`======= ENV: ${NODE_ENV} =======`);
        logger.info(`🚀 Đã lưu thành công ${rs.length} quốc gia vào cơ sở dữ liệu.`);
        logger.info(`=================================`);
      } else {
        logger.info(`=================================`);
        logger.info(`======= ENV: ${NODE_ENV} =======`);
        logger.info('🚀 Không có dữ liệu countries để lưu.');
        logger.info(`=================================`);
      }
    } catch (error) {
      logger.error(`=================================`);
      logger.error(`======= ENV: ${NODE_ENV} =======`);
      logger.error(`🚀 Lỗi khi gọi API hoặc lưu dữ liệu countries:`, error);
      logger.error(`=================================`);
    }
  }
}
