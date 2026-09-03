import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import process from 'node:process';

const projectRoot = resolve(import.meta.dirname, '..');
const baseline = JSON.parse(readFileSync(resolve(projectRoot, 'config/design-system-debt-baseline.json'), 'utf8'));

const rules = [
  ['gradient-panel', /\bGradientPanel\b/],
  ['raw-color', /#[\da-f]{3,8}\b/i],
  ['important', /!important\b/],
  ['raw-z-index', /z-index\s*:\s*[1-9]\d*/],
  ['theme-business-selector', /html\[data-appearance-template[^\]]*\]\s+\.[\w-]+/],
];

const sourceFile = file => /\.(?:[cm]?[jt]sx?|scss|css)$/.test(file);
const normalize = source => source.trim().replaceAll(/\s+/g, ' ');
function isReferenceColorSource(file) {
  return file === 'src/assets/styles/appearance.scss'
    || file.startsWith('src/assets/styles/design-system/')
    || file.startsWith('src/shared/config/');
}

function listCurrentFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = join(directory, entry.name);
    if (entry.isDirectory())
      return listCurrentFiles(absolutePath);
    return sourceFile(entry.name) ? [relative(projectRoot, absolutePath)] : [];
  });
}

function collectViolations(files, readFile) {
  const violations = [];
  for (const file of files) {
    const occurrences = new Map();
    readFile(file).split(/\r?\n/).forEach((source, index) => {
      for (const [rule, matcher] of rules) {
        if (rule === 'raw-color' && isReferenceColorSource(file))
          continue;
        if (!matcher.test(source))
          continue;
        const normalizedSource = normalize(source);
        const occurrenceKey = `${rule}\u0000${file}\u0000${normalizedSource}`;
        const occurrence = (occurrences.get(occurrenceKey) ?? 0) + 1;
        occurrences.set(occurrenceKey, occurrence);
        violations.push({
          file,
          line: index + 1,
          rule,
          signature: `${occurrenceKey}\u0000${occurrence}`,
          source: normalizedSource,
        });
      }
    });
  }
  return violations;
}

const currentViolations = collectViolations(
  listCurrentFiles(resolve(projectRoot, 'src')),
  file => readFileSync(resolve(projectRoot, file), 'utf8'),
);

if (process.argv.includes('--write-baseline')) {
  const nextBaseline = {
    ...baseline,
    description: 'Approved v2 debt inventory. Signatures are rule + file + normalized source + occurrence. CI rejects new debt and requires this list to shrink whenever existing debt is removed.',
    violations: currentViolations.map(violation => violation.signature).sort(),
  };
  writeFileSync(
    resolve(projectRoot, 'config/design-system-debt-baseline.json'),
    `${JSON.stringify(nextBaseline, null, 2)}\n`,
  );
  process.exit(0);
}

if (!Array.isArray(baseline.violations)) {
  console.error('WW Design System v2 debt baseline is not initialized. Run pnpm sync:design-system-debt-baseline.');
  process.exit(1);
}

const baselineViolations = new Set(baseline.violations);
const currentSignatures = new Set(currentViolations.map(violation => violation.signature));
const newViolations = currentViolations.filter(violation => !baselineViolations.has(violation.signature));
const removedViolations = baseline.violations.filter(signature => !currentSignatures.has(signature));

if (newViolations.length > 0) {
  console.error('WW Design System v2 permits no new visual debt:');
  console.error(newViolations.map(violation => `${violation.file}:${violation.line} ${violation.rule}: ${violation.source}`).join('\n'));
  process.exitCode = 1;
}

if (removedViolations.length > 0) {
  console.error('WW Design System v2 debt baseline must ratchet after permitted debt is removed. Run pnpm sync:design-system-debt-baseline and include the resulting baseline update:');
  console.error(removedViolations.join('\n'));
  process.exitCode = 1;
}
