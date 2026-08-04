import { PutObjectCommand } from '@aws-sdk/client-s3';

import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { s3 } from './s3.client';

@Injectable()
export class StorageService {
  async upload(file: any, folder: string) {
    const extension = file.originalname.split('.').pop();

    const key = `${folder}/${randomUUID()}.${extension}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return {
      fileName: file.originalname,
      key,
      url: `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${key}`,
      mimeType: file.mimetype,
      size: file.size,
    };
  }
}
