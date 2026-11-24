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
  return <div class="shell">
    <aside class="sidebar">
      <a class="brand" href="#main" onClick={() => setView('Discover')}><span class="brandmark">jt<span>.</span></span><span>Jobsearch<br/><strong>toolbox</strong></span></a>
      <div class="nav-label">WORKSPACE</div>
      <nav aria-label="Workspace"><For each={['Discover', 'Saved jobs', 'Sources']}>
        {(item, index) => <button classList={{ active: view() === item }} onClick={() => setView(item)} aria-current={view() === item ? 'page' : undefined}>
          <span aria-hidden="true" class="nav-icon">{['◫', '☆', '◎'][index()]}</span>{item}
          <Show when={item === 'Saved jobs'}><span class="count">{(feed()?.jobs || []).filter(j => saved().includes(j.id)).length}</span></Show>
        </button>}
      </For></nav>
      <div class="sidebar-note"><span class="small-label">THE SEARCH</span><p>Good work.<br/>Room to grow.</p><span>Software engineering<br/>US remote & Chicago</span></div>
      <div class="sidebar-footer"><span class="avatar">JM</span><span>Jerry MacPherson<small>Personal workspace</small></span></div>
    </aside>
    <main id="main">
      <header class="topbar"><span>YOUR NEXT CHAPTER</span><a href="https://github.com/jmpherso/jmpherso.github.io">View project</a></header>
      <div class="content">
        <div class="page-heading"><div><div class="eyebrow">A LITTLE MOMENTUM, EVERY MORNING</div><h1>{view() === 'Discover' ? 'Find your next good fit.' : view() === 'Saved jobs' ? 'Worth a closer look.' : 'A wider search.'}</h1><p class="intro">{view() === 'Sources' ? 'Public boards, employer feeds, and an honest view of coverage.' : 'A focused shortlist. Clear tradeoffs. A place to move things forward.'}</p></div><button class="refresh" onClick={() => refetch()} disabled={feed.loading}>Refresh update</button></div>
        <Show when={loadError()}><div class="alert" role="alert">We couldn’t load the daily update. {loadError()} <button onClick={() => refetch()}>Try again</button></div></Show>
        <Show when={feed.loading && !feed()}><div class="empty" role="status">Loading your shortlist…</div></Show>
        <Show when={feed()}>{data => <>
          <Show when={stale()}><div class="alert">The last discovery run is over 36 hours old. Listings below retain their original verification dates.</div></Show>
          <Show when={data().jobs.length < data().target_count}><div class="alert">{data().jobs.length} qualifying roles are available toward the ~{data().target_count} target. The shortlist will grow as more relevant listings are verified.</div></Show>
          <Show when={storageMessage()}><div class="alert" role="status">{storageMessage()}</div></Show>
          <section class="stats" aria-label="Daily overview">
            <div><span>IN YOUR SHORTLIST</span><strong>{data().jobs.length}<small> / ~{data().target_count}</small></strong><p>Ranked by fit & scope</p></div>
            <div><span>NEW TO THE SEARCH</span><strong>{data().jobs.filter(j => j.new_to_search).length.toString().padStart(2, '0')}</strong><p>First seen today · not posting date</p></div>
            <div><span>FEEDS CHECKED</span><strong>{data().sources.filter(s => !s.error).length}<small> / {data().sources.length}</small></strong><p>{failures().length ? `${failures().length} need attention` : 'All reporting successfully'}</p></div>
            <div class="update-stat"><span>LATEST DISCOVERY</span><strong>{day(data().discovery_at)}</strong><p>Shortlist exported {day(data().generated_at)}</p></div>
          </section>
          <Show when={view() === 'Sources'} fallback={<>
            <div class="section-heading"><div><h2>{view() === 'Saved jobs' ? 'Your saved shortlist' : 'The shortlist'} <span>{visible().length}</span></h2><p>Employer-verified listings, with the details that matter.</p></div><span class="sort-note">Ordered by fit, then verification date</span></div>
            <div class="filters">
              <label class="search"><span aria-hidden="true">⌕</span><input aria-label="Search jobs" placeholder="Search role, company, or skill…" value={search()} onInput={e => setSearch(e.currentTarget.value)}/></label>
              <label class="select"><span class="sr-only">Role type</span><select value={role()} onChange={e => setRole(e.currentTarget.value)}><For each={['All roles', ...Array.from(new Set(data().jobs.map(j => j.role)))]}>{r => <option>{r}</option>}</For></select></label>
              <label class="select"><span class="sr-only">Work location</span><select value={workplace()} onChange={e => setWorkplace(e.currentTarget.value)}><For each={['All locations', 'Remote', 'Chicago hybrid', 'Clarify']}>{r => <option>{r}</option>}</For></select></label>
              <label class="select"><span class="sr-only">Freshness</span><select value={freshness()} onChange={e => setFreshness(e.currentTarget.value)}><For each={['All dates', 'New to search', 'Published within 72h']}>{r => <option>{r}</option>}</For></select></label>
            </div>
            <Show when={visible().length} fallback={<div class="empty"><h3>{view() === 'Saved jobs' ? 'Keep a few possibilities close.' : 'No jobs match these filters.'}</h3><p>{view() === 'Saved jobs' ? 'Use Save job on any listing. Saves stay in this browser; they do not change application status.' : 'Try another company, skill, or location.'}</p><button onClick={() => { clear(); if (view() === 'Saved jobs') setView('Discover'); }}>Browse the shortlist</button></div>}>
              <div class="jobs"><For each={visible()}>{(job, index) => <article class="job-card">
                <div class="job-top"><div class="company-icon" aria-hidden="true" style={{ '--hue': `${(job.company.charCodeAt(0) * 37) % 360}` }}>{job.company.slice(0, 1)}</div><div class="job-title"><div class="company">{job.company}<span class="rank">{String(index() + 1).padStart(2, '0')}</span></div><h3><a href={safeUrl(job.employer_url)} target="_blank" rel="noopener noreferrer">{job.title}</a></h3></div><button class="save" classList={{ saved: saved().includes(job.id) }} aria-pressed={saved().includes(job.id)} aria-label={`${saved().includes(job.id) ? 'Unsave' : 'Save'} ${job.company} ${job.title}`} onClick={() => toggle(job.id)}>{saved().includes(job.id) ? '★ Saved' : '☆ Save job'}</button></div>
                <div class="tags"><span>{job.role}</span><span>{job.workplace}</span><Show when={job.new_to_search}><span class="new">New to search</span></Show><Show when={job.fresh_72h}><span class="fresh">Published within 72h</span></Show></div>
                <div class="job-meta"><strong>{job.salary}</strong><span>{job.arrangement}</span></div>
                <div class="fit-preview"><span>WHY IT’S HERE</span><p>{job.evidence[0] || 'Review the employer requirements and listed gaps before applying.'}</p></div>
                <details><summary>Match details & tradeoffs <span aria-hidden="true">+</span></summary><div class="details-grid">
                  <div><h4>Supported evidence</h4><ul><For each={job.evidence}>{x => <li>{x}</li>}</For></ul><Show when={job.transferable.length}><h4>Transferable experience</h4><ul><For each={job.transferable}>{x => <li>{x}</li>}</For></ul></Show></div>
                  <div><h4>Gaps & questions</h4><ul><For each={job.gaps}>{x => <li>{x}</li>}</For></ul><Show when={!job.gaps.length}><p>No additional gaps recorded; review requirements.</p></Show><h4>Responsibility & compensation</h4><ul><For each={job.responsibilities}>{x => <li>{x}</li>}</For></ul><p>{job.salary_scope}</p></div>
                  <div class="provenance"><h4>Dates & sources</h4><p>Published: {day(job.published_at)} · Source updated: {day(job.source_updated_at)} · First seen: {day(job.first_seen)} · Employer verified: {day(job.employer_verified_at)}</p><Show when={job.requisition_id}><p>Requisition: {job.requisition_id}</p></Show><For each={job.sources}>{s => <a href={safeUrl(s.url)} target="_blank" rel="noopener noreferrer">{s.name}</a>}</For></div>
                </div></details>
                <footer class="job-footer"><span>Employer verified {day(job.employer_verified_at)}</span><a class="apply" href={safeUrl(job.application_url)} target="_blank" rel="noopener noreferrer">View application</a></footer>
              </article>}</For></div>
            </Show>
            <p class="footnote">{data().selection_note} Saved jobs stay in this browser and are not application records. Already applied roles are excluded.</p>
          </>}>
            <div class="section-heading"><div><h2>Source health</h2><p>Counts are discovery leads, before fit review and deduplication. A successful feed is not exhaustive coverage.</p></div></div>
            <div class="source-list"><For each={data().sources}>{s => <div class="source-row"><div><strong>{s.name}</strong><small>Checked {day(s.checked_at)}{s.baseline ? ' · Initial baseline' : ''}</small><Show when={s.error}><p class="source-error">{s.error}</p></Show></div><span>{s.count} leads</span><span classList={{ 'health-error': !!s.error }} class="health">{s.error ? 'Failed' : 'Available'}</span></div>}</For></div>
            <h2 class="board-title">Board & community reviews</h2><p class="intro">Public web research supplements the feeds. Counts include only unique employer-verified matches.</p>
            <div class="source-list board-reviews"><For each={data().board_reviews || []}>{s => <div class="source-row"><div><strong>{s.name}</strong><small>Reviewed {day(s.checked_on)}</small><Show when={s.access_problem}><p class="source-error">{s.access_problem}</p></Show></div><span>{s.verified_matches} matches</span><span class="health" classList={{ 'health-error': !!s.access_problem }}>{s.access_problem ? 'Limited access' : 'Reviewed'}</span></div>}</For></div>
            <h2 class="board-title">Explore more boards</h2><p class="intro">Public discovery sources. A directory link does not mean an automated integration is enabled. Account and paid features are not included.</p><div class="boards"><For each={data().boards}>{b => <a href={safeUrl(b.url)} target="_blank" rel="noopener noreferrer">{b.name}<small>{b.access.replaceAll('_', ' ')}</small></a>}</For></div>
          </Show>
          <footer class="page-footer"><span>A thoughtful search beats a noisy one.</span><a href={`${import.meta.env.BASE_URL}data/latest.json`}>Daily JSON</a><span>Daily discovery · 9 AM Chicago</span></footer>
        </>}</Show>
      </div>
    </main>
  </div>;
}
