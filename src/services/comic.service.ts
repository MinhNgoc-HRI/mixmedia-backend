import { Comic } from '@interfaces/comic.interface';
import { ComicEntity } from '@entities/comic.entity';
import { Repository, EntityRepository } from 'typeorm';
import { Chapter } from '@interfaces/chapter.interface';
import { ComicCategoryEntity } from '@entities/comic_category.entity';
import { ChapterEntity } from '@entities/chapter.entity';
import { logger } from '@utils/logger';
import axios from 'axios';
import { APP_DOMAIN_CDN_IMAGE, CRAWL_ENDPOINT_COMIC } from '@config';
import { Service } from 'typedi';
import { MovieEntity } from '@entities/movie.entity';
import https from 'https';
import pLimit from '@esm2cjs/p-limit';

const limit = pLimit(10);
@Service()
@EntityRepository()
export class ComicService extends Repository<ComicEntity> {
  public async insertComic(comicData: Comic, chapterData: Chapter[]): Promise<Comic> {
    const comicRepo = ComicEntity.getRepository();
    const comicCategoryRepo = ComicCategoryEntity.getRepository();
    const chapterRepo = ChapterEntity.getRepository();

    let comic = await comicRepo.findOne({ where: { slug: comicData.slug } });

    if (!comic) {
      comic = new ComicEntity();
    }

    // Đặt các thuộc tính cho comic
    comic.author = comicData?.author || [''];
    comic.name = comicData?.name || '';
    comic.slug = comicData?.slug || '';
    comic.origin_name = comicData?.origin_name || [''];
    comic.content = comicData?.content || '';
    comic.status = comicData?.status || '';
    comic.thumb_url = comicData?.thumb_url || '';
    comic.sub_docquyen = comicData?.sub_docquyen || false;
    comic.updatedAt = comicData?.updatedAt || null;
    comic.created = comicData?.created || null;

    // Xử lý danh mục
    const comicCategories = await Promise.all(
      (comicData?.category || []).map(async (cat: any) => {
        let cate = await comicCategoryRepo.findOne({ where: { slug: cat?.slug } });
        if (!cate) {
          cate = new ComicCategoryEntity();
          cate.name = cat?.name;
          cate.slug = cat?.slug;
          // Lưu danh mục mới
          await comicCategoryRepo.save(cate);
        }
        return cate;
      }),
    );
    comic.category = comicCategories;

    // Lưu comic
    await comicRepo.save(comic);

    // Lưu các chapter
    const chaptersData = chapterData || [];
    await Promise.all(
      chaptersData.map(async (chapterData: any) => {
        let chapter = await chapterRepo.findOne({
          where: { server_name: chapterData?.server_name, comic: comic._id },
        });

        if (!chapter) {
          chapter = new ChapterEntity();
          chapter.comic = comic;
          chapter.server_name = chapterData?.server_name;
        }
        chapter.server_data = chapterData?.server_data || '';

        // Lưu chapter
        await chapterRepo.save(chapter);
        logger.info(`Đã lưu chapter ${chapter?.server_name} cho comic ${comic?.name}`);
      }),
    );

    return comic;
  }

  public async fetchAndSaveComic(slug: string): Promise<void> {
    if (!slug) {
      logger.warn(`Không có slug để gọi API.`);
      return;
    }

    try {
      const response = await axios.get(`${CRAWL_ENDPOINT_COMIC}/v1/api/truyen-tranh/${slug}`, {
        timeout: 30000,
      });

      if (response.data?.status === 'success' && response.data?.data?.item) {
        const comic = response.data?.data?.item;
        const chapters = comic.chapters || [];

        const updatedChapters = await Promise.all(
          chapters.map(async chapter => {
            if (chapter.server_data) {
              try {
                const updatedServerData = await Promise.all(
                  chapter.server_data.map(server =>
                    limit(async () => {
                      const chapterApiUrl = server.chapter_api_data;

                      if (chapterApiUrl) {
                        try {
                          const chapterResponse = await axios.get(`${chapterApiUrl}`, {
                            timeout: 30000,
                            httpsAgent: new https.Agent({
                              rejectUnauthorized: false,
                            }),
                          });

                          if (chapterResponse.data?.status === 'success' && chapterResponse.data?.data) {
                            const chapterData = chapterResponse.data.data;
                            return {
                              ...server,
                              chapter_path: `${chapterData.domain_cdn}/${chapterData.item.chapter_path}`,
                              chapter_image: chapterData.item.chapter_image,
                            };
                          } else {
                            logger.warn(`Không có dữ liệu cho chapter ${server.chapter_name}.`);
                          }
                        } catch (chapterError) {
                          logger.error(`Lỗi khi gọi API cho chapter ${server.chapter_name}: ${chapterError.message}`);
                        }
                      }

                      return server;
                    }),
                  ),
                );

                chapter.server_data = updatedServerData;
              } catch (chapterError) {
                logger.error(`Lỗi khi xử lý chapter ${chapter.name}: ${chapterError.message}`);
              }
            }

            return chapter;
          }),
        );

        await this.insertComic(comic, updatedChapters);
        logger.info(`Đã lưu thành công comic ${comic.name} vào cơ sở dữ liệu.`);
      } else {
        logger.info('Không có dữ liệu comic để lưu.');
      }
    } catch (error) {
      logger.error(`Lỗi khi gọi API cho comic ${slug}: ${error.message}`);
    }
  }
  public async fetchComics(page: number): Promise<{ comics: Comic[]; pagination: { currentPage: number; totalPages: number } } | null> {
    try {
      const response = await axios.get(`${CRAWL_ENDPOINT_COMIC}/v1/api/danh-sach/truyen-moi?page=${page}`, {
        timeout: 30000,
      });
      const comics = response?.data?.data?.items;
      const params = response?.data?.data?.params;
      const pagination = {
        currentPage: params?.pagination?.currentPage,
        totalPages: Number(params?.pagination?.totalItems || 0) / Number(params?.pagination?.totalItemsPerPage || 1),
      };
      if (comics && Array.isArray(comics)) {
        const promises = comics?.map(comic => this.fetchAndSaveComic(comic?.slug));

        // Chờ tất cả các promise hoàn thành
        await Promise.all(promises);
        logger.info(`Đã lưu thành công ${comics.length} comic vào cơ sở dữ liệu.`);
        return { comics, pagination };
      }
    } catch (error) {
      logger.error('Lỗi khi gọi API để lấy danh sách comic:', error);
      return null;
    }
  }

