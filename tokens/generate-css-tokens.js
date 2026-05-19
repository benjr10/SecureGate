const fs = require('fs');
const path = require('path');

const tokensRaw = fs.readFileSync(path.join(__dirname, '../design-tokens.json'), 'utf8');
const tokens = JSON.parse(tokensRaw);

const cssVariables = [];
const primitiveColors = {};

// 1. First pass: collect all primitive colors to resolve references later
function collectPrimitives(obj, currentPath = []) {
  for (const [key, val] of Object.entries(obj)) {
    if (val && typeof val === 'object') {
      if (val.type === 'color' && val.value !== undefined) {
        // e.g. "primitive color collection.key color group.primary key color"
        const fullPath = currentPath.concat(key).join('.');
        primitiveColors[fullPath] = val.value;
      }
      collectPrimitives(val, currentPath.concat(key));
    }
  }
}

collectPrimitives(tokens['primitive color collection'] || {}, ['primitive color collection']);

function resolveValue(val) {
  if (typeof val === 'string' && val.startsWith('{') && val.endsWith('}')) {
    let refPath = val.slice(1, -1); // remove { and }
    // Handle edge cases if there's .value appended
    refPath = refPath.replace(/\.value$/, '');
    if (primitiveColors[refPath]) {
      return primitiveColors[refPath];
    } else {
        // Just in case it points to another resolved token or it's slightly different
        // we can attempt a generic resolve here but let's stick to primitiveColors first.
        // Actually, sometimes references refer to the exact path.
    }
  }
  return val;
}

function camelToDash(str) {
  return str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
}

function sanitizeName(name) {
  // Remove spaces, dots, and convert to lowercase
  return name.replace(/[\s\.]+/g, '-').toLowerCase();
}

// 2. Second pass: generate CSS variables for everything else
function generateVars(obj, currentPath = []) {
  for (const [key, val] of Object.entries(obj)) {
    if (currentPath.length === 0 && key === 'primitive color collection') {
      // skip primitives as per requirement "UI will only use the color roles"
      continue;
    }

    if (val && typeof val === 'object') {
      if (val.value !== undefined) {
        if (typeof val.value === 'object') {
          // It's an object like custom-fontStyle
          for (const [prop, propVal] of Object.entries(val.value)) {
            const varName = `--${currentPath.concat(key).map(sanitizeName).join('-')}-${camelToDash(prop)}`;
            let finalVal = propVal;
            // Add px to font sizes / line heights if they are numbers and not weights
            if (typeof propVal === 'number' && propVal !== 0 && !['fontWeight', 'fontStretch', 'paragraphIndent', 'paragraphSpacing'].includes(prop)) {
              finalVal = `${propVal}px`;
            }
            cssVariables.push(`  ${varName}: ${finalVal};`);
          }
        } else {
          // It's a primitive value token
          // Remove top level key "color roles" or "typography" to make names shorter?
          // The prompt says "keep all the CSS variables in one CSS file", let's just use the full path to avoid collisions
          const pathElements = currentPath.concat(key);
          // Optional: strip generic grouping keys for cleaner variables
          // e.g. color-roles-primary-roles-primary-color-role -> primary-color-role
          // But to be safe let's just map them all.
          
          const varName = `--${pathElements.map(sanitizeName).join('-')}`;
          let finalVal = resolveValue(val.value);
          
          // append px if dimension
          if (val.type === 'dimension' && typeof finalVal === 'number' && finalVal !== 0) {
              finalVal = `${finalVal}px`;
          }
          cssVariables.push(`  ${varName}: ${finalVal};`);
        }
      } else {
        generateVars(val, currentPath.concat(key));
      }
    }
  }
}

generateVars(tokens);

const cssContent = `:root {\n${cssVariables.join('\n')}\n}\n`;

const outDir = path.join(__dirname, '../styles');
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

const outPath = path.join(outDir, 'tokens.css');
fs.writeFileSync(outPath, cssContent);
console.log(`Successfully generated CSS tokens at ${outPath}`);
