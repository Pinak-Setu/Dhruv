# Deploying to Vercel (Project Dhruv)

This project uses Vercel for hosting the Next.js dashboard. There are two ways to deploy:

1) Automatic GitHub Actions deployment (recommended)
  - We added `.github/workflows/vercel-deploy-demo-branch.yml` which deploys the `demo-glass-component` branch to a Vercel preview on push, and allows manual workflow dispatchting to deploy to production.
  - The workflow requires these GitHub repo secrets to be set:
    - `VERCEL_TOKEN` - A Vercel Personal Token with `scope=all` or at least project write access.
    - `VERCEL_ORG_ID` - Organization ID for the Vercel project.
    - `VERCEL_PROJECT_ID` - Project ID for the Vercel project.

  Steps to configure:
  - Add the three secrets to GitHub: Go to repo -> Settings -> Secrets -> Actions and add the values.
  - Push to `demo-glass-component` to trigger a preview deploy.
  - You can also run the workflow manually and choose `environment: prod` to deploy to production.

2) Local CLI deploy (quick immediate deploy)
  - Install the Vercel CLI: `npm i -g vercel` or `npx vercel`.
  - Login: `vercel login`
  - Optionally pull remote env: `npx vercel pull --yes --environment=preview`
  - Deploy (preview): `npx vercel` or `npx vercel --token $VERCEL_TOKEN`
  - Deploy (prod): `npx vercel --prod` or run `npm run deploy` (which uses `vercel --prod`)

Notes:
  - `vercel.json` exists and configures the project framework and commands.
  - If you want the `demo-glass-component` branch to produce a production deploy by default, set the workflow's `vercel deploy` to `--prod` (this will require careful review).
  - If you need me to automatically promote preview->prod on approval, I can add a separate workflow to run on PR merge.

If you'd like, I can:
  - Add a branch-specific Vercel deployment label and rules, or
  - Add a GitHub Action that creates a Vercel preview per PR (the Vercel GitHub App provides this automatically), or
  - Trigger a local CLI deploy if you provide a Vercel token and want me to run it for you (not needed if you prefer to run it manually).
