import copy
import datetime as dt
import json
import tempfile
import unittest
from pathlib import Path
from zoneinfo import ZoneInfo
import export_toolbox as export


class PublicExportTests(unittest.TestCase):
    def setUp(self):
        self.today = dt.datetime.now(ZoneInfo('America/Chicago')).date()
        self.job = dict(company='Example', title='Software Engineer II', requisition_id='123',
                        url='https://example.com/jobs/123', status='shortlisted_not_applied',
                        last_employer_verified_at=self.today.isoformat(),
                        evidence=['React features'], work_arrangement='100% remote US. Illinois not excluded; no office requirement.',
                        prepared_resume='SECRET_RESUME_PATH', confirmation_text='SECRET_CONFIRMATION',
                        screening_answers={'address': 'SECRET_ADDRESS'}, email='SECRET_EMAIL')

    def test_private_fields_never_leave_workspace_and_remote_is_not_hybrid(self):
        public = export.public_job(self.job, self.today)
        self.assertNotIn('SECRET_', json.dumps(public))
        self.assertEqual(public['workplace'], 'Remote')

    def test_verification_age_and_status(self):
        for changes in [dict(status='applied_confirmed'), dict(status='closed_filled_not_applied'),
                        dict(last_employer_verified_at=None), dict(hard_conflicts=['Location']),
                        dict(last_employer_verified_at=(self.today-dt.timedelta(days=15)).isoformat())]:
            with self.subTest(changes=changes):
                self.assertFalse(export.eligible(dict(self.job, **changes), self.today))
        self.assertTrue(export.eligible(self.job, self.today))

    def test_applied_duplicate_suppresses_shortlist(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root/'job-tracker.json').write_text(json.dumps({'jobs': [self.job, dict(self.job, status='applied_confirmed')]}))
            self.assertEqual(export.build(root)['jobs'], [])

    def test_salary_does_not_increase_rank(self):
        self.assertEqual(export.relevance(self.job), export.relevance(dict(self.job, base_salary_usd=[300000, 500000])))

    def test_source_application_url_and_dates_preserved(self):
        job = dict(self.job, application_url='https://himalayas.app/jobs/example?utm_source=api',
                   source_updated_at=self.today.isoformat(), published_at=None, posted_date=None)
        public = export.public_job(job, self.today)
        self.assertEqual(public['application_url'], job['application_url'])
        self.assertIsNone(public['published_at'])
        self.assertFalse(public['fresh_72h'])
        self.assertIsNone(export.url('javascript:alert(1)'))


if __name__ == '__main__':
    unittest.main()
