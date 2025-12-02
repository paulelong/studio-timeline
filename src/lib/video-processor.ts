import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

// Set the FFmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export interface ProcessedVideo {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  thumbnailBuffer?: Buffer;
  thumbnailFilename?: string;
}

/**
 * Process video: auto-rotate based on metadata, optimize for web playback
 */
export async function processVideo(
  inputBuffer: Buffer,
  originalFilename: string
): Promise<ProcessedVideo> {
  const tempDir = os.tmpdir();
  const timestamp = Date.now();
  const inputPath = path.join(tempDir, `input-${timestamp}-${originalFilename}`);
  const outputPath = path.join(tempDir, `output-${timestamp}-${originalFilename.replace(/\.[^.]+$/, '.mp4')}`);
  const thumbnailPath = path.join(tempDir, `thumb-${timestamp}.jpg`);

  try {
    // Write input buffer to temp file
    await fs.writeFile(inputPath, inputBuffer);

    // Get video metadata to check rotation
    const metadata = await new Promise<any>((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) reject(err);
        else resolve(metadata);
      });
    });

    // Check for rotation in metadata
    const videoStream = metadata.streams?.find((s: any) => s.codec_type === 'video');
    const rotation = videoStream?.tags?.rotate || videoStream?.side_data_list?.find((d: any) => d.rotation)?.rotation || 0;
    
    // Determine transpose filter based on rotation
    let transposeFilter = '';
    if (rotation === 90 || rotation === -270) {
      transposeFilter = 'transpose=1'; // 90° clockwise
    } else if (rotation === 180 || rotation === -180) {
      transposeFilter = 'transpose=2,transpose=2'; // 180°
    } else if (rotation === 270 || rotation === -90) {
      transposeFilter = 'transpose=2'; // 90° counter-clockwise
    }

    // Process video with FFmpeg
    const ffmpegCommand = ffmpeg(inputPath)
      .outputOptions([
        '-c:v libx264',           // H.264 codec for wide compatibility
        '-preset fast',            // Balance encoding speed and compression
        '-crf 23',                 // Quality setting (lower = better quality, 18-28 is good range)
        '-movflags +faststart',    // Enable streaming (move metadata to beginning)
        '-pix_fmt yuv420p',        // Pixel format for compatibility
      ]);

    // Add transpose filter if rotation detected
    if (transposeFilter) {
      ffmpegCommand.outputOptions([`-vf ${transposeFilter}`]);
      ffmpegCommand.outputOptions(['-metadata:s:v rotate=0']); // Clear rotation metadata
    }

    await new Promise<void>((resolve, reject) => {
      ffmpegCommand
        .audioCodec('aac')           // AAC audio codec
        .audioBitrate('128k')        // Audio bitrate
        .on('end', () => resolve())
        .on('error', (err: Error) => reject(err))
        .save(outputPath);
    });

    // Read processed video
    const processedBuffer = await fs.readFile(outputPath);
    
    // Generate thumbnail from the middle of the video
    await new Promise<void>((resolve, reject) => {
      ffmpeg(outputPath)
        .screenshots({
          timestamps: ['50%'],
          filename: path.basename(thumbnailPath),
          folder: path.dirname(thumbnailPath),
          size: '640x?',
        })
        .on('end', () => resolve())
        .on('error', (err: Error) => reject(err));
    });

    // Read thumbnail
    let thumbnailBuffer: Buffer | undefined;
    let thumbnailFilename: string | undefined;
    try {
      thumbnailBuffer = await fs.readFile(thumbnailPath);
      thumbnailFilename = `thumb-${timestamp}.jpg`;
    } catch (e) {
      // Thumbnail generation failed, continue without it
      console.warn('Failed to generate thumbnail:', e);
    }
    
    return {
      buffer: processedBuffer,
      filename: path.basename(outputPath),
      mimeType: 'video/mp4',
      thumbnailBuffer,
      thumbnailFilename,
    };
  } finally {
    // Cleanup temp files
    try {
      await fs.unlink(inputPath);
    } catch (e) {
      // Ignore cleanup errors
    }
    try {
      await fs.unlink(outputPath);
    } catch (e) {
      // Ignore cleanup errors
    }
    try {
      await fs.unlink(thumbnailPath);
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}
