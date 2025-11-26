const fs = require('fs');
const path = require('path');

// Read the test results from playwright JSON reporter
const resultsPath = path.join(__dirname, 'test-results.json');

if (!fs.existsSync(resultsPath)) {
  console.log('No test results found. Using default report.');
  process.exit(0);
}

const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));

// Collect stdout text for a single spec
function collectStdoutForSpec(spec) {
  let output = '';
  for (const test of spec.tests || []) {
    for (const result of test.results || []) {
      for (const item of result.stdout || []) {
        if (typeof item.text === 'string') {
          output += item.text;
        }
      }
    }
  }
  return output;
}

// Determine pass/fail for a single spec
function statusForSpec(spec) {
  for (const test of spec.tests || []) {
    for (const result of test.results || []) {
      if (result.status !== 'passed') {
        return '❌ FAILED';
      }
    }
  }
  return '✅ PASSED';
}

let emailBody = '';

const suites = results.suites || [];
let scenarioCount = 0;

for (const suite of suites) {
  for (const spec of suite.specs || []) {
    scenarioCount += 1;

    const consoleOutput = collectStdoutForSpec(spec);
    const modeMatch = consoleOutput.match(/MODE:\s*(.+)/);
    const shipmentFromMatch = consoleOutput.match(/SHIPMENT_FROM:\s*(.+)/);
    const shipmentToMatch = consoleOutput.match(/SHIPMENT_TO:\s*(.+)/);

    // Fallbacks if logs are missing
    const isWarehouseSpec =
      /warehouse/i.test(spec.title || '') ||
      /warehouse/i.test(suite.title || '') ||
      /warehouse/i.test(modeMatch ? modeMatch[1] : '');

    const mode = modeMatch
      ? modeMatch[1].trim()
      : isWarehouseSpec
      ? 'Ship from Nigeria to Warehouse'
      : 'Ship from Nigeria to US Address';

    const shipmentFrom = shipmentFromMatch
      ? shipmentFromMatch[1].trim()
      : 'Nigeria (sender address from form)';

    const shipmentTo = shipmentToMatch
      ? shipmentToMatch[1].trim()
      : isWarehouseSpec
      ? 'Delaware Warehouse'
      : '1600 Amphitheatre Parkway, Mountain View, CA 94043, USA';

    const summaryVariant = isWarehouseSpec ? 'Ship to warehouse' : 'Ship to address';
    const statusText = statusForSpec(spec);

    if (scenarioCount > 1) {
      emailBody += '\n========================\n\n';
    }

    emailBody += `GET A QUOTE TEST SUMMARY : ${summaryVariant}\n========================\n\n` +
      `Status: ${statusText}\n\n` +
      `Mode: ${mode}\n` +
      `Shipment from: ${shipmentFrom}\n` +
      `Shipment to: ${shipmentTo}\n\n`;

    // Parse console logs to extract shipping method information for this spec
    const methodMatches = consoleOutput.match(/--- METHOD \d+: (.+?) ---/g) || [];

    if (methodMatches.length > 0) {
      emailBody += `Returned ${methodMatches.length} shipping methods\n\n---\n\n`;

      // Extract each method's details
      const methodSections = consoleOutput.split(/--- METHOD \d+:/);

      for (let i = 1; i < methodSections.length; i++) {
        const section = methodSections[i];
        const nameMatch = section.match(/^(.+?) ---/);
        const methodName = nameMatch ? nameMatch[1].trim() : `Method ${i}`;

        emailBody += `METHOD ${i}: ${methodName}\n`;

        const fields = [
          'last_mile_delivery_cost',
          'shippo_cost',
          'insurance_cost',
          'vat',
          'total_amount',
          'service_shipment_cost',
          'initial_service_shipment_cost',
        ];

        fields.forEach((field) => {
          const regex = new RegExp(`(✅|❌) ${field}: ([\\d.]+|NOT PRESENT)`, 'i');
          const match = section.match(regex);
          if (match) {
            const status = match[1];
            const value = match[2];
            emailBody += `${status} ${field}: ${value}\n`;
          }
        });

        emailBody += `\n`;
      }
    } else {
      emailBody += `No shipping methods data available\n\n`;
    }

    emailBody += `---\n\nTime: ${new Date().toISOString()}\n`;
  }
}

if (!scenarioCount) {
  emailBody = `GET A QUOTE TEST SUMMARY\n========================\n\nStatus: ❌ FAILED\n\nNo tests found in test-results.json\n\nTime: ${new Date().toISOString()}\n`;
}

// Write to file for GitHub Actions to read
fs.writeFileSync(path.join(__dirname, 'email-body.txt'), emailBody);
console.log('Email report generated successfully');
