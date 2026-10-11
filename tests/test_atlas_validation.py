"""Regressões de integridade: metadados inválidos devem bloquear o build."""
import copy
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from tools import build_atlas_data as atlas


class AtlasValidationTests(unittest.TestCase):
    def setUp(self):
        self.source = json.loads(atlas.STUDIES.read_text())
        self.note = json.loads(next(atlas.NOTES.glob('*.json')).read_text())

    def build(self, source=None, note=None):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            studies = root / 'studies.json'
            studies.write_text(json.dumps(source or self.source))
            notes = root / 'notes'
            notes.mkdir()
            (notes / 'note.json').write_text(json.dumps(note or self.note))
            with patch.object(atlas, 'STUDIES', studies), patch.object(atlas, 'NOTES', notes):
                return atlas.build_data()

    def test_current_catalog_is_preserved(self):
        self.assertEqual(self.build()['studies'], self.source['studies'])

    def test_malformed_doi_is_rejected(self):
        for doi in ('sem DOI', '10.1234/', '10.1234/a b'):
            with self.subTest(doi=doi):
                source = copy.deepcopy(self.source)
                source['studies'][0]['doi'] = doi
                with self.assertRaisesRegex(ValueError, 'DOI'):
                    self.build(source=source)

    def test_same_doi_different_case_and_id_is_rejected(self):
        source = copy.deepcopy(self.source)
        duplicate = copy.deepcopy(source['studies'][1])
        duplicate['id'] = 'duplicate-study'
        duplicate['doi'] = duplicate['doi'].upper()
        source['studies'].append(duplicate)
        with self.assertRaisesRegex(ValueError, 'DOI.*duplicado'):
            self.build(source=source)

    def test_model_doi_is_validated(self):
        source = copy.deepcopy(self.source)
        source['explanatory_model']['doi'] = 'pendente'
        with self.assertRaisesRegex(ValueError, 'DOI'):
            self.build(source=source)

    def test_impossible_calendar_date_is_rejected(self):
        for date in ('2026-02-29', '2026-13-01', '2026-04-31'):
            with self.subTest(date=date):
                note = dict(self.note, date=date)
                with self.assertRaisesRegex(ValueError, 'data inválida'):
                    self.build(note=note)

    def test_leap_day_is_accepted(self):
        result = self.build(note=dict(self.note, date='2024-02-29'))
        self.assertEqual(result['notes'][0]['date'], '2024-02-29')

    def test_draft_is_not_published(self):
        self.assertEqual(self.build(note=dict(self.note, status='rascunho'))['notes'], [])


if __name__ == '__main__':
    unittest.main()
