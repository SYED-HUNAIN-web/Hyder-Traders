import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Initialize Cloudinary configuration dynamically using process.env
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: NextRequest) {
  try {
    const { publicId } = await req.json();

    if (!publicId) {
      return NextResponse.json(
        { error: 'Missing publicId parameter' },
        { status: 400 }
      );
    }

    // Check for server-side config safety
    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: 'Cloudinary server credentials (API_KEY/API_SECRET) are not configured in .env.local' },
        { status: 500 }
      );
    }

    // Destroy the specified image in Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok' || result.result === 'not found') {
      return NextResponse.json({ success: true, result });
    } else {
      return NextResponse.json(
        { error: 'Failed to delete asset from Cloudinary', result },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Cloudinary deletion API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error during asset deletion' },
      { status: 500 }
    );
  }
}
