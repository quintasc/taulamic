import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { GuestImportModule } from '../guest-import/guest-import.module';
import {
  AddGuestRestrictionUseCase,
  ListGuestRestrictionsUseCase,
} from './application/manage-guest-restrictions.use-case';
import { GuestPreferencesController } from './guest-preferences.controller';

@Module({
  imports: [GuestImportModule, EventsModule],
  controllers: [GuestPreferencesController],
  providers: [ListGuestRestrictionsUseCase, AddGuestRestrictionUseCase],
})
export class GuestPreferencesModule {}
