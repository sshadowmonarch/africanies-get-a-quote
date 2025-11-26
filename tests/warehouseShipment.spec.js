import { test, expect } from '@playwright/test';

test('Nigeria to Delaware Warehouse Shipment Test', async ({ page }) => {
  // Increase timeout for this test due to external site dependencies
  test.setTimeout(90000);
  
  await page.goto('https://www.africanies.com/');
  
  // Close modal if it appears
  try {
    await expect(page.locator('.closeLPModal')).toBeVisible({ timeout: 5000 });
    await page.locator('.closeLPModal').click();
  } catch (e) {
    // Modal might not appear, continue
  }

  await expect(page.getByRole('link', { name: 'Get Quote' })).toBeVisible();
  const page1Promise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'Get Quote' }).click();
  const page1 = await page1Promise;
  
  // Wait for the popup page to load completely
  await page1.waitForLoadState('domcontentloaded');
  
  // Wait for sender address field to be visible (first address textbox is sender)
  await expect(page1.getByRole('textbox', { name: 'Enter Address' }).first()).toBeVisible({ timeout: 15000 });
  
  // Fill in sender address (Nigeria) - this is the FIRST address textbox
  await page1.getByRole('textbox', { name: 'Enter Address' }).first().click();
  await page1.getByRole('textbox', { name: 'Enter Address' }).first().fill('11 Ajibade Oke');
  
  // Wait for Google address autocomplete and select first option
  await page1.waitForTimeout(2000);
  await page1.keyboard.press('ArrowDown');
  await page1.keyboard.press('Enter');
  await page1.waitForTimeout(1000);
  
  // Look for and click "My Africanies Warehouse" option for receiver
  // This might be a radio button, checkbox, or clickable text
  try {
    const warehouseOption = page1.getByText('My Africanies Warehouse', { exact: false });
    if (await warehouseOption.isVisible({ timeout: 10000 })) {
      await warehouseOption.click();
    } else {
      throw new Error('My Africanies Warehouse text not visible');
    }
  } catch (e) {
    // Try alternative selectors with shorter, explicit timeouts to avoid long hangs
    const fallbackLocator = page1
      .locator('[value*="warehouse"], input[type="radio"][value*="warehouse"]')
      .first();
    const canSeeFallback = await fallbackLocator.isVisible({ timeout: 5000 }).catch(() => false);
    if (canSeeFallback) {
      await fallbackLocator.click();
    } else {
      throw new Error('Warehouse selection UI not found by any known locator');
    }
  }
  await page1.waitForTimeout(1000);
  
  // Select Delaware warehouse from dropdown
  try {
    // Try to find a select/combobox with warehouse options
    const warehouseSelect = page1.locator('select').filter({ has: page1.locator('option:has-text("Delaware")') }).first();
    if (await warehouseSelect.count() > 0) {
      await warehouseSelect.selectOption({ label: /delaware/i });
    } else {
      // Try clicking Delaware text directly
      await page1.getByText('Delaware', { exact: false }).first().click();
    }
  } catch (e) {
    console.log('Warehouse selection might use different UI element');
  }
  
  // Wait for box dimensions to load
  await expect(page1.getByText('Length: 31 inchesWidth: 16')).toBeVisible({ timeout: 10000 });
  
  // Fill item details
  await page1.getByRole('textbox', { name: 'Enter Item name' }).click();
  await page1.getByRole('textbox', { name: 'Enter Item name' }).fill('electronics');
  await page1.getByPlaceholder('Enter Weight').click();
  await page1.getByPlaceholder('Enter Weight').fill('15');
  await page1.getByPlaceholder('Enter Quantity').click();
  await page1.getByPlaceholder('Enter Quantity').fill('3');
  await page1.getByPlaceholder('Enter Item Value').click();
  await page1.getByPlaceholder('Enter Item Value').fill('200000');
  
  // Scroll to and click Get Quote button
  const getQuoteButton = page1.getByRole('button', { name: 'Get Quote' });
  await getQuoteButton.scrollIntoViewIfNeeded();
  await page1.waitForTimeout(500);
  await getQuoteButton.click();
  
  // Wait for backend quote API response and validate status
  const quoteApiResponse = await page1.waitForResponse(
    (resp) => resp.url().includes('/api/') && resp.url().includes('quote') && resp.request().method() === 'POST',
    { timeout: 30000 }
  );
  expect(quoteApiResponse.status()).toBeGreaterThanOrEqual(200);
  expect(quoteApiResponse.status()).toBeLessThan(400);

  // Parse and validate response body
  const responseBody = await quoteApiResponse.json();
  console.log('\n=== Warehouse Shipment API Response ===');
  console.log(JSON.stringify(responseBody, null, 2));
  
  // Validate that response contains data array with shipping options
  expect(responseBody).toHaveProperty('data');
  expect(Array.isArray(responseBody.data)).toBeTruthy();
  expect(responseBody.data.length).toBeGreaterThan(0);
  
  // Check first shipping option
  const firstOption = responseBody.data[0];
  
  console.log('\n=== Warehouse Shipment Field Validation ===');
  
  // Fields that SHOULD be > 0 for warehouse shipments from Nigeria
  expect(firstOption).toHaveProperty('vat');
  expect(parseFloat(firstOption.vat)).toBeGreaterThan(0);
  console.log(`✅ vat: ${firstOption.vat} (> 0 - shipping FROM Nigeria)`);
  
  expect(firstOption).toHaveProperty('insurance_cost');
  expect(parseFloat(firstOption.insurance_cost)).toBeGreaterThan(0);
  console.log(`✅ insurance_cost: ${firstOption.insurance_cost}`);
  
  expect(firstOption).toHaveProperty('total_amount');
  expect(parseFloat(firstOption.total_amount)).toBeGreaterThan(0);
  console.log(`✅ total_amount: ${firstOption.total_amount}`);
  
  expect(firstOption).toHaveProperty('service_shipment_cost');
  expect(parseFloat(firstOption.service_shipment_cost)).toBeGreaterThan(0);
  console.log(`✅ service_shipment_cost: ${firstOption.service_shipment_cost}`);
  
  expect(firstOption).toHaveProperty('initial_service_shipment_cost');
  expect(parseFloat(firstOption.initial_service_shipment_cost)).toBeGreaterThan(0);
  console.log(`✅ initial_service_shipment_cost: ${firstOption.initial_service_shipment_cost}`);
  
  // Fields that SHOULD be 0 or not exist for warehouse shipments
  if (firstOption.last_mile_delivery_cost !== undefined) {
    expect(parseFloat(firstOption.last_mile_delivery_cost)).toBe(0);
    console.log(`✅ last_mile_delivery_cost: ${firstOption.last_mile_delivery_cost} (0 - warehouse shipment)`);
  } else {
    console.log(`✅ last_mile_delivery_cost: not present (warehouse shipment)`);
  }
  
  if (firstOption.shippo_cost !== undefined) {
    expect(parseFloat(firstOption.shippo_cost)).toBe(0);
    console.log(`✅ shippo_cost: ${firstOption.shippo_cost} (0 - warehouse shipment)`);
  } else {
    console.log(`✅ shippo_cost: not present (warehouse shipment)`);
  }
  console.log('=== All Warehouse Shipment Fields Validated ===\\n');

  // Log all shipping methods and their raw cost fields for email reporting
  console.log(`\n=== Validating ${responseBody.data.length} Warehouse Shipping Methods ===\n`);
  for (let i = 0; i < responseBody.data.length; i++) {
    const method = responseBody.data[i];
    console.log(`\n--- METHOD ${i + 1}: ${method.name} ---`);
    const fieldsToCheck = [
      'last_mile_delivery_cost',
      'shippo_cost',
      'insurance_cost',
      'vat',
      'total_amount',
      'service_shipment_cost',
      'initial_service_shipment_cost',
    ];
    fieldsToCheck.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(method, field)) {
        const value = parseFloat(method[field]);
        const status = value > 0 ? '✅' : '❌';
        console.log(`${status} ${field}: ${method[field]}`);
      } else {
        console.log(`❌ ${field}: NOT PRESENT`);
      }
    });
  }

  // Log shipment metadata for email report generation
  console.log('MODE: Ship from Nigeria to Delaware Warehouse');
  console.log('SHIPMENT_FROM: 11 Ajibade Oke, Nigeria');
  console.log('SHIPMENT_TO: Delaware Warehouse');

  // Wait for quote results
  await page1.waitForSelector('button:has-text("Select")', { timeout: 30000 });
  await page1.getByRole('button', { name: 'Select' }).first().click();
  await expect(page1.getByRole('heading', { name: 'Login To Your Nigerian Account' })).toBeVisible({ timeout: 10000 });
  
  // Log final summary
  console.log('\\n=== Warehouse Shipment API Validation Summary ===');
  console.log(`✅ Quote API Response Status: ${quoteApiResponse.status()} (${quoteApiResponse.statusText()})`);
  console.log(`✅ 5 cost fields > 0 (vat, insurance, total, service costs)`);
  console.log(`✅ 2 cost fields = 0 or absent (last_mile, shippo)`);
  console.log(`✅ All warehouse shipment validations passed`);
  console.log('=== End API Validation ===\\n');
});
