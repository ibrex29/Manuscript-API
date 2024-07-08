import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { ReviewerController } from 'src/modules/reviewer/reviewer.controller';
import { ReviewerService } from 'src/modules/reviewer/reviewer.service';


@Module({
  imports: [PrismaModule],
  controllers: [ReviewerController],
  providers: [ReviewerService],
})
export class ReviewerModule {}
