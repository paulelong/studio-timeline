import { NextResponse } from 'next/server';
import { client } from '../../../../src/sanity/lib/client';

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

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const asset = await client.assets.upload('file', buffer, {
      filename: file.name || 'upload-video',
      contentType: file.type || 'video/mp4',
    });

    // Append to media array on entry; schema may expect _type: 'file' or 'image'. Using 'file' for videos.
    const patched = await client
      .patch(entryId)
      .setIfMissing({ media: [] })
      .append('media', [
        {
          _type: 'file',
          asset: { _type: 'reference', _ref: asset._id },
        },
      ])
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