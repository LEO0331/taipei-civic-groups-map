import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import {
  buildEmploymentAgencyIntermediaryCompanySummary,
  cleanEmploymentAgencyText,
  createEmploymentAgencyExternalMapQuery,
  employmentAgencyLocationPrecision,
  parseEmploymentAgencyAddress,
  parseEmploymentAgencyBusinessItemCode,
  parseEmploymentAgencyBusinessScope,
  parseEmploymentAgencyEvaluationGrade,
  parseEmploymentAgencyFax,
  parseEmploymentAgencyInstitutionName,
  parseEmploymentAgencyIntermediaryAssociation,
  parseEmploymentAgencyPhone,
  parseEmploymentAgencySequenceNumber,
  parseNonNegativeIntegerCount,
  parseResponsiblePersonOrManagerEnglishName,
  parseResponsiblePersonOrManagerName,
  parseTaiwanUnifiedBusinessNumber,
} from '../src/lib/employmentAgencyIntermediaryCompanies';
import type { EmploymentAgencyIntermediaryCompanyRecord } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/employment-agency-intermediary-companies');
const outputDir = join(process.cwd(), 'public/data/employment-agency-intermediary-companies');
const reportPath = join(process.cwd(), 'public/data/conversion-report.json');
const source = '臺北市仲介公司資料';
const sourceAgency = '臺北市政府勞動局重建處';
const decode = (bytes: Uint8Array) => {
  try { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; }
  catch { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; }
};
const duplicates = (values: Array<string | undefined>) => [...values.reduce((map, value) => value ? map.set(value, (map.get(value) ?? 0) + 1) : map, new Map<string, number>())].filter(([, count]) => count > 1).slice(0, 30).map(([value, count]) => ({ value, count }));

