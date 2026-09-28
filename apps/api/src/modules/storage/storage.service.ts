import { PutObjectCommand } from '@aws-sdk/client-s3';

import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { s3 } from './s3.client';

@Injectable()
export class StorageService {
  async upload(file: any, folder: string) {
    if (
      !process.env.S3_ENDPOINT ||
      !process.env.S3_BUCKET ||
      !process.env.S3_ACCESS_KEY ||
      !process.env.S3_SECRET_KEY
    ) {
      throw new ServiceUnavailableException(
        'File storage is not configured on the server.',
      );
    }

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
