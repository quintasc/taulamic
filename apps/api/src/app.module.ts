import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './config/app.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FloorPlansModule } from './floor-plans/floor-plans.module';
import { GuestImportModule } from './guest-import/guest-import.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    FloorPlansModule,
    GuestImportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
