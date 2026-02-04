# AI Agents & Workflow Automation Workshop

This project supports a hands-on workshop demonstrating how AI and workflow automation
can assist engineering, training, and IT governance workflows using n8n.

The focus is on:
- Engineering realism
- Structured outputs
- Governance-first AI usage

## Deploy n8n on an EC2 instance (daemon)

This section shows a simple, systemd-based deployment so n8n runs as a daemon on Ubuntu.

### 1) Provision EC2

- Launch an Ubuntu LTS instance (t3.small or larger recommended).
- Open inbound ports: `22` (SSH) and `5678` (n8n) or put it behind a reverse proxy (recommended for HTTPS).
- SSH into the instance.

### 2) Install Docker and Docker Compose

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
newgrp docker
```

### 3) Create a working directory

```bash
mkdir -p ~/n8n
cd ~/n8n
```

### 4) Create a docker-compose.yml

```yaml
version: "3.8"
services:
  n8n:
    image: n8nio/n8n:latest
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=your-domain-or-ip
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://your-domain-or-ip:5678/
      - GENERIC_TIMEZONE=UTC
    volumes:
      - n8n_data:/home/node/.n8n
volumes:
  n8n_data:
```

### 5) Start n8n

```bash
docker compose up -d
```

### 6) Run as a daemon with systemd

Create a systemd unit so n8n starts on boot and restarts automatically:

```bash
sudo tee /etc/systemd/system/n8n.service >/dev/null <<'EOF'
[Unit]
Description=n8n (Docker Compose)
After=network-online.target docker.service
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/n8n
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now n8n
```

Check status:

```bash
sudo systemctl status n8n
```

### 7) Secure the instance (recommended)

- Put n8n behind an HTTPS reverse proxy (e.g., Nginx + Let’s Encrypt).
- Set `N8N_PROTOCOL=https` and update `WEBHOOK_URL` accordingly.
- Restrict inbound access to the instance where possible.
