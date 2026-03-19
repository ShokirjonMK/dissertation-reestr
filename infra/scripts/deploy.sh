#!/usr/bin/env bash
# deploy.sh — Manual yoki CI/CD orqali server deploy skripti
#
# Foydalanish:
#   bash infra/scripts/deploy.sh              # Faqat o'zgargan servislarni qayta build
#   bash infra/scripts/deploy.sh --all        # Barcha servislarni qayta build
#   bash infra/scripts/deploy.sh --frontend   # Faqat frontendni build
#   bash infra/scripts/deploy.sh --backend    # Faqat backendni build
#
set -euo pipefail

APP_DIR="/opt/dissertation-reestr"
LOG_FILE="$APP_DIR/deploy.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

log() { echo "[$TIMESTAMP] $*" | tee -a "$LOG_FILE"; }
ok()  { echo "  ✓ $*"; }
err() { echo "  ✗ $*" >&2; }

cd "$APP_DIR"
log "=== Deploy boshlandi ==="

# ──────────────────────────────────────────────
# Argumentlarni tahlil qilish
# ──────────────────────────────────────────────
FORCE_ALL=false
ONLY_SERVICES=""

for arg in "$@"; do
  case "$arg" in
    --all)         FORCE_ALL=true ;;
    --frontend)    ONLY_SERVICES="$ONLY_SERVICES frontend" ;;
    --backend)     ONLY_SERVICES="$ONLY_SERVICES backend" ;;
    --search)      ONLY_SERVICES="$ONLY_SERVICES search-service" ;;
    --ai)          ONLY_SERVICES="$ONLY_SERVICES ai-service" ;;
    --integration) ONLY_SERVICES="$ONLY_SERVICES integration-service" ;;
  esac
done

# ──────────────────────────────────────────────
# 1. Git pull
# ──────────────────────────────────────────────
log "[1/5] Git pull..."
PREV_COMMIT=$(git rev-parse HEAD)
git pull origin main
NEW_COMMIT=$(git rev-parse HEAD)

if [ "$PREV_COMMIT" = "$NEW_COMMIT" ] && [ -z "$ONLY_SERVICES" ] && [ "$FORCE_ALL" = "false" ]; then
  log "Yangi o'zgarish yo'q. Deploy bekor qilindi."
  exit 0
fi

ok "Git pull: $PREV_COMMIT → $NEW_COMMIT"

# ──────────────────────────────────────────────
# 2. O'zgargan servislarni aniqlash
# ──────────────────────────────────────────────
log "[2/5] O'zgargan servislarni aniqlash..."

if [ "$FORCE_ALL" = "true" ]; then
  BUILD_SERVICES="frontend backend search-service ai-service integration-service"
  log "  Force rebuild: barcha servislar"
elif [ -n "$ONLY_SERVICES" ]; then
  BUILD_SERVICES="$ONLY_SERVICES"
  log "  Manual: $BUILD_SERVICES"
else
  CHANGED=$(git diff --name-only "$PREV_COMMIT" "$NEW_COMMIT" 2>/dev/null || echo "")
  BUILD_SERVICES=""

  echo "$CHANGED" | grep -q "^front/"                          && BUILD_SERVICES="$BUILD_SERVICES frontend"
  echo "$CHANGED" | grep -q "^back/"                           && BUILD_SERVICES="$BUILD_SERVICES backend"
  echo "$CHANGED" | grep -q "^services/search-service/"        && BUILD_SERVICES="$BUILD_SERVICES search-service"
  echo "$CHANGED" | grep -q "^services/ai-service/"            && BUILD_SERVICES="$BUILD_SERVICES ai-service"
  echo "$CHANGED" | grep -q "^services/integration-service/"   && BUILD_SERVICES="$BUILD_SERVICES integration-service"

  if [ -z "$BUILD_SERVICES" ]; then
    log "  Servis kodlarida o'zgarish yo'q. Faqat docker compose up -d."
  else
    log "  Qayta build: $BUILD_SERVICES"
  fi
fi

# ──────────────────────────────────────────────
# 3. Docker build
# ──────────────────────────────────────────────
log "[3/5] Docker build..."

if [ -n "${BUILD_SERVICES:-}" ]; then
  docker compose build $BUILD_SERVICES 2>&1 | tee -a "$LOG_FILE"
  ok "Build tugadi: $BUILD_SERVICES"
else
  ok "Build kerak emas"
fi

# ──────────────────────────────────────────────
# 4. Konteynlarni ishga tushirish
# ──────────────────────────────────────────────
log "[4/5] Konteynlarni yangilash..."
docker compose up -d 2>&1 | tee -a "$LOG_FILE"
ok "docker compose up -d tugadi"

# ──────────────────────────────────────────────
# 5. Health check
# ──────────────────────────────────────────────
log "[5/5] Health check (15s kutish)..."
sleep 15

FAIL=0
declare -A ENDPOINTS=(
  ["Frontend"]="http://localhost:3000"
  ["Backend"]="http://localhost:8000/api/v1/health"
  ["Search"]="http://localhost:8001/health"
  ["AI"]="http://localhost:8002/health"
  ["Integration"]="http://localhost:8003/health"
)

for name in "${!ENDPOINTS[@]}"; do
  url="${ENDPOINTS[$name]}"
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")
  if [[ "$STATUS" =~ ^(200|301|302)$ ]]; then
    ok "$name: $STATUS"
  else
    err "$name: $STATUS — $url"
    FAIL=1
  fi
done

# ──────────────────────────────────────────────
# Yakuniy holat
# ──────────────────────────────────────────────
echo ""
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null

if [ $FAIL -ne 0 ]; then
  log "❌ Health check muvaffaqiyatsiz! Loglarni tekshiring."
  exit 1
fi

log "✅ Deploy muvaffaqiyatli yakunlandi! ($TIMESTAMP)"
