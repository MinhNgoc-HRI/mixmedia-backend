import { ComicCategory } from '@interfaces/comic_category.interface';
import { ComicCategoryEntity } from '@entities/comic_category.entity';
import { Repository, EntityRepository } from 'typeorm';
import axios from 'axios';
import { CRAWL_ENDPOINT_COMIC } from '@config';
import { logger } from '@utils/logger';
import { NODE_ENV } from '@config';
import { Service } from 'typedi';

@Service()
@EntityRepository()
export class ComicCategoryService extends Repository<ComicCategoryEntity> {
  public async insertComicCaterories(comic_categories: ComicCategory[]): Promise<ComicCategory[]> {
    if (!comic_categories?.length) {
      return [];
    }

    const insertResult = await ComicCategoryEntity.createQueryBuilder()
      .insert()
      .into(ComicCategoryEntity)
      .values(comic_categories)
      .orIgnore()
      .returning('*')
      .execute();

    return insertResult.raw;
  }

  public async fetchAndSaveComicCategories(): Promise<void> {
    try {
      const response = await axios.get(`${CRAWL_ENDPOINT_COMIC}/v1/api/the-loai`, {
        timeout: 10000,
      });
      if (response.data.status === 'success') {
        const categories = response.data.data.items;
        const rs = await this.insertComicCaterories(categories);
        logger.info(`=================================`);
        logger.info(`======= ENV: ${NODE_ENV} =======`);
        logger.info(`🚀 Đã lưu thành công ${rs.length} thể loại truyện vào cơ sở dữ liệu.`);
        logger.info(`=================================`);
      } else {
        logger.info(`=================================`);
        logger.info(`======= ENV: ${NODE_ENV} =======`);
        logger.info('🚀 Không có dữ liệu comic categories để lưu.');
        logger.info(`=================================`);
      }
    } catch (error) {}
  }
  public async getComicCategories(): Promise<ComicCategory[]> {
    try {
      const comic_categories = await ComicCategoryEntity.createQueryBuilder('comic_category')
        .select(['comic_category.name', 'comic_category.slug'])
        .getMany();
      return comic_categories;
    } catch (error) {
      logger.error(`🚀 Lỗi khi lấy comic categories từ db`);
    }
  }
}
