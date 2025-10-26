# Incident Response Procedures

This document should be mirrored into the repository wiki so that on-call responders always have the latest version. It captures the minimum viable steps for preparing, detecting, and responding to incidents originating from the share pipeline.

## Preparation

1. **Access**
   - Ensure every on-call engineer has the admin token (`ADMIN_TOKEN`) and VPN credentials.
   - Maintain access to the observability stack (Prometheus/Alertmanager dashboard) and log aggregation tooling (e.g., Loki, Elastic, or Datadog).
2. **Runbooks**
   - Bookmark the admin dashboard at `/admin/dashboard` for live job inspection.
   - Document expected share volumes per tenant in the configuration wiki page and update quarterly.
3. **Testing**
   - Run monthly game days that simulate upstream API outages and rate limit spikes using the `simulateFailure` payload flag.
   - Validate alert routing rules by firing synthetic alerts from Alertmanager’s “test” endpoint.

## Detection

1. **Metrics**
   - Alerts fire when `share_jobs_failure_total` increments more than 10 times in 5 minutes or when no `share_jobs_success_total` increments for 10 minutes during business hours.
   - Track latency regressions using the `share_job_duration_seconds` histogram. Investigate p95 > 5s sustained for more than 10 minutes.
2. **Logs**
   - Correlation IDs are present in every API and worker log. Search for the correlation ID from the alert payload to follow an entire share through the system.
3. **Dashboards**
   - Use `/admin/jobs?status=processing` to identify long-running jobs. Jobs exceeding the `STUCK_JOB_THRESHOLD_MS` environment variable appear in the dashboard “Stuck Jobs” section.

## Response

1. **Triage**
   - Confirm whether the failures are user-specific (look at `userId` label in logs) or systemic.
   - If a credential compromise is suspected, revoke via `/admin/credentials/rescind` and notify the Trust & Safety team.
2. **Mitigation**
   - Pause intake by raising `API_MAX_SHARES_PER_HOUR` to a low value (e.g., `1`) while leaving worker limits untouched to drain the queue.
   - For runaway jobs, use `/admin/jobs/:id/requeue` to retry after resolving downstream issues.
3. **Communication**
   - Update the incident Slack channel every 30 minutes with observed impact, mitigation steps, and ETA for resolution.
   - File a post-incident report within 48 hours capturing detection, timeline, root cause, and follow-up tasks.

## Postmortem Checklist

- [ ] Incident recorded in the tracker with severity and duration.
- [ ] Metrics and alert thresholds reviewed for tuning opportunities.
- [ ] Action items assigned owners and due dates.
- [ ] Wiki updated with any new mitigation steps or configuration changes.
