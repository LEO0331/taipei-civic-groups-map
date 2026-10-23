"""Run: python scripts/seniorCarePolicyPdf.test.py (pdfplumber==0.11.9)."""
import importlib.util
from pathlib import Path
import contextlib, hashlib, html, io, json
import tempfile
import unittest
from unittest.mock import MagicMock, patch

spec=importlib.util.spec_from_file_location('policy_pdf',Path(__file__).with_name('seniorCarePolicyPdf.py'))
policy=importlib.util.module_from_spec(spec);spec.loader.exec_module(policy)

class PolicyPdfTests(unittest.TestCase):
    def test_real_accepted_sources_and_determinism(self):
        one=policy.encode(policy.build());two=policy.encode(policy.build())
        self.assertEqual(one,two)
        self.assertEqual(one,(policy.RAW/'extracted.json').read_bytes())

    def test_invalid_pdf(self):
        with tempfile.TemporaryDirectory() as tmp:
            path=Path(tmp)/'invalid.pdf';path.write_bytes(b'not a pdf')
            with self.assertRaisesRegex(ValueError,'signature'):policy.extract_pdf(path,'A')

    def test_changed_page_count(self):
        pdf=MagicMock();pdf.pages=[]
        with patch.object(policy.pdfplumber,'open') as opener:
            opener.return_value.__enter__.return_value=pdf
            with self.assertRaisesRegex(ValueError,'page count'):policy.extract_pdf(policy.RAW/'A.pdf','A')

    def test_changed_preparation_date(self):
        pdf=MagicMock();pdf.pages=[MagicMock() for _ in range(14)];pdf.pages[0].extract_text.return_value='115年度臺北市社區照顧關懷據點 115.09製表'
        with patch.object(policy.pdfplumber,'open') as opener:
            opener.return_value.__enter__.return_value=pdf
            with self.assertRaisesRegex(ValueError,'preparation date'):policy.extract_pdf(policy.RAW/'A.pdf','A')

    def test_changed_header(self):
        pdf=MagicMock();pdf.pages=[MagicMock() for _ in range(14)];pdf.pages[0].extract_text.return_value='115年度臺北市社區照顧關懷據點 115.08製表'
        table=MagicMock();table.extract.return_value=[['序號','地址']];pdf.pages[0].find_tables.return_value=[table]
        with patch.object(policy.pdfplumber,'open') as opener:
            opener.return_value.__enter__.return_value=pdf
            with self.assertRaisesRegex(ValueError,'schema'):policy.extract_pdf(policy.RAW/'A.pdf','A')

    def check_bad_first_row(self, row, message):
        pdf=MagicMock();pdf.pages=[MagicMock() for _ in range(14)];pdf.pages[0].extract_text.return_value='115年度臺北市社區照顧關懷據點 115.08製表'
        table=MagicMock();table.extract.return_value=[policy.A_HEADER,row];pdf.pages[0].find_tables.return_value=[table]
        with patch.object(policy.pdfplumber,'open') as opener:
            opener.return_value.__enter__.return_value=pdf
            with self.assertRaisesRegex(ValueError,message):policy.extract_pdf(policy.RAW/'A.pdf','A')

    def test_missing_district(self):
        self.check_bad_first_row(['1','','三玉里','真實來源格式名稱','社區照顧關懷據點 2-3時段','測試地址',''], 'required source A cell')

    def test_missing_village(self):
        self.check_bad_first_row(['1','士林區','','真實來源格式名稱','社區照顧關懷據點 2-3時段','測試地址',''], 'required source A cell')

    def test_missing_ordinal(self):
        self.check_bad_first_row(['','士林區','三玉里','真實來源格式名稱','社區照顧關懷據點 2-3時段','測試地址',''], 'ordinal')

    def test_unparseable_columns(self):
        self.check_bad_first_row(['1','士林區','三玉里'], 'column count')

    def test_missing_source_hash(self):
        with patch.object(policy,'digest',return_value='0'*64):
            with self.assertRaisesRegex(ValueError,'hash mismatch'):policy.build()

    def test_real_multiline_and_cross_page_controls(self):
        value=policy.build();a=value['sites'];b=value['villages']
        self.assertEqual([r['serial'] for r in a],list(range(1,521)))
        self.assertIn('244巷3號1樓',a[16]['address']);self.assertIn('244巷4號2樓',a[16]['address'])
        self.assertEqual([(r['page'],r['district']) for r in b[46:49]],[(1,'內湖區'),(1,'內湖區'),(2,'內湖區')])
        self.assertEqual(b[68]['village'],'㇐德里')
        self.assertEqual(a[13]['address'].split('雨聲街')[0],a[14]['address'].split('雨聲街')[0])
        self.assertTrue(all(set(r)=={'serial','page','district','village'} for r in b))
        self.assertTrue(all(set(r)=={'serial','page','district','village','name','type','address'} for r in a))

