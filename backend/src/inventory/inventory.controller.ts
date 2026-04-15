import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  ParseIntPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

class AdjustStockDto {
  @ApiProperty()
  warehouseId: number;
  @ApiProperty()
  productId: number;
  @ApiProperty({ description: 'Positive number to add, negative to deduct' })
  quantityChange: number;
}

@ApiTags('inventory')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get total overview of inventory' })
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get('warehouse/:warehouseId')
  @ApiOperation({ summary: 'Get inventory by warehouse' })
  findByWarehouse(@Param('warehouseId', ParseIntPipe) warehouseId: number) {
    return this.inventoryService.findByWarehouse(warehouseId);
  }

  @Post('adjust')
  @Roles('ADMIN', 'WAREHOUSE_MANAGER')
  @ApiOperation({
    summary: 'Manually adjust stock for a product in a warehouse',
  })
  async adjustStock(@Body() adjustStockDto: AdjustStockDto) {
    try {
      return await this.inventoryService.adjustStock(
        adjustStockDto.warehouseId,
        adjustStockDto.productId,
        adjustStockDto.quantityChange,
      );
    } catch (e: unknown) {
      if (e instanceof Error) {
        throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('Unknown error', HttpStatus.BAD_REQUEST);
    }
  }
}
