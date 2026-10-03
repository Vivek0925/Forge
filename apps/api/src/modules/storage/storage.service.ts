import { PutObjectCommand } from '@aws-sdk/client-s3';

import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { extname } from 'path';

import { s3 } from './s3.client';

export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

const ALLOWED_FILE_TYPES = new Map([
  ['jpg', new Set(['image/jpeg', 'image/jpg'])],
  ['jpeg', new Set(['image/jpeg'])],
  ['png', new Set(['image/png'])],
  ['gif', new Set(['image/gif'])],
  ['webp', new Set(['image/webp'])],
  ['mp4', new Set(['video/mp4'])],
  ['webm', new Set(['video/webm'])],
  ['mov', new Set(['video/quicktime'])],
  ['pdf', new Set(['application/pdf'])],
  ['txt', new Set(['text/plain'])],
  ['csv', new Set(['text/csv', 'application/vnd.ms-excel'])],
  ['doc', new Set(['application/msword'])],
  [
    'docx',
    new Set([
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]),
  ],
  ['xls', new Set(['application/vnd.ms-excel'])],
  [
    'xlsx',
    new Set([
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]),
  ],
  ['ppt', new Set(['application/vnd.ms-powerpoint'])],
  [
    'pptx',
    new Set([
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ]),
  ],
]);

export const ALLOWED_WORKSPACE_FOLDERS = new Set([
  'chat',
  'workspace-icons',
  'documents',
  'whiteboards',
]);

function getFileExtension(fileName: string) {
  return extname(fileName).slice(1).toLowerCase();
}

export function isAllowedFileType(
  file: Pick<Express.Multer.File, 'originalname' | 'mimetype'>,
) {
  const extension = getFileExtension(file.originalname);
  const allowedMimeTypes = ALLOWED_FILE_TYPES.get(extension);

  return allowedMimeTypes?.has(file.mimetype.toLowerCase()) ?? false;
}

@Injectable()
export class StorageService {
  async upload(file: Express.Multer.File, folder: string) {
    if (!isAllowedFileType(file)) {
      throw new BadRequestException(
        'Unsupported file type. Upload an allowed image, video, or document.',
      );
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(folder)) {
      throw new BadRequestException('Invalid storage folder.');
    }

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

    const extension = getFileExtension(file.originalname);

    const key = `${folder}/${randomUUID()}.${extension}`;

    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
    } catch (error) {
      console.error('Failed to upload file to object storage', error);
      throw new ServiceUnavailableException(
        'File storage is temporarily unavailable. Please try again later.',
      );
    }

    return {
      fileName: file.originalname,
      key,
      url: `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${key}`,
      mimeType: file.mimetype,
      size: file.size,
    };
  }
}
