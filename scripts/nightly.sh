#!/usr/bin/env bash

set -uo pipefail

START_TIME=$(date +%s)
STARTED_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)
REPO_NAME="${REPO_NAME:-Loader}"
export REPORT_DIR="${REPORT_DIR:-reports}"
RAW_DIR=$(mktemp -d "/tmp/nightly-${REPO_NAME}.XXXXXX")

mkdir -p "$REPORT_DIR"

cleanup() {
    rm -rf "$RAW_DIR"
}
trap cleanup EXIT

require_bins() {
    local bin
    for bin in git bash jq pnpm; do
        if ! command -v "$bin" >/dev/null 2>&1; then
            echo "Required command not found: $bin" >&2
            return 1
        fi
    done
}

setup() {
    echo "=== [Nightly Setup: $REPO_NAME] ==="

    if [[ ! -f ".env" ]] && [[ -f ".env.example" ]]; then
        cp .env.example .env
    fi

    # Ensure bun is available if possible
    if ! command -v bun >/dev/null 2>&1; then
        echo "bun not found, attempting npm install -g bun..."
        npm install --global bun || true
    fi

    if [[ ! -d "node_modules" ]]; then
        echo "Installing dependencies..."
        pnpm install --frozen-lockfile || pnpm install
    fi
}

run_unit_tests() {
    echo "=== [Running Unit Tests] ==="
    local unit_start unit_end unit_duration
    local exit_code=0
    unit_start=$(date +%s)

    local log_file="$RAW_DIR/bun-test.log"

    if command -v bun >/dev/null 2>&1 && [[ -d "apps/server" ]]; then
        echo "Running bun test in apps/server..."
        (
            cd apps/server
            bun test
        ) > "$log_file" 2>&1 || exit_code=$?
    else
        echo "bun command not found or apps/server missing" > "$log_file"
        exit_code=1
    fi

    cat "$log_file"

    unit_end=$(date +%s)
    unit_duration=$((unit_end - unit_start))

    local passed_tests=0 failed_tests=0 total_tests=0 skipped_tests=0
    local passed_suites=0 failed_suites=0 total_suites=0
    local status="failed"

    if [[ -f "$log_file" ]]; then
        local p f s
        p=$(grep -oE '[0-9]+ pass' "$log_file" | head -n 1 | awk '{print $1}')
        f=$(grep -oE '[0-9]+ fail' "$log_file" | head -n 1 | awk '{print $1}')
        s=$(grep -oE 'across [0-9]+ files' "$log_file" | head -n 1 | awk '{print $2}')

        passed_tests=${p:-0}
        failed_tests=${f:-0}
        total_tests=$((passed_tests + failed_tests))
        total_suites=${s:-1}

        if [[ "$failed_tests" -gt 0 ]]; then
            failed_suites=1
            passed_suites=$((total_suites - 1))
        else
            passed_suites=$total_suites
            failed_suites=0
        fi
    fi

    if [[ "$exit_code" -eq 0 ]]; then
        status="passed"
    fi

    UNIT_JSON=$(jq -n \
        --arg name "unit" \
        --arg status "$status" \
        --argjson exit_code "$exit_code" \
        --argjson duration "$unit_duration" \
        --argjson tests_total "$total_tests" \
        --argjson tests_passed "$passed_tests" \
        --argjson tests_failed "$failed_tests" \
        --argjson tests_skipped "$skipped_tests" \
        --argjson suites_total "$total_suites" \
        --argjson suites_passed "$passed_suites" \
        --argjson suites_failed "$failed_suites" \
        '{
            name: $name,
            status: $status,
            exit_code: $exit_code,
            duration_seconds: $duration,
            tests_total: $tests_total,
            tests_passed: $tests_passed,
            tests_failed: $tests_failed,
            tests_skipped: $tests_skipped,
            suites_total: $suites_total,
            suites_passed: $suites_passed,
            suites_failed: $suites_failed
        }')

    echo "$UNIT_JSON" > "$RAW_DIR/unit.json"
    return "$exit_code"
}

set_e2e_skipped() {
    local reason=$1
    jq -n \
        --arg name "e2e" \
        --arg status "skipped" \
        --arg reason "$reason" \
        '{
            name: $name,
            status: $status,
            exit_code: null,
            duration_seconds: 0,
            tests_total: 0,
            tests_passed: 0,
            tests_failed: 0,
            tests_skipped: 0,
            suites_total: 0,
            suites_passed: 0,
            suites_failed: 0,
            reason: $reason
        }' > "$RAW_DIR/e2e.json"
}

