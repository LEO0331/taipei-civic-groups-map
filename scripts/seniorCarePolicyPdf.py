"""Offline deterministic extraction of retained official Policy #10 PDFs.
Requires pdfplumber==0.11.9 (bundled Codex runtime). Refresh stages only.
"""
from pathlib import Path
import argparse, hashlib, html, json, os, re, tempfile, urllib.request
import pdfplumber

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / 'data/raw/senior-care-policy'
VERSION = 'pdfplumber-0.11.9/table-lines-v1'
PAGES = {'A': 'https://dosw.gov.taipei/News_Content.aspx?n=222C9779823FA161&s=0CE286F6AA2F930F&sms=E2A8B6B533500CB0', 'B': 'https://dosw.gov.taipei/News_Content.aspx?n=63FBD779B8854D69&s=207B5C83CE31EEAE', 'C': 'https://laws.gov.taipei/Law/LawSearch/LawArticleContent/FL078396'}
A_HEADER = ['序號', '行政區', '里別', '據點名稱', '據點類型', '據點地址', '聯絡電話']
B_HEADER = ['序號', '行政區', '里別', '里內獨居老人數']
A_BOUNDS = [(1,36),(37,74),(75,112),(113,149),(150,187),(188,225),(226,262),(263,298),(299,335),(336,373),(374,412),(413,451),(452,489),(490,520)]
B_GROUPS = [(1,16,'士林區'),(17,21,'大同區'),(22,32,'大安區'),(33,40,'中山區'),(41,46,'中正區'),(47,58,'內湖區'),(59,64,'文山區'),(65,70,'北投區'),(71,74,'松山區'),(75,79,'信義區'),(80,82,'南港區'),(83,88,'萬華區')]

def require(ok, message):
    if not ok: raise ValueError(message)

