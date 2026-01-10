#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

echo "Verifying Immerse 3-Layer Architecture..."
echo ""

# Helper function to check grep results
check_grep() {
    local rule_number=$1
    local description=$2
    local command=$3
    local is_warning=${4:-false}
    
    echo -n "[$rule_number] $description... "
    
    if result=$(eval "$command" 2>&1); then
        if [ -z "$result" ]; then
            echo -e "${GREEN}PASS${NC}"
            return 0
        else
            if [ "$is_warning" = true ]; then
                echo -e "${YELLOW}WARN${NC}"
                echo "$result" | head -10
                ((WARNINGS++))
            else
                echo -e "${RED}FAIL${NC}"
                echo "$result" | head -10
                ((ERRORS++))
            fi
            return 1
        fi
    else
        echo -e "${GREEN}PASS${NC}"
        return 0
    fi
}

# ============================================================================
# Rule 1: Direct Prisma - Import db from @/db and use directly
# ============================================================================

echo "Rule 1: Direct Prisma"

check_grep "1.1" "Import db from @/db (not @prisma/client)" \
    "grep -rE 'from ['\"]@prisma/client['\"]' src/ | grep -v 'src/db.ts'"

check_grep "1.2" "Only db.ts imports PrismaClient" \
    "grep -rE 'new PrismaClient' src/ | grep -v 'src/db.ts'"

# ============================================================================
# Rule 2: Server Components - Pages fetch data directly, no API routes
# ============================================================================

echo ""
echo "Rule 2: Server Components"

check_grep "2.1" "Pages are async Server Components" \
    "find src/app/\(app\) -name 'page.tsx' -exec grep -L 'export default async function' {} \; | grep -v '/edit/page.tsx'" \
    true

check_grep "2.2" "Server Components import db directly" \
    "find src/app/\(app\) -name 'page.tsx' -exec grep -l 'fetch.*api' {} \; | grep -v '/edit/page.tsx'" \
    true

# ============================================================================
# Rule 3: Server Actions - Mutations use 'use server' functions
# ============================================================================

echo ""
echo "Rule 3: Server Actions"

check_grep "3.1" "Server Actions have 'use server' directive" \
    "find src/app -name 'actions.ts' -exec grep -L \"'use server'\\|\\\"use server\\\"\" {} \;"

check_grep "3.2" "Server Actions import from @/db" \
    "find src/app -name 'actions.ts' -exec grep -L 'from ['\"]@/db['\"]' {} \;" \
    true

check_grep "3.3" "Server Actions call revalidatePath after mutations" \
    "find src/app -name 'actions.ts' -exec grep -L 'revalidatePath' {} \;" \
    true

# ============================================================================
# Rule 4: No abstractions - No services, repos, registries
# ============================================================================

echo ""
echo "Rule 4: No Abstractions"

check_grep "4.1" "No services layer (src/features)" \
    "[ -d src/features ] && echo 'src/features/ should not exist'"

check_grep "4.2" "No repositories (lib/data)" \
    "[ -d src/lib/data ] && echo 'src/lib/data/ should not exist'"

check_grep "4.3" "No old imports (@/features, @/lib/data, @/lib/api)" \
    "grep -rE 'from ['\"]@/(features|lib/data|lib/api)' src/ | grep -v 'verify-architecture.sh'"

check_grep "4.4" "Only lib/auth, lib/upload, lib/utils remain" \
    "find src/lib -mindepth 1 -maxdepth 1 -type d ! -name auth ! -name upload ! -name utils | grep -v node_modules" \
    true

check_grep "4.5" "API routes only for external APIs (auth, upload)" \
    "find src/app/api -name 'route.ts' ! -path '*/auth/*' ! -path '*/upload/*' 2>/dev/null | grep -v 'verify-architecture.sh'" \
    true

# ============================================================================
# Database Safety Rules
# ============================================================================

echo ""
echo "Database Safety"

check_grep "5.1" "No prisma migrate reset" \
    "grep -rE 'prisma migrate reset|prisma db push --force-reset' scripts/ package.json | grep -v 'verify-architecture.sh'"

check_grep "5.2" "No database deletion commands" \
    "grep -rE 'DROP DATABASE|TRUNCATE|DELETE FROM.*WHERE 1=1' scripts/ | grep -v 'verify-architecture.sh'"

check_grep "5.3" "db.ts exists in src root" \
    "[ ! -f src/db.ts ] && echo 'src/db.ts not found'"

# ============================================================================
# Summary
# ============================================================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}SUCCESS: All architecture rules passed!${NC}"
    echo ""
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}WARNING: $WARNINGS warnings found (non-blocking)${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}FAILED: $ERRORS architecture violations found!${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}WARNING: $WARNINGS warnings found${NC}"
    fi
    echo ""
    echo "Fix violations before committing."
    exit 1
fi
