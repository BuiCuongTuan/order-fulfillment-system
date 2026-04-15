import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

class OrderItemDto {
  @ApiProperty()
  productId: number;
  @ApiProperty()
  quantity: number;
}

class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  items: OrderItemDto[];
}

class ApproveOrderDto {
  @ApiProperty()
  warehouseId: number;
  @ApiProperty({ required: false })
  comment?: string;
}

interface RequestWithUser {
  user: { sub: number; email: string; role: string };
}

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all orders' })
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'SALES')
  @ApiOperation({ summary: 'Create a new order (Draft/Pending Approval)' })
  create(@Body() createOrderDto: CreateOrderDto, @Req() req: RequestWithUser) {
    const userId = req.user.sub;
    return this.ordersService.create(userId, createOrderDto.items);
  }

  @Patch(':id/approve')
  @Roles('ADMIN', 'WAREHOUSE_MANAGER')
  @ApiOperation({
    summary: 'Approve an order and fulfill from a specific warehouse',
  })
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Body() approveDto: ApproveOrderDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.sub;
    return this.ordersService.approveOrder(
      id,
      userId,
      approveDto.warehouseId,
      approveDto.comment,
    );
  }
}
