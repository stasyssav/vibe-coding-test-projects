#!/usr/bin/env python3
"""Upload the contents of ./public to a remote server over FTPS or SFTP.

Credentials are read from environment variables and never stored in the repo:

  DEPLOY_HOST    server hostname
  DEPLOY_USER    username
  DEPLOY_PASS    password
  DEPLOY_PROTO   "ftps" (default, port 21) or "sftp" (port 22)
  DEPLOY_PORT    override the default port
  DEPLOY_DIR     remote directory to upload into (default: "/eli")

Usage:  python3 deploy.py
"""
import os
import sys
from ftplib import FTP_TLS, error_perm
from pathlib import Path

LOCAL_DIR = Path(__file__).parent / "public"


def env(name, default=None, required=False):
    value = os.environ.get(name, default)
    if required and not value:
        sys.exit(f"Missing required environment variable {name}")
    return value


def files_to_upload():
    for path in sorted(LOCAL_DIR.rglob("*")):
        if path.is_file():
            yield path, path.relative_to(LOCAL_DIR).as_posix()


def deploy_ftps(host, port, user, password, remote_dir):
    ftp = FTP_TLS()
    ftp.connect(host, port, timeout=30)
    ftp.login(user, password)
    ftp.prot_p()  # encrypt the data channel too
    if remote_dir not in ("", "/"):
        # Create the target directory (and any parents) if it does not exist.
        for segment in remote_dir.strip("/").split("/"):
            try:
                ftp.cwd(segment)
            except error_perm:
                ftp.mkd(segment)
                ftp.cwd(segment)
                print(f"created remote directory {segment}")
    for local, rel in files_to_upload():
        parts = rel.split("/")
        for i in range(len(parts) - 1):
            sub = "/".join(parts[: i + 1])
            try:
                ftp.mkd(sub)
            except error_perm:
                pass  # already exists
        with open(local, "rb") as fh:
            ftp.storbinary(f"STOR {rel}", fh)
        print(f"uploaded {rel}")
    ftp.quit()


def deploy_sftp(host, port, user, password, remote_dir):
    try:
        import paramiko
    except ImportError:
        sys.exit("SFTP requires paramiko: pip install paramiko")
    transport = paramiko.Transport((host, port))
    transport.connect(username=user, password=password)
    sftp = paramiko.SFTPClient.from_transport(transport)
    base = remote_dir.rstrip("/")
    for local, rel in files_to_upload():
        parts = rel.split("/")
        for i in range(len(parts) - 1):
            sub = f"{base}/{'/'.join(parts[: i + 1])}"
            try:
                sftp.stat(sub)
            except IOError:
                sftp.mkdir(sub)
        sftp.put(str(local), f"{base}/{rel}")
        print(f"uploaded {rel}")
    sftp.close()
    transport.close()


def main():
    proto = env("DEPLOY_PROTO", "ftps").lower()
    host = env("DEPLOY_HOST", required=True)
    user = env("DEPLOY_USER", required=True)
    password = env("DEPLOY_PASS", required=True)
    remote_dir = env("DEPLOY_DIR", "/eli")
    default_port = 22 if proto == "sftp" else 21
    port = int(env("DEPLOY_PORT", str(default_port)))

    print(f"Deploying {LOCAL_DIR} to {proto}://{host}:{port}{remote_dir}")
    if proto == "sftp":
        deploy_sftp(host, port, user, password, remote_dir)
    elif proto == "ftps":
        deploy_ftps(host, port, user, password, remote_dir)
    else:
        sys.exit(f"Unknown DEPLOY_PROTO {proto!r}; use 'ftps' or 'sftp'")
    print("Done.")


if __name__ == "__main__":
    main()
