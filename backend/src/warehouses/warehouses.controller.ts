import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { WarehousesService } from './warehouses.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('warehouses')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all warehouses' })
  findAll() {
    return this.warehousesService.findAll();
  }

  @Post()
  @Roles('ADMIN', 'WAREHOUSE_MANAGER')
  @ApiOperation({ summary: 'Create a warehouse (Admin/WarehouseManager only)' })
  create(@Body() createDto: { code: string; name: string; location?: string }) {
    return this.warehousesService.create(createDto);
  }
}
