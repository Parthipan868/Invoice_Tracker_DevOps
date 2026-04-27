# Frontend CI/CD Pipeline — Complete Step-by-Step Guide
### Invoice Tracker React App → Docker → Jenkins → Docker Hub

---

## Files Used in This Setup

| File | Purpose |
|---|---|
| `Dockerfile.frontend` | Builds React app (Stage 1) then serves it via Nginx (Stage 2) |
| `nginx.conf` | Nginx config — handles React Router, caching, compression |
| `Jenkinsfile` | 5-stage Jenkins pipeline: Checkout → Build → Push → Deploy → Health Check |
| `Dockerfile` | Full-stack file (backend + frontend together) — NOT used for this setup |

---

## PHASE 1 — Set Up Docker

### Step 1 — Check if Docker is already installed

Open a terminal and type:

```bash
docker --version
```

- See `Docker version 24.x.x` → **skip to Phase 2**
- Get "command not found" → continue to Step 2

---

### Step 2 — Install Docker on Ubuntu/Linux

Run each line one at a time in your terminal:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io
```

**On Windows — Install Docker Desktop:**
1. Go to https://www.docker.com/products/docker-desktop
2. Download and install Docker Desktop
3. Restart your computer
4. Open Docker Desktop → wait for "Engine running"

---

### Step 3 — Verify Docker works

```bash
docker run hello-world
# Should print: Hello from Docker!
```

---

## PHASE 2 — Set Up Docker Hub

### Step 4 — Create a Docker Hub account

1. Open browser → go to **https://hub.docker.com**
2. Click **"Sign Up"**
3. Use username `abiram08` (must match the Jenkinsfile)
4. Verify your email

### Step 5 — Create a Docker Hub Access Token

1. Log in to https://hub.docker.com
2. Click profile picture (top right) → **"Account Settings"**
3. Click **"Security"** in the left sidebar
4. Click **"New Access Token"**
5. Description: `jenkins-ci`
6. Permissions: `Read, Write, Delete`
7. Click **"Generate"**
8. **COPY THE TOKEN NOW** — you cannot see it again
9. Save it in Notepad or a password manager

---

## PHASE 3 — Install Jenkins

### Step 6 — Install Java

```bash
sudo apt install -y openjdk-17-jdk

# Verify
java -version
# Should print: openjdk version "17.x.x"
```

### Step 7 — Install Jenkins

Run each line one at a time:

```bash
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null

sudo apt-get update

sudo apt-get install -y jenkins
```

### Step 8 — Start Jenkins

```bash
sudo systemctl enable jenkins
sudo systemctl start jenkins

# Confirm it's running
sudo systemctl status jenkins
# Should say: Active: active (running)
```

### Step 9 — Open Jenkins in browser

- **Local PC:** go to `http://localhost:8080`
- **Remote VM:** go to `http://<your-server-ip>:8080`

You will see the **"Unlock Jenkins"** page.

### Step 10 — Get the initial admin password

In your terminal:
```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```
Copy the long string it prints.

### Step 11 — Finish Jenkins setup in browser

1. Paste the password into the "Administrator password" box → click **"Continue"**
2. Click **"Install suggested plugins"** — wait for all green checkmarks (~3 min)
3. Fill in the form:
   - Username: `admin`
   - Password: something memorable
   - Full name: your name
   - Email: your email
4. Click **"Save and Continue"** → **"Save and Finish"** → **"Start using Jenkins"**

You are now inside Jenkins.

---

## PHASE 4 — Configure Jenkins

### Step 12 — Install the Docker Pipeline plugin

1. Click **"Manage Jenkins"** (left sidebar)
2. Click **"Plugins"**
3. Click **"Available plugins"** tab
4. Search: `Docker Pipeline`
5. Check the checkbox next to **Docker Pipeline**
6. Click **"Install"** (top right)
7. Wait for green checkmarks
8. Check **"Restart Jenkins when installation is complete"**
9. Wait for restart → log back in

### Step 13 — Allow Jenkins to run Docker commands

In your terminal on the server:

```bash
# Add jenkins user to the docker group
sudo usermod -aG docker jenkins

# Restart Jenkins
sudo systemctl restart jenkins

# Verify it worked
sudo su - jenkins -s /bin/bash -c "docker ps"
# Should show an empty table, NOT an error
```

### Step 14 — Add Docker Hub credentials in Jenkins

1. Click **"Manage Jenkins"** → **"Credentials"**
2. Click **"System"**
3. Click **"Global credentials (unrestricted)"**
4. Click **"Add Credentials"** (top right)
5. Fill in:
   - **Kind:** `Username with password`
   - **Username:** `abiram08` ← your Docker Hub username
   - **Password:** paste the Access Token from Step 5
   - **ID:** `dockerhub-credentials` ← type exactly this
   - **Description:** `Docker Hub Access Token`
6. Click **"Create"**

---

## PHASE 5 — Push Code to GitHub

### Step 15 — Commit all CI/CD files

Open a terminal in your project folder and run:

