import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { Resend } from 'resend';

interface InvitationEmail {
  recipient: string;
  workspaceName: string;
  role: string;
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      })[character] ?? character,
  );
}

@Injectable()
export class MailService {
  private readonly resend: Resend | null;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.resend = apiKey ? new Resend(apiKey) : null;
  }

  async sendWorkspaceInvitation({
    recipient,
    workspaceName,
    role,
  }: InvitationEmail) {
    if (!this.resend) {
      throw new ServiceUnavailableException(
        'Invitation email is not configured.',
      );
    }

    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    const from =
      process.env.RESEND_FROM_EMAIL ?? 'Vynor <onboarding@resend.dev>';
    const invitationUrl = `${frontendUrl}/dashboard`;
    const safeWorkspaceName = escapeHtml(workspaceName);
    const safeRole = escapeHtml(role.toLowerCase());

    const { error } = await this.resend.emails.send({
      from,
      to: recipient,
      subject: `You're invited to join ${workspaceName} on Vynor`,
      text: [
        `You've been invited to join ${workspaceName} on Vynor.`,
        `Your role: ${role.toLowerCase()}.`,
        '',
        `Sign in to accept the invitation: ${invitationUrl}`,
      ].join('\n'),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; color: #14141c;">
          <h1 style="font-size: 24px; margin-bottom: 12px;">You're invited to Vynor</h1>
          <p>You've been invited to join <strong>${safeWorkspaceName}</strong>.</p>
          <p>Your role: <strong>${safeRole}</strong></p>
          <a href="${invitationUrl}" style="display: inline-block; margin-top: 16px; padding: 12px 18px; border-radius: 10px; background: #14141c; color: #ffffff; text-decoration: none;">
            View invitation
          </a>
        </div>
      `,
    });

    if (error) {
      throw new Error(`Failed to send invitation email: ${error.message}`);
    }
  }
}
