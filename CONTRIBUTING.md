# Contributing Guide

## Git Workflow

### GitHub Remote Configuration

This repository is configured with the following remote:
```
origin: https://github.com/Eldborg/family-wealth-mvp.git
```

### Committing and Pushing

1. **Make your changes** and stage them:
   ```bash
   git add .
   ```

2. **Create a commit**:
   ```bash
   git commit -m "Description of changes"
   ```

3. **Automatic push**: Commits are automatically pushed to GitHub via a post-commit hook.

   If you need to manually push (e.g., if the hook fails):
   ```bash
   git push origin main
   ```

### Authentication

Pushes to GitHub require `GITHUB_TOKEN` to be set in your environment:
```bash
export GITHUB_TOKEN=<your-github-token>
```

### Branching Strategy

- **main**: Production-ready code
- Feature branches should follow naming convention: `feature/BER-##-description`
- Always push to the remote to keep the team in sync

### Troubleshooting

**Push fails with "Permission denied":**
- Verify `GITHUB_TOKEN` is set correctly
- Check token permissions include `repo` scope

**Commits not automatically pushed:**
- Verify the post-commit hook is executable:
  ```bash
  chmod +x .git/hooks/post-commit
  ```
- Check git status: `git status`
- Manually push if needed: `git push origin <branch>`

### Questions?

Contact the CTO for setup assistance or clarification on the workflow.