```bash
git add Dockerfile Dockerfile.frontend nginx.conf Jenkinsfile

git commit -m "feat: add frontend Docker and Jenkins CI/CD pipeline"

git push origin main
```

Go to https://github.com/Abiram08/Invoice-Generator-Tracker and confirm all 4 files are there.

---

## PHASE 6 — Create a Jenkins Pipeline Job

### Step 16 — Create new pipeline

1. Click **"New Item"** (left sidebar in Jenkins)
2. Name: `invoice-frontend-pipeline`
3. Click **"Pipeline"**
4. Click **"OK"**

### Step 17 — Configure the job

**General section:**
- Check **"Discard old builds"**
- Max # of builds to keep: `5`

**Pipeline section:**
- Definition → select **"Pipeline script from SCM"**
- SCM → select **"Git"**
- Repository URL: `https://github.com/Abiram08/Invoice-Generator-Tracker`
- Credentials: `- none -` (public repo)
- Branch: `*/main`
- Script Path: `Jenkinsfile`

Click **"Save"**

---

## PHASE 7 — Run the Pipeline

### Step 18 — Trigger your first build

1. You are on the pipeline's main page
2. Click **"Build Now"** (left sidebar)
3. A new item appears under "Build History" — click it
4. Click **"Console Output"**

### Step 19 — What to look for in Console Output

```
📥 Cloning repository from GitHub...      ← Stage 1 done
🔨 Building frontend image...             ← Stage 2 building
🚀 Pushing image to Docker Hub...         ← Stage 3 pushing
▶️  Starting new container...             ← Stage 4 deploying
✅ Frontend is live at http://localhost:3000  ← ALL DONE

Finished: SUCCESS
```

### Step 20 — Verify on Docker Hub

1. Go to https://hub.docker.com → **"Repositories"**
2. You should see: `abiram08/invoice-tracker-frontend`
3. Tags inside: `1` and `latest`

### Step 21 — View the running app

```bash
# See running containers
docker ps

# Open in browser
http://localhost:3000
```

---

## PHASE 8 — Test the Full CI/CD Loop

### Step 22 — Push a code change and watch it auto-deploy

1. Change any file in `src/` (e.g., add a comment to `src/App.js`)
2. Save the file
3. In terminal:
   ```bash
   git add .
   git commit -m "test: trigger CI/CD pipeline"
   git push origin main
   ```
4. Go to Jenkins → click **"Build Now"**
5. Watch it build and deploy automatically

---

## Pipeline Flow Diagram

```
You run: git push origin main
        │
        ▼
Jenkins (Build Now or Webhook)
        │
        ├─ Stage 1: CHECKOUT
        │   └── git clone https://github.com/Abiram08/Invoice-Generator-Tracker
        │
        ├─ Stage 2: BUILD
        │   └── docker build -f Dockerfile.frontend .
        │        ├── Stage A → npm ci + npm run build  (React → /app/build)
        │        └── Stage B → nginx:alpine + COPY build → /usr/share/nginx/html
        │
        ├─ Stage 3: PUSH
        │   ├── docker push abiram08/invoice-tracker-frontend:5
        │   └── docker push abiram08/invoice-tracker-frontend:latest
        │
        ├─ Stage 4: DEPLOY
        │   ├── docker stop invoice-frontend  (removes old)
        │   └── docker run -d -p 3000:80 ...  (starts new)
        │
        └─ Stage 5: HEALTH CHECK
            └── curl http://localhost:3000  ✅
```

---

## Troubleshooting

| Error | Fix |
|---|---|
| `permission denied while trying to connect to Docker daemon` | Run `sudo usermod -aG docker jenkins` then `sudo systemctl restart jenkins` |
| `invalid reference format` | `DOCKERHUB_USERNAME` in Jenkinsfile doesn't match your actual Docker Hub username |
| `unauthorized: authentication required` | The credential ID in Jenkins isn't `dockerhub-credentials`, or the token is wrong |
| `npm ci` fails | Run `npm install --legacy-peer-deps` locally, commit the updated `package-lock.json` |
| `curl: (7) Failed to connect` | Container crashed — run `docker logs invoice-frontend` to see why |
| Pipeline doesn't start | Make sure `Jenkinsfile` exists at the root of your GitHub repo |

---

## Quick Checklist Before Running

- [ ] Replace `abiram08` in `Jenkinsfile` with your actual Docker Hub username
- [ ] All 4 files committed and pushed to GitHub: `Dockerfile`, `Dockerfile.frontend`, `nginx.conf`, `Jenkinsfile`
- [ ] Docker installed and working (`docker --version`)
- [ ] Jenkins installed and running on port 8080
- [ ] Docker Pipeline plugin installed in Jenkins
- [ ] `jenkins` user added to `docker` group (`sudo usermod -aG docker jenkins`)
- [ ] `dockerhub-credentials` added in Jenkins Credentials store
- [ ] Pipeline job created pointing to your GitHub repo
- [ ] Click **Build Now** and watch Console Output
