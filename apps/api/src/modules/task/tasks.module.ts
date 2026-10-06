import { Module } from '@nestjs/common';

import { WorkspaceModule } from '../workspace/workspace.module';

import { TasksController } from './controllers/tasks.controller';
import { TasksRepository } from './repositories/tasks.repository';
import { TasksService } from './services/tasks.service';

@Module({
  imports: [WorkspaceModule],
  controllers: [TasksController],
  providers: [
    TasksRepository,
    TasksService,
  ],
  exports: [TasksService],
})
export class TasksModule {}