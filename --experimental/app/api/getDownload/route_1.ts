import { NextResponse } from 'next/server';
// @ts-ignore
import { JSDOM } from 'jsdom';

export async function GET() {
  try {
    // npmjs.com에서 HTML 데이터를 가져옵니다
    // const response = await fetch("https://info.bct2-4.com/infoservice/index.html");
    const response = await fetch("https://www.npmjs.com/package/puppeteer");
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    
    // HTML을 콘솔에 출력
    console.log("Fetched HTML:", html);
    
    return NextResponse.json({
      success: true,
      data: html
    });

  } catch (error) {
    console.error('Error fetching HTML:', error);
    return NextResponse.json(
      { error: 'Failed to fetch HTML data' },
      { status: 500 }
    );
  }
}