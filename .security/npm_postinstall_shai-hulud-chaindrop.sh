#!/usr/bin/env bash
#
# check_forbidden_hash.sh
#
# Recursively searches a directory tree for "Math_Symbol.js" and "math_init.js",
# computes their SHA-256 hash, and raises an explicit error if a file's hash
# matches a known forbidden hash.
#
# Compatible with Linux, macOS, and Windows (via Git Bash, WSL, or Cygwin),
# as long as a bash interpreter is available.
#
# Usage:
#   ./check_forbidden_hash.sh

set -u  # Treat unset variables as an error
# Note: we do NOT use 'set -e' globally, so that we can collect all mismatches
# before deciding whether to exit with an error.

# ---------------------------------------------------------------------------
# Configuration: map each target file name to its forbidden SHA-256 hash.
# Replace the placeholder values below with the real hashes to detect.
# If both files must be checked against the SAME hash, just use the same
# value for both entries.
# ---------------------------------------------------------------------------
declare -A FORBIDDEN_HASHES=(
  ["Math_Symbol.js"]="9fc2570b7cef51c1b8df116d144d11ff4096357be7d2c4c6367cfc2509cf1bcc"
  ["math_init.js"]="9fc2570b7cef51c1b8df116d144d11ff4096357be7d2c4c6367cfc2509cf1bcc"
)

# ---------------------------------------------------------------------------
# Access working base directory
# ---------------------------------------------------------------------------
cd ..

# ---------------------------------------------------------------------------
# Detect an available SHA-256 tool, since it differs across platforms.
#   - Linux (and Git Bash/Cygwin/WSL): sha256sum
#   - macOS: shasum -a 256
#   - Fallback (widely available): openssl dgst -sha256
# ---------------------------------------------------------------------------
compute_sha256() {
  local file="$1"

  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$file" | awk '{print $1}'
  elif command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$file" | awk '{print $1}'
  elif command -v openssl >/dev/null 2>&1; then
    openssl dgst -sha256 "$file" | awk '{print $NF}'
  else
    echo "Error: no SHA-256 tool found (sha256sum, shasum, or openssl required)." >&2
    exit 1
  fi
}

# ---------------------------------------------------------------------------
# Recursively find target files.
# Using -iname to be safe on case-insensitive filesystems (e.g. Windows).
# ---------------------------------------------------------------------------
FILES_FOUND=0
MATCH_FOUND=0

while IFS= read -r -d '' file; do
  FILES_FOUND=$((FILES_FOUND + 1))

  base_name="$(basename "$file")"

  # Find the matching key in FORBIDDEN_HASHES, ignoring case
  forbidden_hash=""
  for key in "${!FORBIDDEN_HASHES[@]}"; do
    if [[ "${key,,}" == "${base_name,,}" ]]; then
      forbidden_hash="${FORBIDDEN_HASHES[$key]}"
      break
    fi
  done

  computed_hash="$(compute_sha256 "$file")"
  # Normalize to lowercase for comparison
  computed_hash_lc="${computed_hash,,}"
  forbidden_hash_lc="${forbidden_hash,,}"

  echo "Checking file: $file"
  echo "  Computed hash : $computed_hash"
  echo "  Forbidden hash: $forbidden_hash"

  if [[ -n "$forbidden_hash" && "$computed_hash_lc" == "$forbidden_hash_lc" ]]; then
    MATCH_FOUND=1
    echo "ERROR: FORBIDDEN HASH MATCH: File '$file' has SHA-256 hash '$computed_hash', which matches the forbidden hash for '$base_name'." >&2
  fi

done < <(find . -type f \( -iname "Math_Symbol.js" -o -iname "math_init.js" \) -print0)

if [[ $FILES_FOUND -eq 0 ]]; then
  echo "No matching files (Math_Symbol.js / math_init.js) were found."
  exit 0
fi

if [[ $MATCH_FOUND -eq 1 ]]; then
  echo "One or more files matched a forbidden hash. See errors above for details." >&2
  exit 1
else
  echo "No forbidden hash matches were found. All checked files are clean."
  exit 0
fi