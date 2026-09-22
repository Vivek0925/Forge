import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

import { CreateMeetingDto } from '../dto/create-meeting.dto';
import { UpdateMeetingDto } from '../dto/update-meeting.dto';
import { MeetingService } from '../services/meeting.service';

@Controller('meetings')
@UseGuards(JwtAuthGuard)
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  @Post('workspaces/:slug')
  async createMeeting(
    @Param('slug') slug: string,
    @Body() dto: CreateMeetingDto,
    @Request() req: any,
  ) {
    return this.meetingService.create(req.user.id, slug, dto);
  }

  @Patch(':id')
  async updateMeeting(
    @Param('id') id: string,
    @Body() dto: UpdateMeetingDto,
    @Request() req: any,
  ) {
    return this.meetingService.update(id, req.user.id, dto);
  }

  @Post('join-code')
  async joinByCode(
    @Body('meetingCode') meetingCode: string,
    @Request() req: any,
  ) {
    return this.meetingService.joinByCode(meetingCode, req.user.id);
  }

  @Post(":id/cancel")
async cancelMeeting(
  @Param("id") id: string,
  @Request() req: any,
) {
  return this.meetingService.cancel(
    id,
    req.user.id,
  );
}

  @Get(':id')
  async getMeeting(@Param('id') id: string) {
    return this.meetingService.findById(id);
  }

  @Get('workspace/:slug')
  async getWorkspaceMeetings(@Param('slug') slug: string) {
    return this.meetingService.findWorkspaceMeetings(slug);
  }

  @Post(':id/start')
  async startMeeting(@Param('id') id: string) {
    return this.meetingService.start(id);
  }

  @Post(':id/end')
  async endMeeting(@Param('id') id: string) {
    return this.meetingService.end(id);
  }

  @Post(':id/join')
  async joinMeeting(@Param('id') id: string, @Request() req: any) {
    return this.meetingService.join(id, req.user.id);
  }

  @Post(':id/leave')
  async leaveMeeting(@Param('id') id: string, @Request() req: any) {
    return this.meetingService.leave(id, req.user.id);
  }
}
