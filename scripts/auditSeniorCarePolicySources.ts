import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const raw = fileURLToPath(new URL('../data/raw/senior-care-policy/', import.meta.url))
const hash = (data: Buffer) => createHash('sha256').update(data).digest('hex')

/** Offline source admission check. Does not fetch, promote, or rewrite evidence. */
export function auditSeniorCarePolicySources() {
  const sources = JSON.parse(readFileSync(resolve(raw, 'manifest.json'), 'utf8'))
  const audit = JSON.parse(readFileSync(resolve(raw, 'extraction-audit.json'), 'utf8'))
  const extractedBytes = readFileSync(resolve(raw, 'extracted.json'))
  const extracted = JSON.parse(extractedBytes.toString('utf8'))
  if (!audit.verified || audit.extractedSha256 !== hash(extractedBytes)) throw new Error('Independent extraction audit mismatch')
  if (JSON.stringify(extracted.sources) !== JSON.stringify(sources)) throw new Error('Manifest/extracted provenance mismatch')
  if (sources.length !== 3 || sources.map((s: { key: string }) => s.key).join() !== 'A,B,C') throw new Error('Source set changed')
  for (const source of sources) {
    for (const key of ['filename', 'pageFilename']) {
      if (!/^[ABC](?:-page\.html|\.pdf)$/.test(source[key])) throw new Error('Unsafe source path')
    }
    if (hash(readFileSync(resolve(raw, source.filename))) !== source.sha256 || audit.sourceHashes[source.key] !== source.sha256) throw new Error(`Original hash mismatch: ${source.key}`)
    if (hash(readFileSync(resolve(raw, source.pageFilename))) !== source.pageSha256) throw new Error(`Page hash mismatch: ${source.key}`)
    if (source.key !== 'C') {
      const page = readFileSync(resolve(raw, source.pageFilename), 'utf8').replaceAll('&amp;', '&')
      if (!page.includes(source.attachmentUrl)) throw new Error(`Attachment not on retained official page: ${source.key}`)
      if (!readFileSync(resolve(raw, source.filename)).subarray(0, 5).equals(Buffer.from('%PDF-'))) throw new Error('Invalid PDF')
    }
  }
  for (const [records, count] of [[extracted.sites, 520], [extracted.villages, 88]] as const) {
    if (records.length !== count || records.some((r: {serial:number;district:string;village:string}, i:number) => r.serial !== i + 1 || !r.district || !r.village)) throw new Error('Record sequence/identity failed')
  }
  if (extracted.villages.some((r: Record<string, unknown>) => Object.keys(r).some(k => !['serial','page','district','village'].includes(k)))) throw new Error('Village privacy schema failed')
  if (extracted.sites.some((r: Record<string, unknown>) => Object.keys(r).some(k => !['serial','page','district','village','name','type','address'].includes(k)))) throw new Error('Site privacy schema failed')
  return { sites: extracted.sites.length, villages: extracted.villages.length, verified: true }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(JSON.stringify(auditSeniorCarePolicySources()))
