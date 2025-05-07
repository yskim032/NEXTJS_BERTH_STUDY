import { NextResponse } from 'next/server';
// @ts-ignore
import { JSDOM } from 'jsdom';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { packageName } = await request.json();
    console.log("packageName", packageName);

    if (!packageName) {
      return NextResponse.json(
        { error: 'Package name is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`https://www.npmjs.com/package/${packageName}`, {
      headers: {
        'Accept': 'text/html',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Package not found: ${packageName}` },
        { status: 404 }
      );
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;
    // npmjs.com 웹사이트에서 특정 클래스명(._9ba9a726)을 가진 요소를 찾아서
    // 그 요소의 텍스트 내용(다운로드 수 정보)을 추출합니다.
    // ?. 연산자는 해당 요소가 없을 경우 undefined를 반환합니다.
    const download = document.querySelector('._9ba9a726')?.textContent;

    console.log("download", download);

    return NextResponse.json({
      success: true,
      data: download || 'No download information found'
    });

  } catch (error) {
    console.error('Error fetching HTML:', error);
    return NextResponse.json(
      { error: 'Failed to fetch HTML data' },
      { status: 500 }
    );
  }
}