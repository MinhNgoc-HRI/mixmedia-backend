import { CategoryEntity } from '@/entities/category.entity';
import { CountryEntity } from '@/entities/country.entity';
import { EpisodeEntity } from '@/entities/episode.entity';
import { Movie } from '@/interfaces/movie.interface';
import { MovieEntity } from '@entities/movie.entity';
import { Service } from 'typedi';
import { EntityRepository, Repository } from 'typeorm';
import axios from 'axios';
import { CRAWL_ENDPOINT } from '@/config';
import { logger } from '@/utils/logger';
import { NODE_ENV } from '@config';
import { Episode } from '@/interfaces/episode.interface';

@Service()
@EntityRepository()
export class MovieService extends Repository<MovieEntity> {
  public async insertMovie(movieData: Movie, episodeData: Episode[]): Promise<Movie> {
    const movieRepo = MovieEntity.getRepository();
    const categoryRepo = CategoryEntity.getRepository();
    const countryRepo = CountryEntity.getRepository();
    const episodeRepo = EpisodeEntity.getRepository();

    // Tìm kiếm movie theo slug
    let movie = await movieRepo.findOne({ where: { slug: movieData.slug } });

    // Nếu movie không tồn tại, tạo mới
    if (!movie) {
      movie = new MovieEntity();
    }

    // Gán giá trị cho movie
    movie.name = movieData?.name || '';
    movie.slug = movieData?.slug || '';
    movie.origin_name = movieData?.origin_name || '';
    movie.content = movieData?.content || '';
    movie.type = movieData?.type || '';
    movie.status = movieData?.status || '';
    movie.thumb_url = movieData?.thumb_url || '';
    movie.poster_url = movieData?.poster_url || '';
    movie.is_copyright = movieData?.is_copyright || false;
    movie.trailer_url = movieData?.trailer_url || '';
    movie.time = movieData?.time || '';
    movie.episode_current = movieData?.episode_current || '';
    movie.episode_total = movieData?.episode_total || '';
    movie.quality = movieData?.quality || '';
    movie.lang = movieData?.lang || '';
    movie.notify = movieData?.notify || '';
    movie.showtimes = movieData?.showtimes || '';
    movie.year = movieData?.year || 0;
    movie.view = movieData?.view || 0;
    movie.actor = movieData?.actor || [];
    movie.director = movieData?.director || [];
    movie.chieurap = movieData?.chieurap || false;
    movie.sub_docquyen = movieData?.sub_docquyen || false;

    // Xử lý danh mục (category)
    const categories = await Promise.all(
      (movieData?.category || []).map(async (cat: any) => {
        let category = await categoryRepo.findOne({ where: { slug: cat.slug } });
        if (!category) {
          category = new CategoryEntity();
          category.name = cat.name;
          category.slug = cat.slug;
          await categoryRepo.save(category);
        }
        return category;
      }),
    );
    movie.category = categories;

    // Xử lý quốc gia (country)
    const countries = await Promise.all(
      (movieData?.country || []).map(async (country: any) => {
        let countryEntity = await countryRepo.findOne({ where: { slug: country.slug } });
        if (!countryEntity) {
          countryEntity = new CountryEntity();
          countryEntity.name = country.name;
          countryEntity.slug = country.slug;
          await countryRepo.save(countryEntity);
        }
        return countryEntity;
      }),
    );
    movie.country = countries;
    // Lưu thông tin movie
    await movieRepo.save(movie);

    // Xử lý tập phim (episodes)
    const episodesData = episodeData || [];
    await Promise.all(
      episodesData.map(async (episodeData: any) => {
        // Kiểm tra xem episode đã tồn tại dựa vào server_name
        let episode = await episodeRepo.findOne({
          where: { server_name: episodeData?.server_name, movie: movie._id },
        });

        // Nếu episode không tồn tại, tạo mới
        if (!episode) {
          episode = new EpisodeEntity();
          episode.movie = movie; // Gán movie cho episode
          episode.server_name = episodeData?.server_name || '';
        }
        // Cập nhật hoặc thiết lập giá trị cho episode
        episode.server_data = episodeData?.server_data || '';

        // Lưu episode (có thể là update hoặc insert)
        await episodeRepo.save(episode);
      }),
    );
    return movie;
  }

