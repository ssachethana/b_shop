import { NextResponse } from 'next/server';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
  },
});

export async function DELETE(request: Request) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
    }

    // Extract the R2 key from the full public URL
    // e.g. "https://pub-xxx.r2.dev/products/123-abc.jpg" → "products/123-abc.jpg"
    const publicBaseUrl = process.env.CLOUDFLARE_PUBLIC_URL!; // must end with "/"
    const key = imageUrl.replace(publicBaseUrl, '');

    if (!key || key === imageUrl) {
      return NextResponse.json({ error: 'Could not parse image key from URL' }, { status: 400 });
    }

    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.CLOUDFLARE_BUCKET_NAME!,
        Key: key,
      })
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('R2 Delete Error:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}