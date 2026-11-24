"""Export an allowlisted public shortlist. Never copy the private tracker wholesale.

Run after discovery and employer verification. This script does not discover jobs,
claim a new verification, submit applications, or publish to GitHub.
"""
import argparse
import datetime as dt
import hashlib
import json
import re
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent


def read(path, default):
    return json.loads(path.read_text(encoding='utf-8-sig')) if path.exists() else default


def url(value):
    if not isinstance(value, str):
        return None
    parts = urlsplit(value)
    return value if parts.scheme in ('http', 'https') and parts.hostname and not parts.username else None


def lines(value):
    if isinstance(value, list):
        return [v for v in value if isinstance(v, str)]
    return [value] if isinstance(value, str) and value else []


def date(value):
    try:
        return dt.datetime.fromisoformat(str(value).replace('Z', '+00:00')).date()
    except ValueError:
        return None


def identity(job):
    company = job.get('company', '').lower().strip()
    parsed = urlsplit(job.get('url') or '')
    canonical = urlunsplit((parsed.scheme, parsed.netloc.lower(), parsed.path.rstrip('/'), '', ''))
    return company, str(job.get('requisition_id') or canonical)


def eligible(job, today):
    status = job.get('status', '')
    if status in ('applied', 'applied_confirmed', 'application_email_sent_confirmed'):
        return False
    if not ('shortlisted' in status or status.startswith(('older_active', 'conditional_', 'application_prepared'))):
        return False
    if job.get('hard_conflicts'):
        return False
    # An actual employer verification timestamp is required; last_checked alone is insufficient.
    verified = date(job.get('last_employer_verified_at'))
    return bool(verified and 0 <= (today - verified).days <= 14 and url(job.get('url')))


def relevance(job):
    """Transparent ordering of existing assessments; never a hiring probability."""
    title = job.get('title', '').lower()
    fit = str(job.get('fit', '')).lower()
    value = 0
    if any(x in title for x in ('junior', 'associate', 'engineer i,', 'engineer i ', 'engineer i', 'engineer ii')):
        value += 3
    if any(x in fit for x in ('strong', 'realistic', 'best_scope', 'good_java')):
        value += 3
    if 'senior' in title:
        value -= 3
    if any(x in fit for x in ('high_ownership', 'stretch', 'specialist', 'senior_scope')):
        value -= 2
    if job.get('status', '').startswith('conditional'):
        value -= 2
    if 'clarify_location_first' == job.get('priority'):
        value -= 3
    return value


def public_job(job, today):
    arrangement = job.get('work_arrangement') or 'Work arrangement needs clarification'
    title = job.get('title', '')
    role = 'Developer tools' if re.search(r'developer|test infra|continuous delivery|integration', title, re.I) else 'Full-stack' if re.search(r'full.?stack|product engineer', title, re.I) else 'Frontend' if re.search(r'front.?end', title, re.I) else 'Backend' if re.search(r'backend|back.end', title, re.I) else 'Software engineering'
    sources = []
    for source in job.get('sources', []):
        if isinstance(source, dict) and url(source.get('url')):
            sources.append({'name': source.get('name', 'Discovery source'), 'url': source['url']})
    if url(job.get('discovery_url')):
        sources.append({'name': job.get('discovered_via', 'Discovery source'), 'url': job['discovery_url']})
    published = job.get('published_at') or job.get('posted_date')
    published_date = date(published)
    # A date without a time cannot establish the exact 72-hour boundary.
    fresh = False
    if published and 'T' in published:
        try:
            stamp = dt.datetime.fromisoformat(published.replace('Z', '+00:00'))
            age = dt.datetime.now(dt.timezone.utc) - stamp.astimezone(dt.timezone.utc)
            fresh = 0 <= age.total_seconds() <= 72 * 3600
        except ValueError:
            pass
    salary = job.get('base_salary_usd')
    salary_text = 'Salary needs clarification'
    if isinstance(salary, list) and len(salary) == 2 and all(isinstance(n, (int, float)) for n in salary):
        salary_text = f'${salary[0]:,.0f}–${salary[1]:,.0f}'
    elif isinstance(salary, dict) and isinstance(salary.get('min'), (int, float)) and isinstance(salary.get('max'), (int, float)):
        salary_text = f"${salary['min']:,.0f}–${salary['max']:,.0f}"
    return {
        'id': hashlib.sha256('|'.join(identity(job)).encode()).hexdigest()[:16],
        'company': job.get('company', ''), 'title': title, 'role': role,
        'employer_url': job['url'],
        'application_url': url(job.get('application_url')) or job['url'],
        'requisition_id': job.get('requisition_id'),
        'arrangement': arrangement,
        'workplace': 'Chicago hybrid' if re.search(r'^Chicago[. ,]|Chicago hybrid', arrangement, re.I) else 'Remote' if 'remote' in arrangement.lower() else 'Clarify',
        'salary': salary_text, 'salary_scope': job.get('salary_scope') or (salary.get('scope') if isinstance(salary, dict) else None) or 'Confirm geographic applicability and compensation basis with employer.',
        'evidence': lines(job.get('evidence')) or lines(job.get('fit')), 'transferable': lines(job.get('transferable_skills')),
        'gaps': lines(job.get('gaps')) + lines(job.get('caveats')),
        'responsibilities': lines(job.get('responsibility_flags')),
        'first_seen': job.get('first_seen'), 'published_at': published if published_date else None,
        'source_updated_at': job.get('source_updated_at'),
        'employer_verified_at': job['last_employer_verified_at'],
        'new_to_search': job.get('first_seen') == today.isoformat(), 'fresh_72h': fresh,
        'sources': sources,
    }


