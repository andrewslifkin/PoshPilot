# Terms of Service Compliance Considerations

> Copy this page into the repository wiki under `Operational Policies/ToS Compliance` so legal, trust & safety, and engineering all operate from the same guidance.

## Data Handling

- Store only the minimum data necessary to execute a share job. Avoid persisting full content payloads beyond the processing window.
- Correlation IDs are considered operational metadata and may be shared with partners only when redacted of user-identifying information.
- Retain processing logs for 30 days unless extended retention is contractually required. Longer retention requires legal approval.

## User Consent & Rate Limits

- Honor per-user opt-out flags. Revoke credentials immediately if a user revokes consent or violates partner ToS.
- The API enforces hourly/daily caps. Do not increase the configured limits above partner contract allowances without written approval.
- Workers enforce guardrails independently to prevent bulk posting or scraping behavior that would violate partner policies.

## Incident & Abuse Handling

- Notify partners within 24 hours of confirmed ToS violations affecting their users.
- Document mitigation steps and credential revocations in the incident tracker. Include the `correlationId` for traceability.
- Coordinate with Trust & Safety before restoring any revoked credential.

## Auditing

- Export metrics snapshots weekly (`share_jobs_success_total`, `share_jobs_failure_total`, rate limit breach counts) to the compliance archive.
- Review admin dashboard access logs monthly to ensure only authorized personnel are retrieving stuck job data or modifying credentials.
- Maintain immutable audit records for credential rescissions, including actor, timestamp, and reason.
