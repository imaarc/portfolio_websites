# EIPI Belettering Redesign - Debugging Log

## Known Issues

### HTTP 429 During Asset Extraction

Status: Open  
Source phase: #002 Asset Discovery

During prior public website inspection, repeated WordPress asset requests triggered HTTP 429 rate limiting.

Impact:

- Full local image archive is incomplete.
- Exact image dimensions and optimized derivatives are not yet available.

Working approach:

- Avoid aggressive scraping.
- Use the uploaded logo reference immediately.
- Use gentle public asset checks only when necessary.
- Prefer existing conversation records and user-provided files when available.

## Local Baseline Notes

### No Existing App Found

Status: Confirmed

The local workspace contains no existing React source, dependency manifest, build config, or git repository.

Resolution:

- A new React frontend must be scaffolded before implementation.

### npm Cache EPERM During Scaffold

Status: Fixed

The first scaffold attempt failed because npm tried to write to the default cache under the user's local app data directory. That path is outside the current writable workspace and returned `EPERM`.

Fix:

- Redirected npm cache to `work/npm-cache` and reran the scaffold.

### Initializer Argument Shape

Status: Fixed

After fixing the npm cache path, the `npm create` wrapper passed `shadcn` as an extra positional argument and the initializer returned `too many arguments`.

Fix:

- Invoked `npx @openai/create-sites@0.3.0` directly with the expected directory/options shape.

### Scaffold Dependency Audit Warnings

Status: Open

The scaffold install reported 11 vulnerabilities in the dependency tree.

Decision:

- Do not run `npm audit fix --force` during the visual-design phase because forced dependency upgrades could destabilize the scaffold. Revisit during a dedicated dependency/security pass.

### Build Validation

Status: Passing

Production build passed after the first visual slice and again after the full planned architecture skeleton was added.

### Local Preview Validation

Status: Passing

The local preview server started at `http://localhost:3000/`, and the root route returned HTTP 200 after implementation.

### Sites Deployment Still Publishing

Status: Open

Private Sites deployment was started after a successful source push, package validation, and saved version. The deployment status remains `publishing`, with no production URL and no failure message yet.

Impact:

- The local preview is usable.
- Sites version 1 is saved.
- Production URL handoff is delayed.

Next step:

- Recheck deployment status later.
