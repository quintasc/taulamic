import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { GetTableShapeCatalogUseCase } from './application/get-table-shape-catalog.use-case';
import { GetSeatTopologyPreviewUseCase } from './application/get-seat-topology.use-case';
import { TableShapeCatalogResponseDto } from './dto/table-shape-catalog.dto';
import { TableSeatTopologyDto } from './dto/table-seat-topology.dto';
import { TABLE_SHAPES } from './domain/table-shape';

@ApiTags('table-shapes')
@Controller('events/:eventId/table-shapes')
export class TableShapesController {
  constructor(
    private readonly getTableShapeCatalogUseCase: GetTableShapeCatalogUseCase,
    private readonly getSeatTopologyPreviewUseCase: GetSeatTopologyPreviewUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Catalogo configurable de formas de mesa (HU-29)',
  })
  @ApiParam({ name: 'eventId', example: 'evt_123' })
  @ApiOkResponse({ type: TableShapeCatalogResponseDto })
  getCatalog(
    @Param('eventId') eventId: string,
  ): TableShapeCatalogResponseDto {
    return this.getTableShapeCatalogUseCase.execute(eventId);
  }

  @Get(':shape/seat-topology')
  @ApiOperation({
    summary: 'Vista previa de topologia de asientos por forma y capacidad',
  })
  @ApiParam({ name: 'eventId', example: 'evt_123' })
  @ApiParam({ name: 'shape', enum: TABLE_SHAPES, example: 'redonda' })
  @ApiQuery({ name: 'capacity', example: 8, type: Number })
  @ApiOkResponse({ type: TableSeatTopologyDto })
  @ApiBadRequestResponse({
    description: 'Forma o capacidad invalida para la topologia.',
  })
  getSeatTopologyPreview(
    @Param('shape') shape: string,
    @Query('capacity', ParseIntPipe) capacity: number,
  ): TableSeatTopologyDto {
    return this.getSeatTopologyPreviewUseCase.execute(shape, capacity);
  }
}
