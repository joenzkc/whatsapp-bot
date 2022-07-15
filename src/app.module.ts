import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebhookModule } from './webhook/webhook.module';

@Module({
  imports: [ConfigModule.forRoot(), WebhookModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
