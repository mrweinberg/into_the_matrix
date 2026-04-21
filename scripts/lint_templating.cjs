const fs = require('fs');
const path = require('path');

const INPUT_FILE = 'MTG INTO THE MATRIX.txt';
const OUTPUT_DIR = 'tmp';
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'template_lint.md');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const raw = fs.readFileSync(INPUT_FILE, 'utf8');
const lines = raw.split('\n');

let galleryStart = 0;
for (let i = 0; i < lines.length; i++) {
    if (/^2\.\s*Card Gallery/.test(lines[i])) {
        galleryStart = i + 1;
        break;
    }
}

const idHeader = /^\[([A-Z]*\d+)\]\s+(.+)$/;

const cards = [];
let current = null;

for (let i = galleryStart; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(idHeader);
    if (m) {
        if (current) cards.push(current);
        const afterId = m[2].trim();
        const costMatch = afterId.match(/^(.+?)\s*((?:\{[^}]+\})+)\s*$/);
        current = {
            id: m[1],
            name: costMatch ? costMatch[1].trim() : afterId,
            startLine: i + 1,
            allLines: [line],
            lineNums: [i + 1],
        };
    } else if (current) {
        current.allLines.push(line);
        current.lineNums.push(i + 1);
    }
}
if (current) cards.push(current);

cards.forEach(c => {
    while (c.allLines.length && !c.allLines[c.allLines.length - 1].trim()) {
        c.allLines.pop();
        c.lineNums.pop();
    }
});

const findings = [];
const report = (card, absLine, severity, category, message, snippet) => {
    findings.push({
        cardId: card.id,
        cardName: card.name,
        line: absLine,
        severity,
        category,
        message,
        snippet,
    });
};

// ---------- Check 1: Typo dictionary ----------
const TYPOS = [
    { pattern: /\bsacrified\b/gi, fix: 'sacrificed' },
    { pattern: /\bScrapnel\b/g, fix: 'Shrapnel' },
    { pattern: /\bpay and amount\b/gi, fix: 'pay an amount' },
    { pattern: /\ba stun counters\b/gi, fix: 'a stun counter' },
    { pattern: /\ba \+1\/\+1 counters\b/gi, fix: 'a +1/+1 counter' },
    { pattern: /\bgraveyard graveyard\b/gi, fix: 'graveyard' },
    { pattern: /\bthe the\b/gi, fix: 'the' },
    { pattern: /\bonce per turn\b/gi, fix: 'once each turn' },
    { pattern: /\bdo X\b/g, fix: '(check: ambiguous variable name)' },
];

cards.forEach(card => {
    card.allLines.forEach((line, idx) => {
        const abs = card.lineNums[idx];
        TYPOS.forEach(({ pattern, fix }) => {
            const matches = line.match(pattern);
            if (matches) {
                report(card, abs, 'typo', 'typo-dictionary', `"${matches[0]}" → "${fix}"`, line.trim());
            }
        });
    });
});

// ---------- Check 2: Whitespace ----------
cards.forEach(card => {
    card.allLines.forEach((line, idx) => {
        const abs = card.lineNums[idx];
        if (line.trim().length > 0 && /\S\s{2,}\S/.test(line)) {
            report(card, abs, 'minor', 'whitespace', 'Multiple consecutive spaces mid-line', line.trim());
        }
        if (line.length > 0 && /\s+$/.test(line)) {
            report(card, abs, 'minor', 'whitespace', 'Trailing whitespace', JSON.stringify(line));
        }
    });
});

// ---------- Check 3: Leftover TODO markers ----------
const TODO_PATTERNS = [
    { re: /#\s*RENAME/i, label: '# RENAME' },
    { re: /\bTODO\b/, label: 'TODO' },
    { re: /\bFIXME\b/, label: 'FIXME' },
    { re: /\bXXX\b/, label: 'XXX' },
    { re: /\?\?\?/, label: '???' },
];
cards.forEach(card => {
    card.allLines.forEach((line, idx) => {
        const abs = card.lineNums[idx];
        TODO_PATTERNS.forEach(({ re, label }) => {
            if (re.test(line)) {
                report(card, abs, 'todo', 'todo-marker', `Leftover ${label} marker`, line.trim());
            }
        });
    });
});

// ---------- Check 4: Jack-in / Eject cost-vs-reminder mismatch ----------
const jackEjectRe = /((?:\{[^}]+\})+)\s*:\s*(Jack-in|Eject)\.\s*(?:Activate[^(]*)?\(\s*((?:\{[^}]+\})+)\s*:\s*Transform this card\.\s*\)/g;

cards.forEach(card => {
    card.allLines.forEach((line, idx) => {
        const abs = card.lineNums[idx];
        let m;
        jackEjectRe.lastIndex = 0;
        while ((m = jackEjectRe.exec(line)) !== null) {
            const [, cost1, word, cost2] = m;
            if (cost1 !== cost2) {
                report(card, abs, 'mismatch', 'reminder-cost', `${word} cost ${cost1} but reminder says ${cost2}`, line.trim());
            }
        }
    });
});

// ---------- Check 5: Anti-digital block clause missing rider ----------
cards.forEach(card => {
    card.allLines.forEach((line, idx) => {
        const abs = card.lineNums[idx];
        if (/can block creatures with digital\b/.test(line) &&
            !/can block creatures with digital as though they didn't have digital/.test(line) &&
            !/can block creatures with digital until end of turn/.test(line)) {
            report(card, abs, 'mismatch', 'anti-digital-rider', `Missing "as though they didn't have digital" rider`, line.trim());
        }
    });
});

