import { Module } from '@nestjs/common';

import { WorkspaceModule } from '../workspace/workspace.module';

import { TasksController } from './controllers/tasks.controller';
import { TasksRepository } from './repositories/tasks.repository';
import { TasksService } from './services/tasks.service';
import { TaskListsController } from "./controllers/task-lists.controller";
import { TaskListsRepository } from "./repositories/task-lists.repository";
import { TaskListsService } from "./services/task-lists.service";

@Module({
  imports: [WorkspaceModule],
  controllers: [TasksController,TaskListsController,],
  providers: [
    TasksRepository,
    TasksService,
    TaskListsRepository,
    TaskListsService,
  ],
  exports: [TasksService,TaskListsService,],
})
export class TasksModule {}