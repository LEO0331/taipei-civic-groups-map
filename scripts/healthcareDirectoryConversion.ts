export const districtByCode: Record<string, string> = { '63000010': '松山區', '63000020': '信義區', '63000030': '大安區', '63000040': '中山區', '63000050': '中正區', '63000060': '大同區', '63000070': '萬華區', '63000080': '文山區', '63000090': '南港區', '63000100': '內湖區', '63000110': '士林區', '63000120': '北投區' };
export const taipeiDistricts = Object.values(districtByCode);
export const clean = (value?: string) => (value ?? '').replace(/[\r\n\t ]+/g, ' ').trim();
export function decodeHealthcareCsv(bytes: Uint8Array) { try { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; } catch { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; } }
export function resolveDistrict(code: string, address: string) { return districtByCode[code] || taipeiDistricts.find((district) => address.includes(district)) || ''; }
