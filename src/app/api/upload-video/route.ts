import { NextResponse } from 'next/server';
import { client } from '../../../../src/sanity/lib/client';
import { processVideo } from '../../../lib/video-processor';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const entryId = formData.get('entryId') as string | null;

    if (!file || !entryId) {
      return NextResponse.json({ error: 'Missing file or entryId' }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Process video: auto-rotate and optimize
    const processed = await processVideo(inputBuffer, file.name);

    // Upload processed video to Sanity
    const asset = await client.assets.upload('file', processed.buffer, {
      filename: processed.filename,
      contentType: processed.mimeType,
    });

    // Upload thumbnail if generated
    let thumbnailAssetId: string | undefined;
    if (processed.thumbnailBuffer && processed.thumbnailFilename) {
      try {
        const thumbnailAsset = await client.assets.upload('image', processed.thumbnailBuffer, {
          filename: processed.thumbnailFilename,
          contentType: 'image/jpeg',
        });
        thumbnailAssetId = thumbnailAsset._id;
      } catch (e) {
        console.warn('Failed to upload thumbnail:', e);
      }
    }

    // Append to media array on entry
    const mediaItem: any = {
      _type: 'file',
      asset: { _type: 'reference', _ref: asset._id },
    };

    // Add thumbnail reference if available
    if (thumbnailAssetId) {
      mediaItem.thumbnail = { _type: 'reference', _ref: thumbnailAssetId };
    }

    const patched = await client
      .patch(entryId)
      .setIfMissing({ media: [] })
      .append('media', [mediaItem])
      .commit();

    return NextResponse.json({
      assetId: asset._id,
      assetUrl: asset.url,
      entryId,
      patchedId: patched._id,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Upload failed', details: err?.message }, { status: 500 });
  }
}