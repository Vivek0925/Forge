import { Module } from '@nestjs/common';

import { WorkspaceModule } from '../workspace/workspace.module';

import { TasksController } from './controllers/tasks.controller';
import { TaskListsController } from './controllers/task-lists.controller';
import { TaskCommentsController } from './controllers/task-comments.controller';

import { TasksRepository } from './repositories/tasks.repository';
import { TaskListsRepository } from './repositories/task-lists.repository';
import { TaskCommentsRepository } from './repositories/task-comments.repository';

import { TasksService } from './services/tasks.service';
import { TaskListsService } from './services/task-lists.service';
import { TaskCommentsService } from './services/task-comments.service';

@Module({
  imports: [WorkspaceModule],
  controllers: [
    TasksController,
    TaskListsController,
    TaskCommentsController,
  ],
  providers: [
    TasksRepository,
    TaskListsRepository,
    TaskCommentsRepository,
    TasksService,
    TaskListsService,
    TaskCommentsService,
  ],
  exports: [
    TasksService,
    TaskListsService,
    TaskCommentsService,
  ],
})
export class TasksModule {}