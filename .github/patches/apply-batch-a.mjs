import { readFile, writeFile } from 'node:fs/promises';

async function replaceOnce(path, before, after) {
  const source = await readFile(path, 'utf8');
  if (!source.includes(before)) throw new Error(`Expected source fragment not found in ${path}: ${before.slice(0, 120)}`);
  const next = source.replace(before, after);
  await writeFile(path, next);
}

await replaceOnce(
  'src/PhysicalTherapyClinicsModule.tsx',
  "  const [copied, setCopied] = useState('');\n  const pageSize = 10;",
  "  const [copied, setCopied] = useState('');\n  const [loading, setLoading] = useState(true);\n  const [loadError, setLoadError] = useState(false);\n  const pageSize = 10;",
);

await replaceOnce(
  'src/PhysicalTherapyClinicsModule.tsx',
  "  useEffect(() => {\n    Promise.all([\n      fetch(`${import.meta.env.BASE_URL}data/physical-therapy-clinics/records.json`).then((res) => res.json()),\n      fetch(`${import.meta.env.BASE_URL}data/physical-therapy-clinics/metadata.json`).then((res) => res.json()),\n    ]).then(([nextRecords, nextMetadata]) => { setRecords(nextRecords); setMetadata(nextMetadata); }).catch(() => { setRecords([]); });\n  }, []);",
  "  useEffect(() => {\n    const recordsRequest = fetch(`${import.meta.env.BASE_URL}data/physical-therapy-clinics/records.json`).then((res) => {\n      if (!res.ok) throw new Error(`records: ${res.status}`);\n      return res.json();\n    });\n    const metadataRequest = fetch(`${import.meta.env.BASE_URL}data/physical-therapy-clinics/metadata.json`)\n      .then((res) => res.ok ? res.json() : {})\n      .catch(() => ({}));\n    Promise.all([recordsRequest, metadataRequest])\n      .then(([nextRecords, nextMetadata]) => {\n        if (!Array.isArray(nextRecords)) throw new Error('Records payload must be an array.');\n        setRecords(nextRecords);\n        setMetadata(nextMetadata);\n      })\n      .catch(() => { setRecords([]); setLoadError(true); })\n      .finally(() => setLoading(false));\n  }, []);",
);

await replaceOnce(
  'src/PhysicalTherapyClinicsModule.tsx',
  "  const reset = () => { setSearch(''); setDistrict(''); setPostalCode(''); setPhoneFilter(''); setAddressFilter(''); };\n  return <section className=\"workspace physical-therapy-module\">",
  "  const reset = () => { setSearch(''); setDistrict(''); setPostalCode(''); setPhoneFilter(''); setAddressFilter(''); };\n  if (loading) return <section className=\"workspace physical-therapy-module\"><p className=\"module-loading\" role=\"status\">{zh ? '正在載入物理治療所資料…' : 'Loading physical therapy clinic data…'}</p></section>;\n  if (loadError) return <section className=\"workspace physical-therapy-module\"><p className=\"notice error\" role=\"alert\">{zh ? '無法載入本機資料快照。請稍後再試或查閱原始資料來源。' : 'The local data snapshot could not be loaded. Please try again later or consult the source dataset.'}</p></section>;\n  return <section className=\"workspace physical-therapy-module\">",
);

await replaceOnce(
  'src/InfluenzaVaccineProvidersChildren3PlusModule.tsx',
  " const [copied, setCopied] = useState(''); const pageSize = 15;\n  useEffect(() => { Promise.all([fetch(`${import.meta.env.BASE_URL}data/influenza-vaccine-providers-children-3plus/records.json`).then((r) => r.json()), fetch(`${import.meta.env.BASE_URL}data/influenza-vaccine-providers-children-3plus/metadata.json`).then((r) => r.json())]).then(([nextRecords, nextMetadata]) => { setRecords(nextRecords); setMetadata(nextMetadata); }).catch(() => setRecords([])); }, []);",
  " const [copied, setCopied] = useState(''); const [loading, setLoading] = useState(true); const [loadError, setLoadError] = useState(false); const pageSize = 15;\n  useEffect(() => {\n    const recordsRequest = fetch(`${import.meta.env.BASE_URL}data/influenza-vaccine-providers-children-3plus/records.json`).then((r) => { if (!r.ok) throw new Error(`records: ${r.status}`); return r.json(); });\n    const metadataRequest = fetch(`${import.meta.env.BASE_URL}data/influenza-vaccine-providers-children-3plus/metadata.json`).then((r) => r.ok ? r.json() : {}).catch(() => ({}));\n    Promise.all([recordsRequest, metadataRequest]).then(([nextRecords, nextMetadata]) => { if (!Array.isArray(nextRecords)) throw new Error('Records payload must be an array.'); setRecords(nextRecords); setMetadata(nextMetadata); }).catch(() => { setRecords([]); setLoadError(true); }).finally(() => setLoading(false));\n  }, []);",
);

