# Web App

An empty HTML page in `public/`, ready to be built out live.
It is deployed to the root of an FTP account
whose home directory is the site's `/eli` folder. Deployment runs automatically in GitHub Actions on every push
that touches `public/`, so the whole edit-and-deploy loop works from a browser.

## One-time setup: repository secrets

In GitHub go to **Settings → Secrets and variables → Actions → New repository
secret** and add:

| Secret     | Value                    |
|------------|--------------------------|
| `FTP_HOST` | the FTP server hostname  |
| `FTP_USER` | the FTP username         |
| `FTP_PASS` | the FTP password         |

The workflow in `.github/workflows/deploy.yml` reads them and uploads over
FTPS (port 21) into the account's root directory. You can also start it by hand from the
**Actions** tab with "Run workflow".

## Deploying from your own machine

```bash
export DEPLOY_HOST=your.server.example
export DEPLOY_USER=username
export DEPLOY_PASS='password'
export DEPLOY_PROTO=ftps      # or sftp, which needs: pip install paramiko
export DEPLOY_DIR=/
python3 deploy.py
```

Set `DEPLOY_REMOVE` to a comma-separated list of remote paths to delete
recursively before uploading (FTPS only), for one-off cleanups.

Credentials are read from the environment only and are never committed.
