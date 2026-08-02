import { Injectable } from "@nestjs/common";

@Injectable()
export class StorageService {
  async upload(
    file: Express.Multer.File,
    folder: string,
  ) {
    console.log(file);
    console.log(folder);

    return {
      message: "Upload endpoint working",
    };
  }
}