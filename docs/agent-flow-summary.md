# ICON Agent Flow Summary

This document captures the high-level flows and operational states described in `Icon-agent-flow-diagram.docx`. We will use this as the reference throughout full app development.

## Core Actors
- Admin: Supervises, overrides stages, reassigns jobs, cancels, monitors metrics
- Agent: Accepts requests, performs diagnosis/repair/build, logs visit details
- User: Creates requests/bookings, may cancel, leaves feedback on completion

## Primary Service Flows

### In‑House (On‑Site Service)
- Request → Agent Accepts → ETA → Diagnosis → Repair → Completed
- Admin sees full trail and can override any step
- Visit lifecycle: Start Visit → End Visit; supports multi‑day sessions via scheduling

### In‑Shop (Drop‑off / Workshop)
- Request → Agent Accepts → Diagnosis → Repair → Completed
- Generally no ETA/reached events; focus on diagnosis/repair stages

### PC Build (Assembly & QA)
- Request → Agent Accepts → Build → Install → QA → Completed
- Admin tracks granular build quality and stage progression

## Cross‑Cutting Operations
- Cancellation: can be initiated by User/Admin/Agent; timeline records event + reason; metrics increment cancelled count
- Reassign: Admin can reassign stuck jobs to a new agent; timeline shows reassignment and starts a new branch for Agent Y
- Multi‑Day Sessions: Diagnosis indicates multi‑day repair; Admin schedules `nextVisitAt`; multiple `JobSessions` tracked (Day 1, Day 2, etc.)
- Notifications (Admin): real‑time alerts like "New booking created", "Agent accepted booking #1234", "Diagnosis completed", "PC Build entered Testing", "Job cancelled"; clicking opens Request Detail
- Feedback Review: after completion, user submits rating/comments; aggregates update agent profile (e.g., `ratingAvg`, `jobsDone`); Admin can export reports and view satisfaction metrics

## Timeline & Status
- Each request maintains a timeline of events and transitions
- Status chip examples: `Cancelled (by User/Admin/Agent)` in red; other states reflect current step (Accepted, In‑Progress, Completed)
- Admin can add notes at key transitions (e.g., reassign with reason) and archive notifications

## Key Data Points
- `nextVisitAt`: scheduled follow‑up for multi‑day sessions
- `JobSessions`: multiple visit tracking per job
- Aggregates: `ratingAvg`, `jobsDone`, cancelled count

## Quick Flow Recap
- In‑House: Request → Accept → ETA → Diagnosis → Repair → Completed
- In‑Shop: Request → Accept → Diagnosis → Repair → Completed
- PC Build: Request → Accept → Build → Install → QA → Completed

This summary mirrors the DOCX content and will be our canonical reference for implementing state machines, timelines, and UI/permissions across Admin, Agent, and User apps.