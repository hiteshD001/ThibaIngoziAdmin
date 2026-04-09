# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Production CI/CD (master)

This repository uses GitHub Actions for safe auto-deploy on `master`.
Detailed runbook: `docs/deploy.md`.

### Workflow files

- `.github/workflows/ci.yml`
  - Runs on pull requests and pushes to `master`
  - Hard gate (`quality` job) executes:
    - `npm ci`
    - `npm run build`
  - Non-blocking visibility job executes:
    - `npm run lint`
  - Uploads the tested `dist` artifact for push events to `master`

- `.github/workflows/deploy-prod.yml`
  - Triggers only when the `CI` workflow completes successfully for a push to `master`
  - Uses concurrency lock (`production-deploy`) to prevent overlapping releases
  - SSHes to your server project directory and runs deploy commands
  - Runs smoke checks:
    - Production URL returns success
    - Critical JS asset is reachable
  - Calls rollback workflow automatically if deployment flow fails

- `.github/workflows/rollback-prod.yml`
  - Can be triggered manually (`workflow_dispatch`) or called by other workflows
  - Restores previous git commit on server and reloads PM2
  - Verifies rollback with a smoke check

### Required GitHub Secrets

Set these in repository **Settings -> Secrets and variables -> Actions**:

- `DEPLOY_HOST`: Production server hostname or IP
- `DEPLOY_USER`: SSH user used by Actions for deployment
- `DEPLOY_PORT`: SSH port (optional, defaults to 22)
- `SSH_PRIVATE_KEY`: Private SSH key for `DEPLOY_USER`
- `PROD_PATH`: Server app repo path where `git`, `npm`, and `pm2` commands run
- `PROD_URL`: Public production URL (used for smoke checks and rollback verification)
- Any required `VITE_*` variables for production build, if your build depends on them

Current workflow compatibility:
- `PROD_HOST` or `DEPLOY_HOST`
- `PROD_USER` or `DEPLOY_USER`
- `PORT_PORT` or `DEPLOY_PORT`
- `PROD_SSH_KEY` or `SSH_PRIVATE_KEY`
- `PROD_PATH` or `DEPLOY_PATH` (required; for you this is `ThibaIngoziAdmin` path on server)

### Branch protection (must configure in GitHub UI)

Configure branch protection for `master`:

1. Require a pull request before merging
2. Require status checks to pass
3. Mark `CI / quality` as a required check
4. Require branches to be up to date before merging
5. Optionally require at least one approving review

### Release flow

1. PR is opened against `master`
2. CI validates build (lint is reported but non-blocking)
3. PR is merged to `master`
4. CI runs again on push
5. Deploy workflow SSHes to server, checks out target commit, builds, and runs `pm2 reload all`
6. Smoke checks validate production health

### Failure matrix

- **Build failure:** deploy is blocked
- **Lint failure:** visible in CI but does not block deploy
- **Server deploy failure:** deploy workflow fails, rollback workflow is called
- **Smoke check failure:** deploy workflow fails, rollback workflow is called
- **Rollback verification failure:** rollback workflow reports failure for manual intervention

### Manual rollback

If needed, run `Rollback Production` from the Actions tab (`workflow_dispatch`).

### Security note

Rotate any exposed credentials immediately and store only current secrets in GitHub Actions secrets.
