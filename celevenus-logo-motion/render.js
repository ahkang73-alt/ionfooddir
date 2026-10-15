// Capture logo_motion.html frame by frame into a silent video (or stills).
// Usage:
//   node render.js video <w> <h> <fps> <out.mp4>
//   node render.js stills <w> <h> <outdir> <t1> <t2> ...
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

(async () => {
  const [mode, w, h, ...rest] = process.argv.slice(2);
  const W = +w, H = +h;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  const url = 'file://' + path.join(__dirname, 'logo_motion.html') + `?w=${W}&h=${H}&capture=1`;
  await page.goto(url);
  await page.waitForFunction('typeof window.render === "function"');

  if (mode === 'stills') {
    const [outdir, ...times] = rest;
    fs.mkdirSync(outdir, { recursive: true });
    for (const t of times) {
      await page.evaluate(t => window.render(t), +t);
      await page.screenshot({ path: path.join(outdir, `t_${(+t).toFixed(2)}.png`) });
    }
  } else {
    const [fps, out] = rest;
    const dur = await page.evaluate('window.DUR');
    const frames = Math.round(dur * +fps);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', fps, '-c:v', 'png', '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = 0; i < frames; i++) {
      await page.evaluate(t => window.render(t), i / +fps);
      const buf = await page.screenshot({ type: 'png' });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 60 === 0) process.stdout.write(`frame ${i}/${frames}\n`);
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
  }
  await browser.close();
})();
