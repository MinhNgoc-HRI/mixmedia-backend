import { CategoryEntity } from '@entities/category.entity';
import { EntityRepository, Repository } from 'typeorm';
import { Service } from 'typedi';
import { Category } from '@interfaces/category.interface';
import axios from 'axios';
import { CRAWL_ENDPOINT } from '@config';
import { logger } from '@utils/logger';
import { NODE_ENV } from '@config';

@Service()
@EntityRepository()
export class CategoryService extends Repository<CategoryEntity> {
  public async insertCategories(categories: Category[]): Promise<Category[]> {
    if (!categories?.length) {
      return [];
    }

    const insertResult = await CategoryEntity.createQueryBuilder()
      .insert()
      .into(CategoryEntity)
      .values(categories)
      .orIgnore() // Bỏ qua các bản ghi có slug đã tồn tại
      .returning('*') // Trả về các bản ghi đã chèn
      .execute();
    return insertResult.raw;
  }

  public async fetchAndSaveCategories(): Promise<void> {
    try {
      const response = await axios.get(`${CRAWL_ENDPOINT}/v1/api/the-loai`, {
        timeout: 30000,
      });
      if (response.data.status === 'success') {
        const categories = response.data.data.items;
        const rs = await this.insertCategories(categories);
        logger.info(`=================================`);
        logger.info(`======= ENV: ${NODE_ENV} =======`);
        logger.info(`🚀 Đã lưu thành công ${rs.length} thể loại vào cơ sở dữ liệu.`);
        logger.info(`=================================`);
      } else {
        logger.info(`=================================`);
        logger.info(`======= ENV: ${NODE_ENV} =======`);
        logger.info('🚀 Không có dữ liệu categories để lưu.');
        logger.info(`=================================`);
      }
    } catch (error) {
      logger.error(`=================================`);
      logger.error(`======= ENV: ${NODE_ENV} =======`);
      logger.error(`🚀 Lỗi khi gọi API hoặc lưu dữ liệu categories:`, error);
      logger.error(`=================================`);
    }
  }

  public async getCategories(): Promise<Category[]> {
    try {
      const categories = await CategoryEntity.createQueryBuilder('category').select(['category.name', 'category.slug']).getMany();
      return categories;
    } catch (error) {
      logger.error(`🚀 Lỗi khi lấy categories từ db`);
    }
  }
}
