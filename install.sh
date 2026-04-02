#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="$SCRIPT_DIR/agent-skills"
COMBINED="$SKILLS_DIR/status-network-rules.md"
MARKER_START="<!-- STATUS_NETWORK_SKILLS_START -->"
MARKER_END="<!-- STATUS_NETWORK_SKILLS_END -->"

COUNT=0

# --- Helpers ---

inject_or_replace() {
  local file="$1"
  local dir
  dir="$(dirname "$file")"
  mkdir -p "$dir"
  [ -f "$file" ] || touch "$file"

  if grep -q "$MARKER_START" "$file" 2>/dev/null; then
    # Replace existing block (idempotent)
    local tmp
    tmp="$(mktemp)"
    awk -v start="$MARKER_START" -v end="$MARKER_END" '
      $0 == start { skip=1; next }
      $0 == end   { skip=0; next }
      !skip
    ' "$file" > "$tmp"
    mv "$tmp" "$file"
  fi

  {
    echo ""
    echo "$MARKER_START"
    cat "$COMBINED"
    echo ""
    echo "$MARKER_END"
  } >> "$file"
}

strip_block() {
  local file="$1"
  [ -f "$file" ] || return 0
  if grep -q "$MARKER_START" "$file" 2>/dev/null; then
    local tmp
    tmp="$(mktemp)"
    awk -v start="$MARKER_START" -v end="$MARKER_END" '
      $0 == start { skip=1; next }
      $0 == end   { skip=0; next }
      !skip
    ' "$file" > "$tmp"
    mv "$tmp" "$file"
    echo "  🗑  Removed Status Network block from $file"
  fi
}

# --- Agent definitions: name, detect_dir, install_fn, uninstall_fn ---

install_kiro() {
  cp -r "$SKILLS_DIR/kiro/status-network-setup"  "$HOME/.kiro/skills/"
  cp -r "$SKILLS_DIR/kiro/status-network-gasless" "$HOME/.kiro/skills/"
  cp -r "$SKILLS_DIR/kiro/status-network-karma"   "$HOME/.kiro/skills/"
  cp -r "$SKILLS_DIR/kiro/status-network-deploy"  "$HOME/.kiro/skills/"
  echo "  ✅ Kiro — installed 4 skills to ~/.kiro/skills/"
}

uninstall_kiro() {
  rm -rf "$HOME/.kiro/skills/status-network-setup" \
         "$HOME/.kiro/skills/status-network-gasless" \
         "$HOME/.kiro/skills/status-network-karma" \
         "$HOME/.kiro/skills/status-network-deploy"
  echo "  🗑  Kiro — removed skills from ~/.kiro/skills/"
}

install_claude() {
  inject_or_replace "$HOME/.claude/CLAUDE.md"
  echo "  ✅ Claude Code — appended rules to ~/.claude/CLAUDE.md"
}
uninstall_claude() { strip_block "$HOME/.claude/CLAUDE.md"; }

install_cursor() {
  mkdir -p "$HOME/.cursor/rules"
  cp "$COMBINED" "$HOME/.cursor/rules/status-network.mdc"
  echo "  ✅ Cursor — wrote rules to ~/.cursor/rules/status-network.mdc"
}
uninstall_cursor() {
  rm -f "$HOME/.cursor/rules/status-network.mdc"
  echo "  🗑  Cursor — removed ~/.cursor/rules/status-network.mdc"
}

install_copilot() {
  inject_or_replace "$HOME/.config/github-copilot/intellij/global-copilot-instructions.md"
  echo "  ✅ Copilot — appended rules to global-copilot-instructions.md"
}
uninstall_copilot() { strip_block "$HOME/.config/github-copilot/intellij/global-copilot-instructions.md"; }

install_windsurf() {
  inject_or_replace "$HOME/.codeium/windsurf/global_rules.md"
  echo "  ✅ Windsurf — appended rules to ~/.codeium/windsurf/global_rules.md"
}
uninstall_windsurf() { strip_block "$HOME/.codeium/windsurf/global_rules.md"; }

install_cline() {
  mkdir -p "$HOME/Documents/Cline/Rules"
  cp "$COMBINED" "$HOME/Documents/Cline/Rules/status-network.md"
  echo "  ✅ Cline — wrote rules to ~/Documents/Cline/Rules/status-network.md"
}
uninstall_cline() {
  rm -f "$HOME/Documents/Cline/Rules/status-network.md"
  echo "  🗑  Cline — removed ~/Documents/Cline/Rules/status-network.md"
}

install_antigravity() {
  inject_or_replace "$HOME/.gemini/GEMINI.md"
  echo "  ✅ Antigravity — appended rules to ~/.gemini/GEMINI.md"
}
uninstall_antigravity() { strip_block "$HOME/.gemini/GEMINI.md"; }

# --- Agent registry: name|detect_path|install_fn|uninstall_fn ---

AGENTS=(
  "Kiro|$HOME/.kiro|install_kiro|uninstall_kiro"
  "Claude Code|$HOME/.claude|install_claude|uninstall_claude"
  "Cursor|$HOME/.cursor|install_cursor|uninstall_cursor"
  "Copilot|$HOME/.config/github-copilot|install_copilot|uninstall_copilot"
  "Windsurf|$HOME/.codeium/windsurf|install_windsurf|uninstall_windsurf"
  "Cline|$HOME/Documents/Cline|install_cline|uninstall_cline"
  "Antigravity|$HOME/.gemini|install_antigravity|uninstall_antigravity"
)

# --- Main ---

if [ "${1:-}" = "--uninstall" ]; then
  echo "🔍 Detecting installed AI agents for uninstall..."
  for entry in "${AGENTS[@]}"; do
    IFS='|' read -r name detect_dir _ uninstall_fn <<< "$entry"
    if [ -d "$detect_dir" ]; then
      $uninstall_fn
      COUNT=$((COUNT + 1))
    else
      echo "  ⏭  $name not detected — skipping"
    fi
  done
  echo ""
  echo "✅ Done! Status Network skills removed from $COUNT agent(s)."
else
  echo "🔍 Detecting installed AI agents..."
  for entry in "${AGENTS[@]}"; do
    IFS='|' read -r name detect_dir install_fn _ <<< "$entry"
    if [ -d "$detect_dir" ]; then
      $install_fn
      COUNT=$((COUNT + 1))
    else
      echo "  ❌ $name not detected — skipping"
    fi
  done
  echo ""
  echo "✅ Done! Status Network skills installed for $COUNT agent(s)."
fi
