import { Module } from '@nestjs/common';

import { WorkspaceModule } from '../workspace/workspace.module';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';

@Module({
  imports: [WorkspaceModule],
  controllers: [StorageController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
