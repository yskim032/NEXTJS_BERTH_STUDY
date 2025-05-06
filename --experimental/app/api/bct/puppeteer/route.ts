import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function GET() {
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.goto('https://info.bct2-4.com/infoservice/index.html');
    
    // Nexacro 프레임워크가 초기화될 때까지 대기
    await page.waitForFunction(() => {
      // @ts-ignore - nexacro는 BCT 사이트의 글로벌 객체이므로 window 타입에 없음
      return typeof window.nexacro !== 'undefined';
    });

    // 동적으로 로드된 요소들을 추출
    const elements = await page.evaluate(() => {
      const result: any = {};

      // 모든 div 요소 추출
      const allDivs = Array.from(document.querySelectorAll('div'));
      result.allDivs = allDivs.map(div => ({
        id: div.id,
        className: div.className,
        style: div.getAttribute('style'),
        textContent: div.textContent?.trim(),
        innerHTML: div.innerHTML,
        outerHTML: div.outerHTML
      }));

      // 모든 스타일 요소 추출
      const allStyles = Array.from(document.querySelectorAll('style'));
      result.styles = allStyles.map(style => ({
        type: style.type,
        media: style.media,
        textContent: style.textContent
      }));

      // 모든 스크립트 요소 추출
      const allScripts = Array.from(document.querySelectorAll('script'));
      result.scripts = allScripts.map(script => ({
        type: script.type,
        src: script.src,
        textContent: script.textContent
      }));

      // 특정 클래스를 가진 요소들 추출
      const specialElements = {
        dialogs: Array.from(document.querySelectorAll('.dialog, .dialogNotice, .dialogGate')),
        tableCells: Array.from(document.querySelectorAll('div[style*="display: table-cell"]')),
        buttons: Array.from(document.querySelectorAll('button, input[type="button"]'))
      };

      result.specialElements = {
        dialogs: specialElements.dialogs.map(el => ({
          className: el.className,
          style: el.getAttribute('style'),
          content: el.innerHTML,
          title: el.querySelector('.dialog__title, .dialogNotice__title, .dialogGate__title')?.textContent,
          closeButton: el.querySelector('.dialog__close, .dialogNotice__close, .dialogGate__close')?.outerHTML
        })),
        tableCells: specialElements.tableCells.map(el => ({
          text: el.textContent?.trim(),
          style: el.getAttribute('style'),
          parent: el.parentElement?.outerHTML
        })),
        buttons: specialElements.buttons.map(el => ({
          type: el.getAttribute('type'),
          value: el.getAttribute('value'),
          text: el.textContent?.trim(),
          style: el.getAttribute('style')
        }))
      };

      // Nexacro 관련 정보
      result.nexacro = {
        // @ts-ignore - nexacro는 BCT 사이트의 글로벌 객체이므로 window 타입에 없음
        initialized: typeof window.nexacro !== 'undefined',
        // @ts-ignore - application은 BCT 사이트의 글로벌 객체이므로 window 타입에 없음
        globalValues: window.application?._globalvalue || [],
        // @ts-ignore - application은 BCT 사이트의 글로벌 객체이므로 window 타입에 없음
        loaded: window.application?.loaded || false
      };

      return result;
    });

    await browser.close();

    return NextResponse.json(elements);
  } catch (error) {
    console.error('Error in Puppeteer scraping:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dynamic elements', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 