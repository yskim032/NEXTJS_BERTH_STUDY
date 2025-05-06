import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function GET() {
  try {
    console.log('Starting BCT data scraping...');

    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
      ],
    });

    try {
      const page = await browser.newPage();
      
      // Enable request interception for debugging
      await page.setRequestInterception(true);
      page.on('request', (request: puppeteer.HTTPRequest) => {
        console.log('Request:', request.url());
        request.continue();
      });

      // Set viewport and user agent
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

      console.log('Navigating to BCT website...');
      await page.goto('https://info.bct2-4.com/infoservice/index.html', {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Wait for the main frame to load
      const mainFrame = page.mainFrame();
      console.log('Main frame loaded');

      // Find and click the berth status link
      console.log('Looking for berth status link...');
      const berthLink = await mainFrame.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        return links.find(link => link.textContent?.includes('선석 배정현황'));
      });

      if (!berthLink) {
        throw new Error('선석 배정현황 링크를 찾을 수 없습니다.');
      }

      // Click the link and wait for navigation
      console.log('Clicking berth status link...');
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }),
        mainFrame.evaluate((link: Element) => link.click(), berthLink)
      ]);

      // Wait for the vessel name element
      console.log('Waiting for vessel name element...');
      const vesselNameSelector = '#mainframe_vframeset_hframeset_bodyframe_workframe_IST010_form_div_work_div_background_Grid00_body_gridrow_0_cell_0_12GridCellTextContainerElement > div';
      await page.waitForSelector(vesselNameSelector, { timeout: 30000 });

      // Extract vessel name
      console.log('Extracting vessel name...');
      const vesselName = await page.evaluate((selector: string) => {
        const element = document.querySelector(selector);
        return element?.textContent?.trim() || null;
      }, vesselNameSelector);

      if (!vesselName) {
        throw new Error('선박명을 찾을 수 없습니다.');
      }

      console.log('Vessel name found:', vesselName);
      return NextResponse.json({ vesselName });
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error('Error in BCT scraping:', error);
    return NextResponse.json({ 
      error: '선박명 스크래핑 실패',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 