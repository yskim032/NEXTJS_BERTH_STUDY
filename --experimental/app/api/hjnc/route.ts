import { NextResponse } from 'next/server';
import { chromium } from 'playwright';

export async function POST(request: Request) {
  let browser;
  try {
    console.log('Starting HJNC API request...');
    
    // Playwright 브라우저 설정
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      viewport: { width: 1280, height: 800 },
      ignoreHTTPSErrors: true
    });

    const page = await context.newPage();
    
    // HJNC 웹사이트 접속
    await page.goto('https://www.hjnc.co.kr/esvc/vessel/berthScheduleT', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // 데이터 로딩 대기
    await page.waitForTimeout(5000);

    // 선박 정보 추출
    const vesselInfo = await page.evaluate(() => {
      const vessels: any[] = [];
      const rows = document.querySelectorAll('table tr');
      
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 12) { // Increased to match example structure
          const vessel = {
            terminal: 'HJNC',
            vesselName: cells[4]?.textContent?.trim() || '', // Changed from 1 to 4 for vessel name
            // portInfo: cells[5]?.textContent?.trim() || '', // Changed from 4 to 5 for port info
            routeCode: cells[5]?.textContent?.trim() || '', // Changed from 4 to 5 for port info
            carrier: cells[7]?.textContent?.trim() || '', // Changed from 3 to 7 for carrier
            // routeCode: cells[2]?.querySelector('a')?.textContent?.trim() || '', // Changed to get route from link
            portInfo: cells[2]?.querySelector('a')?.textContent?.trim() || '', // Changed to get route from link
            arrivalTime: cells[8]?.textContent?.trim() || '', // Changed from 5 to 8 for arrival
            departureTime: cells[9]?.textContent?.trim() || '', // Changed from 6 to 9 for departure
            status: cells[16]?.textContent?.trim() || '' // Adjusted status column
          };
          vessels.push(vessel);
        }
      });
      
      return vessels;
    });

    return NextResponse.json(vesselInfo);
  } catch (error) {
    console.error('HJNC API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch HJNC content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
} 