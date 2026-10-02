import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  UseGuards,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/interfaces/current-user.interface';
import { WorkspaceService } from '../workspace/services/workspace.service';

import { StorageService } from './storage.service';
import { UploadFileDto } from './dto/upload-file.dto';
import {
  ALLOWED_WORKSPACE_FOLDERS,
  isAllowedFileType,
  MAX_UPLOAD_SIZE,
} from './storage.service';
import { memoryStorage } from 'multer';

@Controller('storage')
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(
    private readonly storageService: StorageService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: MAX_UPLOAD_SIZE,
        files: 1,
        parts: 3,
      },
      fileFilter: (_request, file, callback) => {
        if (!isAllowedFileType(file)) {
          return callback(
            new BadRequestException(
              'Unsupported file type. Upload an allowed image, video, or document.',
            ),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  async upload(
    @CurrentUser() user: CurrentUserData,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file was uploaded.');
    }

    if (ALLOWED_WORKSPACE_FOLDERS.has(dto.folder)) {
      if (!dto.workspaceSlug) {
        throw new BadRequestException(
          'A workspace is required for this upload.',
        );
      }

      await this.workspaceService.findAccessibleWorkspace(
        user.id,
        dto.workspaceSlug,
      );
    }

    return this.storageService.upload(file, dto.folder);
  }
}