// ---------- Check 6: Champion keyword without reminder text ----------
cards.forEach(card => {
    for (let idx = 0; idx < card.allLines.length; idx++) {
        const line = card.allLines[idx];
        const abs = card.lineNums[idx];
        const trimmed = line.trim();
        if (/^Champion\b/.test(trimmed)) {
            const inlineReminder = /\(When this enters, sacrifice it unless you exile another/i.test(line);
            const next = card.allLines[idx + 1] || '';
            const nextIsReminder = /^\s*\(When this enters, sacrifice it unless you exile another/i.test(next);
            if (!inlineReminder && !nextIsReminder) {
                report(card, abs, 'mismatch', 'champion-reminder', 'Champion keyword without reminder text', trimmed);
            }
        }
    }
});

// ---------- Check 7: Digital keyword first-use reminder ----------
// Convention: first *keyword-ability* mention of Digital on a card should carry reminder text.
// This check targets standalone keyword lines (e.g., "Digital" or "Flying, digital, ward {2}"),
// not rules text that references the keyword ("has digital", "gains digital until end of turn").
const isKeywordLine = (raw) => {
    const t = raw.trim();
    if (t.length === 0 || t.length > 80) return false;
    // Rules-text tells: these indicate the line isn't a keyword declaration.
    if (/\b(?:has|have|gains?|gaining|gained|with|without|is a|is an|be a|be an|was|were|loses?|losing|lost) digital\b/i.test(t)) return false;
    if (/can block creatures with digital/i.test(t)) return false;
    // Proper-noun tell: "Digital X" where X is capitalized = likely a creature name (e.g., "Digital Avatar").
    if (/\bDigital\s+[A-Z][a-z]/.test(t) && !/^Digital\s*\(/.test(t)) return false;
    // Common rules-text verbs that shouldn't appear on a keyword line
    if (/\b(?:attack|block|create|destroy|exile|return|draw|discard|gain|lose|add|search|reveal|counter|target|whenever|when|if you|at the|as though|becomes|enters|sacrifice|pay|put|tap|untap)\b/i.test(t)) return false;
    return /\b[Dd]igital\b/.test(t);
};

cards.forEach(card => {
    let firstDigitalIdx = -1;
    for (let idx = 0; idx < card.allLines.length; idx++) {
        if (isKeywordLine(card.allLines[idx])) {
            firstDigitalIdx = idx;
            break;
        }
    }
    if (firstDigitalIdx >= 0) {
        const line = card.allLines[firstDigitalIdx];
        const abs = card.lineNums[firstDigitalIdx];
        const hasReminder = /can block or be blocked only by creatures with digital/i.test(line);
        if (!hasReminder) {
            report(card, abs, 'minor', 'digital-reminder', 'First Digital mention on this card is missing reminder text', line.trim());
        }
    }
});

// ---------- Check 8: Activation restriction phrasing variants ----------
const canonicalActivation = [
    /Activate only as a sorcery\./,
    /Activate only as a sorcery and only once each turn\./,
    /Activate only once each turn\./,
    /Activate only if /,
    /Activate this ability only as a sorcery(?: and only once each turn)?\./,
    /Activate this ability only if /,
    /Activate this only as a sorcery(?: and only once each turn)?\./,
    /Activate only once per turn\./, // covered by typo check; still matches as "variant"
];
cards.forEach(card => {
    card.allLines.forEach((line, idx) => {
        const abs = card.lineNums[idx];
        if (/Activate\b/.test(line)) {
            const matchesCanonical = canonicalActivation.some(r => r.test(line));
            if (!matchesCanonical) {
                report(card, abs, 'minor', 'activation-phrasing', 'Non-canonical "Activate ..." phrasing', line.trim());
            }
        }
    });
});

// ---------- Output ----------
findings.sort((a, b) => a.line - b.line);

const bySeverity = {};
findings.forEach(f => {
    bySeverity[f.severity] = (bySeverity[f.severity] || 0) + 1;
});

const byCategory = {};
findings.forEach(f => {
    byCategory[f.category] = (byCategory[f.category] || 0) + 1;
});

const byCard = new Map();
findings.forEach(f => {
    const key = `${f.cardId}\t${f.cardName}`;
    if (!byCard.has(key)) byCard.set(key, []);
    byCard.get(key).push(f);
});

let out = `# Templating Lint Report\n\n`;
out += `Source: \`${INPUT_FILE}\`\n`;
out += `Generated: ${new Date().toISOString()}\n\n`;
out += `## Summary\n\n`;
out += `- Total findings: **${findings.length}**\n`;
out += `- Cards affected: ${byCard.size}\n\n`;

out += `### By severity\n\n`;
Object.entries(bySeverity).sort().forEach(([sev, n]) => {
    out += `- ${sev}: ${n}\n`;
});

out += `\n### By category\n\n`;
Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, n]) => {
        out += `- ${cat}: ${n}\n`;
    });

out += `\n## Findings by card\n\n`;
Array.from(byCard.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([key, list]) => {
        const [id, name] = key.split('\t');
        out += `### ${id} — ${name}\n\n`;
        list.forEach(f => {
            out += `- **L${f.line}** [${f.severity} / ${f.category}] ${f.message}\n`;
            if (f.snippet) out += `  \n  \`${f.snippet}\`\n`;
        });
        out += `\n`;
    });

fs.writeFileSync(OUTPUT_FILE, out);
console.log(`Wrote ${findings.length} findings across ${byCard.size} cards to ${OUTPUT_FILE}`);
console.log(`By severity:`, bySeverity);
console.log(`By category:`, byCategory);
