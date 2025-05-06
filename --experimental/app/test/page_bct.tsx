// pages/api/scrape-schedule.js

import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const STARTDATE = formData.get('STARTDATE') as string;
    const ENDDATE = formData.get('ENDDATE') as string;

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // BCT 웹사이트에 접속
    await page.goto('https://info.bct2-4.com/infoservice/index.html');
    
    // 날짜 범위 입력
    await page.type('#STARTDATE', STARTDATE);
    await page.type('#ENDDATE', ENDDATE);
    
    // 검색 버튼 클릭
    await page.click('input[type="submit"]');
    
    // 테이블이 로드될 때까지 대기
    await page.waitForSelector('#berthScheduleTable');
    
    // 데이터 추출
    const vessels = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('#berthScheduleTable tbody tr'));
      return rows.map(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        return {
          terminal: 'BCT',
          vesselName: cells[1]?.textContent?.trim() || '',
          routeCode: cells[2]?.textContent?.trim() || '',
          carrier: cells[3]?.textContent?.trim() || '',
          portInfo: cells[4]?.textContent?.trim() || '',
          arrivalTime: cells[5]?.textContent?.trim() || '',
          departureTime: cells[6]?.textContent?.trim() || ''
        };
      });
    });

    await browser.close();
    
    return NextResponse.json(vessels);
  } catch (error) {
    console.error('BCT 데이터 추출 중 오류 발생:', error);
    return NextResponse.json(
      { error: 'BCT 데이터를 가져오는 데 실패했습니다.' },
      { status: 500 }
    );
  }
}