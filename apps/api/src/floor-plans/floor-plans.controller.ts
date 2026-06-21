import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import {
  GetLayoutVersionUseCase,
  ListLayoutVersionsUseCase,
} from './application/layout-version.use-case';
import { DetectTablesUseCase } from './application/detect-tables.use-case';
import { GetDraftTableSeatTopologyUseCase } from './application/get-seat-topology.use-case';
import { GetLayoutDraftUseCase } from './application/get-layout-draft.use-case';
import {
  AddDraftTableUseCase,
  ConfirmLayoutDraftUseCase,
  GetConfirmedLayoutUseCase,
  RemoveDraftTableUseCase,
  UpdateDraftTableUseCase,
} from './application/manage-layout-draft.use-case';
import { ConfirmLayoutDraftDto } from './dto/confirm-layout-draft.dto';
import { ConfirmedLayoutResponseDto } from './dto/confirmed-layout-response.dto';
import { LayoutVersionListResponseDto } from './dto/layout-version-summary.dto';
import { DetectTablesResponseDto } from './dto/detect-tables-response.dto';
import { LayoutDraftResponseDto } from './dto/layout-draft-response.dto';
import { UpsertDraftTableDto } from './dto/upsert-draft-table.dto';
import { FloorPlansService } from './floor-plans.service';
import { UploadFloorPlanResponseDto } from './dto/upload-floor-plan-response.dto';
import { TableSeatTopologyDto } from './dto/table-seat-topology.dto';

