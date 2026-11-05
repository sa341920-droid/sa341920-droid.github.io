# Scheduled tasks
Configure hosting cron to run only reviewed scripts. Suggested schedules:
- Database backup: daily, encrypted, off-server destination, retention policy.
- Low stock report: daily.
- Abandoned cart notification: only after consent and SMTP/WhatsApp provider configuration.
No cron task is enabled by default. Backups must be stored outside public_html and tested by restoring to a staging database.
