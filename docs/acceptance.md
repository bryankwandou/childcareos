# MVP Acceptance Record

Validated on July 24, 2026 against the production Next.js bundle.

## Automated domain tests

- Check-in allowed one place below the ratio boundary.
- Check-in rejected at the exact ratio boundary.
- Check-in rejected with zero active staff.
- Capacity enforced independently from ratio.
- Staff removal from an occupied room raises an urgent alert.
- Explicitly revoked pickup authorization is blocked.
- A blocked pickup attempt cannot complete checkout.
- A successful pickup verification is one-time use.
- Incident drafting does not finalize or notify automatically.
- Guardian portal data is scoped to linked family records.

## Production HTTP checks

- `GET /api/state` returned `200` with two rooms.
- First Sunflower check-in returned `200`; the next returned `409`.
- Staff reduction returned `200` with `urgentAlert: true`.
- Revoked pickup verification returned `403`.
- Valid pickup verification and checkout returned `200`; replay returned `409`.
- Incident draft returned `200`; notify-before-finalize returned `409`.
- Finalize and deliberate guardian notification each returned `200`.
- `/dashboard` and `/guardian` each returned `200`.

## Production boundary

The demo is complete as a credential-free MVP. Production use still requires applying the included Supabase migration, wiring authenticated identities, verifying RLS with a real Supabase test project, configuring jurisdiction-reviewed ratio rules, and implementing an outage continuity plan.