  public async getComics(
    page: number,
    total: number,
  ): Promise<{
    data: Comic[];
    total_items: number;
    current_page: number;
    total_pages: number;
    APP_DOMAIN_CDN_IMAGE: string;
  }> {
    // Xác định page và total mặc định
    const pageNum = page > 0 ? page : 1;
    const totalItemsPerPage = total > 0 ? total : 20; // Mặc định 20 item nếu không chỉ định
    const totalItems = await ComicEntity.createQueryBuilder('comic').getCount(); // Đếm tổng số lượng comic trong database
    // Tính tổng số trang
    const totalPages = Math.ceil(totalItems / totalItemsPerPage);
    const comics = await ComicEntity.createQueryBuilder('comic')
      .leftJoinAndSelect('comic.category', 'comic_category') // Join với bảng comic_category
      .addSelect('comic_category.id', 'category_id') // Sửa alias ở đây
      .take(totalItemsPerPage) // Số lượng comic trên mỗi trang
      .skip((pageNum - 1) * totalItemsPerPage) // Bỏ qua số lượng bản ghi của các trang trước
      .getMany(); // Lấy danh sách comic

    return {
      data: comics,
      total_items: totalItems,
      current_page: pageNum,
      total_pages: totalPages,
      APP_DOMAIN_CDN_IMAGE: APP_DOMAIN_CDN_IMAGE,
    };
  }

  // Lấy comic theo slug
  public async getComicBySlug(slug: string): Promise<{ data: Comic; APP_DOMAIN_CDN_IMAGE: string }> {
    const comic = await ComicEntity.createQueryBuilder('comic')
      .leftJoinAndSelect('comic.category', 'comic_category') // Join với bảng comic_category
      .leftJoinAndSelect('comic.chapters', 'chapters') // Join với bảng chapters
      .addSelect('comic_category.id', 'category_id') // Sửa alias ở đây
      .where('comic.slug = :slug', { slug })
      .getOne();

    return {
      data: comic,
      APP_DOMAIN_CDN_IMAGE: APP_DOMAIN_CDN_IMAGE,
    };
  }

  // Lấy danh sách comic theo query
  public async getComicsByQuery(
    page: number,
    total: number,
    category?: string[],
    slug?: string,
    asc = true,
  ): Promise<{
    data: Comic[];
    total_items: number;
    current_page: number;
    total_pages: number;
    APP_DOMAIN_CDN_IMAGE: string;
  }> {
    try {
      // Khởi tạo query builder cho thực thể Comic
      const queryBuilder = await ComicEntity.createQueryBuilder('comic')
        .leftJoinAndSelect('comic.category', 'comic_category') // Join với bảng comic_category
        .addSelect('comic_category.id', 'category_id'); // Join với bảng chapters

      // Thêm điều kiện lọc theo slug (nếu có)
      if (slug) {
        queryBuilder.andWhere('comic.name LIKE :slug', { slug: `%${slug}%` });
      }

      // Thêm điều kiện lọc theo slug của category (nếu có)
      if (category && category.length > 0) {
        queryBuilder.andWhere('comic_category.slug IN (:...category)', { category });
      }

      // Sắp xếp theo updatedAt
      if (asc) {
        queryBuilder.orderBy('comic.updatedAt', 'ASC'); // Sắp xếp theo updatedAt tăng dần
      } else {
        queryBuilder.orderBy('comic.updatedAt', 'DESC'); // Sắp xếp theo updatedAt giảm dần
      }

      // Đếm tổng số bản ghi để tính tổng trang
      const total_items = await queryBuilder.getCount();

      // Áp dụng phân trang (page và total)
      const data = await queryBuilder
        .skip((page - 1) * total) // Bỏ qua các bản ghi không thuộc trang hiện tại
        .take(total) // Giới hạn số bản ghi trả về
        .getMany(); // Thực hiện query và lấy kết quả

      // Tính tổng số trang
      const total_pages = Math.ceil(total_items / total);

      // Trả về dữ liệu
      return {
        data,
        total_items,
        current_page: page,
        total_pages,
        APP_DOMAIN_CDN_IMAGE: APP_DOMAIN_CDN_IMAGE,
      };
    } catch (error) {
      throw new Error('Lỗi khi truy vấn danh sách comic');
    }
  }
}
