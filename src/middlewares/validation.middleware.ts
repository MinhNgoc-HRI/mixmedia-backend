import { plainToInstance } from 'class-transformer';
import { validateOrReject, ValidationError } from 'class-validator';
import { NextFunction, Request, Response } from 'express';

/**
 * @name ValidationMiddleware
 * @description Middleware dùng để validate dữ liệu từ request (body, params, query)
 * @param type DTO được sử dụng để validate
 * @param source 'body' | 'params' | 'query' | 'headers'
 * @param skipMissingProperties Khi bỏ qua các trường bị thiếu
 * @param whitelist Cho phép loại bỏ các thuộc tính không nằm trong DTO
 * @param forbidNonWhitelisted Ném ra lỗi nếu có thuộc tính không nằm trong whitelist
 */
export const ValidationMiddleware = (
  type: any,
  source: 'body' | 'params' | 'query' | 'headers' = 'body',
  skipMissingProperties = false,
  whitelist = false,
  forbidNonWhitelisted = false,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Chọn source cần validate
    const dataToValidate = req[source];
    const dto = plainToInstance(type, dataToValidate);
    validateOrReject(dto, { skipMissingProperties, whitelist, forbidNonWhitelisted })
      .then(() => {
        // Cập nhật dữ liệu đã validate lại vào request
        req[source] = dto;
        next();
      })
      .catch((errors: ValidationError[]) => {
        const errorMessages = errors.map((error: ValidationError) => ({
          property: error.property,
          constraints: error.constraints,
        }));

        // Trả về lỗi JSON với thông báo chi tiết
        res.status(400).json({
          status: false,
          message: 'Invalid request data',
          errors: errorMessages,
        });
      });
  };
};
