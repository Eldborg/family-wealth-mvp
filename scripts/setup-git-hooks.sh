#!/bin/bash
# Setup git hooks for automatic push workflow

set -e

echo "Setting up git hooks for family-wealth-mvp..."

# Create post-commit hook
cat > .git/hooks/post-commit << 'HOOK_EOF'
#!/bin/bash
# Automatically push commits to GitHub after committing

BRANCH=$(git rev-parse --abbrev-ref HEAD)
git push origin "$BRANCH" 2>/dev/null || true
HOOK_EOF

chmod +x .git/hooks/post-commit

echo "✓ Post-commit hook installed"
echo ""
echo "Git workflow is now configured!"
echo "  - Commits will be automatically pushed to GitHub"
echo "  - If push fails, commits are still saved locally"
echo ""
echo "For more details, see CONTRIBUTING.md"
