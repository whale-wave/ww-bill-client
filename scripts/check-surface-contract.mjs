import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import process from 'node:process';

const projectRoot = resolve(import.meta.dirname, '..');
const sourceRoot = resolve(projectRoot, 'src');
const forbiddenClass = /\b(?:bg-|border-(?:[a-z]+-\d|white|black)|shadow-|backdrop-|rounded-|opacity-)\S*/;
const forbiddenAttribute = /\b(?:on[A-Z]\w*|role|style|tabIndex)\s*=/;
const violations = [];

function collectFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory())
      return collectFiles(path);
    return entry.name.endsWith('.tsx') ? [path] : [];
  });
}

for (const file of collectFiles(sourceRoot)) {
  const source = readFileSync(file, 'utf8');
  const relativeFile = relative(projectRoot, file);
  for (const match of source.matchAll(/<Surface\b([\s\S]*?)>/g)) {
    const attributes = match[1];
    const location = source.slice(0, match.index).split('\n').length;
    if (forbiddenAttribute.test(attributes))
      violations.push(`${relativeFile}:${location} Surface must remain presentation-only`);

    const classNameAttribute = /className\s*=\s*("[^"]*"|\{[\s\S]*?\})/.exec(attributes)?.[1];
    if (classNameAttribute?.startsWith('{') && !/^\{cn\(/.test(classNameAttribute))
      violations.push(`${relativeFile}:${location} Surface className must be a literal or shared cn()`);

    const className = classNameAttribute?.match(/(['"]).*?\1/g)?.join(' ') ?? '';
    if (className && forbiddenClass.test(className))
      violations.push(`${relativeFile}:${location} Surface className may only control layout/composition`);
  }
}

if (violations.length > 0) {
  console.error('WW Surface contract violation:');
  console.error(violations.join('\n'));
  process.exitCode = 1;
}
