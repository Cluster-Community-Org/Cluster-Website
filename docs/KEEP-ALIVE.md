# Supabase Keep-Alive & Inactivity Protection Runbook

> **Operational guide and runbook for the CLUSTER automated keep-alive system**, preventing Supabase free-tier database pause through automated PostgREST queries.

[![Keep-Alive Status](https://img.shields.io/badge/Keep--Alive-Active-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Schedule](https://img.shields.io/badge/Schedule-Every%203%20Days-00E5FF?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/Cluster-Community-Org/Cluster-Website/actions)
[![Runtime](https://img.shields.io/badge/Runtime-Node.js%2018%2B-C6FF4D?style=for-the-badge&logo=node.js&logoColor=080808)](https://nodejs.org/)

---

## 1. System Overview & The Supabase Inactivity Rule

### 1.1 The Supabase Free-Tier 7-Day Inactivity Rule
Supabase Free Plan projects are automatically paused after **7 consecutive days of zero database activity** ([Supabase Project Management Documentation](https://supabase.com/docs/guides/platform/pausing)).

When a project is paused:
- The PostgreSQL database container and compute virtual machine are shut down.
- Persistent data, tables, schemas, and configurations remain safely stored on disk.
- Any subsequent web requests to the database return `503 Service Unavailable` or connection timeouts, causing application downtime for website visitors.
- Restoring a paused project requires manual intervention in the Supabase Dashboard ("Resume project"), which can take several minutes to re-provision compute resources.

### 1.2 What Qualifies as Activity?
Supabase calculates inactivity strictly based on **PostgreSQL database operations**:
- **Qualifying Activity**:
  - SQL queries executed via the PostgREST API (e.g. `GET /rest/v1/<table>?select=...`).
  - Direct or connection-pooled SQL queries (`pg`, Prisma, Drizzle, psql).
  - Supabase RPC function calls executing PostgreSQL logic.
- **Non-Qualifying Activity (Does NOT prevent pausing)**:
  - API Gateway health checks (e.g. `GET /auth/v1/health` hits only the GoTrue Go daemon without querying Postgres).
  - Visiting the Supabase Web Dashboard / Studio (unless queries are explicitly executed in the SQL Editor).
  - Unauthenticated requests that are rejected at the Kong API Gateway before reaching PostgREST (e.g. `GET /rest/v1/` returning `401 Unauthorized`).

The CLUSTER keep-alive system executes a lightweight PostgREST query against `public.homepage_config`, directly issuing `SELECT id FROM homepage_config LIMIT 1;` against the PostgreSQL database engine to reset the 7-day timer.

---

## 2. System Architecture & Target Endpoints

```
┌─────────────────────────────────┐
│     GitHub Actions Workflow     │
│   (Schedule: 0 4 */3 * *)       │
└────────────────┬────────────────┘
                 │
                 ▼ HTTPS GET /rest/v1/homepage_config?select=id&limit=1
┌─────────────────────────────────┐
│       Supabase Kong Gateway     │  ◄── Validates 'apikey' Header
└────────────────┬────────────────┘
                 │
                 ▼ Proxied Internal Request
┌─────────────────────────────────┐
│        PostgREST Engine         │  ◄── Authenticates 'anon' Role via Bearer Token
└────────────────┬────────────────┘
                 │
                 ▼ SQL Execution: SELECT id FROM homepage_config LIMIT 1;
┌─────────────────────────────────┐
│     PostgreSQL Database         │  ◄── Activity Timer Reset!
│  (Returns [{"id": 1}], 10 bytes)│
└─────────────────────────────────┘
```

### 2.1 Target Endpoint Specifications
- **Primary Endpoint**:
  `GET ${SUPABASE_URL}/rest/v1/homepage_config?select=id&limit=1`
  - **Table**: `public.homepage_config` (singleton table containing site headline & announcements).
  - **RLS Policy**: Public read permitted (`FOR SELECT TO anon, authenticated USING (true)` in `supabase/schema.sql`).
  - **Payload Size**: ~10 bytes (`[{"id":1}]`).
  - **Expected Status**: `200 OK`.
- **Fallback Endpoint**:
  `GET ${SUPABASE_URL}/rest/v1/events?select=id&limit=1`
  - **Table**: `public.events`.
  - **RLS Policy**: Public read permitted (`FOR SELECT TO anon, authenticated USING (true)`).
  - **Expected Status**: `200 OK`.

### 2.2 Required Headers
Every request must include the following headers:
| Header | Value | Purpose |
|---|---|---|
| `apikey` | `<SUPABASE_ANON_KEY>` | Satisfies Kong API Gateway routing requirements. |
| `Authorization` | `Bearer <SUPABASE_ANON_KEY>` | PostgREST session authentication for PostgreSQL `anon` role. |
| `Accept` | `application/json` | Enforces JSON response format. |

### 2.3 Built-in Resilience
- **Timeout**: 10 seconds per request using `AbortSignal.timeout(10000)`.
- **Retries**: Up to 3 attempts with exponential backoff (1s, 2s) for transient network glitches.
- **Key Masking**: Redacts sensitive key strings in stdout logs (e.g. `sb_pub...2EG0`).
- **Exit Codes**: Exit `0` on HTTP 200–299; Exit `1` on HTTP 4xx/5xx or unrecoverable error.

---

## 3. Scheduled Workflow Breakdown

The automated service is defined in [`.github/workflows/supabase-keepalive.yml`](../.github/workflows/supabase-keepalive.yml).

### 3.1 Cron Schedule: `0 4 */3 * *`
- `0`: 0th minute.
- `4`: 04:00 AM UTC.
- `*/3`: Every 3 days (1st, 4th, 7th, 10th, 13th, etc. of the month).
- `*`: Every month.
- `*`: Every day of the week.

#### Cadence Justification:
1. **Inactivity Safety**: A 3-day frequency easily satisfies the requirement to run between 1 and 5 days, leaving a 4-day safety window before Supabase's 7-day inactivity pause.
2. **Quota Efficiency**: Executing every 3 days requires only ~10 runs per month. With each run taking ~15 seconds total, the workflow consumes only ~2.5 runner minutes per month out of GitHub Actions' 2,000 free minutes (0.125% of quota).
3. **Queue Distribution**: Scheduling at 04:00 AM UTC avoids the midnight UTC (00:00 UTC) rush where GitHub Actions runners frequently experience scheduling delays.

### 3.2 Security & Permissions
- **Least-Privilege Token**: The workflow specifies `permissions: contents: read`.
- **Zero Secrets Hardcoded**: Credentials are dynamically injected from GitHub Repository Secrets into environment variables (`SUPABASE_URL` and `SUPABASE_ANON_KEY`).

### 3.3 GitHub Actions 60-Day Repository Inactivity Policy & Mitigation

> **Crucial Operational Notice**: GitHub Actions enforces an automatic inactivity policy on scheduled workflows to conserve compute infrastructure:  
> **In public repositories, scheduled workflows (`schedule: - cron: ...`) are automatically disabled if there has been no git commit activity in the repository for 60 consecutive days.**

#### The Dormancy Risk:
If the repository goes 60 days without a commit, GitHub suspends the keep-alive workflow. Automated pings will cease, and after 7 additional days (day 67), Supabase will pause the free-tier database.

#### How GitHub Alerts Maintainers:
1. **Email Notification**: GitHub automatically sends an email to repository administrators with the subject *"Workflows have been disabled in <owner>/<repo>"*.
2. **Web UI Banner**: A yellow alert banner appears at the top of the repository's **Actions** tab:  
   *"Workflows are disabled due to repository inactivity. You can enable them again in the Actions tab."*

#### How to Re-Enable the Workflow (One-Click Remediation):
- **Method 1: One-Click Web UI (Recommended)**:
  1. Open the repository on GitHub and navigate to the **Actions** tab.
  2. Click the banner button **"Enable workflows"** (or select **Supabase Keep-Alive** in the left sidebar and click **"Enable workflow"**).
  3. Click **"Run workflow"** (`workflow_dispatch`) to immediately execute a keep-alive ping and reset both GitHub's 60-day counter and Supabase's 7-day timer.
- **Method 2: Any Git Commit**:
  - Pushing any commit to any branch in the repository immediately resets GitHub's 60-day repository inactivity counter.
- **Method 3: GitHub CLI (`gh`)**:
  ```bash
  gh workflow enable supabase-keepalive.yml
  gh workflow run supabase-keepalive.yml
  ```


---

## 4. GitHub Repository Secrets Setup

To enable the automated workflow to ping Supabase in CI, configure the following secrets in your GitHub repository:

### 4.1 Via GitHub Web Interface
1. Navigate to your repository on GitHub: `https://github.com/<your-org>/<your-repo>`.
2. Click **Settings** (top right tab).
3. In the left navigation sidebar, expand **Secrets and variables** and select **Actions**.
4. Click the green button **New repository secret**.
5. Add Secret 1:
   - **Name**: `SUPABASE_URL`
   - **Secret**: `https://xkdjcunvxkxqrqbgxqrt.supabase.co` (or your Supabase project URL).
   - Click **Add secret**.
6. Add Secret 2:
   - **Name**: `SUPABASE_ANON_KEY`
   - **Secret**: Your public `anon` / `publishable` API key (e.g. `sb_publishable_...`).
   - Click **Add secret**.

### 4.2 Via GitHub CLI (`gh`)
If you have the [GitHub CLI](https://cli.github.com/) authenticated:
```bash
gh secret set SUPABASE_URL --body "https://xkdjcunvxkxqrqbgxqrt.supabase.co"
gh secret set SUPABASE_ANON_KEY --body "your-supabase-anon-or-publishable-key"
```

> **Security Note**: Never commit API keys or URLs into git commit history. The workflow and script automatically mask secrets so that values never leak into GitHub Actions job logs.

---

## 5. Manual Execution & On-Demand Testing

You do not need to wait for the scheduled cron job to test the system. The workflow supports on-demand execution via GitHub's `workflow_dispatch` trigger.

### 5.1 Via GitHub Web Interface
1. Go to your repository on GitHub and click the **Actions** tab.
2. In the left workflow sidebar, select **Supabase Keep-Alive**.
3. Click the **Run workflow** dropdown on the right side of the banner.
4. Leave branch set to `main` (or select your working branch) and click the green **Run workflow** button.
5. Refresh the page after 5 seconds to inspect the live execution run.

### 5.2 Via GitHub CLI (`gh`)
```bash
# Trigger the workflow
gh workflow run supabase-keepalive.yml

# Watch the running workflow in your terminal
gh run watch
```

---

## 6. Monitoring, Logs & Failure Alert Handling

### 6.1 Inspecting Run History & Logs
1. Navigate to **Actions** -> **Supabase Keep-Alive**.
2. Click on the latest workflow run.
3. Click on the `keep-alive` job.
4. Expand the step **Execute keep-alive ping** to review the execution output:
   ```
   [Keep-Alive] Target URL: https://xkdjcunvxkxqrqbgxqrt.supabase.co
   [Keep-Alive] Masked Key: sb_pub...EG0
   [Keep-Alive] Querying: /rest/v1/homepage_config?select=id&limit=1
   [Keep-Alive] Response Status: 200 OK (latency: 142ms)
   [Keep-Alive] Body: [{"id":1}]
   [Keep-Alive] Success: Supabase PostgreSQL database activity recorded!
   ```

### 6.2 Automatic Failure Notifications
- GitHub automatically sends email notifications to repository maintainers whenever a scheduled workflow run fails.
- To configure or verify your notification preferences:
  1. Go to your GitHub profile **Settings** -> **Notifications**.
  2. Under **Actions**, ensure notifications are enabled for failed workflows.

### 6.3 Incident Recovery & Troubleshooting
| Symptom / Error | Root Cause | Resolution Action |
|---|---|---|
| `Error: Missing SUPABASE_URL or SUPABASE_ANON_KEY` | Repository secrets are not set or names are misspelled. | Follow Section 4 to set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in GitHub Secrets. |
| HTTP Status `401 Unauthorized` | Invalid or rotated API key. | Obtain the current anon/publishable key from the Supabase Dashboard (**Settings -> API**) and update the secret. |
| HTTP Status `503 Service Unavailable` | Project was already paused due to prior inactivity before keep-alive was deployed. | Open the Supabase Dashboard, click **"Resume project"**, wait ~2 minutes for PostgreSQL to boot, then trigger a manual workflow run. |
| `Fetch error: AbortError / Timeout` | Transient network issue or Supabase platform maintenance. | The script retries automatically 3 times. If persistent, check [Supabase Status](https://status.supabase.com/). |
| `Scheduled workflow stopped running without errors / Actions Banner: "Workflows are disabled due to repository inactivity"` | GitHub Actions 60-day dormancy policy paused cron schedules because no commits were pushed for 60 days. | Go to the repository **Actions** tab and click **"Enable workflows"** (or run `gh workflow enable supabase-keepalive.yml`), then click **"Run workflow"** to trigger an immediate keep-alive ping. Pushing any new commit also resets the 60-day timer. |

---

## 7. Local Developer Verification

The keep-alive script [`scripts/keep-alive.js`](../scripts/keep-alive.js) can be run locally by any contributor. It automatically detects credentials from environment variables or reads them from `client/.env` / `.env`.

### 7.1 Using npm
From the `client/` directory:
```bash
npm run keep-alive:verify
```

From the repository root:
```bash
npm run keep-alive:verify --prefix client
```

### 7.2 Direct Node.js Execution
From the repository root (zero dependencies required):
```bash
node scripts/keep-alive.js
```

### 7.3 Multi-Platform Command-Line Verification

> **Note**: Replace `<YOUR_SUPABASE_ANON_KEY>` with your public `anon` key from `client/.env` or GitHub Secrets. If already exported to your environment variables (`SUPABASE_ANON_KEY`), the commands below will read it automatically.

#### macOS / Linux / Git Bash (curl):
```bash
# Read from environment variable or replace <YOUR_SUPABASE_ANON_KEY>
ANON_KEY="${SUPABASE_ANON_KEY:-<YOUR_SUPABASE_ANON_KEY>}"

curl -i -X GET "https://xkdjcunvxkxqrqbgxqrt.supabase.co/rest/v1/homepage_config?select=id&limit=1" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Accept: application/json"
```

#### Windows PowerShell:
```powershell
# Read from environment variable or replace <YOUR_SUPABASE_ANON_KEY>
$anonKey = if ($env:SUPABASE_ANON_KEY) { $env:SUPABASE_ANON_KEY } else { "<YOUR_SUPABASE_ANON_KEY>" }

$headers = @{
  "apikey"        = $anonKey
  "Authorization" = "Bearer $anonKey"
  "Accept"        = "application/json"
}
$res = Invoke-RestMethod -Uri "https://xkdjcunvxkxqrqbgxqrt.supabase.co/rest/v1/homepage_config?select=id&limit=1" -Headers $headers
Write-Output "Status: 200, Body: $($res | ConvertTo-Json -Compress)"
```

