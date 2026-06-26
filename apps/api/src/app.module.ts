import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { appConfig } from './config/app.config';
import { sentryEnabled } from './instrument';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FloorPlansModule } from './floor-plans/floor-plans.module';
import { GuestImportModule } from './guest-import/guest-import.module';
import { GuestsModule } from './guests/guests.module';
import { DistributionModule } from './distribution/distribution.module';
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
    ...(sentryEnabled ? [SentryModule.forRoot()] : []),
    FloorPlansModule,
    GuestImportModule,
    GuestsModule,
    DistributionModule,
    EventsModule,
    GuestPreferencesModule,
    GuestCompanionsModule,
    EventGovernanceAuditModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ...(sentryEnabled
      ? [{ provide: APP_FILTER, useClass: SentryGlobalFilter }]
      : []),
  ],
})
export class AppModule {}
