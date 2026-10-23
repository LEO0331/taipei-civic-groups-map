import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { auditSeniorCarePolicySources } from './auditSeniorCarePolicySources.ts'

if (process.argv.slice(2).some(arg => arg !== '--refresh')) throw new Error('Only --refresh is supported')
console.log(JSON.stringify(auditSeniorCarePolicySources()))
if (process.argv.includes('--refresh')) {
  const result = spawnSync(process.env.SENIOR_CARE_POLICY_PYTHON ?? 'python', [fileURLToPath(new URL('./seniorCarePolicyPdf.py', import.meta.url)), '--refresh'], { stdio: 'inherit', timeout: 180_000 })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error('Refresh staging failed; accepted sources preserved')
}
