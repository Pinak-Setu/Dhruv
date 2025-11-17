# How to add Vercel secrets to GitHub

This document lists the exact steps and CLI commands to add your Vercel tokens and optional GitHub project token to the repository's GitHub secrets.

Required repo secrets:
- `VERCEL_TOKEN` - Vercel Personal Token
- `VERCEL_ORG_ID` - Vercel Organization ID
- `VERCEL_PROJECT_ID` - Vercel Project ID

Optional repo secret:
- `GH_PROJECT_TOKEN` - GitHub token used to update project boards (if you use the automations in workflows)

Step A: Obtain the required Vercel values
1. Vercel Personal Token
   - Go to https://vercel.com/account/tokens
   - Create a Personal Token with at least project access; copy it.

2. Vercel Organization ID and Project ID
   - Use the Vercel CLI or Web UI.

   Via the CLI:
   ```zsh
   npm i -g vercel
   vercel login # (or just use `npx vercel login`) if you haven’t
   vercel projects ls --token $VERCEL_TOKEN
   # or to show project details
   vercel inspect <project-name> --token $VERCEL_TOKEN
   # If you need the org id directly
   vercel teams ls --token $VERCEL_TOKEN
   ```

   Via the Web UI:
   - Open your Vercel project and grab the Project ID from the project settings (General -> Project ID)
   - Organization ID is in the organization settings (Settings -> General -> Organization ID)

Step B: Add secrets to GitHub Repo using UI
1. Visit your repository on GitHub -> Settings -> Secrets and variables -> Actions -> New repository secret
2. Add the three secrets:
   - Name: `VERCEL_TOKEN`  | Value:  `<paste token here>`
   - Name: `VERCEL_ORG_ID`  | Value:  `<paste org id here>`
   - Name: `VERCEL_PROJECT_ID` | Value: `<paste project id here>`
3. Optionally add `GH_PROJECT_TOKEN` if you use project-board updates from workflows.

Step C: (Optional) Add secrets using GitHub CLI
```zsh
# Configure: ensure you're in the repo directory or set --repo owner/repo
# Add Vercel token
gh secret set VERCEL_TOKEN --body "<your_vercel_token>" --repo $GITHUB_OWNER/$GITHUB_REPO
# Add org id
gh secret set VERCEL_ORG_ID --body "<your_org_id>" --repo $GITHUB_OWNER/$GITHUB_REPO
# Add project id
gh secret set VERCEL_PROJECT_ID --body "<your_project_id>" --repo $GITHUB_OWNER/$GITHUB_REPO
# Optional: GH_PROJECT_TOKEN
gh secret set GH_PROJECT_TOKEN --body "<your_gh_proj_token>" --repo $GITHUB_OWNER/$GITHUB_REPO
```

Step D: Validate secrets are present in GitHub (UI) or via CLI
```zsh
gh secret list --repo $GITHUB_OWNER/$GITHUB_REPO
``` 
This shows the list of secret names but not their values.

Step E: Run an immediate preview deploy locally (optional)
If you prefer to deploy immediately independent of the GitHub workflow, run:
```zsh
# Use vercel CLI to link and deploy
npx vercel login
# Pull environment (optional)
npx vercel pull --yes --environment=preview
# Deploy the project
npx vercel --token $VERCEL_TOKEN
# (For prod)
npx vercel --prod --token $VERCEL_TOKEN
```

Step F: Trigger the GitHub Action workflow (if using the workflow)
- Push to `demo-glass-component` branch to trigger an automatic preview deploy after secrets are set.
- Or go to Actions -> Vercel Deploy (Demo Branch) -> Run workflow -> Choose `environment: prod` to manually deploy to production.

Troubleshooting
- Workflow fails because of invalid token: ensure token is not restricted and has project's permissions.
- `vercel inspect` not found or unauthorized: check you are logged into vercel and have the token with proper scopes.
- If your repo isn't linked to a Vercel project with that project ID, create or link it in Vercel UI.

If you'd like, I can add a small `scripts/curl/check-vercel-secrets.sh` for CI to verify tokens are valid, or a GitHub Action step to fail louder if the token is invalid.