def digest(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def clean(value): return (value or '').replace('\n','').strip()
def encode(value): return (json.dumps(value, ensure_ascii=False, indent=2)+'\n').encode('utf-8')
def atomic(path, data):
    temp = path.with_suffix(path.suffix+'.tmp');temp.write_bytes(data);os.replace(temp,path)

def extract_pdf(path, key):
    require(path.read_bytes().startswith(b'%PDF-'), 'Invalid PDF signature')
    require(pdfplumber.__version__ == '0.11.9', 'Use pinned pdfplumber==0.11.9')
    result=[];boundaries=[]
    with pdfplumber.open(path) as pdf:
        require(len(pdf.pages)==(14 if key=='A' else 2), 'Changed page count requires admission review')
        first=pdf.pages[0].extract_text()
        require('115.08製表' in first and '115年度臺北市社區照顧關懷據點' in first, 'Changed title/preparation date')
        for pi,page in enumerate(pdf.pages,1):
            tables=page.find_tables();require(len(tables)==1,'Unparseable table layout')
            table=tables[0];rows=table.extract();header=A_HEADER if key=='A' else B_HEADER
            if pi==1: require(rows[0]==header,'Changed table schema')
            district=None;span=None;page_rows=[]
            for ri,row in enumerate(rows):
                if row==header: continue
                require(len(row)==len(header),'Changed column count')
                require(row[0] and re.fullmatch(r'\d+',row[0]),'Missing ordinal or unexpected continuation')
                serial=int(row[0]);cells=table.rows[ri].cells;rowcell=cells[0]
                if key=='B':
                    # Normal inheritance is permitted only while the original merged cell covers this row.
                    if row[1]: district=clean(row[1]);span=cells[1]
                    elif span and rowcell[1]>=span[1]-0.1 and rowcell[3]<=span[3]+0.1: pass
                    elif 47<=serial<=58:
                        # This admitted edition has one open-ended cell across pages 1/2.
                        # Validate the empty cell + next-page visible label; never forward-fill 中正區.
                        require(cells[1] is None,'Changed cross-page district geometry')
                        nextpage=pdf.pages[1]
                        label=nextpage.crop((61,0,186,175)).extract_text() or ''
                        require(label.strip()=='內湖區','Cross-page district label missing')
                        district='內湖區';span=None
                    else: raise ValueError('Missing district without verified merged-cell geometry')
                    expected=next(d for lo,hi,d in B_GROUPS if lo<=serial<=hi)
                    require(district==expected,'District transition changed: independent controls need review')
                    item={'serial':serial,'page':pi,'district':district,'village':clean(row[2])}
                else:
                    require(all(row[j] for j in range(6)),'Missing required source A cell')
                    item=dict(zip(['serial','page','district','village','name','type','address'],[serial,pi]+[clean(v) for v in row[1:6]]))
                require(item['village'].endswith('里'),'Missing/unparseable village')
                result.append(item);page_rows.append(serial)
            boundaries.append([page_rows[0],page_rows[-1]])
        require([x['serial'] for x in result]==list(range(1,(520 if key=='A' else 88)+1)),'Duplicate/missing ordinal')
        require(boundaries==([list(x) for x in A_BOUNDS] if key=='A' else [[1,48],[49,88]]),'Changed page boundaries')
    return result

def build():
    manifest=json.loads((RAW/'manifest.json').read_text('utf-8'))
    for source in manifest:
        require(digest(RAW/source['filename'])==source['sha256'], 'Source file hash mismatch: '+source['key'])
        require(digest(RAW/source['pageFilename'])==source['pageSha256'], 'Official page evidence hash mismatch')
        if source['key'] in ['A','B']:
            text=(RAW/source['pageFilename']).read_text('utf-8')
            require(html.escape(source['attachmentUrl'],quote=True).replace('&#x27;',"'") in text or source['attachmentUrl'] in html.unescape(text),'Attachment not a member of official page')
    sites=extract_pdf(RAW/'A.pdf','A');villages=extract_pdf(RAW/'B.pdf','B')
    require(sites[0]['village']=='三玉里' and sites[-1]['village']=='興隆里','A independent endpoint control failed')
    require('244巷3號1樓' in sites[16]['address'] and '244巷4號2樓' in sites[16]['address'],'A multiline control failed')
    require(villages[68]['village']=='㇐德里','B independently reviewed glyph changed')
    return {'sites':sites,'villages':villages,'sources':manifest}

def stage_refresh():
    # Bounded staging only: accepted originals/pointer are never overwritten by network refresh.
    stage=Path(tempfile.mkdtemp(prefix='policy-refresh-',dir=RAW))
    for key,url in PAGES.items():
        with urllib.request.urlopen(url,timeout=30) as response:
            data=response.read(5_000_001);require(len(data)<=5_000_000,'HTML size limit');require(response.url.startswith(url.split('/')[0]+'//'+url.split('/')[2]+'/'),'Unexpected redirect host')
        (stage/(key+'-page.html')).write_bytes(data)
        if key!='C':
            links=re.findall(r'<a\b[^>]*href="([^"]+)"[^>]*title="([^"]+)"',data.decode('utf-8'))
            matches=[html.unescape(u) for u,title in links if '115.08(pdf' in title and '社區照顧關懷據點' in title and ('尚未' in title)==(key=='B')]
            require(len(matches)==1,'Changed/ambiguous edition requires manual admission')
            url=matches[0];require(url.startswith('https://www-ws.gov.taipei/Download.ashx?'),'Unexpected attachment host')
            with urllib.request.urlopen(url,timeout=30) as response:
                require(response.url.startswith('https://www-ws.gov.taipei/'),'Unexpected attachment redirect host')
                require(response.headers.get_content_type()=='application/pdf','Unexpected attachment content type')
                pdf=response.read(10_000_001)
            require(len(pdf)<=10_000_000 and pdf.startswith(b'%PDF-'),'Invalid/oversized PDF');(stage/(key+'.pdf')).write_bytes(pdf);extract_pdf(stage/(key+'.pdf'),key)
    print('Staged for independent admission review: '+str(stage))

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--extract',action='store_true');parser.add_argument('--refresh',action='store_true');args=parser.parse_args()
    if args.refresh: stage_refresh()
    else:
        value=build();data=encode(value)
        audit=json.loads((RAW/'extraction-audit.json').read_text('utf-8'))
        require(audit['verified'] is True and audit['sourceHashes']=={s['key']:s['sha256'] for s in value['sources']},'Independent audit source binding failed')
        require(audit['extractedSha256']==hashlib.sha256(data).hexdigest(),'Exact extraction audit binding failed')
        if args.extract: atomic(RAW/'extracted.json',data)
        else: require((RAW/'extracted.json').read_bytes()==data,'Extraction differs: run --extract after review')
        print('Verified offline: 520 site records; 88 village records; source hashes and independent controls passed')
