import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { GuestImportModule } from '../guest-import/guest-import.module';
import {
  CreateGuestUseCase,
  DeleteGuestUseCase,
  GetGuestUseCase,
  ListGuestCategoriesUseCase,
  ListGuestsUseCase,
  UpdateGuestUseCase,
} from './application/manage-guests.use-case';
import { GuestsController } from './guests.controller';

@Module({
  imports: [GuestImportModule, EventsModule],
  controllers: [GuestsController],
  providers: [
    ListGuestsUseCase,
    GetGuestUseCase,
    CreateGuestUseCase,
    UpdateGuestUseCase,
    DeleteGuestUseCase,
    ListGuestCategoriesUseCase,
  ],
})
export class GuestsModule {}
