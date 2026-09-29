# Forge

### Collaborative Engineering Workspace

Forge is a full-stack collaborative engineering workspace designed to bring project communication, real-time collaboration, and developer meetings into one place.

It provides workspace-based collaboration with real-time chat, secure authentication, invitations, and built-in video meetings with screen sharing and persistent meeting chat.

## 🚀 Live Demo

**Production:** https://glistening-endurance-production-76e8.up.railway.app/

**GitHub:** https://github.com/Vivek0925/Forge

---

## ✨ Features

### 🔐 Authentication

- Email and password authentication
- Google OAuth authentication
- JWT-based authentication using HTTP-only cookies
- Protected routes and API endpoints
- Secure logout and session validation

### 🏢 Workspaces

- Create and manage workspaces
- Workspace-specific collaboration
- Invite members to workspaces
- Workspace-based access control
- Dedicated workspace navigation

### 💬 Real-Time Chat

- Persistent workspace chat
- Real-time messaging using Socket.IO
- Automatic message synchronization
- Message history stored in PostgreSQL
- File sharing support

### 🎥 Meetings

- Real-time video and audio meetings
- WebRTC-based peer-to-peer communication
- Camera and microphone controls
- Screen sharing
- Participant synchronization
- Camera and microphone device switching
- Fullscreen support
- Persistent meeting chat
- Shareable meeting links
- Host-controlled meeting termination

### ⚡ Quick Meetings

- Start a meeting instantly without creating a scheduled meeting
- Share meeting links with participants
- Designed for quick team discussions and ad-hoc collaboration

### 📱 Responsive UI

- Desktop and mobile responsive interface
- Mobile workspace navigation
- Swipe-based sidebar interaction
- Responsive meeting and workspace layouts
- Touch-friendly controls

---

## 🏗️ Architecture

```text
                    ┌──────────────────────┐
                    │      Next.js         │
                    │     Frontend         │
                    └──────────┬───────────┘
                               │
                    REST API / WebSockets
                               │
                               ▼
                    ┌──────────────────────┐
                    │       NestJS         │
                    │       Backend        │
                    └───────┬───────┬──────┘
                            │       │
                 ┌──────────┘       └──────────┐
                 ▼                             ▼
        ┌─────────────────┐          ┌─────────────────┐
        │   PostgreSQL    │          │      Redis      │
        │  Persistent DB  │          │  Cache / State  │
        └─────────────────┘          └─────────────────┘

                    WebRTC
                       │
                       ▼
              ┌─────────────────┐
              │ Meeting Clients │
              │ Video / Audio   │
              └─────────────────┘
