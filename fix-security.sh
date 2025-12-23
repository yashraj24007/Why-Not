#!/bin/bash

# Security Fix Script for WhyNot Project
# This script helps clean up the exposed secrets from git history

set -e

echo "🔒 WhyNot Security Fix Script"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${RED}⚠️  WARNING: This script will rewrite git history!${NC}"
echo -e "${RED}⚠️  Make sure you have rotated your Supabase keys first!${NC}"
echo ""
echo "Have you rotated your Supabase keys? (y/n)"
read -r response

if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Please rotate your keys first:${NC}"
    echo "1. Go to https://supabase.com/dashboard"
    echo "2. Select your project"
    echo "3. Go to Settings → API"
    echo "4. Generate new keys"
    echo "5. Update your .env file"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo ""
echo "Choose your cleanup method:"
echo "1. Interactive rebase (recommended for small history)"
echo "2. Create fresh branch (simplest, loses history)"
echo "3. Manual - I'll do it myself"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo -e "${YELLOW}Starting interactive rebase...${NC}"
        echo ""
        echo "In the editor that opens:"
        echo "1. Find the line with commit 1a55b64"
        echo "2. Change 'pick' to 'drop' (to remove it) or 'edit' (to modify it)"
        echo "3. Save and exit"
        echo ""
        read -p "Press Enter to continue..."
        
        git rebase -i 749e361^
        
        echo ""
        echo -e "${GREEN}✓ Rebase complete!${NC}"
        echo ""
        echo "Now force push to update remote:"
        echo "  git push origin Junior --force"
        ;;
        
    2)
        echo ""
        echo -e "${YELLOW}Creating fresh branch...${NC}"
        
        # Get current branch name
        current_branch=$(git branch --show-current)
        
        # Create backup
        git branch backup-before-cleanup
        echo -e "${GREEN}✓ Created backup branch: backup-before-cleanup${NC}"
        
        # Get all changes
        echo "Stashing any uncommitted changes..."
        git stash
        
        # Create new clean branch from main
        git checkout main
        git pull origin main
        git checkout -b Junior-clean
        
        # Cherry-pick good commits (all except 1a55b64)
        echo "Cherry-picking clean commits..."
        git cherry-pick 749e361..HEAD
        
        # Apply stashed changes if any
        git stash pop 2>/dev/null || true
        
        echo ""
        echo -e "${GREEN}✓ Created clean branch: Junior-clean${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Review the new branch: git log"
        echo "2. Delete old Junior branch: git push origin --delete Junior"
        echo "3. Push new branch: git push origin Junior-clean"
        echo "4. Rename locally: git branch -m Junior-clean Junior"
        ;;
        
    3)
        echo ""
        echo "Manual cleanup instructions:"
        echo ""
        echo "To remove the specific commit:"
        echo "  git rebase -i 749e361^"
        echo ""
        echo "Then change 'pick' to 'drop' for commit 1a55b64 and save."
        echo ""
        echo "After cleaning, force push:"
        echo "  git push origin Junior --force"
        ;;
        
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Done!${NC}"
echo ""
echo "Remember to:"
echo "1. Verify your app works with the new Supabase keys"
echo "2. Check that GitGuardian no longer shows the alert"
echo "3. Never commit secrets again!"
