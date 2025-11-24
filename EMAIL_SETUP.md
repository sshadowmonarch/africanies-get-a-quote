# Email Notification Setup - Quick Guide

## 📧 What You Get

After pushing to GitHub and configuring secrets, you'll receive automated emails to **armstrong.p@africanies.com** containing:

- ✅ **PASSED** or ❌ **FAILED** status in subject line
- Test run details (repository, branch, commit)
- Direct link to full GitHub Actions report
- Timestamp of test execution
- Sent after **every test run** (3 times daily + on code push)

## ⚙️ Setup Steps (5 minutes)

### Option 1: Using Gmail (Recommended)

1. **Create Gmail App Password:**
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification (if not already enabled)
   - Click "App passwords"
   - Select "Mail" and "Other (GitHub Actions)"
   - Copy the 16-character password

2. **Add Secrets to GitHub:**
   - Go to your repository on GitHub
   - Navigate: **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   
   Add these three secrets:
   
   | Secret Name | Value |
   |------------|-------|
   | `EMAIL_USERNAME` | Your Gmail address (e.g., `yourname@gmail.com`) |
   | `EMAIL_PASSWORD` | The 16-character app password from step 1 |
   | `EMAIL_RECIPIENTS` | Comma-separated emails (e.g., `armstrong.p@africanies.com,other@africanies.com`) |

3. **Done!** Test it by manually triggering the workflow.

### Option 2: Using Zoho Mail

If you want to send from an `@africanies.com` email:

1. **Update the workflow file** (`.github/workflows/playwright-test.yml`):
   
   Change lines 65-68 to:
   ```yaml
   server_address: smtp.zoho.com
   server_port: 587
   username: ${{ secrets.EMAIL_USERNAME }}
   password: ${{ secrets.EMAIL_PASSWORD }}
   ```

2. **Add secrets to GitHub:**
   
   | Secret Name | Value |
   |------------|-------|
   | `EMAIL_USERNAME` | Your Zoho email (e.g., `noreply@africanies.com`) |
   | `EMAIL_PASSWORD` | Your Zoho email password |
   | `EMAIL_RECIPIENTS` | Comma-separated emails (e.g., `armstrong.p@africanies.com,other@africanies.com`) |

3. **Commit and push** the workflow file changes.

## 🧪 Test Email Notification

After setup:

1. Go to **Actions** tab in your GitHub repository
2. Select "Playwright Tests" workflow
3. Click **Run workflow** → **Run workflow**
4. Wait ~2 minutes
5. Check armstrong.p@africanies.com inbox

## 📋 Email Example

```
Subject: Playwright Test Results - ✅ PASSED

Test Run Summary
================

Status: ✅ PASSED
Repository: YourOrg/africanies-quote-automation
Branch: main
Commit: abc123def456
Workflow: Playwright Tests
Run Number: 42
Triggered by: schedule

View full report:
https://github.com/YourOrg/africanies-quote-automation/actions/runs/123456

Time: 2025-11-24T06:00:00Z

---
This is an automated message from Africanies Test Automation
```

## 🔒 Security Notes

- Gmail app passwords are safer than using your actual password
- Secrets are encrypted in GitHub and never exposed in logs
- Only repository admins can view/edit secrets
- Consider using a dedicated email account for automation

## 🛠️ Troubleshooting

**Email not received?**
- Check spam/junk folder
- Verify secrets are set correctly in GitHub Settings
- Check GitHub Actions logs for email sending errors
- Ensure 2FA is enabled if using Gmail

**Using company email server?**
- Contact your IT department for SMTP settings
- You may need to whitelist GitHub Actions IP addresses
- Some servers require TLS on port 465 instead of 587

## 📝 Customization

**Change or add recipient emails:**
No code changes needed! Simply update the `EMAIL_RECIPIENTS` secret in GitHub:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **EMAIL_RECIPIENTS** and edit the value
3. Use comma-separated emails: `armstrong.p@africanies.com,other@africanies.com,team@africanies.com`
4. Commit any code changes if needed - the workflow will use the updated secret immediately

**Send only on failure:**
Edit `.github/workflows/playwright-test.yml` line 62 from `if: always()` to:
```yaml
if: failure()
```
