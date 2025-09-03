import { createFromRoot } from 'codama';
import { rootNodeFromAnchor } from '@codama/nodes-from-anchor';
import { renderVisitor as renderJavaScriptVisitor } from '@codama/renderers-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read IDL from file
const idlPath = path.join(__dirname, 'idl/timelock_base_wallet_program.json');
const anchorIdl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));

console.log('🚀 Generating TypeScript client SDK from Anchor IDL...');

// Convert Anchor IDL to Codama IDL
const codama = createFromRoot(rootNodeFromAnchor(anchorIdl));

// Create client directory if it doesn't exist
const clientDir = path.join(__dirname, '');
if (!fs.existsSync(clientDir)) {
  fs.mkdirSync(clientDir, { recursive: true });
}

// Generate TypeScript client
codama.accept(renderJavaScriptVisitor(path.join(clientDir, 'src')));

console.log('✅ TypeScript client SDK generated successfully!');
console.log(`📁 Client code generated in: ${path.resolve(clientDir)}`);
