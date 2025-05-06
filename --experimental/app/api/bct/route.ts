import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isMobile = searchParams.get('mobile') === 'true';
    
    const baseUrl = 'https://info.bct2-4.com/infoservice/index.html';
    const url = isMobile ? `${baseUrl}?mobile=true` : baseUrl;
    
    const response = await fetch(url);
    const html = await response.text();
    
    const $ = cheerio.load(html);
    
    // MSC CHINA 정보 추출
    const mscChinaElement = $('div[style*="display: table-cell"]').filter((_, el) => {
      const text = $(el).text().trim();
      return text === 'MSC CHINA';
    });

    const mscChinaInfo = {
      text: mscChinaElement.text().trim(),
      style: mscChinaElement.attr('style'),
      parent: mscChinaElement.parent().html()
    };

    return NextResponse.json({
      mscChina: mscChinaInfo,
      isMobile: isMobile
    });
  } catch (error) {
    console.error('Error fetching or parsing data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}