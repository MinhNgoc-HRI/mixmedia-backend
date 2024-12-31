import { CountryService } from '@services/country.service';
import { logger } from '@utils/logger';
import Container, { Service } from 'typedi';
import cron from 'node-cron';
import { CategoryService } from '@services/category.service';
import { MovieService } from '@services/movie.service';
import { ComicCategoryService } from '@services/comic_category.service';
import { ComicService } from '@services/comic.service';
import pRetry from 'async-retry';

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
    // cron.schedule('03 14 * * *', async () => {
    //   try {
    //     await this.countryService.fetchAndSaveCountries();
    //   } catch (error) {
    //     logger.error('Error fetching countries:', error);
    //   }
    // });
    // cron.schedule('22 15 * * *', async () => {
    //   try {
    //     await this.categoryService.fetchAndSaveCategories();
    //   } catch (error) {
    //     logger.error('Error fetching categories:', error);
    //   }
    // });
    cron.schedule('09 01 * * *', async () => {
      const maxRetries = 3;
      let success = false;
      // Định nghĩa hàm crawl (fetchMovies) có retry
      const fetchMoviesWithRetry = async (currentPage: number) => {
        try {
          const result = await this.movieService.fetchMovies(currentPage);
          if (result && result.pagination) {
            return result;
          } else {
            throw new Error('Không có dữ liệu phim mới.');
          }
        } catch (error) {
          throw error; // Để p-retry có thể retry lại khi gặp lỗi
        }
      };
      // Sử dụng p-retry để gọi hàm fetchMovies với retry
      try {
        logger.info('Cron job bắt đầu.');
        let currentPage = 1;
        let totalPages = 1;
        // Retry logic cho việc fetchMovies
        await pRetry(
          async () => {
            logger.info(`Lần thử fetchMovies, trang ${currentPage}`);
            do {
              const result = await fetchMoviesWithRetry(currentPage);
              if (result && result.pagination) {
                totalPages = result.pagination.totalPages; // Lấy tổng số trang
                currentPage++; // Tăng số trang lên 1
              }
            } while (currentPage <= totalPages); // Tiếp tục cho đến khi đã lấy tất cả các trang
          },
          {
            retries: maxRetries, // Số lần thử lại tối đa
            factor: 2, // Tăng gấp đôi thời gian chờ giữa các lần retry
            minTimeout: 20000, // Thời gian chờ tối thiểu giữa các lần retry
            maxTimeout: 80000, // Thời gian chờ tối đa giữa các lần retry
          },
        );
        logger.info('Cron job đã hoàn thành.');
        success = true;
      } catch (error) {
        logger.error('Cron job thất bại sau nhiều lần thử lại:', error);
      }
      if (!success) {
        logger.error('Cron job thất bại sau tất cả các lần thử lại.');
      }
    });
    // cron.schedule('55 21 * * *', async () => {
    //   try {
    //     await this.comicCategoryService.fetchAndSaveComicCategories();
    //   } catch (error) {
    //     logger.error('Error fetching comic categories:', error);
    //   }
    // });
    // cron.schedule('18 16 * * *', async () => {
    //   try {
    //     let currentPage = 1;
    //     let totalPages = 1;
    //     do {
    //       // Gọi hàm fetchComics để lấy danh sách phim
    //       const result = await this.comicService.fetchComics(currentPage);
    //       if (result && result.pagination) {
    //         totalPages = result.pagination.totalPages; // Lấy tổng số trang
    //         currentPage++; // Tăng số trang lên 1
    //       } else {
    //         logger.info('Không có dữ liệu comic mới.');
    //         break; // Thoát vòng lặp nếu không có dữ liệu
    //       }
    //     } while (currentPage <= totalPages); // Tiếp tục cho đến khi đã lấy tất cả các trang
    //     logger.info('Cron job đã hoàn thành.');
    //   } catch (error) {
    //     logger.error('Lỗi khi thực thi cron job:', error);
    //   }
    // });
  }
}
