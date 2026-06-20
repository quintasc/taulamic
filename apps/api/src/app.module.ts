import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './config/app.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FloorPlansModule } from './floor-plans/floor-plans.module';
import { GuestImportModule } from './guest-import/guest-import.module';
import { EventsModule } from './events/events.module';
import { GuestPreferencesModule } from './guest-preferences/guest-preferences.module';
import { GuestCompanionsModule } from './guest-companions/guest-companions.module';
import { EventGovernanceAuditModule } from './event-governance-audit/event-governance-audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    FloorPlansModule,
    GuestImportModule,
    EventsModule,
    GuestPreferencesModule,
    GuestCompanionsModule,
    EventGovernanceAuditModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