@ApiTags('floor-plans')
@Controller('events/:eventId/floor-plans')
export class FloorPlansController {
  constructor(
    private readonly floorPlansService: FloorPlansService,
    private readonly detectTablesUseCase: DetectTablesUseCase,
    private readonly getLayoutDraftUseCase: GetLayoutDraftUseCase,
    private readonly addDraftTableUseCase: AddDraftTableUseCase,
    private readonly updateDraftTableUseCase: UpdateDraftTableUseCase,
    private readonly removeDraftTableUseCase: RemoveDraftTableUseCase,
    private readonly confirmLayoutDraftUseCase: ConfirmLayoutDraftUseCase,
    private readonly getConfirmedLayoutUseCase: GetConfirmedLayoutUseCase,
    private readonly listLayoutVersionsUseCase: ListLayoutVersionsUseCase,
    private readonly getLayoutVersionUseCase: GetLayoutVersionUseCase,
    private readonly getDraftTableSeatTopologyUseCase: GetDraftTableSeatTopologyUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Subir plano del salon (JPG, PNG o PDF)',
  })
  @ApiParam({ name: 'eventId', example: 'evt_123' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiCreatedResponse({ type: UploadFloorPlanResponseDto })
  @ApiBadRequestResponse({
    description:
      'Archivo invalido, formato no soportado o tamano excedido. Permite reintento inmediato.',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  upload(
    @Param('eventId') eventId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<UploadFloorPlanResponseDto> {
    return this.floorPlansService.upload(eventId, file);
  }

  @Post(':floorPlanId/detect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Detectar mesas candidatas en un plano subido',
  })
  @ApiParam({ name: 'eventId', example: 'evt_123' })
  @ApiParam({
    name: 'floorPlanId',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({ type: DetectTablesResponseDto })
  @ApiNotFoundResponse({
    description: 'Plano no encontrado para el evento indicado.',
  })
  detect(
    @Param('eventId') eventId: string,
    @Param('floorPlanId') floorPlanId: string,
  ): Promise<DetectTablesResponseDto> {
    return this.detectTablesUseCase.execute(eventId, floorPlanId);
  }

  @Get(':floorPlanId/draft')
  @ApiOperation({
    summary: 'Obtener borrador editable de mesas',
  })
  @ApiOkResponse({ type: LayoutDraftResponseDto })
  @ApiNotFoundResponse({ description: 'Plano no encontrado.' })
  getDraft(
    @Param('eventId') eventId: string,
    @Param('floorPlanId') floorPlanId: string,
  ): Promise<LayoutDraftResponseDto> {
    return this.getLayoutDraftUseCase.execute(eventId, floorPlanId);
  }

  @Post(':floorPlanId/draft/tables')
  @ApiOperation({ summary: 'Anadir mesa al borrador' })
  @ApiCreatedResponse({ type: LayoutDraftResponseDto })
  @ApiConflictResponse({ description: 'Layout ya confirmado.' })
  addDraftTable(
    @Param('eventId') eventId: string,
    @Param('floorPlanId') floorPlanId: string,
    @Body() body: UpsertDraftTableDto,
  ): Promise<LayoutDraftResponseDto> {
    return this.addDraftTableUseCase.execute(eventId, floorPlanId, body);
  }

  @Put(':floorPlanId/draft/tables/:tableId')
  @ApiOperation({ summary: 'Editar mesa del borrador' })
  @ApiOkResponse({ type: LayoutDraftResponseDto })
  @ApiNotFoundResponse({ description: 'Mesa o plano no encontrado.' })
  @ApiConflictResponse({ description: 'Layout ya confirmado.' })
  updateDraftTable(
    @Param('eventId') eventId: string,
    @Param('floorPlanId') floorPlanId: string,
    @Param('tableId') tableId: string,
    @Body() body: UpsertDraftTableDto,
  ): Promise<LayoutDraftResponseDto> {
    return this.updateDraftTableUseCase.execute(
      eventId,
      floorPlanId,
      tableId,
      body,
    );
  }

  @Get(':floorPlanId/draft/tables/:tableId/seat-topology')
  @ApiOperation({
    summary: 'Topologia de asientos de una mesa del borrador (recalcula al cambiar forma/capacidad)',
  })
  @ApiOkResponse({ type: TableSeatTopologyDto })
  @ApiNotFoundResponse({ description: 'Mesa o plano no encontrado.' })
  getDraftTableSeatTopology(
    @Param('eventId') eventId: string,
    @Param('floorPlanId') floorPlanId: string,
    @Param('tableId') tableId: string,
  ): Promise<TableSeatTopologyDto> {
    return this.getDraftTableSeatTopologyUseCase.execute(
      eventId,
      floorPlanId,
      tableId,
    );
  }

  @Delete(':floorPlanId/draft/tables/:tableId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar mesa del borrador' })
  @ApiNoContentResponse({ description: 'Mesa eliminada del borrador.' })
  @ApiNotFoundResponse({ description: 'Mesa o plano no encontrado.' })
  @ApiConflictResponse({ description: 'Layout ya confirmado.' })
  async removeDraftTable(
    @Param('eventId') eventId: string,
    @Param('floorPlanId') floorPlanId: string,
    @Param('tableId') tableId: string,
  ): Promise<void> {
    await this.removeDraftTableUseCase.execute(eventId, floorPlanId, tableId);
  }

  @Post(':floorPlanId/draft/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirmar explicitamente la configuracion final de mesas',
  })
  @ApiOkResponse({ type: ConfirmedLayoutResponseDto })
  @ApiBadRequestResponse({
    description: 'Confirmacion explicita requerida o borrador vacio.',
  })
  @ApiConflictResponse({ description: 'Layout ya confirmado.' })
  confirmDraft(
    @Param('eventId') eventId: string,
    @Param('floorPlanId') floorPlanId: string,
    @Body() body: ConfirmLayoutDraftDto,
  ): Promise<ConfirmedLayoutResponseDto> {
    return this.confirmLayoutDraftUseCase.execute(
      eventId,
      floorPlanId,
      body.confirmed,
    );
  }

  @Get(':floorPlanId/confirmed')
  @ApiOperation({ summary: 'Consultar configuracion confirmada' })
  @ApiOkResponse({ type: ConfirmedLayoutResponseDto })
  @ApiNotFoundResponse({ description: 'Plano o configuracion no encontrados.' })
  getConfirmed(
    @Param('eventId') eventId: string,
    @Param('floorPlanId') floorPlanId: string,
  ): Promise<ConfirmedLayoutResponseDto> {
    return this.getConfirmedLayoutUseCase.execute(eventId, floorPlanId);
  }

  @Get(':floorPlanId/layout-versions')
  @ApiOperation({ summary: 'Listar versiones persistidas del layout' })
  @ApiOkResponse({ type: LayoutVersionListResponseDto })
  async listLayoutVersions(
    @Param('eventId') eventId: string,
    @Param('floorPlanId') floorPlanId: string,
  ): Promise<LayoutVersionListResponseDto> {
    const versions = await this.listLayoutVersionsUseCase.execute(
      eventId,
      floorPlanId,
    );

    return {
      floorPlanId,
      eventId,
      latestVersion: versions.at(-1)?.version ?? 0,
      versions,
    };
  }

  @Get(':floorPlanId/layout-versions/:version')
  @ApiOperation({ summary: 'Consultar una version persistida del layout' })
  @ApiOkResponse({ type: ConfirmedLayoutResponseDto })
  @ApiNotFoundResponse({ description: 'Version no encontrada.' })
  getLayoutVersion(
    @Param('eventId') eventId: string,
    @Param('floorPlanId') floorPlanId: string,
    @Param('version') version: string,
  ): Promise<ConfirmedLayoutResponseDto> {
    return this.getLayoutVersionUseCase.execute(
      eventId,
      floorPlanId,
      Number.parseInt(version, 10),
    );
  }
}
