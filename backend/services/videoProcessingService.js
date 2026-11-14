/**
 * videoProcessingService.js
 * Re-muxes an MP4 file so its moov atom sits at the front of the file
 * (the "fast-start" flag). Safari / iOS requires this for progressive
 * playback; without it the browser must download the entire file before
 * it can begin playing.
 */
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);
const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';

/**
 * Check if an MP4 already has fast-start (moov atom before mdat).
 * We read the first 32 bytes and look for 'ftyp' or 'moov' as the
 * first atom; if 'mdat' appears first, fast-start is needed.
 */
async function needsFastStart(filePath) {
  try {
    const fd = await fs.promises.open(filePath, 'r');
    const buf = Buffer.alloc(32);
    await fd.read(buf, 0, 32, 0);
    await fd.close();
    // Atom name is at bytes 4-7
    const atom = buf.toString('ascii', 4, 8);
    // If first atom is 'mdat', moov is at the end => needs fast-start
    if (atom === 'mdat') return true;
    // 'ftyp' or 'moov' at the start => already fast-start
    return false;
  } catch {
    // Can't read — assume processing needed
    return true;
  }
}

/**
 * Run ffmpeg -movflags +faststart on the given file (in-place).
 * Returns true if processed, false if already fast-start or non-MP4.
 */
async function applyFastStart(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext !== '.mp4') return false;

  if (!(await needsFastStart(filePath))) {
    console.log(`[FastStart] Already optimised: ${path.basename(filePath)}`);
    return false;
  }

  const tmpPath = filePath + '.tmp.mp4';
  try {
    await execFileAsync(FFMPEG, [
      '-hide_banner', '-loglevel', 'error',
      '-i', filePath,
      '-c', 'copy',          // no re-encoding — fast
      '-movflags', '+faststart',
      '-y', tmpPath
    ], { windowsHide: true, timeout: 120000, maxBuffer: 4 * 1024 * 1024 });

    // Replace original with fast-start version
    await fs.promises.rename(tmpPath, filePath);
    console.log(`[FastStart] Optimised: ${path.basename(filePath)}`);
    return true;
  } catch (err) {
    console.warn(`[FastStart] Failed for ${path.basename(filePath)}:`, err.message);
    // Clean up temp if it exists
    try { await fs.promises.unlink(tmpPath); } catch {}
    return false;
  }
}

/**
 * Process fast-start for all existing MP4 files in the uploads directory.
 * Called once at server startup to fix already-uploaded files.
 */
async function processExistingUploads(uploadsDir) {
  try {
    const files = await fs.promises.readdir(uploadsDir);
    const mp4s = files.filter(f => f.toLowerCase().endsWith('.mp4'));
    if (mp4s.length === 0) return;
    console.log(`[FastStart] Checking ${mp4s.length} existing MP4(s)...`);
    for (const file of mp4s) {
      const fullPath = path.join(uploadsDir, file);
      await applyFastStart(fullPath);
    }
    console.log('[FastStart] Existing uploads scan complete.');
  } catch (err) {
    console.warn('[FastStart] Could not scan uploads:', err.message);
  }
}

module.exports = { applyFastStart, processExistingUploads };
