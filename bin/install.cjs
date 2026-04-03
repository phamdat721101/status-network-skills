#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');

const PKG_DIR = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(PKG_DIR, 'agent-skills');
const COMBINED = path.join(SKILLS_DIR, 'status-network-rules.md');
const MARKER_START = '<!-- STATUS_NETWORK_SKILLS_START -->';
const MARKER_END = '<!-- STATUS_NETWORK_SKILLS_END -->';
const HOME = os.homedir();
const uninstall = process.argv.includes('--uninstall');

// --- Helpers ---

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    entry.isDirectory() ? copyDirSync(s, d) : fs.copyFileSync(s, d);
  }
}

function injectOrReplace(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  let content = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const startIdx = content.indexOf(MARKER_START);
  const endIdx = content.indexOf(MARKER_END);
  if (startIdx !== -1 && endIdx !== -1) {
    content = content.slice(0, startIdx) + content.slice(endIdx + MARKER_END.length);
  }
  const rules = fs.readFileSync(COMBINED, 'utf8');
  fs.writeFileSync(file, content + `\n${MARKER_START}\n${rules}\n${MARKER_END}\n`);
}

function stripBlock(file) {
  if (!fs.existsSync(file)) return false;
  const content = fs.readFileSync(file, 'utf8');
  const startIdx = content.indexOf(MARKER_START);
  const endIdx = content.indexOf(MARKER_END);
  if (startIdx === -1) return false;
  fs.writeFileSync(file, content.slice(0, startIdx) + content.slice(endIdx + MARKER_END.length));
  return true;
}

function copyFile(dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(COMBINED, dest);
}

// --- Agent Registry ---

const KIRO_SKILLS = ['status-network-setup', 'status-network-gasless', 'status-network-karma', 'status-network-deploy'];

const agents = [
  {
    name: 'Kiro',
    detect: path.join(HOME, '.kiro'),
    install() {
      for (const s of KIRO_SKILLS) copyDirSync(path.join(SKILLS_DIR, 'kiro', s), path.join(HOME, '.kiro', 'skills', s));
      console.log('  ✅ Kiro — installed 4 skills to ~/.kiro/skills/');
    },
    uninstall() {
      for (const s of KIRO_SKILLS) fs.rmSync(path.join(HOME, '.kiro', 'skills', s), { recursive: true, force: true });
      console.log('  🗑  Kiro — removed skills from ~/.kiro/skills/');
    },
  },
  {
    name: 'Claude Code',
    detect: path.join(HOME, '.claude'),
    install() { injectOrReplace(path.join(HOME, '.claude', 'CLAUDE.md')); console.log('  ✅ Claude Code — appended rules to ~/.claude/CLAUDE.md'); },
    uninstall() { if (stripBlock(path.join(HOME, '.claude', 'CLAUDE.md'))) console.log('  🗑  Removed Status Network block from ~/.claude/CLAUDE.md'); },
  },
  {
    name: 'Cursor',
    detect: path.join(HOME, '.cursor'),
    install() { copyFile(path.join(HOME, '.cursor', 'rules', 'status-network.mdc')); console.log('  ✅ Cursor — wrote rules to ~/.cursor/rules/status-network.mdc'); },
    uninstall() { const f = path.join(HOME, '.cursor', 'rules', 'status-network.mdc'); if (fs.existsSync(f)) { fs.unlinkSync(f); console.log('  🗑  Cursor — removed ~/.cursor/rules/status-network.mdc'); } },
  },
  {
    name: 'Copilot',
    detect: path.join(HOME, '.config', 'github-copilot'),
    install() { injectOrReplace(path.join(HOME, '.config', 'github-copilot', 'intellij', 'global-copilot-instructions.md')); console.log('  ✅ Copilot — appended rules to global-copilot-instructions.md'); },
    uninstall() { if (stripBlock(path.join(HOME, '.config', 'github-copilot', 'intellij', 'global-copilot-instructions.md'))) console.log('  🗑  Removed Status Network block from global-copilot-instructions.md'); },
  },
  {
    name: 'Windsurf',
    detect: path.join(HOME, '.codeium', 'windsurf'),
    install() { injectOrReplace(path.join(HOME, '.codeium', 'windsurf', 'global_rules.md')); console.log('  ✅ Windsurf — appended rules to ~/.codeium/windsurf/global_rules.md'); },
    uninstall() { if (stripBlock(path.join(HOME, '.codeium', 'windsurf', 'global_rules.md'))) console.log('  🗑  Removed Status Network block from ~/.codeium/windsurf/global_rules.md'); },
  },
  {
    name: 'Cline',
    detect: path.join(HOME, 'Documents', 'Cline'),
    install() { copyFile(path.join(HOME, 'Documents', 'Cline', 'Rules', 'status-network.md')); console.log('  ✅ Cline — wrote rules to ~/Documents/Cline/Rules/status-network.md'); },
    uninstall() { const f = path.join(HOME, 'Documents', 'Cline', 'Rules', 'status-network.md'); if (fs.existsSync(f)) { fs.unlinkSync(f); console.log('  🗑  Cline — removed ~/Documents/Cline/Rules/status-network.md'); } },
  },
  {
    name: 'Antigravity',
    detect: path.join(HOME, '.gemini'),
    install() { injectOrReplace(path.join(HOME, '.gemini', 'GEMINI.md')); console.log('  ✅ Antigravity — appended rules to ~/.gemini/GEMINI.md'); },
    uninstall() { if (stripBlock(path.join(HOME, '.gemini', 'GEMINI.md'))) console.log('  🗑  Removed Status Network block from ~/.gemini/GEMINI.md'); },
  },
];

// --- Main ---

let count = 0;
console.log(uninstall ? '🔍 Detecting installed AI agents for uninstall...' : '🔍 Detecting installed AI agents...');

for (const agent of agents) {
  if (!fs.existsSync(agent.detect)) {
    console.log(`  ${uninstall ? '⏭' : '❌'} ${agent.name} not detected — skipping`);
    continue;
  }
  uninstall ? agent.uninstall() : agent.install();
  count++;
}

console.log(`\n✅ Done! Status Network skills ${uninstall ? 'removed from' : 'installed for'} ${count} agent(s).`);
