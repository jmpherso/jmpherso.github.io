import { createMemo, createResource, createSignal, For, Show } from 'solid-js';
import './toolbox.css';

type Job = {
  id: string; company: string; title: string; role: string; employer_url: string;
  application_url: string; requisition_id: string | null; arrangement: string;
  workplace: string; salary: string; salary_scope: string; evidence: string[];
  transferable: string[]; gaps: string[]; responsibilities: string[];
  first_seen: string | null; published_at: string | null; source_updated_at: string | null;
  employer_verified_at: string; new_to_search: boolean; fresh_72h: boolean;
  sources: { name: string; url: string }[];
};
type Source = { name: string; checked_at: string; count: number; error: string | null; baseline: boolean };
type Feed = { schema_version: number; generated_at: string; discovery_at: string; target_count: number;
  selection_note: string; jobs: Job[]; qualifying_count: number; sources: Source[];
  boards: { name: string; url: string; access: string }[];
  board_reviews: { name: string; url: string | null; checked_on: string; access_problem: string | null; verified_matches: number }[] };

const day = (s: string | null) => s ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/Chicago' }).format(new Date(s.length === 10 ? `${s}T12:00:00` : s)) : 'Not established';
const safeUrl = (s: string) => /^https?:\/\//i.test(s) ? s : '#';
function loadSaved(): string[] {
  try { const value = JSON.parse(localStorage.getItem('jobtoolbox:saved') || '[]'); return Array.isArray(value) ? value.filter(x => typeof x === 'string') : []; }
  catch { return []; }
}

