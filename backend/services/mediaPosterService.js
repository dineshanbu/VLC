const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);
const uploadsDir = path.join(__dirname, '../uploads');
const posterDir = path.join(uploadsDir, 'media-posters');
const inFlight = new Map();

function posterFileName(fileName) {
  return `${path.parse(path.basename(fileName)).name}.jpg`;
}

async function createMediaPoster(fileName) {
  const safeName = path.basename(fileName);
  const source = path.join(uploadsDir, safeName);
  const target = path.join(posterDir, posterFileName(safeName));
  if (!fs.existsSync(source)) throw new Error('Media video file was not found.');
  if (fs.existsSync(target)) return target;

  if (inFlight.has(target)) return inFlight.get(target);
  const task = (async () => {
    await fs.promises.mkdir(posterDir, { recursive: true });
    await execFileAsync(process.env.FFMPEG_PATH || 'ffmpeg', [
      '-hide_banner', '-loglevel', 'error', '-ss', '1', '-i', source,
      '-frames:v', '1', '-vf', 'scale=960:-2:force_original_aspect_ratio=decrease',
      '-q:v', '5', '-y', target
    ], { windowsHide: true, timeout: 20000, maxBuffer: 1024 * 1024 });
    return target;
  })();
  inFlight.set(target, task);
  try {
    return await task;
  } finally {
    inFlight.delete(target);
  }
}

async function ensureIosCompatibleVideo(fileName) {
  const safeName = path.basename(fileName);
  const ext = path.extname(safeName).toLowerCase();
  if (ext !== '.mp4') return;
  const source = path.join(uploadsDir, safeName);
  if (!fs.existsSync(source)) return;

  const target = source + '.ios.tmp.mp4';
  try {
    await execFileAsync(process.env.FFMPEG_PATH || 'ffmpeg', [
      '-hide_banner', '-loglevel', 'error',
      '-i', source,
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-movflags', '+faststart',
      '-y', target
    ], { windowsHide: true, timeout: 60000, maxBuffer: 1024 * 1024 });

    if (fs.existsSync(target) && fs.statSync(target).size > 1000) {
      await fs.promises.unlink(source);
      await fs.promises.rename(target, source);
    }
  } catch (err) {
    console.warn('[Video Normalization] Skip or failed:', err.message);
    if (fs.existsSync(target)) {
      try { await fs.promises.unlink(target); } catch (_) {}
    }
  }
}

module.exports = { createMediaPoster, posterFileName, ensureIosCompatibleVideo };
