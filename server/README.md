# Nudge Platform Prototype Server

This minimal Express server provides prototype endpoints used by the dashboard and SDK:

- POST /v1/identify  -> { user_id, traits }
- POST /v1/track     -> { user_id, event, properties }
- GET  /v1/campaigns -> ?user_id=<id>
- POST /v1/admin/campaigns -> create a campaign (admin)

Run locally (PowerShell):

```powershell
cd server
npm install
npm start
```

The server stores everything in-memory (for prototype/demo). Use the `sdk/` module to make sample calls.