export async function convertEmploymentAgencyIntermediaryCompanies(filePath?: string) {
  const csvFile = filePath ? undefined : (await readdir(rawDir)).find((file) => file.toLowerCase().endsWith('.csv'));
  if (!filePath && !csvFile) throw new Error('No employment agency intermediary company CSV found. Run npm run data:fetch:employment-agencies.');
  const inputPath = filePath ?? join(rawDir, csvFile!), { text, encoding } = decode(await readFile(inputPath)), [rawHeaders, ...rows] = parseCsv(text);
  if (!rawHeaders) throw new Error('Invalid employment agency CSV: file is empty.');
  const headers = rawHeaders.map((header) => cleanEmploymentAgencyText(header) ?? '');
  const col = (name: string) => headers.indexOf(name);
  const idx = {
    sequence: col('編號'), grade: col('評鑑等級'), name: col('機構名稱'), address: col('機構地址'), phone: col('電話'), fax: col('傳真'),
    scope: col('經營業務範圍'), association: col('所屬仲介公會'), manager: col('負責人/經理人姓名'), managerEn: col('負責人/經理人英文姓名'),
    businessNumber: col('公司統一編號'), item: col('營業項目'), professional: col('專業人員人數'), bilingual: col('聘僱許可雙語人員人數'), employees: col('從業人員人數'),
  };
  const missing = Object.entries(idx).filter(([, index]) => index < 0).map(([key]) => key);
  if (missing.length) throw new Error(`Invalid employment agency CSV: missing columns ${missing.join(', ')}.`);
  const warnings = { sequence: [] as string[], grade: [] as string[], address: [] as string[], phone: [] as string[], fax: [] as string[], scope: [] as string[], association: [] as string[], businessNumber: [] as string[], item: [] as string[], staff: [] as string[] };
  const records = rows.flatMap((row, index): EmploymentAgencyIntermediaryCompanyRecord[] => {
    const sequence = parseEmploymentAgencySequenceNumber(row[idx.sequence]), grade = parseEmploymentAgencyEvaluationGrade(row[idx.grade]), name = parseEmploymentAgencyInstitutionName(row[idx.name]), address = parseEmploymentAgencyAddress(row[idx.address]), phone = parseEmploymentAgencyPhone(row[idx.phone]), fax = parseEmploymentAgencyFax(row[idx.fax]), scope = parseEmploymentAgencyBusinessScope(row[idx.scope]), association = parseEmploymentAgencyIntermediaryAssociation(row[idx.association]), manager = parseResponsiblePersonOrManagerName(row[idx.manager]), managerEn = parseResponsiblePersonOrManagerEnglishName(row[idx.managerEn]), businessNumber = parseTaiwanUnifiedBusinessNumber(row[idx.businessNumber]), item = parseEmploymentAgencyBusinessItemCode(row[idx.item]), professional = parseNonNegativeIntegerCount(row[idx.professional], '專業人員人數'), bilingual = parseNonNegativeIntegerCount(row[idx.bilingual], '聘僱許可雙語人員人數'), employees = parseNonNegativeIntegerCount(row[idx.employees], '從業人員人數');
    if (sequence.warning && warnings.sequence.length < 20) warnings.sequence.push(`${index + 2}:${row[idx.sequence] ?? ''}`);
    if (grade.warning && warnings.grade.length < 20) warnings.grade.push(`${sequence.sourceSequenceNumberNormalized ?? index + 2}:${grade.evaluationGradeRaw ?? ''}`);
    if (address.warning && warnings.address.length < 20) warnings.address.push(`${sequence.sourceSequenceNumberNormalized ?? index + 2}:${address.institutionAddress ?? ''}`);
    if (phone.warning && warnings.phone.length < 20) warnings.phone.push(`${sequence.sourceSequenceNumberNormalized ?? index + 2}:${phone.phone ?? ''}`);
    if (fax.warning && warnings.fax.length < 20) warnings.fax.push(`${sequence.sourceSequenceNumberNormalized ?? index + 2}:${fax.fax ?? ''}`);
    if (scope.warning && warnings.scope.length < 20) warnings.scope.push(`${sequence.sourceSequenceNumberNormalized ?? index + 2}:${scope.businessScopeRaw ?? ''}`);
    if (association.warning && warnings.association.length < 20) warnings.association.push(`${sequence.sourceSequenceNumberNormalized ?? index + 2}:${association.intermediaryAssociationRaw ?? ''}`);
    if (businessNumber.warning && warnings.businessNumber.length < 20) warnings.businessNumber.push(`${sequence.sourceSequenceNumberNormalized ?? index + 2}:${businessNumber.companyUnifiedBusinessNumber ?? ''}`);
    if (item.warning && warnings.item.length < 20) warnings.item.push(`${sequence.sourceSequenceNumberNormalized ?? index + 2}:${item.businessItemCode ?? ''}`);
    [professional, bilingual, employees].forEach((result) => { if (result.warning && warnings.staff.length < 20) warnings.staff.push(`${sequence.sourceSequenceNumberNormalized ?? index + 2}:${result.warning}`); });
    if (!name.institutionName || !address.institutionAddress || !businessNumber.companyUnifiedBusinessNumber) return [];
    const fallback = [name.institutionNameNormalized, address.institutionAddressNormalized, phone.phoneNormalized].filter(Boolean).join('|');
    const sourceRecordHash = createHash('sha1').update(`${businessNumber.companyUnifiedBusinessNumberNormalized ?? fallback}|${sequence.sourceSequenceNumberNormalized ?? index}`).digest('hex');
    const employeeCount = employees.value;
    return [{
      id: sourceRecordHash.slice(0, 12), module: 'employment_agency_intermediary_companies',
      sourceSequenceNumber: sequence.sourceSequenceNumber, sourceSequenceNumberNormalized: sequence.sourceSequenceNumberNormalized,
      evaluationGradeRaw: grade.evaluationGradeRaw, evaluationGrade: grade.evaluationGrade, evaluationGradeNormalized: grade.evaluationGradeNormalized, evaluationGradeCategory: grade.evaluationGradeCategory,
      institutionName: name.institutionName, institutionNameNormalized: name.institutionNameNormalized,
      institutionAddress: address.institutionAddress, institutionAddressNormalized: address.institutionAddressNormalized, districtNameFromAddress: address.districtNameFromAddress, isTaipeiDistrict: address.isTaipeiDistrict, roadName: address.roadName, addressLooksLikeMultiFloorOrUnit: address.addressLooksLikeMultiFloorOrUnit,
      phone: phone.phone, phoneNormalized: phone.phoneNormalized, hasPhone: Boolean(phone.phone), fax: fax.fax, faxNormalized: fax.faxNormalized, hasFax: Boolean(fax.fax),
      businessScopeRaw: scope.businessScopeRaw, businessScope: scope.businessScope, businessScopeNormalized: scope.businessScopeNormalized, businessScopeCategory: scope.businessScopeCategory,
      intermediaryAssociationRaw: association.intermediaryAssociationRaw, intermediaryAssociation: association.intermediaryAssociation, intermediaryAssociationNormalized: association.intermediaryAssociationNormalized, intermediaryAssociationCategory: association.intermediaryAssociationCategory, hasIntermediaryAssociation: Boolean(association.intermediaryAssociation),
      responsiblePersonOrManagerName: manager.responsiblePersonOrManagerName, responsiblePersonOrManagerNameNormalized: manager.responsiblePersonOrManagerNameNormalized,
      responsiblePersonOrManagerEnglishName: managerEn.responsiblePersonOrManagerEnglishName, responsiblePersonOrManagerEnglishNameNormalized: managerEn.responsiblePersonOrManagerEnglishNameNormalized,
      companyUnifiedBusinessNumber: businessNumber.companyUnifiedBusinessNumber, companyUnifiedBusinessNumberNormalized: businessNumber.companyUnifiedBusinessNumberNormalized, companyUnifiedBusinessNumberValidFormat: businessNumber.companyUnifiedBusinessNumberValidFormat,
      businessItemCode: item.businessItemCode, businessItemCodeNormalized: item.businessItemCodeNormalized, businessItemCategory: item.businessItemCategory,
      professionalStaffCount: professional.value, bilingualEmploymentPermitStaffCount: bilingual.value, employeeCount,
      staffSizeCategory: employeeCount == null ? 'unknown' : employeeCount <= 5 ? 'micro' : employeeCount <= 20 ? 'small' : employeeCount <= 50 ? 'medium' : 'large',
      hasBilingualEmploymentPermitStaff: (bilingual.value ?? 0) > 0,
      professionalStaffShare: employeeCount && professional.value != null ? professional.value / employeeCount : undefined,
      bilingualEmploymentPermitStaffShare: employeeCount && bilingual.value != null ? bilingual.value / employeeCount : undefined,
      coordinateSource: 'none', geocodingStatus: 'not_geocoded_address_only', locationPrecision: employmentAgencyLocationPrecision(address),
      googleMapsQuery: createEmploymentAgencyExternalMapQuery({ institutionName: name.institutionName, institutionAddress: address.institutionAddress }),
      sourceRecordHash, source, sourceAgency,
    }];
  });
  const fileInfo = await stat(inputPath), report = await readFile(reportPath, 'utf8').then(JSON.parse).catch(() => ({}));
  const employmentAgencyIntermediaryCompanies = {
    source, sourceAgency, officialSourceAgencyShort: '勞動局重建處', sourcePage: 'https://data.taipei/dataset/detail?id=e39d8ba6-999f-48bb-a8ad-c3c27ee90c78',
    category: '勞動', serviceCategory: '開創事業', datasetType: '原始資料', resourceName: '臺北市仲介公司資料', officialResourceUpdateTime: '2025-06-07 22:03:26', officialMetadataUpdateTime: '2026-03-24 09:45:46', updateFrequency: '不定期更新',
    inputFile: basename(inputPath), convertedAt: new Date().toISOString(), fileSize: fileInfo.size, encoding, inputRows: rows.length, outputRecords: records.length,
    duplicateSequenceNumbers: duplicates(records.map((r) => r.sourceSequenceNumberNormalized)), duplicateInstitutionNames: duplicates(records.map((r) => r.institutionNameNormalized)), duplicateInstitutionAddresses: duplicates(records.map((r) => r.institutionAddressNormalized)), duplicatePhones: duplicates(records.map((r) => r.phoneNormalized)), duplicateResponsiblePersonOrManagerNames: duplicates(records.map((r) => r.responsiblePersonOrManagerNameNormalized)), duplicateUnifiedBusinessNumbers: duplicates(records.map((r) => r.companyUnifiedBusinessNumberNormalized)),
    warnings, notes: ['UTF-8-SIG / UTF-8 decoded first with CP950 / Big5 fallback.', 'Sequence numbers, phones, faxes, unified business numbers, business item codes, and staff counts are read as text before parsing.', 'No official coordinates supplied; no geocoding performed and no exact markers are generated.', 'External map links are address queries, not official coordinates.', 'No agency recommendation, ranking, service-quality, real-time operating, real-time license, compliance, credit, investment, job-seeking, migrant-worker placement, or legal-advice claims are inferred.'],
  };
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, 'records.json'), JSON.stringify(records)),
    writeFile(join(outputDir, 'summary.json'), JSON.stringify(buildEmploymentAgencyIntermediaryCompanySummary(records))),
    writeFile(reportPath, JSON.stringify({ ...report, employmentAgencyIntermediaryCompanies }, null, 2)),
  ]);
  console.log(`Converted ${records.length} employment agency intermediary company records from ${basename(inputPath)}.`);
}

if (import.meta.url === `file://${process.argv[1]}`) await convertEmploymentAgencyIntermediaryCompanies(process.argv.find((arg) => arg.startsWith('--file='))?.slice(7));
