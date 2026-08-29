import fs from 'fs';
import path from 'path';

try {
  // 1. Copy dist to docs
  fs.cpSync('dist', 'docs', { recursive: true });

  // 2. Create .nojekyll in root, dist, and docs
	fs.writeFileSync('.nojekyll', '');
	fs.writeFileSync('dist/.nojekyll', '');
	fs.writeFileSync('docs/.nojekyll', '');

	// 3. Create 404.html in dist and docs
	if (fs.existsSync('dist/index.html')) {
		fs.copyFileSync('dist/index.html', 'dist/404.html');
		fs.copyFileSync('dist/index.html', 'docs/404.html');
	}

	console.log('[PostBuild] Successfully prepared dist/ and docs/ for GitHub Pages');
} catch (err) {
	console.error('[PostBuild] Error:', err);
}
