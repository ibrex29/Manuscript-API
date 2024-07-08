import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { ReviewerController } from './reviewer.controller';
import { ReviewerService } from './reviewer.service';


@Module({
  imports: [PrismaModule],
  controllers: [ReviewerController],
  providers: [ReviewerService],
})
export class ReviewerModule {}
