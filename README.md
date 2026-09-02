# Hello World

A minimal static web page in `public/`, with a deploy script that uploads it
over FTPS (port 21) or SFTP (port 22).

## Deploy

```bash
export DEPLOY_HOST=your.server.example
export DEPLOY_USER=username
export DEPLOY_PASS='password'
export DEPLOY_PROTO=ftps      # or sftp
export DEPLOY_DIR=/           # remote directory, e.g. /public_html
python3 deploy.py
```

SFTP mode needs `pip install paramiko`. Credentials are read from the
environment only and are never committed.
