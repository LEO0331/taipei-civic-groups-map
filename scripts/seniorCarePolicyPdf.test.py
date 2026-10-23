"""Run: python scripts/seniorCarePolicyPdf.test.py (pdfplumber==0.11.9)."""
import importlib.util
from pathlib import Path
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

if __name__=='__main__': unittest.main()
