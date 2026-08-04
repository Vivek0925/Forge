import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
} from "@nestjs/common";

import { FileInterceptor } from "@nestjs/platform-express";

import { StorageService } from "./storage.service";
import { UploadFileDto } from "./dto/upload-file.dto";
import { memoryStorage } from "multer";


@Controller("storage")
export class StorageController {
  constructor(
    private readonly storageService: StorageService,
  ) {}

  @Post("upload")
  @UseInterceptors(
  FileInterceptor("file", {
    storage: memoryStorage(),
  }),
)
  upload(
    @UploadedFile() file: any,
    @Body() dto: UploadFileDto,
  ) {
    return this.storageService.upload(file, dto.folder);
  }
}