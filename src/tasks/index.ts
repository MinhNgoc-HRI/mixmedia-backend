import { CountryService } from '@services/country.service';
import { logger } from '@utils/logger';
import Container, { Service } from 'typedi';
import cron from 'node-cron';
import { CategoryService } from '@services/category.service';
import { MovieService } from '@services/movie.service';
import { ComicCategoryService } from '@services/comic_category.service';
import { ComicService } from '@services/comic.service';

@Service()
export class CronJobService {
  private countryService: CountryService;
  private categoryService: CategoryService;
  private movieService: MovieService;
  private comicCategoryService: ComicCategoryService;
  private comicService: ComicService;
  constructor() {
    this.countryService = Container.get(CountryService);
    this.categoryService = Container.get(CategoryService);
    this.movieService = Container.get(MovieService);
    this.comicCategoryService = Container.get(ComicCategoryService);
    this.comicService = Container.get(ComicService);
    this.initializeCronJobs();
  }

  private initializeCronJobs() {
    cron.schedule('22 15 * * *', async () => {
      try {
        await this.countryService.fetchAndSaveCountries();
      } catch (error) {
        logger.error('Error fetching countries:', error);
      }
    });
    cron.schedule('22 15 * * *', async () => {
      try {
        await this.categoryService.fetchAndSaveCategories();
      } catch (error) {
        logger.error('Error fetching categories:', error);
      }
    });

    cron.schedule('54 13 * * *', async () => {
      try {
        let currentPage = 1;
        let totalPages = 1;

        do {
          // Gọi hàm fetchMovies để lấy danh sách phim
          const result = await this.movieService.fetchMovies(currentPage);

          if (result && result.pagination) {
            totalPages = result.pagination.totalPages; // Lấy tổng số trang
            currentPage++; // Tăng số trang lên 1
          } else {
            logger.info('Không có dữ liệu phim mới.');
            break; // Thoát vòng lặp nếu không có dữ liệu
          }
        } while (currentPage <= totalPages); // Tiếp tục cho đến khi đã lấy tất cả các trang

        logger.info('Cron job đã hoàn thành.');
      } catch (error) {
        logger.error('Lỗi khi thực thi cron job:', error);
      }
    });

    cron.schedule('55 21 * * *', async () => {
      try {
        await this.comicCategoryService.fetchAndSaveComicCategories();
      } catch (error) {
        logger.error('Error fetching comic categories:', error);
      }
    });

    cron.schedule('09 14 * * *', async () => {
      try {
        let currentPage = 1;
        let totalPages = 1;

        do {
          // Gọi hàm fetchComics để lấy danh sách phim
          const result = await this.comicService.fetchComics(currentPage);

          if (result && result.pagination) {
            totalPages = result.pagination.totalPages; // Lấy tổng số trang
            currentPage++; // Tăng số trang lên 1
          } else {
            logger.info('Không có dữ liệu comic mới.');
            break; // Thoát vòng lặp nếu không có dữ liệu
          }
        } while (currentPage <= totalPages); // Tiếp tục cho đến khi đã lấy tất cả các trang

        logger.info('Cron job đã hoàn thành.');
      } catch (error) {
        logger.error('Lỗi khi thực thi cron job:', error);
      }
    });
  }
}
