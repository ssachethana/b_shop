import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Initialize the S3 client configured for Cloudflare R2
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer for uploading
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique file name to prevent overwriting existing files
    const uniqueId = Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const fileExtension = file.name.split('.').pop();
    const fileName = `products/${uniqueId}.${fileExtension}`;

    // Set up the R2 upload parameters
    const uploadParams = {
      Bucket: process.env.CLOUDFLARE_BUCKET_NAME!,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    };

    // Execute upload to Cloudflare R2
    await r2Client.send(new PutObjectCommand(uploadParams));

    // Construct the final public URL
    const publicUrl = `${process.env.CLOUDFLARE_PUBLIC_URL}${fileName}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error('R2 Upload Error:', error);
    return NextResponse.json({ error: 'Failed to upload image to storage' }, { status: 500 });
  }
}