def build(root=ROOT, limit=25):
    today = dt.datetime.now(ZoneInfo('America/Chicago')).date()
    tracker = read(root / 'job-tracker.json', {'jobs': []})
    jobs = tracker['jobs']
    applied = {identity(j) for j in jobs if j.get('status') in ('applied', 'applied_confirmed', 'application_email_sent_confirmed')}
    chosen = {}
    for job in sorted(jobs, key=lambda j: (relevance(j), str(j.get('last_employer_verified_at', ''))), reverse=True):
        key = identity(job)
        if key not in applied and key not in chosen and eligible(job, today):
            chosen[key] = job
    health = read(root / 'discovery/latest-source-health.json', [])
    catalog = read(root / 'source-catalog.json', {'sources': []})
    reviews = read(root / 'discovery/source-review-log.json', {})
    runs = reviews.get('runs', []) if isinstance(reviews, dict) else reviews
    leads = read(root / 'discovery/latest-leads.json', {})
    return {
        'schema_version': 1, 'generated_at': dt.datetime.now(dt.timezone.utc).isoformat(),
        'discovery_at': leads.get('collected_at'), 'target_count': limit,
        'selection_note': 'Rolling shortlist from employer verifications in the last 14 days. Prioritizes realistic junior/mid-level scope and supported work; salary never boosts rank. New to search does not mean newly posted. Availability can change after verification.',
        'jobs': [public_job(j, today) for j in list(chosen.values())[:limit]],
        'qualifying_count': len(chosen),
        'sources': [{'name': s['source'], 'checked_at': s.get('checked_at'), 'count': s.get('count', 0), 'error': s.get('error'), 'baseline': bool(s.get('baseline'))} for s in health],
        'boards': [{'name': s['name'], 'url': s['url'], 'access': s.get('access'), 'cadence': s.get('cadence')} for s in catalog['sources'] if url(s.get('url')) and s.get('cadence') not in ('disabled', 'hold') and s.get('status') not in ('disabled', 'hold') and s.get('access') in ('public', 'public_web', 'public_feed', 'public_api', 'public_web_account_options', 'public_web_paid_options', 'public_archive_rss', 'public_web_feed_available')],
        'board_reviews': [{'name': r.get('source', ''), 'url': url(r.get('url')), 'checked_on': r.get('checked_on'), 'finding': r.get('finding'), 'access_problem': r.get('access_problem'), 'verified_matches': r.get('qualifying_employer_verified_roles', 0)} for r in (runs[-1].get('reviews', []) if runs else [])],
        'last_source_review_date': (runs[-1].get('checked_on') or runs[-1].get('date') or runs[-1].get('run_date')) if runs else None,
    }


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path, default=ROOT / 'toolbox-site/public/data/latest.json')
    parser.add_argument('--limit', type=int, default=25)
    parser.add_argument('--workspace', type=Path, default=ROOT)
    args = parser.parse_args()
    if not 1 <= args.limit <= 100:
        parser.error('--limit must be between 1 and 100')
    payload = build(root=args.workspace, limit=args.limit)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    temporary = args.output.with_suffix('.tmp')
    temporary.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    temporary.replace(args.output)
    print(f"Exported {len(payload['jobs'])} of {payload['qualifying_count']} qualifying roles to {args.output}")
