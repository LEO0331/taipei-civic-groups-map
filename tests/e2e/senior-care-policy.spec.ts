import { test, expect } from '@playwright/test';
for (const language of ['zh','en']) for (const width of [320,390,768,1024,1440]) {
 test(`policy ${language} at ${width}px`,async({page},testInfo)=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text())});
  const requests:string[]=[];page.on('request',r=>requests.push(r.url()));
  await page.setViewportSize({width,height:900});
  await page.goto(`?dataset=seniorCarePolicy&lang=${language}`);
  await expect(page.locator('.senior-policy')).toBeVisible();
  await expect(page.locator('.senior-policy .summary-grid strong').first()).toHaveText('520');
  await expect(page.locator('.senior-policy .summary-grid strong').nth(2)).toHaveText('88');
  await expect(page.locator('[aria-label="Selected investigation records"], [aria-label="已選取查核紀錄"]').locator('tbody tr')).toHaveCount(5);
  const labels=language==='zh'?['模式','查核名額','選取策略']:['Mode','Review capacity','Selection strategy'];
  await page.getByRole('combobox',{name:labels[0],exact:true}).selectOption('B');
  await page.getByRole('combobox',{name:labels[1],exact:true}).selectOption('10');
  await page.getByRole('combobox',{name:labels[2],exact:true}).selectOption('balanced');
  await expect(page.locator('[aria-label="Selected investigation records"], [aria-label="已選取查核紀錄"]').locator('tbody tr')).toHaveCount(10);
  await page.locator('[aria-label="Selected investigation records"], [aria-label="已選取查核紀錄"]').getByRole('button').first().click();
  await expect(page.locator('.policy-detail')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  expect(errors).toEqual([]);
  expect(requests.filter(r=>/dosw\.gov|laws\.gov|\.pdf(?:\?|$)/.test(r))).toEqual([]);
  await page.screenshot({path:testInfo.outputPath(`policy-${language}-${width}.png`),fullPage:true});
 });
}
test('policy export and integrity retry retain source provenance',async({page})=>{
 let fail=true;
 await page.route('**/policy/senior-care-policy/current.json',async route=>{if(fail)await route.fulfill({status:503,body:'unavailable'});else await route.continue()});
 await page.goto('?dataset=seniorCarePolicy&lang=en');
 await expect(page.locator('.senior-policy').getByRole('alert')).toBeVisible();
 fail=false;await page.locator('.senior-policy').getByRole('button',{name:'Retry',exact:true}).click();
 await expect(page.locator('.senior-policy .summary-grid strong').first()).toHaveText('520');
 const pending=page.waitForEvent('download');
 await page.locator('.senior-policy').getByRole('button',{name:'JSON',exact:true}).click();
 const download=await pending;expect(download.suggestedFilename()).toContain('administrative-briefing-A.json');
 const stream=await download.createReadStream();const chunks:Buffer[]=[];for await(const chunk of stream!)chunks.push(chunk);
 const briefing=JSON.parse(Buffer.concat(chunks).toString());expect(briefing.scenario.used).toBe(5);expect(briefing.sources.length).toBe(4);
 expect(briefing.scenario.selected[0].editionHash).toMatch(/^[a-f0-9]{64}$/);
 await page.getByRole('combobox',{name:'Source association scope',exact:true}).selectOption('pdf');
 await page.getByRole('combobox',{name:'Issue scope',exact:true}).selectOption('primary');
 await expect(page.locator('[aria-label="Selected investigation records"], [aria-label="已選取查核紀錄"]').locator('tbody tr')).toHaveCount(0);
});
test('corrupted policy content is withheld',async({page})=>{
 await page.route('**/policy/senior-care-policy/snapshot-*.json',route=>route.fulfill({status:200,contentType:'application/json',body:'{}'}));
 await page.goto('?dataset=seniorCarePolicy&lang=en');await expect(page.locator('.senior-policy').getByRole('alert')).toBeVisible();
 await expect(page.locator('.senior-policy .summary-grid')).toHaveCount(0);
});
