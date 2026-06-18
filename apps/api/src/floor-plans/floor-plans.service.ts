import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { UploadFloorPlanResponseDto } from './dto/upload-floor-plan-response.dto';
import {
  assertValidFloorPlanFile,
  FloorPlanUploadFile,
} from './floor-plan-file.validator';

@Injectable()
export class FloorPlansService {
  constructor(private readonly configService: ConfigService) {}

  async upload(
    eventId: string,
    file: FloorPlanUploadFile | undefined,
  ): Promise<UploadFloorPlanResponseDto> {
    const maxBytes = this.configService.get<number>(
      'floorPlan.maxBytes',
      10 * 1024 * 1024,
    );
    const uploadDir = this.configService.get<string>(
      'floorPlan.uploadDir',
      'uploads/floor-plans',
    );

    assertValidFloorPlanFile(file, maxBytes);

    const id = randomUUID();
    const safeName = file!.originalname.replace(/[^\w.\-() ]+/g, '_');
    const relativeDir = join(uploadDir, eventId);
    const relativePath = join(relativeDir, `${id}-${safeName}`);
    const absoluteDir = join(process.cwd(), relativeDir);
    const absolutePath = join(process.cwd(), relativePath);

    await mkdir(absoluteDir, { recursive: true });
    await writeFile(absolutePath, file!.buffer);

    return {
      id,
      eventId,
      originalName: file!.originalname,
      mimeType: file!.mimetype,
      sizeBytes: file!.size,
      status: 'uploaded',
    };
  }
}
