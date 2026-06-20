import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { DetectTablesUseCase } from './application/detect-tables.use-case';
import { DetectTablesResponseDto } from './dto/detect-tables-response.dto';
import { FloorPlansService } from './floor-plans.service';
import { UploadFloorPlanResponseDto } from './dto/upload-floor-plan-response.dto';

@ApiTags('floor-plans')
@Controller('events/:eventId/floor-plans')
export class FloorPlansController {
  constructor(
    private readonly floorPlansService: FloorPlansService,
    private readonly detectTablesUseCase: DetectTablesUseCase,
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
  @ApiParam({ name: 'floorPlanId', example: '550e8400-e29b-41d4-a716-446655440000' })
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
}
