const fs = require('fs');
const path = require('path');

const filePath = 'c:/Users/pc/OneDrive/Desktop/Drive-Hub-luck/frontend/src/contexts/LanguageContext.tsx';
let content = fs.readFileSync(filePath, 'utf8');

function deduplicateSection(lang) {
    const startMarker = `${lang}: {`;
    let startIndex = -1;
    let braceCount = 0;
    
    const lines = content.split('\n');
    let inLang = false;
    let startLine = -1;
    let endLine = -1;
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(startMarker)) {
            inLang = true;
            startLine = i;
            braceCount = 1;
            continue;
        }
        
        if (inLang) {
            for (let char of lines[i]) {
                if (char === '{') braceCount++;
                if (char === '}') {
                    braceCount--;
                    if (braceCount === 0) {
                        endLine = i;
                        inLang = false;
                        break;
                    }
                }
            }
        }
        if (endLine !== -1) break;
    }
    
    if (startLine === -1 || endLine === -1) return;
    
    const langLines = lines.slice(startLine + 1, endLine);
    const seen = new Set();
    const newLines = [];
    
    for (let i = langLines.length - 1; i >= 0; i--) {
        const line = langLines[i];
        const match = line.match(/^\s*([a-zA-Z0-9_]+):/);
        if (match) {
            const key = match[1];
            if (seen.has(key)) continue;
            seen.add(key);
        }
        newLines.unshift(line);
    }
    
    const before = lines.slice(0, startLine + 1);
    const after = lines.slice(endLine);
    
    content = [...before, ...newLines, ...after].join('\n');
}

['en', 'am', 'om'].forEach(lang => {
    // Re-read content for each lang as indices change
    // Or just run one by one if not complex
    deduplicateSection(lang);
});

fs.writeFileSync(filePath, content);
console.log('Deduplication complete.');
