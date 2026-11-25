# Jobsearch Toolbox

A Solid + TypeScript site hosted at https://jmpherso.github.io. The browser loads /data/latest.json independently of the app build.

## Develop

Run npm ci, npm run check, and npm run build. Run npm run dev for a local preview. Static output goes to dist/. main stores source and public/data/latest.json; gh-pages stores the published build and data/latest.json. Existing GitHub Pages branch publishing handles deployment. Never put private search records in this repository.

## Morning publishing contract

The existing Codex job discovery heartbeat runs daily at 9 AM America/Chicago. It performs discovery, employer verification and tracker updates, then exports a public snapshot. This website does not itself run a job collector or send applications.

1. Read the private workspace AGENTS.md, candidate profile, tracker, source catalog and employer watchlist. Run the public collector once per daily pass. Review daily-priority boards plus eight accessible rotating sources; record source failures and yield. First source scans are baselines.
2. Refresh strong existing candidates along with new discoveries. Aim for around 25 useful roles. Never invent verification or pad with unsuitable listings. Keep original publication, source update, first-seen and employer-verification dates separate. Ashby last-published timestamps do not establish original publication.
3. From the private workspace, run python export_toolbox.py. Alternatively run this repository copy with --workspace set to the private search directory and --output set to public/data/latest.json. Python needs America/Chicago timezone data. Run python -m unittest test_export_toolbox after changing export logic.
4. Review the JSON. Only allowlisted listing fields, source health and public board review metadata may leave the private workspace. Never publish candidate profiles, tracker files, resumes, addresses, email, screening answers, application confirmations or credentials. Retain source credits and mandated application links.
5. Archive the export locally as discovery/toolbox-history/YYYY-MM-DD.json in the private workspace. Use the connected GitHub plugin to fetch public/data/latest.json on main, then update it using the current blob SHA. Fetch data/latest.json on gh-pages, then update it using its current blob SHA. Use the SAME JSON contents in both writes. If a lease fails, inspect the current file before retrying. Do not force branches or overwrite unrelated files. If a file is missing unexpectedly, inspect branch contents before creating it.
6. Verify the deployed public JSON at https://jmpherso.github.io/data/latest.json has the expected generated_at and job IDs. Pages/CDN propagation may take time. Failed publication is an actionable failure, not success. Leave the last successful update intact if discovery/export fails; publish actual source failures when the export succeeds.
7. Notify the user only about meaningful new matches, material changes, actionable failures or required input. An ordinary successful daily refresh does not require a chat notification.

## Selection and privacy

The export uses employer-verification timestamps from the last 14 days. It excludes applied records, closed records and known hard conflicts, and deduplicates by employer and requisition/canonical URL. Applied identities suppress duplicate shortlist records. Scope/fit heuristics prioritize realistic junior and mid-level work; compensation never boosts rank. These heuristics are ordering aids, not hiring probabilities. Unknown salary or location eligibility stays a visible question.

The public JSON intentionally includes ordinary professional match evidence and gaps. The full private tracker stays local. Saved jobs use localStorage in the current browser and never mark a job applied. They are shown while the role remains in the current rolling shortlist; saves do not sync between devices. The site warns when discovery data is older than 36 hours. Availability can change after the displayed employer verification date.

## UI changes

After checks and browser QA, publish source changes to main and the matching static build to gh-pages using atomic Git tree/commit/ref updates. Preserve unrelated files and branch history. Add .nojekyll to the static output. Data-only daily refreshes require no rebuild. Keep the two JSON copies identical.


## Visual direction

The toolbox uses a resume-inspired document layout: white paper on a gray desktop, black rules, serif employer/role headings, dated entries, evidence bullets and restrained monospace notes. Preserve the jt mark in its original dark ink and mint colors. Keep humor limited to labels such as Experience wanted and Sources & references. Avoid dashboard tiles, pill badges, colored company avatars, a fixed sidebar and generic motivational hero copy. Search, saved roles, source health and the daily JSON remain functional tools within the document. Narrow screens reflow the sheet rather than shrinking the type.
