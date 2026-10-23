"""Deployment transport; credentials are read only from the process environment."""
import base64
import hashlib
import os
from pathlib import Path
import sys
import paramiko

host = os.environ['FC_VPS_HOST']
known_hosts = Path('data/vps-known-hosts')
known_hosts.parent.mkdir(parents=True, exist_ok=True)
client = paramiko.SSHClient()
client.load_system_host_keys()
if known_hosts.exists():
    client.load_host_keys(str(known_hosts))

class RecordFirstHostKey(paramiko.MissingHostKeyPolicy):
    def missing_host_key(self, ssh, hostname, key):
        fingerprint = base64.b64encode(hashlib.sha256(key.asbytes()).digest()).decode().rstrip('=')
        print(f'First SSH connection: {hostname} {key.get_name()} SHA256:{fingerprint}', flush=True)
        ssh.get_host_keys().add(hostname, key.get_name(), key)
        ssh.save_host_keys(str(known_hosts))

client.set_missing_host_key_policy(RecordFirstHostKey())
try:
    client.connect(host, username=os.environ['FC_VPS_USER'], password=os.environ['FC_VPS_PASSWORD'],
                   timeout=15, auth_timeout=15, banner_timeout=15, allow_agent=False, look_for_keys=False)
    if len(sys.argv) == 4 and sys.argv[1] == 'upload':
        with client.open_sftp() as sftp:
            sftp.put(sys.argv[2], sys.argv[3])
            sftp.chmod(sys.argv[3], 0o600)
        print('Upload complete', flush=True)
    else:
        command = sys.argv[1] if len(sys.argv) > 1 else sys.stdin.read()
        stdin, stdout, stderr = client.exec_command(command, timeout=600)
        stdin.close()
        for line in stdout:
            print(line, end='', flush=True)
        errors = stderr.read().decode('utf-8', errors='replace')
        if errors:
            print(errors, file=sys.stderr)
        sys.exit(stdout.channel.recv_exit_status())
finally:
    client.close()