await replaceOnce(
  'src/InfluenzaVaccineProvidersChildren3PlusModule.tsx',
  " const voiceLabel = (status: Provider['voiceReservationStatus']) => zh ? labels[status][1] : labels[status][0];\n  return <section className=\"workspace influenza-provider-module\">",
  " const voiceLabel = (status: Provider['voiceReservationStatus']) => zh ? labels[status][1] : labels[status][0];\n  if (loading) return <section className=\"workspace influenza-provider-module\"><p className=\"module-loading\" role=\"status\">{zh ? '正在載入幼童流感疫苗院所資料…' : 'Loading influenza vaccine provider data…'}</p></section>;\n  if (loadError) return <section className=\"workspace influenza-provider-module\"><p className=\"notice error\" role=\"alert\">{zh ? '無法載入本機資料快照。請稍後再試或查閱原始資料來源。' : 'The local data snapshot could not be loaded. Please try again later or consult the source dataset.'}</p></section>;\n  return <section className=\"workspace influenza-provider-module\">",
);

await replaceOnce(
  'src/AdultInfluenzaVaccineProvidersModule.tsx',
  "[err,setErr]=useState(false),[view,setView]",
  "[err,setErr]=useState(false),[loading,setLoading]=useState(true),[view,setView]",
);
await replaceOnce(
  'src/AdultInfluenzaVaccineProvidersModule.tsx',
  ".then(setRecords).catch(()=>setErr(true))},[]);",
  ".then(setRecords).catch(()=>setErr(true)).finally(()=>setLoading(false))},[]);",
);
await replaceOnce(
  'src/AdultInfluenzaVaccineProvidersModule.tsx',
  "URL.revokeObjectURL(u)};if(err)return",
  "URL.revokeObjectURL(u)};if(loading)return <section className=\"workspace\"><p className=\"module-loading\" role=\"status\">{t('正在載入成人流感疫苗院所資料…','Loading adult influenza vaccine provider data…')}</p></section>;if(err)return",
);

const e2ePath = 'tests/e2e/dashboard.spec.ts';
const e2e = await readFile(e2ePath, 'utf8');
const extraTests = `\n\ntest('self-loading healthcare directories distinguish request failures from zero records', async ({ page }) => {\n  await page.route('**/data/physical-therapy-clinics/records.json', (route) => route.fulfill({ status: 500, body: '' }));\n  await page.goto('/');\n  await selectDataset(page, '臺北市物理治療所');\n  await expect(main(page)).toContainText('無法載入本機資料快照。');\n\n  await page.unroute('**/data/physical-therapy-clinics/records.json');\n  await page.route('**/data/influenza-vaccine-providers-children-3plus/records.json', (route) => route.fulfill({ status: 500, body: '' }));\n  await selectDataset(page, '3歲以上幼童流感疫苗特約院所');\n  await expect(main(page)).toContainText('無法載入本機資料快照。');\n});\n\ntest('adult influenza directory exposes a loading state while records are pending', async ({ page }) => {\n  await page.route('**/data/adult-influenza-vaccine-providers/records.json', () => new Promise(() => {}));\n  await page.goto('/');\n  await selectDataset(page, '流感疫苗合約醫療院所（成人）');\n  await expect(main(page)).toContainText('正在載入成人流感疫苗院所資料…');\n});\n`;
if (!e2e.includes("self-loading healthcare directories distinguish request failures")) await writeFile(e2ePath, `${e2e.trimEnd()}${extraTests}`);
