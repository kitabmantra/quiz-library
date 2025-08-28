import { getCurrentUser } from '@/lib/actions/user/get-current-user';
import { getBackendUrl } from '@/lib/utils/get-backendurl';
import { get_cookies } from '@/lib/utils/get-cookie';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    
    const user_token = await get_cookies("user_token")
    if(!user_token) { 
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const currentUser = await getCurrentUser();
    if(!currentUser || !currentUser.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    if(!currentUser.user.admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const url = formData.get('url') as string;

    if (!file && !url) {
      return NextResponse.json(
        { error: 'Either file or URL is required' },
        { status: 400 }
      );
    }

    let response;

    if (file) {
      const backendFormData = new FormData();
      backendFormData.append('file', file);
      const backendUrl = await getBackendUrl();
      response = await fetch(`${backendUrl}/api/pdf/extract`, {
        method: 'POST',
        body: backendFormData,
        headers  :{
          Cookie : `user_token=${user_token}`
        }
      });
    } else if (url) {
      const backendUrl = await getBackendUrl();
      response = await fetch(`${backendUrl}/api/pdf/extract-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie : `user_token=${user_token}`
        },
        body: JSON.stringify({ url }),
      });
    }

    if (!response || !response.ok) {
      throw new Error(`Backend request failed: ${response?.status} ${response?.statusText}`);
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'PDF Text Extraction API (Go Backend)',
    endpoints: {
      POST: {
        description: 'Extract text from PDF file or URL using Go backend',
        parameters: {
          file: 'PDF file (multipart/form-data)',
          url: 'PDF URL (multipart/form-data)'
        },
        response: {
          success: 'boolean',
          text: 'string',
          metadata: {
            characters: 'number',
            words: 'number',
            lines: 'number'
          }
        }
      }
    }
  });
}

export const runtime = 'nodejs';