generate_report() {
    local overall_exit_code=$1
    local finished_at total_duration
    finished_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    total_duration=$(( $(date +%s) - START_TIME ))

    local overall_status="passed"
    if [[ "$overall_exit_code" -ne 0 ]]; then
        overall_status="failed"
    fi

    if [[ ! -f "$RAW_DIR/unit.json" ]]; then
        echo '{"name":"unit","status":"skipped","tests_total":0,"tests_passed":0,"tests_failed":0,"tests_skipped":0}' > "$RAW_DIR/unit.json"
    fi
    if [[ ! -f "$RAW_DIR/e2e.json" ]]; then
        set_e2e_skipped "no_e2e_tests_configured"
    fi

    local report_json
    report_json=$(jq -n \
        --arg name "$REPO_NAME" \
        --arg status "$overall_status" \
        --argjson exit_code "$overall_exit_code" \
        --arg started_at "$STARTED_AT" \
        --arg finished_at "$finished_at" \
        --argjson duration "$total_duration" \
        --slurpfile unit "$RAW_DIR/unit.json" \
        --slurpfile e2e "$RAW_DIR/e2e.json" \
        '
        ($unit[0] // {}) as $u |
        ($e2e[0] // {}) as $e |
        {
            name: $name,
            status: $status,
            exit_code: $exit_code,
            started_at: $started_at,
            finished_at: $finished_at,
            duration_seconds: $duration,
            summary: {
                tests_total: (($u.tests_total // 0) + ($e.tests_total // 0)),
                tests_passed: (($u.tests_passed // 0) + ($e.tests_passed // 0)),
                tests_failed: (($u.tests_failed // 0) + ($e.tests_failed // 0)),
                tests_skipped: (($u.tests_skipped // 0) + ($e.tests_skipped // 0)),
                suites_total: (($u.suites_total // 0) + ($e.suites_total // 0)),
                suites_passed: (($u.suites_passed // 0) + ($e.suites_passed // 0)),
                suites_failed: (($u.suites_failed // 0) + ($e.suites_failed // 0)),
                coverage_pct: null,
                coverage: null
            },
            suites: [ $u, $e ]
        }')

    echo "$report_json" | jq '.' > "$REPORT_DIR/${REPO_NAME}.json"
    cp "$REPORT_DIR/${REPO_NAME}.json" "$REPORT_DIR/${REPO_NAME}.report.json"

    local md_file="$REPORT_DIR/${REPO_NAME}.md"
    {
        echo "# Nightly Test Report: $REPO_NAME"
        echo
        echo "- **Status**: $([[ "$overall_status" == "passed" ]] && echo "PASS" || echo "FAIL")"
        echo "- **Started**: $STARTED_AT"
        echo "- **Finished**: $finished_at"
        echo "- **Duration**: ${total_duration}s"
        echo "- **Tests**: $(echo "$report_json" | jq -r '.summary.tests_passed') passed, $(echo "$report_json" | jq -r '.summary.tests_failed') failed, $(echo "$report_json" | jq -r '.summary.tests_total') total"
        echo
        echo "### Test Suites"
        echo "| Suite | Status | Tests (P/F/Total) | Suites (P/F/Total) | Duration (s) |"
        echo "|---|---|---:|---:|---:|"
        echo "$report_json" | jq -r '.suites[] | "| \(.name) | \(.status) | \(.tests_passed // 0) / \(.tests_failed // 0) / \(.tests_total // 0) | \(.suites_passed // 0) / \(.suites_failed // 0) / \(.suites_total // 0) | \(.duration_seconds // 0)s |"'
        echo
    } > "$md_file"
    cp "$md_file" "$REPORT_DIR/${REPO_NAME}.report.md"

    if [[ "$REPORT_DIR" != "reports" ]] && [[ "$REPORT_DIR" != "$(pwd)/reports" ]]; then
        mkdir -p reports
        cp "$REPORT_DIR/${REPO_NAME}.json" "reports/nightly-report.json"
        cp "$REPORT_DIR/${REPO_NAME}.md" "reports/nightly-report.md"
    fi

    echo
    echo "=== [Nightly Report Summary] ==="
    cat "$md_file"
    echo "Report JSON written to: $REPORT_DIR/${REPO_NAME}.json"
    echo "Report Markdown written to: $REPORT_DIR/${REPO_NAME}.md"
}

main() {
    if ! require_bins; then
        exit 1
    fi

    setup

    local unit_exit=0
    run_unit_tests || unit_exit=$?

    set_e2e_skipped "no_e2e_tests_configured"

    generate_report "$unit_exit"
    exit "$unit_exit"
}

main "$@"