class RefreshSelectionTests(unittest.TestCase):
    def anchor(self, selected, edition, suffix=''):
        label=selected['observedLabel'].replace('115.08',edition)
        url=selected['attachmentUrl']+suffix
        return '<a title="'+html.escape(label,quote=True)+'" href="'+html.escape(url,quote=True)+'">pdf</a>'

    def retained(self,key):
        return (policy.RAW/(key+'-page.html')).read_text('utf-8')

    def test_actual_retained_attachment_links(self):
        manifest=json.loads((policy.RAW/'manifest.json').read_text('utf-8'))
        for key in ['A','B']:
            result=policy.select_latest_attachment(self.retained(key),key)
            self.assertEqual(result['attachmentUrl'],next(s['attachmentUrl'] for s in manifest if s['key']==key))
            self.assertEqual(result['attachmentLabelPeriod'],'2026-08')

    def test_future_edition_selected_when_old_remains(self):
        for key in ['A','B']:
            old=policy.select_latest_attachment(self.retained(key),key)
            result=policy.select_latest_attachment(self.retained(key)+self.anchor(old,'116.01','&future=1'),key)
            self.assertEqual(result['observedEdition'],'116.01')
            self.assertEqual(result['attachmentLabelPeriod'],'2027-01')
            self.assertTrue(result['attachmentUrl'].endswith('&future=1'))

    def test_same_edition_ties_rejected(self):
        old=policy.select_latest_attachment(self.retained('A'),'A')
        fixture=self.retained('A')+self.anchor(old,'116.01','&one=1')+self.anchor(old,'116.01','&two=1')
        with self.assertRaisesRegex(ValueError,'same-edition'):policy.select_latest_attachment(fixture,'A')

    def test_unparseable_relevant_edition_rejected(self):
        old=policy.select_latest_attachment(self.retained('B'),'B')
        with self.assertRaisesRegex(ValueError,'Unparseable'):
            policy.select_latest_attachment(self.retained('B')+self.anchor(old,'最新','&future=1'),'B')
        with self.assertRaisesRegex(ValueError,'Invalid relevant'):
            policy.select_latest_attachment(self.retained('B')+self.anchor(old,'116.13','&future=1'),'B')

    def test_attachment_host_rejected(self):
        old=policy.select_latest_attachment(self.retained('A'),'A')
        fixture=self.anchor(old,'116.01').replace('https://www-ws.gov.taipei/','https://untrusted.example/')
        with self.assertRaisesRegex(ValueError,'attachment host'):policy.select_latest_attachment(fixture,'A')

    def test_irrelevant_programme_and_duplicate_links(self):
        old=policy.select_latest_attachment(self.retained('A'),'A')
        duplicate=self.anchor(old,'115.08')
        other=self.anchor(old,'116.01').replace('一覽表','補助標準').replace('㇐覽表','補助標準')
        self.assertEqual(policy.select_latest_attachment(self.retained('A')+duplicate+other,'A')['observedEdition'],'115.08')

    def test_stage_new_edition_records_provenance_without_promotion(self):
        original_raw=policy.RAW
        accepted_bytes=(original_raw/'manifest.json').read_bytes()
        pages={key:(original_raw/(key+'-page.html')).read_bytes() for key in policy.PAGES}
        old=policy.select_latest_attachment(pages['A'].decode('utf-8'),'A')
        pages['A']+=self.anchor(old,'116.01','&future=1').encode('utf-8')
        pdfs={key:(original_raw/(key+'.pdf')).read_bytes() for key in ['A','B']}
        pdfs['A']+=b'\n% future-edition test bytes\n'
        output=io.StringIO()
        def fetch(url,limit,content_type=None):
            self.assertIn('Staged for independent admission review:',output.getvalue())
            for key,page in policy.PAGES.items():
                if url==page:return pages[key],'text/html'
            key='A' if url.endswith('&future=1') else 'B'
            return pdfs[key],'application/pdf'
        def extract(path,key):
            if key=='A':raise ValueError('Changed title/preparation date')
            return []
        with tempfile.TemporaryDirectory() as tmp:
            raw=Path(tmp);(raw/'manifest.json').write_bytes(accepted_bytes)
            with patch.object(policy,'RAW',raw),patch.object(policy,'fetch_bounded',side_effect=fetch),patch.object(policy,'extract_pdf',side_effect=extract),contextlib.redirect_stdout(output):
                stage=policy.stage_refresh()
            metadata=json.loads((stage/'manifest.json').read_text('utf-8'))
            entry=metadata['sources'][0]
            self.assertEqual(metadata['status'],'requires-independent-admission')
            self.assertEqual(entry['observedEdition'],'116.01')
            self.assertEqual(entry['attachmentLabelPeriod'],'2027-01')
            self.assertIsNone(entry['documentHeaderPreparationDate'])
            self.assertEqual(entry['extractionStatus'],'requires-new-admission')
            self.assertFalse(entry['matchesAcceptedHash'])
            self.assertEqual(entry['sha256'],hashlib.sha256(pdfs['A']).hexdigest())
            self.assertEqual(entry['byteSize'],len(pdfs['A']))
            self.assertEqual(entry['pageSha256'],hashlib.sha256(pages['A']).hexdigest())
            self.assertEqual((stage/'A.pdf').read_bytes(),pdfs['A'])
            self.assertEqual((raw/'manifest.json').read_bytes(),accepted_bytes)
            self.assertFalse((raw/'A.pdf').exists())

    def test_bounded_fetch_host_type_size_and_timeout(self):
        url='https://www-ws.gov.taipei/Download.ashx?test=1'
        response=MagicMock();response.url=url;response.headers.get_content_type.return_value='application/pdf';response.read.return_value=b'%PDF-'
        with patch.object(policy.urllib.request,'urlopen') as opener:
            opener.return_value.__enter__.return_value=response
            self.assertEqual(policy.fetch_bounded(url,10,'application/pdf')[0],b'%PDF-')
            opener.assert_called_with(url,timeout=30);response.read.assert_called_with(11)
            response.url='https://untrusted.example/file'
            with self.assertRaisesRegex(ValueError,'redirect host'):policy.fetch_bounded(url,10)
            response.url=url;response.headers.get_content_type.return_value='text/html'
            with self.assertRaisesRegex(ValueError,'content type'):policy.fetch_bounded(url,10,'application/pdf')
            response.read.return_value=b'x'*11
            with self.assertRaisesRegex(ValueError,'size limit'):policy.fetch_bounded(url,10)

    def test_staging_failure_keeps_page_and_diagnostic(self):
        original_raw=policy.RAW;accepted=(original_raw/'manifest.json').read_bytes()
        old=policy.select_latest_attachment(self.retained('A'),'A')
        page=(self.retained('A')+self.anchor(old,'最新版','&future=1')).encode('utf-8')
        with tempfile.TemporaryDirectory() as tmp:
            raw=Path(tmp);(raw/'manifest.json').write_bytes(accepted)
            with patch.object(policy,'RAW',raw),patch.object(policy,'fetch_bounded',return_value=(page,'text/html')),contextlib.redirect_stdout(io.StringIO()):
                with self.assertRaisesRegex(ValueError,'Unparseable'):policy.stage_refresh()
            stage=next(raw.glob('policy-refresh-*'))
            metadata=json.loads((stage/'manifest.json').read_text('utf-8'))
            self.assertEqual(metadata['status'],'failed-staging')
            self.assertEqual(metadata['diagnostics'][0]['code'],'staging-failed')
            self.assertEqual((stage/'A-page.html').read_bytes(),page)
            self.assertEqual((raw/'manifest.json').read_bytes(),accepted)

if __name__=='__main__': unittest.main()
