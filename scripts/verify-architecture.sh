#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

echo "Verifying Immerse Architecture..."
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
# Prisma Isolation Rules
# ============================================================================

echo "Prisma Isolation"

check_grep "1" "No @prisma/client imports outside lib/data/" \
    "grep -rE 'from ['\"]@prisma/client|require\(['\"]@prisma/client' src/ | grep -v 'src/lib/data/'"

check_grep "2" "No prisma client imports in features/" \
    "grep -rE '@/lib/data/prisma|@prisma/client' src/features/"

check_grep "3" "No prisma client imports in app/" \
    "grep -rE '@/lib/data/prisma|@prisma/client' src/app/"

check_grep "4" "No prisma client imports in lib/ (except lib/data/)" \
    "grep -rE '@/lib/data/prisma|@prisma/client' src/lib/ | grep -v 'src/lib/data/'"

check_grep "5" "Only lib/data/ imports Prisma type re-exports" \
    "grep -rE 'import.*from ['\"]@/lib/data/types['\"]' src/ | grep -v -E 'src/lib/data/|src/features/|src/app/'"

# ============================================================================
# Dependency Direction Rules
# ============================================================================

echo ""
echo "Dependency Direction"

check_grep "6" "No upward dependencies (lib → features/app)" \
    "grep -rE 'from ['\"]@/features|from ['\"]@/app' src/lib/ | grep -v 'src/lib/services'"

check_grep "7" "No circular dependencies (features ↔ lib violation)" \
    "grep -rE 'from ['\"]@/lib/data/prisma['\"]' src/features/"

check_grep "8" "No presentation layer importing data layer directly" \
    "grep -rE 'from ['\"]@/lib/data/(prisma|repositories|resources)['\"]' src/app/(app)/"

check_grep "9" "No API routes importing from presentation layer" \
    "grep -rE 'from ['\"]@/app/\(app\)' src/app/api/"

# ============================================================================
# Service Layer Rules
# ============================================================================

echo ""
echo "Service Layer"

check_grep "10" "API routes call services (not repositories directly)" \
    "grep -rE 'from ['\"]@/lib/data/repositories['\"]' src/app/api/ | grep -v 'src/app/api/\[\[\.\.\.segments\]\]'"

check_grep "11" "Custom API routes use services (not resources directly)" \
    "grep -rE 'from ['\"]@/lib/data/resources['\"]' src/app/api/ | grep -v -E 'src/app/api/\[\[\.\.\.segments\]\]|src/app/api/.*/\[\[\.\.\.segments\]\]'"

check_grep "12" "Custom API routes have corresponding services" \
    "for route in src/app/api/campaigns/*/route.ts; do [ \"\$route\" = 'src/app/api/campaigns/[[...segments]]/route.ts' ] && continue; grep -q 'resourceRegistry\|from.*features' \$route || { resource=\$(basename \$(dirname \$route)); [ ! -f src/features/campaigns/\${resource}/\${resource}.ts ] && echo \$route; }; done || true"

check_grep "13" "No business logic in API routes (>5 line handlers)" \
    "awk '/export (async )?function (GET|POST|PUT|DELETE|PATCH)/ {start=NR; logic=0} start && NR>start && NR<start+5 && !/return|await.*Service|apiRoute/ {logic++} logic>3 {print FILENAME\":\"NR; exit}' src/app/api/**/route.ts" \
    true

# ============================================================================
# Schema Rules
# ============================================================================

echo ""
echo "Schema Definitions"

check_grep "14" "Resources define schemas + register with registry" \
    "find src/lib/data/resources -name '*.ts' ! -name 'index.ts' ! -name 'registry.ts' ! -name 'operations.ts' -exec grep -L 'resourceRegistry\.register\|ValidationFactory\.createSchemas' {} \;" \
    true

check_grep "15" "No ValidationFactory usage outside lib/data/resources/" \
    "grep -rE 'ValidationFactory\.create' src/ | grep -v -E 'src/lib/data/resources/|src/lib/validation/factory.ts'"

check_grep "16" "Services only exist for complex logic (not simple CRUD)" \
    "find src/features -name '*.ts' ! -name 'index.ts' -exec grep -l 'extends CampaignResourceService' {} \; | while read f; do lines=\$(wc -l < \"\$f\"); [ \$lines -lt 50 ] && echo \"\$f (\$lines lines - consider using registry only)\"; done || true" \
    true

# ============================================================================
# Base Class Usage Rules
# ============================================================================

echo ""
echo "Base Class Usage"

