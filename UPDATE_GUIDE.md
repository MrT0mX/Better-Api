# Update Guide

> Maintained by MrTomXxX. Keep this guide in sync with `README.md` and the CI workflow.

## Current Tested Runtime

- Node.js: `22.22.1` (pinned in `.nvmrc`)
- Install: `npm ci --legacy-peer-deps`
- Checks: `npm test`
- Dashboard: `/docs` after signing in
- Health: `/healthz`

Node 24 was checked during the current update. The installed `canvas@2.11.2` native binary was built for Node 22 and would not load on Node 24. Do not change the supported Node version until a clean install, native build, and app smoke test pass on that version.

`canvacord` is pinned to `5.3.0` because `5.4.x` runs a forced network asset download during installation and did not exit after all assets were downloaded in this environment. Test that package's existing `Canvas.*` API before upgrading it.

## Update Dependencies Safely

1. Review available updates:

   ```bash
   npm outdated
   npm audit
   ```

2. Apply compatible updates within existing version ranges:

   ```bash
   npm update --legacy-peer-deps
   ```

3. Recreate and test the install from the lockfile:

   ```bash
   npm ci --legacy-peer-deps
   npm test
   npm start
   ```

4. In another terminal, check the health response:

   ```bash
   curl -i http://localhost:8080/healthz
   ```

   A `200` response means the API and MongoDB are connected. A `503` response means the HTTP app is up but MongoDB is unavailable or misconfigured.

5. Review the diff for unexpected major-version changes, then commit `package.json` and `package-lock.json` together.

Dependabot checks npm packages and GitHub Actions weekly and opens reviewable pull requests. Run the checks above on every update PR before merging.

## Upgrade Node.js

1. Install the version recorded in `.nvmrc` and switch to it:

   ```bash
   nvm install
   nvm use
   node --version
   ```

2. To evaluate a newer LTS, update `.nvmrc` and the supported range in `engines.node` in `package.json`. CI reads `.nvmrc` automatically, so it will use the same pinned runtime.

3. Reinstall from scratch in a clean worktree or after preserving any local work. Native modules such as `canvas` must be built for the selected Node version. On Ubuntu, install the build libraries listed in the CI workflow first.

4. Run `npm ci --legacy-peer-deps`, `npm test`, start the server, and confirm `/healthz` plus representative image/GIF endpoints. Keep the new Node version only if all checks pass.

5. Update this guide and the README with the new tested version. Do not label a Node release as supported based only on `npm install` succeeding.

## API Credentials

Keep MongoDB, SMTP, reCAPTCHA, Cuttly, and Bitly credentials in `.env` or the hosting provider's secret settings. Never commit real credentials. The link-shortener credentials previously stored in source should be rotated at their providers; removing them from the current files does not remove them from Git history.
