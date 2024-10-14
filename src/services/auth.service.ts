import { compare, hash } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { Service } from 'typedi';
import { EntityRepository, Repository } from 'typeorm';
import { SECRET_KEY } from '@config';
import { UserEntity } from '@entities/users.entity';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, TokenData } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';

const createRefreshToken = (user: User): string => {
  const dataStoredInToken: DataStoredInToken = { id: user.id };
  const secretKey: string = SECRET_KEY;
  const expiresIn: number = 60 * 60 * 24 * 7; // 1 tuần

  return sign(dataStoredInToken, secretKey, { expiresIn });
};

const createToken = (user: User): TokenData => {
  const dataStoredInToken: DataStoredInToken = { id: user.id };
  const secretKey: string = SECRET_KEY;
  const accessTokenExpiresIn: number = 60 * 60; // 1 giờ
  const refreshToken = createRefreshToken(user);

  return {
    expiresIn: accessTokenExpiresIn,
    token: sign(dataStoredInToken, secretKey, { expiresIn: accessTokenExpiresIn }),
    refreshToken,
  };
};

const createCookie = (tokenData: TokenData): string => {
  return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
};

@Service()
@EntityRepository()
export class AuthService extends Repository<UserEntity> {
  public async signup(userData: User): Promise<User> {
    const findUser: User = await UserEntity.findOne({ where: { email: userData.email } });
    if (findUser) throw new HttpException(409, `This email ${userData.email} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    const createUserData: User = await UserEntity.create({ ...userData, password: hashedPassword }).save();
    return createUserData;
  }

  public async login(userData: User): Promise<{ cookie: string; findUser: User; refreshToken: string }> {
    const findUser: User = await UserEntity.findOne({ where: { email: userData.email } });
    if (!findUser) throw new HttpException(409, `This email ${userData.email} was not found`);

    const isPasswordMatching: boolean = await compare(userData.password, findUser.password);
    if (!isPasswordMatching) throw new HttpException(409, 'Password not matching');

    const tokenData = createToken(findUser);
    const cookie = createCookie(tokenData);

    return { cookie, findUser, refreshToken: tokenData.refreshToken }; // Trả về refresh token
  }

  public async logout(userData: User): Promise<User> {
    const findUser: User = await UserEntity.findOne({ where: { email: userData.email, password: userData.password } });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    return findUser;
  }

  public async refreshToken(oldRefreshToken: string): Promise<{ token: string; refreshToken: string }> {
    try {
      const decoded = verify(oldRefreshToken, SECRET_KEY) as DataStoredInToken; // Xác thực refresh token
      const userId = decoded.id;

      const findUser: User = await UserEntity.findOne({ where: { id: userId } });
      if (!findUser) throw new HttpException(409, "User doesn't exist");

      const tokenData = createToken(findUser); // Tạo lại token mới
      return { token: tokenData.token, refreshToken: tokenData.refreshToken }; // Trả về token mới và refresh token mới
    } catch (error) {
      throw new HttpException(401, 'Invalid refresh token');
    }
  }
}
