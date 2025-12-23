# Security Fix Instructions

## ⚠️ CRITICAL: Your Supabase keys have been exposed!

### Step 1: Rotate Your Supabase Keys (DO THIS IMMEDIATELY!)

1. Go to https://supabase.com/dashboard
2. Select your project: `aklatipnzvpguhgyebsy`
3. Go to Settings → API
4. Click "Generate new anon key" and "Generate new service role key"
5. Update your local `.env` file with the NEW keys

### Step 2: Remove Secrets from Git History

The hardcoded JWT token is in commit `1a55b64`. Here are your options:

#### Option A: Use git-filter-repo (Recommended)

```bash
# Install git-filter-repo
pip install git-filter-repo

# Remove the specific commit or rewrite history
git filter-repo --path services/supabaseClient.ts --invert-paths --force
```

#### Option B: Interactive Rebase (If you're comfortable with git)

```bash
# Start interactive rebase from the commit BEFORE the problematic one
git rebase -i 749e361^

# In the editor that opens, change 'pick' to 'edit' for commit 1a55b64
# Save and close

# Now edit the file to remove the hardcoded secret
nano services/supabaseClient.ts

# Stage the changes
git add services/supabaseClient.ts

# Continue the rebase
git rebase --continue

# Force push to update remote (WARNING: This rewrites history!)
git push origin Junior --force
```

#### Option C: Simplest - Delete and Recreate (If no one else is using the branch)

```bash
# Create a new branch from main
git checkout main
git pull origin main
git checkout -b Junior-fixed

# Cherry-pick only the commits you want (excluding the problematic one)
# Or start fresh and commit your current changes

# Delete the old branch on remote
git push origin --delete Junior

# Push the new branch
git push origin Junior-fixed

# Rename locally if needed
git branch -m Junior-fixed Junior
```

### Step 3: Ensure .env is Never Committed

Your `.gitignore` already includes `.env`, but double-check:

```bash
# Verify .env is ignored
git check-ignore .env

# If it was previously tracked, remove it from git (but keep local file)
git rm --cached .env
git commit -m "Remove .env from tracking"
```

### Step 4: Update Your Pull Request

After cleaning the history and rotating keys:

```bash
# Force push the cleaned history
git push origin Junior --force

# The pull request will automatically update
```

### Step 5: Verify the Fix

1. Check that GitGuardian no longer shows the secret
2. Ensure your app still works with the NEW keys
3. Never commit secrets again!

## Best Practices Going Forward

1. **Always use environment variables** - Never hardcode secrets
2. **Check before committing** - Review changes before pushing
3. **Use .env files** - Keep them in .gitignore
4. **Consider using secrets management** - Like GitHub Secrets, AWS Secrets Manager, etc.
5. **Enable GitHub Secret Scanning** - It's already helping you!

## Need Help?

If you're unsure about any of these steps, ask for help before proceeding!
