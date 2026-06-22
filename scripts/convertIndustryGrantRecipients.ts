import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import { buildIndustryGrantSummary, normalizeGrantDistrict, parseNtdAmount, parseRocDate } from '../src/lib/industryGrants';
import { normalizeColumnName, normalizeText } from '../src/lib/civicGroups';
import type { IndustryGrantRecipient } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/industry-grant-recipients');
const outputDir = join(process.cwd(), 'public/data');
const reportPath = join(outputDir, 'conversion-report.json');
const source = '臺北市產業發展獎勵補助計畫獲獎勵補助廠商基本資料';

function decodeCsv(bytes: Uint8Array) {
  try {
    return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8' };
  } catch {
    return { text: new TextDecoder('big5', { fatal: true }).decode(bytes), encoding: 'CP950 / Big5-compatible' };
  }
}

export async function convertIndustryGrantRecipients(filePath?: string) {
  const csvFile = filePath ? undefined : (await readdir(rawDir)).find((file) => file.toLowerCase().endsWith('.csv'));
  if (!filePath && !csvFile) throw new Error('No industry grant CSV found. Run npm run data:fetch:industry-grants.');
  const inputPath = filePath ?? join(rawDir, csvFile!);
  const { text, encoding } = decodeCsv(await readFile(inputPath));
  const [rawHeaders, ...rows] = parseCsv(text);
  if (!rawHeaders) throw new Error('Invalid industry grant CSV: file is empty.');
  const headers = rawHeaders.map(normalizeColumnName);
  const required = ['獲補助年度', '領域', '公司名稱', '計畫名稱', '負責人姓名', '登記地址-行政區', '核定日期', '計畫起始日', '計畫到期日', '核定補助款-元', '自籌款-元', '總經費-元', '產業類別-大類', '資本額-申請時'];
  const missing = required.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`Invalid industry grant CSV: missing columns ${missing.join(', ')}.`);
  const dateWarnings: string[] = [];
  const numericWarnings: string[] = [];
  const districtWarnings: string[] = [];

  const records = rows.flatMap((row, index): IndustryGrantRecipient[] => {
    const values = Object.fromEntries(headers.map((header, column) => [header, normalizeText(row[column])]));
    const companyName = values['公司名稱'];
    if (!companyName) return [];
    const subsidyYearRoc = parseNtdAmount(values['獲補助年度']);
    const approval = parseRocDate(values['核定日期']);
    const start = parseRocDate(values['計畫起始日']);
    const end = parseRocDate(values['計畫到期日']);
    [values['核定日期'], values['計畫起始日'], values['計畫到期日']].forEach((raw, dateIndex) => {
      if (raw && [approval, start, end][dateIndex].warning && dateWarnings.length < 20) dateWarnings.push(raw);
    });
    const amountFields = ['核定補助款-元', '自籌款-元', '總經費-元', '資本額-申請時'];
    const amounts = amountFields.map((field) => parseNtdAmount(values[field]));
    amountFields.forEach((field, amountIndex) => {
      if (values[field] && amounts[amountIndex] === undefined && numericWarnings.length < 20) numericWarnings.push(`${field}: ${values[field]}`);
    });
    const districtRaw = values['登記地址-行政區'];
    const registeredDistrict = normalizeGrantDistrict(districtRaw);
    if (registeredDistrict && !registeredDistrict.endsWith('區') && districtWarnings.length < 20) districtWarnings.push(registeredDistrict);
    const [approvedSubsidyNtd, selfFundedAmountNtd, totalProjectBudgetNtd, capitalAmountAtApplicationNtd] = amounts;
    return [{
      id: createHash('sha1').update(`${companyName}|${values['計畫名稱'] ?? ''}|${index}`).digest('hex').slice(0, 12),
      module: 'industry_grant_recipients',
      subsidyYearRoc, subsidyYear: subsidyYearRoc ? subsidyYearRoc + 1911 : undefined,
      grantField: values['領域'], companyName, projectName: values['計畫名稱'],
      responsiblePersonName: values['負責人姓名'], registeredDistrict,
      approvalDateRaw: values['核定日期'], approvalDate: approval.date,
      projectStartDateRaw: values['計畫起始日'], projectStartDate: start.date,
      projectEndDateRaw: values['計畫到期日'], projectEndDate: end.date,
      approvedSubsidyNtd, selfFundedAmountNtd, totalProjectBudgetNtd, capitalAmountAtApplicationNtd,
      subsidyShare: totalProjectBudgetNtd && totalProjectBudgetNtd > 0 && approvedSubsidyNtd !== undefined ? approvedSubsidyNtd / totalProjectBudgetNtd : undefined,
      selfFundingShare: totalProjectBudgetNtd && totalProjectBudgetNtd > 0 && selfFundedAmountNtd !== undefined ? selfFundedAmountNtd / totalProjectBudgetNtd : undefined,
      industryCategory: values['產業類別-大類'], source,
    }];
  });

  const fileInfo = await stat(inputPath);
  let report = {};
  try { report = JSON.parse(await readFile(reportPath, 'utf8')); } catch { /* first conversion */ }
  const industryGrantRecipients = {
    source, sourcePage: 'https://data.taipei/dataset/detail?id=3e78bffa-3fa3-46d5-a632-df99447de695',
    inputFile: basename(inputPath), convertedAt: new Date().toISOString(), fileSize: fileInfo.size, encoding,
    inputRows: rows.length, outputRecords: records.length,
    failedDateCount: dateWarnings.length, failedDateExamples: dateWarnings,
    failedNumericExamples: numericWarnings, unnormalizedDistrictExamples: districtWarnings,
    notes: ['Strings trimmed', 'Empty strings normalized', 'ROC dates converted to Gregorian dates', 'Currency fields parsed as NTD'],
  };
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, 'industry-grant-recipients.json'), JSON.stringify(records)),
    writeFile(join(outputDir, 'industry-grant-summary.json'), JSON.stringify(buildIndustryGrantSummary(records))),
    writeFile(reportPath, JSON.stringify({ ...report, industryGrantRecipients }, null, 2)),
  ]);
  console.log(`Converted ${records.length} industry grant records from ${basename(inputPath)}.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await convertIndustryGrantRecipients(process.argv.find((arg) => arg.startsWith('--file='))?.slice(7));
}
