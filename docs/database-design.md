# Forge Database Design

## Core Domain

- User
- Workspace
- WorkspaceMember
- Project
- ProjectMember

---

## User

Fields:
- id
- name
- email
- avatar
- provider
- createdAt
- updatedAt

---

## Workspace

Fields:
- id
- name
- slug
- description
- createdBy
- createdAt
- updatedAt

---

## WorkspaceMember

Fields:
- id
- userId
- workspaceId
- role
- joinedAt

---

## Project

Fields:
- id
- workspaceId
- name
- description
- status
- createdBy
- createdAt
- updatedAt

---

## ProjectMember

Fields:
- id
- projectId
- userId
- role
- joinedAt

## Collaboration

- Meeting
- MeetingParticipant
- Channel
- Message
- Reaction
- Document
- DocumentVersion
- Whiteboard
- Task
- Comment

---

## Supporting

- Invitation
- Notification
- Activity
- Storage

---

## AI

- ProjectMemory