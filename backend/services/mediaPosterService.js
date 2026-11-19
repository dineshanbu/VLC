const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);
const uploadsDir = path.join(__dirname, '../uploads');
const posterDir = path.join(uploadsDir, 'media-posters');
const inFlight = new Map();

// Portable ffmpeg and ffprobe paths (bundled via @ffmpeg-installer & @ffprobe-installer)
let ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';
try {
  const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
  if (ffmpegInstaller && ffmpegInstaller.path) ffmpegPath = ffmpegInstaller.path;
} catch (_) {}

let ffprobePath = process.env.FFPROBE_PATH || 'ffprobe';
try {
  const ffprobeInstaller = require('@ffprobe-installer/ffprobe');
  if (ffprobeInstaller && ffprobeInstaller.path) ffprobePath = ffprobeInstaller.path;
} catch (_) {}

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
    await execFileAsync(ffmpegPath, [
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

async function hasFastStart(filePath) {
  const file = await fs.promises.open(filePath, 'r');
  try {
    const { size: fileSize } = await file.stat();
    let offset = 0;
    let moovOffset = -1;
    let mdatOffset = -1;
    const header = Buffer.alloc(16);

    while (offset + 8 <= fileSize) {
      const { bytesRead } = await file.read(header, 0, header.length, offset);
      if (bytesRead < 8) break;

      const size32 = header.readUInt32BE(0);
      const type = header.toString('ascii', 4, 8);
      let atomSize = size32;
      let headerSize = 8;

      if (size32 === 1) {
        if (bytesRead < 16) break;
        const largeSize = header.readBigUInt64BE(8);
        if (largeSize > BigInt(Number.MAX_SAFE_INTEGER)) break;
        atomSize = Number(largeSize);
        headerSize = 16;
      } else if (size32 === 0) {
        atomSize = fileSize - offset;
      }

      if (atomSize < headerSize || offset + atomSize > fileSize) break;
      if (type === 'moov') moovOffset = offset;
      if (type === 'mdat') mdatOffset = offset;
      if (moovOffset >= 0 && mdatOffset >= 0) break;
      offset += atomSize;
    }

    return moovOffset >= 0 && mdatOffset >= 0 && moovOffset < mdatOffset;
  } finally {
    await file.close();
  }
}

/**
 * Ensures a video file has an AAC audio stream and MP4 faststart (+faststart)
 * so it plays with sound across all devices (Windows Chrome, Mac Safari, iPhone iOS, Android).
 * AAC audio is copied unchanged; other audio codecs are converted. Videos with
 * AAC but a trailing moov atom are remuxed so iOS can start playback promptly.
 */
async function ensureIosCompatibleVideo(fileName) {
  const safeName = path.basename(fileName);
  const ext = path.extname(safeName).toLowerCase();
  if (ext !== '.mp4') return false;
  const source = path.join(uploadsDir, safeName);
  if (!fs.existsSync(source)) return false;

  // Probe audio codec
  let audioCodec = '';
  try {
    const { stdout } = await execFileAsync(ffprobePath, [
      '-v', 'error',
      '-select_streams', 'a:0',
      '-show_entries', 'stream=codec_name',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      source
    ], { timeout: 15000 });
    audioCodec = stdout.trim().toLowerCase();
  } catch (_) {}

  let fastStart = false;
  try {
    fastStart = await hasFastStart(source);
  } catch (_) {}

  // Skip only when both the audio codec and MP4 layout are already compatible.
  if (audioCodec === 'aac' && fastStart) {
    return false;
  }

  const target = source + '.ios.tmp.mp4';
  try {
    await execFileAsync(ffmpegPath, [
      '-hide_banner', '-loglevel', 'error',
      '-i', source,
      '-c:v', 'copy',
      ...(audioCodec === 'aac' ? ['-c:a', 'copy'] : ['-c:a', 'aac', '-b:a', '192k']),
      '-movflags', '+faststart',
      '-y', target
    ], { windowsHide: true, timeout: 120000, maxBuffer: 4 * 1024 * 1024 });

    if (fs.existsSync(target) && fs.statSync(target).size > 1000) {
      await fs.promises.unlink(source);
      await fs.promises.rename(target, source);
      console.log(`[Video Normalization] Processed ${safeName} (audio: ${audioCodec || 'none'}${fastStart ? '' : ', faststart added'})`);
      return true;
    }
  } catch (err) {
    console.warn(`[Video Normalization] Skip or failed for ${safeName}:`, err.message);
    if (fs.existsSync(target)) {
      try { await fs.promises.unlink(target); } catch (_) {}
    }
  }
  return false;
}

/**
 * Scans uploads folder and normalizes any video files that are not AAC.
 * Can be run on server startup or triggered via admin API endpoint.
 */
async function autoConvertAllServerVideos() {
  try {
    const files = await fs.promises.readdir(uploadsDir);
    const mp4Files = files.filter(f => f.toLowerCase().endsWith('.mp4'));
    let converted = 0;
    let checked = 0;
    for (const file of mp4Files) {
      checked++;
      try {
        const didConvert = await ensureIosCompatibleVideo(file);
        if (didConvert) converted++;
      } catch (e) {
        console.warn(`[AutoConvert] Error processing ${file}:`, e.message);
      }
    }
    console.log(`[AutoConvert] Complete: checked ${checked} videos, converted ${converted} to AAC.`);
    return { checked, converted };
  } catch (err) {
    console.warn('[AutoConvert] Scan error:', err.message);
    return { checked: 0, converted: 0, error: err.message };
  }
}

module.exports = {
  createMediaPoster,
  posterFileName,
  ensureIosCompatibleVideo,
  autoConvertAllServerVideos
};
