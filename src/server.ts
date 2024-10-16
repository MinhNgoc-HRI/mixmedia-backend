import { App } from '@/app';
import { ValidateEnv } from '@utils/validateEnv';
import { AuthRoute } from '@routes/auth.route';
import { UserRoute } from '@routes/users.route';
import { MovieRoute } from '@routes/movies.route';
import { CategoryRoute } from '@routes/category.route';
import { CountryRoute } from '@routes/country.route';
import { ComicCategoryRoute } from '@routes/comic_category.route';
import { ComicRoute } from '@routes/comic.route';

ValidateEnv();

const app = new App([
  new AuthRoute(),
  new UserRoute(),
  new MovieRoute(),
  new CategoryRoute(),
  new CountryRoute(),
  new ComicRoute(),
  new ComicCategoryRoute(),
]);

app.listen();