  public async fetchAndSaveMovie(slug: string): Promise<void> {
    if (!slug) {
      logger.warn(`Không có slug để gọi API.`);
      return; // Không có slug, không thực hiện gì cả
    }

    try {
      const response = await axios.get(`${CRAWL_ENDPOINT}/phim/${slug}`, {
        timeout: 10000,
      });
      if (response.data?.status === true && response.data?.movie) {
        const movie = response.data.movie;
        const episode = response.data.episodes;
        const rs = await this.insertMovie(movie, episode);
        logger.info(`=================================`);
        logger.info(`======= ENV: ${NODE_ENV} =======`);
        logger.info(`🚀 Đã lưu thành công phim ${rs.name} vào cơ sở dữ liệu.`);
        logger.info(`=================================`);
      } else {
        logger.info(`=================================`);
        logger.info(`======= ENV: ${NODE_ENV} =======`);
        logger.info('🚀 Không có dữ liệu phim để lưu.');
        logger.info(`=================================`);
      }
    } catch (error) {
      logger.error(`=================================`);
      logger.error(`======= ENV: ${NODE_ENV} =======`);
      logger.error(`🚀 Lỗi khi gọi API hoặc lưu dữ liệu phim:`, error);
      logger.error(`=================================`);
    }
  }

  public async fetchMovies(page: number): Promise<{ movies: Movie[]; pagination: { currentPage: number; totalPages: number } } | null> {
    try {
      const response = await axios.get(`${CRAWL_ENDPOINT}/danh-sach/phim-moi-cap-nhat?page=${page}`, {
        timeout: 10000,
      });

      // Lấy danh sách phim từ response
      const movies = response?.data?.items; // Giả định response.data chứa danh sách phim
      const pagination = {
        currentPage: response?.data?.pagination?.currentPage || 1,
        totalPages: response?.data?.pagination?.totalPages || 1,
      };
      // Kiểm tra xem có phim nào không
      if (movies && Array.isArray(movies)) {
        // Tạo mảng các promise
        const promises = movies?.map(movie => this.fetchAndSaveMovie(movie?.slug));

        // Chờ tất cả các promise hoàn thành
        await Promise.all(promises);

        logger.info(`Đã lưu thành công ${movies.length} phim vào cơ sở dữ liệu.`);
        return { movies, pagination };
      } else {
        logger.info('Không có phim nào để lưu.');
        return null;
      }
    } catch (error) {
      logger.error('Lỗi khi gọi API để lấy danh sách phim:', error);
      return null;
    }
  }

  public async getMovies(
    page: number,
    total: number,
  ): Promise<{
    data: Movie[];
    total_items: number;
    current_page: number;
    total_pages: number;
  }> {
    // Xác định page và total mặc định
    const pageNum = page > 0 ? page : 1;
    const totalItemsPerPage = total > 0 ? total : 20; // Mặc định 20 item nếu không chỉ định

    // Lấy tổng số lượng phim
    const totalItems = await MovieEntity.createQueryBuilder('movie').getCount(); // Đếm tổng số lượng phim trong database

    // Tính tổng số trang
    const totalPages = Math.ceil(totalItems / totalItemsPerPage);

    // Lấy dữ liệu phim theo page và limit
    const movies = await MovieEntity.createQueryBuilder('movie')
      .leftJoinAndSelect('movie.country', 'country') // Join với bảng country
      .leftJoinAndSelect('movie.category', 'category') // Join với bảng category
      .leftJoinAndSelect('movie.episodes', 'episodes') // Join với bảng episodes
      .addSelect('category.id', 'id')
      .addSelect('country.id', 'id')
      .addSelect('episodes.id', 'id')
      .take(totalItemsPerPage) // Số lượng phim trên mỗi trang
      .skip((pageNum - 1) * totalItemsPerPage) // Bỏ qua số lượng bản ghi của các trang trước
      .getMany(); // Lấy danh sách phim
    return {
      data: movies,
      total_items: totalItems,
      current_page: pageNum,
      total_pages: totalPages,
    };
  }

  public async getMovieBySlug(slug: string): Promise<{ data: Movie }> {
    const movie = await MovieEntity.createQueryBuilder('movie')
      .leftJoinAndSelect('movie.country', 'country') // Join với bảng country
      .leftJoinAndSelect('movie.category', 'category') // Join với bảng category
      .leftJoinAndSelect('movie.episodes', 'episodes') // Join với bảng episodes
      .addSelect('category.id', 'id')
      .addSelect('country.id', 'id')
      .addSelect('episodes.id', 'id')
      .where('movie.slug=:slug', { slug })
      .getOne();
    return {
      data: movie,
    };
  }
}