export default function App() {
  const [loadError, setLoadError] = createSignal('');
  const [feed, { refetch }] = createResource(async (): Promise<Feed | undefined> => {
    setLoadError('');
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}data/latest.json`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Update unavailable (${response.status}).`);
      const data = await response.json();
      if (data.schema_version !== 1 || !Array.isArray(data.jobs) || !Array.isArray(data.sources)) throw new Error('Unsupported update format.');
      return data;
    } catch (error) {
      setLoadError(error instanceof SyntaxError ? 'The update file is missing or unreadable.' : error instanceof Error ? error.message : 'Connection failed.');
      return undefined;
    }
  });
  const [view, setView] = createSignal('Discover');
  const [search, setSearch] = createSignal('');
  const [role, setRole] = createSignal('All roles');
  const [workplace, setWorkplace] = createSignal('All locations');
  const [freshness, setFreshness] = createSignal('All dates');
  const [saved, setSaved] = createSignal(loadSaved());
  const [storageMessage, setStorageMessage] = createSignal('');
  const toggle = (id: string) => {
    const next = saved().includes(id) ? saved().filter(x => x !== id) : [...saved(), id];
    setSaved(next);
    try { localStorage.setItem('jobtoolbox:saved', JSON.stringify(next)); }
    catch { setStorageMessage('Browser storage is unavailable. Saved jobs will last for this visit only.'); }
  };
  const visible = createMemo(() => (feed()?.jobs || []).filter(j =>
    (view() !== 'Saved jobs' || saved().includes(j.id)) &&
    (role() === 'All roles' || j.role === role()) &&
    (workplace() === 'All locations' || j.workplace === workplace()) &&
    (freshness() === 'All dates' || (freshness() === 'New to search' ? j.new_to_search : j.fresh_72h)) &&
    `${j.company} ${j.title} ${j.arrangement} ${j.evidence.join(' ')} ${j.gaps.join(' ')}`.toLowerCase().includes(search().toLowerCase())
  ));
  const failures = createMemo(() => (feed()?.sources || []).filter(s => s.error));
  const stale = createMemo(() => !!feed() && Date.now() - Date.parse(feed()!.discovery_at) > 36 * 3600000);
  const clear = () => { setSearch(''); setRole('All roles'); setWorkplace('All locations'); setFreshness('All dates'); };
  return <div class="shell" id="top">
    <header class="desktop-header">
      <a class="brand" href="#top" onClick={() => setView('Discover')} aria-label="jt. Jobsearch toolbox">
        <span class="brandmark">jt<span>.</span></span><span class="brand-name">Jobsearch<br/><strong>toolbox</strong></span>
      </a>
      <nav aria-label="Workspace"><For each={['Discover', 'Saved jobs', 'Sources']}>{item =>
        <button classList={{ active: view() === item }} onClick={() => setView(item)} aria-current={view() === item ? 'page' : undefined}>
          {item === 'Discover' ? 'Shortlist' : item === 'Saved jobs' ? 'Saved roles' : 'Source notes'}
          <Show when={item === 'Saved jobs'}><span class="count">({(feed()?.jobs || []).filter(j => saved().includes(j.id)).length})</span></Show>
        </button>
      }</For></nav>
    </header>
    <main id="main" class="sheet">
      <div class="sheet-content">
        <div class="document-meta"><span>Jobsearch toolbox / Working copy</span><a href="https://github.com/jmpherso/jmpherso.github.io">Project files</a></div>
        <header class="document-heading">
          <h1>JERRY MACPHERSON</h1>
          <p class="contact-line">SOFTWARE ENGINEER · CHICAGO, IL · US REMOTE</p>
          <p class="document-subtitle">References available. Opportunities wanted.</p>
        </header>
        <section class="objective" aria-label="Search objective"><h2>Objective</h2><p>Interesting engineering work, a collaborative team, and room to grow. A daily shortlist of roles worth a closer look.</p></section>
        <Show when={loadError()}><div class="alert" role="alert">We couldn’t load the daily update. {loadError()} <button onClick={() => refetch()}>Try again</button></div></Show>
        <Show when={feed.loading && !feed()}><div class="empty" role="status">Retrieving the latest working copy…</div></Show>
        <Show when={feed()}>{data => <>
          <Show when={stale()}><div class="alert">The last discovery run is over 36 hours old. Entries retain their original verification dates.</div></Show>
          <Show when={data().jobs.length < data().target_count}><div class="alert">{data().jobs.length} qualifying roles are available toward the ~{data().target_count} target. More will appear as relevant listings are verified.</div></Show>
          <Show when={storageMessage()}><div class="alert" role="status">{storageMessage()}</div></Show>
          <section class="record-line" aria-label="Daily overview">
            <span><strong>{data().jobs.length}</strong> roles shortlisted</span>
            <span><strong>{data().jobs.filter(j => j.new_to_search).length}</strong> new in this edition</span>
            <span classList={{ issue: !!failures().length }}><strong>{data().sources.filter(s => !s.error).length}/{data().sources.length}</strong> feeds available</span>
            <span>Discovered {day(data().discovery_at)}</span>
          </section>
          <Show when={view() === 'Sources'} fallback={<>
            <div class="section-heading"><h2>{view() === 'Saved jobs' ? 'Selected possibilities' : 'Experience wanted'}</h2><span class="section-aside">{visible().length} entries · ordered by fit</span></div>
            <p class="section-description">{view() === 'Saved jobs' ? 'The roles you kept for a second reading.' : 'The next section of the résumé is still open.'}</p>
            <div class="filters" role="search" aria-label="Filter job entries">
              <label class="search">Find in document<input aria-label="Search jobs" placeholder="Role, company, or skill" value={search()} onInput={e => setSearch(e.currentTarget.value)}/></label>
              <label class="select">Discipline<select aria-label="Role type" value={role()} onChange={e => setRole(e.currentTarget.value)}><For each={['All roles', ...Array.from(new Set(data().jobs.map(j => j.role)))]}>{r => <option>{r}</option>}</For></select></label>
              <label class="select">Location<select aria-label="Work location" value={workplace()} onChange={e => setWorkplace(e.currentTarget.value)}><For each={['All locations', 'Remote', 'Chicago hybrid', 'Clarify']}>{r => <option>{r}</option>}</For></select></label>
              <label class="select">Recency<select aria-label="Freshness" value={freshness()} onChange={e => setFreshness(e.currentTarget.value)}><For each={['All dates', 'New to search', 'Published within 72h']}>{r => <option>{r}</option>}</For></select></label>
            </div>
            <p class="filter-note">New to the search ≠ newly posted. Publication and verification dates are recorded separately.</p>
            <Show when={visible().length} fallback={<div class="empty"><h3>{view() === 'Saved jobs' ? 'Nothing under consideration. Yet.' : 'No entries match these criteria.'}</h3><p>{view() === 'Saved jobs' ? 'Use “Keep for review” on a role to add it here. Saves stay in this browser.' : 'Try another role, company, or location.'}</p><button onClick={() => { clear(); if (view() === 'Saved jobs') setView('Discover'); }}>Return to the shortlist</button></div>}>
              <div class="jobs"><For each={visible()}>{job => <article class="job-entry">
                <header>
                  <div class="entry-heading"><div class="company">{job.company}</div><span class="entry-date">Verified {day(job.employer_verified_at)}</span></div>
                  <div class="entry-title"><h3><a href={safeUrl(job.employer_url)} target="_blank" rel="noopener noreferrer">{job.title}</a></h3><span class="salary">{job.salary}</span></div>
                </header>
                <div class="entry-classification"><span>{job.role}</span><span>{job.workplace}</span><Show when={job.new_to_search}><span class="annotation">New to the search</span></Show><Show when={job.fresh_72h}><span class="annotation">Published within 72h</span></Show></div>
                <p class="entry-location">{job.arrangement}</p>
                <ul class="evidence-preview"><li>{job.evidence[0] || 'Review the employer requirements and recorded gaps before applying.'}</li></ul>
                <details><summary>Read qualifications & fine print <span aria-hidden="true">+</span></summary><div class="details-grid">
                  <div><h4>Supported experience</h4><ul><For each={job.evidence}>{x => <li>{x}</li>}</For></ul><Show when={job.transferable.length}><h4>Transferable experience</h4><ul><For each={job.transferable}>{x => <li>{x}</li>}</For></ul></Show></div>
                  <div><h4>Gaps & open questions</h4><ul><For each={job.gaps}>{x => <li>{x}</li>}</For></ul><Show when={!job.gaps.length}><p>No additional gaps recorded; review requirements.</p></Show><h4>Responsibility & compensation</h4><ul><For each={job.responsibilities}>{x => <li>{x}</li>}</For></ul><p>{job.salary_scope}</p></div>
                  <div class="provenance"><h4>Record of verification</h4><p>Published: {day(job.published_at)} · Source updated: {day(job.source_updated_at)} · First seen: {day(job.first_seen)} · Employer verified: {day(job.employer_verified_at)}</p><Show when={job.requisition_id}><p>Requisition: {job.requisition_id}</p></Show><For each={job.sources}>{s => <a href={safeUrl(s.url)} target="_blank" rel="noopener noreferrer">{s.name}</a>}</For></div>
                </div></details>
                <footer class="entry-actions"><button class="save" classList={{ saved: saved().includes(job.id) }} aria-pressed={saved().includes(job.id)} aria-label={`${saved().includes(job.id) ? 'Unsave' : 'Save'} ${job.company} ${job.title}`} onClick={() => toggle(job.id)}>{saved().includes(job.id) ? 'Kept for review' : 'Keep for review'}</button><a class="apply" href={safeUrl(job.application_url)} target="_blank" rel="noopener noreferrer">View application</a></footer>
              </article>}</For></div>
            </Show>
            <p class="footnote">{data().selection_note} Kept roles are saved in this browser, not recorded as applications. Already applied roles are excluded.</p>
          </>}>
            <div class="section-heading"><h2>Sources & references</h2><span class="section-aside">{data().sources.length} public feed records</span></div>
            <p class="section-description">Counts are discovery leads, before fit review and deduplication. A successful feed is not exhaustive coverage.</p>
            <div class="source-list"><For each={data().sources}>{s => <div class="source-row"><div><strong>{s.name}</strong><small>Checked {day(s.checked_at)}{s.baseline ? ' · Initial baseline' : ''}</small><Show when={s.error}><p class="source-error">{s.error}</p></Show></div><span>{s.count} leads</span><span classList={{ 'health-error': !!s.error }}>{s.error ? 'Failed' : 'Available'}</span></div>}</For></div>
            <div class="section-heading"><h2>Research notes</h2></div><p class="section-description">Public board and community reviews. Counts include only unique employer-verified matches.</p>
            <div class="source-list"><For each={data().board_reviews || []}>{s => <div class="source-row"><div><strong>{s.name}</strong><small>Reviewed {day(s.checked_on)}</small><Show when={s.access_problem}><p class="source-error">{s.access_problem}</p></Show></div><span>{s.verified_matches} matches</span><span classList={{ 'health-error': !!s.access_problem }}>{s.access_problem ? 'Limited access' : 'Reviewed'}</span></div>}</For></div>
            <div class="section-heading"><h2>Further reading</h2><span class="section-aside">Public discovery directory</span></div><p class="section-description">Directory links do not imply an enabled integration. Account and paid features are not included.</p><div class="boards"><For each={data().boards}>{b => <a href={safeUrl(b.url)} target="_blank" rel="noopener noreferrer">{b.name}<small>{b.access.replaceAll('_', ' ')}</small></a>}</For></div>
          </Show>
          <footer class="page-footer"><span>Prepared {day(data().generated_at)} · Daily discovery, 9 AM Chicago</span><a href={`${import.meta.env.BASE_URL}data/latest.json`}>Supporting document: JSON</a></footer>
        </>}</Show>
      </div>
    </main>
    <footer class="desk-footer"><span>A working document. Subject to a good offer.</span><button class="text-button" onClick={() => refetch()} disabled={feed.loading}>{feed.loading ? 'Retrieving update…' : 'Retrieve latest edition'}</button></footer>
  </div>;
}
