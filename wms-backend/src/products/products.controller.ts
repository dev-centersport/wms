import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './product.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(): Promise<Product[]> {
    try {
      return await this.productsService.findAll();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch products',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Product> {
    try {
      const product = await this.productsService.findOne(+id);
      if (!product) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }
      return product;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch product',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    try {
      return await this.productsService.create(createProductDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create product',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
