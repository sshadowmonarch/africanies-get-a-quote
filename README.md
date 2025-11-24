# Africanies Get a Quote - Automated Testing

This repository contains automated Playwright tests for the Africanies "Get a Quote" functionality.

## 🚀 Features

- Automated end-to-end testing of the quote request flow
- Network interception to ensure valid API payloads
- Scheduled runs via GitHub Actions (every 8 hours)
- Email notifications sent after every test run
- Automatic test reporting and artifact uploads
- Screenshots captured on test failures

## 📋 Prerequisites

- Node.js 20 or higher
- npm

## 🛠️ Local Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Africanies_get_a_quote
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Playwright browsers:
   ```bash
   npx playwright install chromium
   ```

4. Run the tests:
   ```bash
   npx playwright test
   ```

5. View the test report:
   ```bash
   npx playwright show-report
   ```

## 🤖 GitHub Actions

The tests run automatically:

- **On every push** to `main` or `master` branch
- **On pull requests** to `main` or `master` branch
- **Every 8 hours** starting at 6 AM UTC (6 AM, 2 PM, 10 PM)
- **Manually** via GitHub Actions UI (workflow_dispatch)

### 📧 Email Notifications

After each test run, an email is automatically sent to `armstrong.p@africanies.com` with:
- ✅ PASSED or ❌ FAILED status
- Link to full test report
- Repository and commit details
- Timestamp

**Setup Required:** You must configure `EMAIL_USERNAME` and `EMAIL_PASSWORD` secrets in GitHub repository settings. See `SETUP_GITHUB.md` for detailed instructions.

### Changing the Schedule

Edit `.github/workflows/playwright-test.yml` and modify the cron expression:

```yaml
schedule:
  - cron: '0 9 * * *'  # Daily at 9 AM UTC
```

Common schedules:
- Every 6 hours: `0 */6 * * *`
- Every Monday at 8 AM: `0 8 * * 1`
- Twice daily (9 AM and 5 PM): `0 9,17 * * *`

## 📊 Viewing Test Results

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. Select a workflow run
4. Download artifacts (reports and screenshots) if needed

## 🧪 Test Details

The test validates:
- Modal popup handling
- Address form filling
- Shipping box selection
- Item details entry
- Quote generation
- Multiple shipping options display
- Login screen navigation

### Network Interception

The test uses network interception to ensure all required fields are present in API requests, including:
- Receiver coordinates (latitude/longitude)
- Complete address details
- Postal codes

## 📁 Project Structure

```
.
├── .github/
│   └── workflows/
│       └── playwright-test.yml    # GitHub Actions workflow
├── tests/
│   └── getAQuote.spec.js         # Main test file
├── playwright.config.js           # Playwright configuration
├── package.json                   # Dependencies
└── README.md                      # This file
```

## 🔧 Configuration

Key settings in `playwright.config.js`:
- Test timeout: 90 seconds (for external site dependencies)
- Navigation timeout: 60 seconds
- Browser: Chromium only

## 📝 Notes

- The test interacts with live external services
- Network conditions may affect test duration
- Test reports are retained for 30 days in GitHub Actions
