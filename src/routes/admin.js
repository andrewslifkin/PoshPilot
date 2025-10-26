const express = require('express');
const { adminAuth } = require('../security/adminAuth');
const shareQueue = require('../shareQueue');
const { listCredentials, revokeCredential, restoreCredential } = require('../credentials');

const router = express.Router();
const STUCK_THRESHOLD_MS = Number(process.env.STUCK_JOB_THRESHOLD_MS || 15 * 60 * 1000);

router.use(adminAuth);

router.get('/dashboard', (req, res) => {
  const stuckJobs = shareQueue.findStuckJobs(STUCK_THRESHOLD_MS).map((job) => shareQueue.serialize(job));
  const recentJobs = shareQueue.listJobs({ limit: 25 }).map((job) => shareQueue.serialize(job));
  const revokedCredentials = listCredentials('revoked');

  res.type('html');
  res.send(`
    <html>
      <head>
        <title>PoshPilot Admin Dashboard</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 2rem; }
          h1 { margin-bottom: 0.5rem; }
          section { margin-bottom: 2rem; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ccc; padding: 0.5rem; text-align: left; }
          th { background: #f0f0f0; }
          code { font-size: 0.85rem; }
        </style>
      </head>
      <body>
        <h1>Admin Dashboard</h1>
        <p>Stuck threshold: ${(STUCK_THRESHOLD_MS / 60000).toFixed(0)} minutes</p>

        <section>
          <h2>Stuck Jobs (${stuckJobs.length})</h2>
          ${renderJobsTable(stuckJobs)}
        </section>

        <section>
          <h2>Recent Jobs</h2>
          ${renderJobsTable(recentJobs)}
        </section>

        <section>
          <h2>Revoked Credentials</h2>
          ${renderCredentialsTable(revokedCredentials)}
        </section>

        <section>
          <h2>Rescind Credentials</h2>
          <form method="post" action="/admin/credentials/rescind">
            <label>User ID <input name="userId" required /></label>
            <label>Reason <input name="reason" placeholder="Reason for revocation" /></label>
            <button type="submit">Rescind</button>
          </form>
        </section>
      </body>
    </html>
  `);
});

router.post('/credentials/rescind', express.urlencoded({ extended: true }), (req, res) => {
  const userId = req.body.userId || req.body.user_id;
  if (!userId) {
    res.status(400).json({ error: 'userId_required' });
    return;
  }
  const reason = req.body.reason;
  const actor = req.headers['x-admin-actor'] || 'admin-portal';
  const record = revokeCredential(userId, { reason, actor });

  if (req.accepts('html')) {
    res.redirect('/admin/dashboard');
    return;
  }

  res.json({ credential: record });
});

router.post('/credentials/restore', express.json(), (req, res) => {
  const { userId, actor } = req.body || {};
  if (!userId) {
    res.status(400).json({ error: 'userId_required' });
    return;
  }
  const record = restoreCredential(userId, actor || 'admin-portal');
  res.json({ credential: record });
});

router.get('/jobs', (req, res) => {
  const { status, userId, limit } = req.query;
  const jobs = shareQueue
    .listJobs({
      status,
      userId,
      limit: limit ? Number(limit) : 100
    })
    .map((job) => shareQueue.serialize(job));

  res.json({ jobs });
});

router.post('/jobs/:jobId/requeue', (req, res) => {
  const { jobId } = req.params;
  const job = shareQueue.requeue(jobId);
  if (!job) {
    res.status(404).json({ error: 'job_not_found' });
    return;
  }
  res.json({ job: shareQueue.serialize(job) });
});

function renderJobsTable(jobs) {
  if (!jobs.length) {
    return '<p>No jobs to display.</p>';
  }

  const rows = jobs
    .map(
      (job) => `
        <tr>
          <td><code>${job.id}</code></td>
          <td>${job.userId}</td>
          <td>${job.status}</td>
          <td>${job.createdAt}</td>
          <td>${job.startedAt || ''}</td>
          <td>${job.finishedAt || ''}</td>
          <td><code>${job.correlationId}</code></td>
        </tr>
      `
    )
    .join('');

  return `
    <table>
      <thead>
        <tr>
          <th>Job ID</th>
          <th>User</th>
          <th>Status</th>
          <th>Created</th>
          <th>Started</th>
          <th>Finished</th>
          <th>Correlation</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function renderCredentialsTable(credentials) {
  if (!credentials.length) {
    return '<p>No revoked credentials.</p>';
  }

  const rows = credentials
    .map(
      (record) => `
        <tr>
          <td>${record.userId}</td>
          <td>${record.reason}</td>
          <td>${record.actor}</td>
          <td>${record.revokedAt}</td>
        </tr>
      `
    )
    .join('');

  return `
    <table>
      <thead>
        <tr>
          <th>User</th>
          <th>Reason</th>
          <th>Actor</th>
          <th>Revoked</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

module.exports = router;
