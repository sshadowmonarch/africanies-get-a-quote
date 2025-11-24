# GitHub Setup Instructions

## Option 1: Push to New Repository

### 1. Initialize Git (if not already initialized)
```bash
cd ~/Desktop/Africanies_get_a_quote
git init
```

### 2. Add all files
```bash
git add .
```

### 3. Commit changes
```bash
git commit -m "Initial commit: Automated Playwright tests with GitHub Actions"
```

### 4. Create repository on GitHub
- Go to https://github.com/new
- Repository name: `africanies-quote-automation` (or your preferred name)
- Choose organization or personal account
- Make it **Private** or **Public** based on your needs
- Do NOT initialize with README (we already have one)
- Click "Create repository"

### 5. Link and push to GitHub
```bash
# Replace YOUR_ORG_OR_USERNAME with actual organization/username
git remote add origin https://github.com/YOUR_ORG_OR_USERNAME/africanies-quote-automation.git
git branch -M main
git push -u origin main
```

## Option 2: Push to Existing Organization Repository

### 1. Create repository in organization
- Go to your organization on GitHub
- Click "New repository"
- Repository name: `africanies-quote-automation`
- Make it Private
- Do NOT initialize with README
- Click "Create repository"

### 2. Initialize and push from local
```bash
cd ~/Desktop/Africanies_get_a_quote

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Automated Playwright tests with GitHub Actions"

# Add remote (replace YOUR_ORG_NAME with actual org name)
git remote add origin https://github.com/YOUR_ORG_NAME/africanies-quote-automation.git

# Push to main branch
git branch -M main
git push -u origin main
```

## Verify GitHub Actions Setup

After pushing:

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. You should see the "Playwright Tests" workflow
4. **IMPORTANT: Configure email secrets first** (see below)
5. Click **Run workflow** > **Run workflow** to test it manually
6. Wait for it to complete and check the results

## Configure Email Notifications

### Step 1: Set up a Gmail App Password (Recommended)

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** > **2-Step Verification** (enable if not already)
3. Scroll down to **App passwords**
4. Create a new app password:
   - App: "Mail"
   - Device: "GitHub Actions"
5. Copy the generated 16-character password

### Step 2: Add Secrets to GitHub Repository

1. Go to your repository on GitHub
2. Click **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add two secrets:

   **Secret 1:**
   - Name: `EMAIL_USERNAME`
   - Value: Your Gmail address (e.g., `yourname@gmail.com`)
   
   **Secret 2:**
   - Name: `EMAIL_PASSWORD`
   - Value: The 16-character app password from Step 1

5. Click **Add secret** for each

### Alternative: Use Organization Email

If you prefer to use your organization's email (e.g., Zoho Mail, Office 365):

**For Zoho Mail:**
```yaml
server_address: smtp.zoho.com
server_port: 587
username: your-email@africanies.com
password: your-password
```

**For Office 365:**
```yaml
server_address: smtp.office365.com
server_port: 587
username: your-email@company.com
password: your-password
```

Then update `.github/workflows/playwright-test.yml` with the correct SMTP settings.

## Configure Schedule (Optional)

The workflow is currently set to run daily at 9 AM UTC. To change:

1. Edit `.github/workflows/playwright-test.yml`
2. Modify the cron expression under `schedule:`
3. Commit and push changes

### Common Cron Schedules

```yaml
# Every hour
- cron: '0 * * * *'

# Every 6 hours
- cron: '0 */6 * * *'

# Every day at 2 PM UTC
- cron: '0 14 * * *'

# Every Monday at 9 AM UTC
- cron: '0 9 * * 1'

# Twice daily: 9 AM and 5 PM UTC
- cron: '0 9,17 * * *'
```

## Troubleshooting

### Authentication Issues
If you encounter authentication issues when pushing:

1. Use GitHub CLI:
   ```bash
   brew install gh
   gh auth login
   gh repo create africanies-quote-automation --private --source=. --push
   ```

2. Or use SSH:
   ```bash
   # Set up SSH key if not already done
   ssh-keygen -t ed25519 -C "your_email@example.com"
   
   # Add to GitHub: Settings > SSH Keys
   
   # Change remote to SSH
   git remote set-url origin git@github.com:YOUR_ORG_NAME/africanies-quote-automation.git
   git push -u origin main
   ```

### Workflow Not Running
- Check that the workflow file is in `.github/workflows/` directory
- Ensure the repository has Actions enabled (Settings > Actions > General)
- Verify the YAML syntax is correct

## Next Steps

After setup:
- ✅ Tests will run automatically on schedule
- ✅ Tests will run on every push to main
- ✅ You can run tests manually from Actions tab
- ✅ Test reports are saved as artifacts for 30 days
- ✅ Screenshots saved on failures
