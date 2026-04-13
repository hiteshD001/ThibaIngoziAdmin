# Deployment Runbook

## Required repository settings

Configure these once in GitHub:

1. Branch protection on `master`
   - Require a pull request before merging
   - Require status checks to pass before merging
   - Required check: `quality (build gate)` from `CI`
   - Require branches to be up to date before merging
   - Optionally require at least one approving review

2. Actions secrets
   - `PROD_HOST` (or `DEPLOY_HOST`)
   - `PROD_USER` (or `DEPLOY_USER`)
   - `PORT_PORT` (or `DEPLOY_PORT`, defaults to `22`)
   - `PROD_SSH_KEY` (or `SSH_PRIVATE_KEY`, private key for deploy user)
   - `PROD_PATH` (or `DEPLOY_PATH`, required; server repo directory)
   - `PROD_URL`
   - Any build-time `VITE_*` values used during production build

## Release flow

1. Merge PR into `master`
2. `CI` workflow runs:
   - install dependencies
   - build
   - artifact upload (`dist`)
   - non-blocking lint report (`lint (non-blocking)`)
3. `Deploy Production` workflow runs only if CI succeeded on push to `master`
4. Deploy connects to server over SSH
5. In `PROD_PATH`, server runs: `git fetch`, `git checkout <sha>`, `npm ci`, `npm run build`, `pm2 reload all`
6. Smoke checks verify health and core asset availability

## Auto rollback flow

Rollback is triggered automatically if `Deploy Production` fails:

1. `Rollback Production` checks out previous commit (or provided commit SHA)
2. Server rebuilds and reloads PM2
3. Smoke check verifies restored service

## Manual rollback

Use GitHub Actions:

1. Open `Actions`
2. Select `Rollback Production`
3. Click `Run workflow`

## Operational notes

- Concurrency lock prevents overlapping production deploys.
- Use PM2 cluster mode for true zero-downtime on `pm2 reload all`.
- Rotate any leaked credentials immediately and replace with new secrets.
