import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import {
  PREFERENCE_CONTROL_MODES,
  type PreferenceControlMode,
} from '../domain/preference-control-mode';

export class EventPreferenceModeResponseDto {
  @ApiProperty({ example: 'evt_123' })
  eventId!: string;

  @ApiProperty({ enum: PREFERENCE_CONTROL_MODES, example: 'colaborativo' })
  mode!: PreferenceControlMode;

  @ApiProperty({ example: 1 })
  version!: number;

  @ApiProperty()
  updatedAt!: string;
}

export class UpdateEventPreferenceModeDto {
  @ApiProperty({ enum: PREFERENCE_CONTROL_MODES, example: 'anfitrion_exclusivo' })
  @IsEnum(PREFERENCE_CONTROL_MODES)
  mode!: PreferenceControlMode;
}

export class PreferenceControlModeRevisionDto {
  @ApiProperty({ example: 1 })
  version!: number;

  @ApiProperty({ enum: PREFERENCE_CONTROL_MODES })
  mode!: PreferenceControlMode;

  @ApiProperty({ enum: PREFERENCE_CONTROL_MODES, nullable: true })
  previousMode!: PreferenceControlMode | null;

  @ApiProperty()
  changedAt!: string;
}

export class PreferenceControlModeRevisionListDto {
  @ApiProperty({ example: 'evt_123' })
  eventId!: string;

  @ApiProperty({ type: [PreferenceControlModeRevisionDto] })
  revisions!: PreferenceControlModeRevisionDto[];
}
