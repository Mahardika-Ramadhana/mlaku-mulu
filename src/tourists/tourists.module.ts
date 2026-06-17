import { Module } from '@nestjs/common';
import { TouristsService } from './tourists.service';
import { TouristsController } from './tourists.controller';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  providers: [TouristsService],
  controllers: [TouristsController],
  exports: [TouristsService],
})
export class TouristsModule {}
