import {
  Controller,
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
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { FloorPlansService } from './floor-plans.service';
import { UploadFloorPlanResponseDto } from './dto/upload-floor-plan-response.dto';

@ApiTags('floor-plans')
@Controller('events/:eventId/floor-plans')
export class FloorPlansController {
  constructor(private readonly floorPlansService: FloorPlansService) {}

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
}
