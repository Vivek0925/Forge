import { Module } from '@nestjs/common';

import { PrismaModule } from '../../database/prisma.module';

import { WorkspaceModule } from '../workspace/workspace.module';

import { WorkspaceInvitationController } from './controllers/workspace-invitation.controller';
import { WorkspaceInvitationRepository } from './repositories/workspace-invitation.repository';
import { WorkspaceInvitationService } from './services/workspace-invitation.service';
import { MailService } from '../../mail/mail.service';

@Module({
  imports: [PrismaModule, WorkspaceModule],
  controllers: [WorkspaceInvitationController],
  providers: [
    WorkspaceInvitationService,
    WorkspaceInvitationRepository,
    MailService,
  ],
})
export class WorkspaceInvitationModule {}
