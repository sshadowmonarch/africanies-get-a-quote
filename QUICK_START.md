# Quick Start - Email Notifications Setup

## 3 Simple Steps to Get Running

### Step 1: Create Gmail App Password (5 min)
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification (if needed)
3. Find "App passwords" → Select "Mail" + "Other (GitHub Actions)"
4. Copy the 16-character password

### Step 2: Add GitHub Secrets (2 min)
1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** and add these 3 secrets:

| Secret Name | Value |
|---|---|
| `EMAIL_USERNAME` | Your Gmail address (e.g., `yourname@gmail.com`) |
| `EMAIL_PASSWORD` | The 16-character app password from Step 1 |
| `EMAIL_RECIPIENTS` | `armstrong.p@africanies.com` |

### Step 3: Push to GitHub
```bash
cd ~/Desktop/Africanies_get_a_quote
git add .
git commit -m "Enable email notifications"
git push
```

## ✅ Done!
- Tests will run automatically on push, every 8 hours, or manually via Actions tab
- Email reports will arrive at `armstrong.p@africanies.com`

## 🔄 Add More Recipients Later
Just update the `EMAIL_RECIPIENTS` secret in GitHub Settings:
- `armstrong.p@africanies.com,team@africanies.com`

---
See `EMAIL_SETUP.md` for detailed troubleshooting and advanced options.
