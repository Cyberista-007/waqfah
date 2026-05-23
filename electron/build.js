const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function findRouteFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            findRouteFiles(filePath, fileList);
        } else if (file === 'route.ts' || file === 'route.js') {
            fileList.push(filePath);
        }
    }
    return fileList;
}

const root = process.cwd();
const apiDir = path.join(root, 'src/app/api');
const savedContents = new Map();

try {
    if (fs.existsSync(apiDir)) {
        console.log('[Electron Build] Locating all API routes...');
        const routeFiles = findRouteFiles(apiDir);
        
        console.log(`[Electron Build] Temporarily replacing ${routeFiles.length} API routes with static placeholders...`);
        for (const file of routeFiles) {
            const content = fs.readFileSync(file, 'utf8');
            savedContents.set(file, content);
            
            const placeholder = `// Static placeholder for Electron build\nexport const dynamic = 'force-static';\nexport async function GET() { return new Response('static'); }\nexport async function POST() { return new Response('static'); }\n`;
            fs.writeFileSync(file, placeholder, 'utf8');
        }
    }
    
    console.log('[Electron Build] Running Next.js build...');
    execSync('node --max-old-space-size=8192 node_modules/next/dist/bin/next build', { stdio: 'inherit', env: { ...process.env, EXPORT_STATIC: 'true' } });
    console.log('[Electron Build] Next.js build completed successfully.');
} catch (error) {
    console.error('[Electron Build] Next.js build failed:', error);
    process.exit(1);
} finally {
    if (savedContents.size > 0) {
        console.log('[Electron Build] Restoring original API route contents...');
        for (const [file, content] of savedContents.entries()) {
            fs.writeFileSync(file, content, 'utf8');
        }
        console.log('[Electron Build] Original API routes restored.');
    }
}