check_grep "17" "Services extend CampaignResourceService when appropriate" \
    "grep -rE 'class.*Service.*\{' src/features/ | grep -v 'extends.*Service' | grep -v 'CampaignService|UserService'" \
    true

check_grep "18" "No manual CRUD duplication (use registry or base class)" \
    "grep -rE 'class.*Service.*extends' src/features/ -A 20 | grep -E 'async (create|update|delete|findById).*\{.*return.*resource\.(create|update|delete)' || true" \
    true

# ============================================================================
# Import Path Rules
# ============================================================================

echo ""
echo "Import Paths"

check_grep "19" "No old import paths (@/lib/db)" \
    "grep -rE 'from ['\"]@/lib/db' src/"

check_grep "20" "No old import paths (@/lib/repositories - use @/lib/data/repositories)" \
    "grep -rE 'from ['\"]@/lib/repositories['\"]' src/"

check_grep "21" "No old import paths (@/lib/resource - use @/lib/data/resources)" \
    "grep -rE 'from ['\"]@/lib/resource['\"]' src/"

check_grep "22" "Use @/ alias (no relative imports across layers)" \
    "grep -rE 'from ['\"]\.\.\/\.\.\/..\/' src/features/ src/app/" \
    true

# ============================================================================
# Type Safety Rules
# ============================================================================

echo ""
echo "Type Safety"

check_grep "23" "No 'any' types in service signatures" \
    "grep -rE 'async [a-zA-Z]+\(.*:.*any' src/features/" \
    true

check_grep "24" "Services return typed responses (not raw Prisma)" \
    "grep -rE 'return (prisma|this\.resource)\.' src/features/" \
    true

check_grep "25" "Features import Prisma types via lib/data/types" \
    "grep -rE 'import.*Prisma.*from ['\"]@prisma/client['\"]' src/features/"

check_grep "26" "API routes use typed responses" \
    "grep -rE 'const result.*=.*await.*\..*\(.*\)' src/app/api/ | grep -v ': [A-Z]' || true" \
    true

# ============================================================================
# Resource Organization Rules
# ============================================================================

echo ""
echo "Resource Organization"

check_grep "27" "Resources are registered in registry" \
    "for resource in src/lib/data/resources/*.ts; do name=\$(basename \$resource .ts); [ \$name != 'index' ] && [ \$name != 'registry' ] && [ \$name != 'operations' ] && ! grep -q 'resourceRegistry.register' \$resource && echo \$resource; done || true" \
    true

check_grep "28" "Services only exist for resources needing complex logic" \
    "for feature in src/features/campaigns/*/; do resource=\$(basename \$feature); [ \$resource = 'campaigns' ] && continue; [ -f \$feature/\$resource.ts ] && ! grep -q 'extends CampaignResourceService' \$feature/\$resource.ts && echo \"\$feature (no base class - use registry?)\"; done || true" \
    true

# ============================================================================
# API Route Rules
# ============================================================================

echo ""
echo "API Routes"

check_grep "29" "Custom API routes use apiRoute wrapper" \
    "find src/app/api -name 'route.ts' ! -path '*[[...segments]]*' ! -path '*/auth/*' -exec grep -L 'apiRoute' {} \;"

check_grep "30" "Custom API routes validate input with schemas" \
    "find src/app/api -name 'route.ts' ! -path '*[[...segments]]*' -exec grep -L 'Schemas\|Schema' {} \;" \
    true

check_grep "31" "API routes use ApiErrors for error handling" \
    "find src/app/api -name 'route.ts' ! -path '*[[...segments]]*' -exec grep -l 'throw new Error' {} \;" \
    true

# ============================================================================
# Data Fetching Rules
# ============================================================================

echo ""
echo "Data Fetching"

check_grep "32" "Use Tanstack Query instead of useState + useEffect for data fetching" \
    "find src/app/\(app\) -name '*.tsx' -exec grep -l 'useState' {} \; | xargs grep -l 'useEffect' | xargs grep -l 'fetch(' | xargs grep -L 'useQuery\|useMutation' 2>/dev/null || true"

# ============================================================================
# Database Rules
# ============================================================================

echo ""
echo "Database"

check_grep "33" "No prisma migrate reset in scripts" \
    "grep -rE 'prisma migrate reset|prisma db push --force-reset' scripts/ package.json | grep -v 'verify-architecture.sh'"

check_grep "34" "No database deletion commands in scripts" \
    "grep -rE 'DROP DATABASE|TRUNCATE|DELETE FROM.*WHERE 1=1' scripts/ | grep -v 'verify-architecture.sh'"

# ============================================================================
# Summary
# ============================================================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}SUCCESS: All 34 architecture rules passed!${NC}"
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
