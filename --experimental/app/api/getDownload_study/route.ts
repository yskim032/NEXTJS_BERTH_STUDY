import { NextRequest, NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';

interface DOMNode {
  type: string;
  tagName?: string;
  id?: string;
  className?: string;
  text?: string;
  style?: string;
  attributes?: Array<{ name: string; value: string }>;
  children?: DOMNode[];
}

interface TableData {
  headers: string[];
  rows: string[][];
}

function parseNode(node: Node): DOMNode {
  const result: DOMNode = {
    type: node.nodeType === 1 ? 'element' : 'text'
  };

  if (node.nodeType === 1) {
    const element = node as Element;
    result.tagName = element.tagName.toLowerCase();
    result.id = element.id || undefined;
    result.className = element.className || undefined;
    result.style = element.getAttribute('style') || undefined;
    result.attributes = Array.from(element.attributes).map(attr => ({
      name: attr.name,
      value: attr.value
    }));

    const children = Array.from(node.childNodes)
      .filter(child => {
        if (child.nodeType === 1) return true;
        if (child.nodeType === 3) {
          const text = child.textContent?.trim();
          return text && text.length > 0;
        }
        return false;
      })
      .map(child => parseNode(child));
    
    if (children.length > 0) {
      result.children = children;
    }
  } else if (node.nodeType === 3) {
    const text = node.textContent?.trim();
    if (text) {
      result.text = text;
    }
  }

  return result;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    console.log('Starting fetch request to BCT website...');
    
    // 선석 배정현황(목록) 페이지 URL
    const response = await fetch("https://info.bct2-4.com/infoservice/IST010.html", {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1'
      },
      credentials: 'include',
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      console.error('Failed to fetch page:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to fetch BCT website',
          details: `HTTP error! status: ${response.status}, statusText: ${response.statusText}`,
          timestamp: new Date().toISOString()
        },
        { status: response.status }
      );
    }

    console.log('Successfully fetched the page, parsing HTML...');
    const html = await response.text();
    
    if (!html) {
      throw new Error('Received empty response from the server');
    }

    console.log('Creating JSDOM instance...');
    const dom = new JSDOM(html, {
      url: "https://info.bct2-4.com/infoservice/IST010.html",
      referrer: "https://info.bct2-4.com/infoservice/index.html",
      contentType: "text/html",
      includeNodeLocations: true,
      runScripts: "dangerously"
    });

    const document = dom.window.document;

    // 테이블 데이터 추출
    const tableData: TableData = {
      headers: [
        'No',
        '선석',
        '선사',
        '모선/항차',
        '입항',
        '출항',
        'CCT',
        '접안예정시간(ETB)',
        '출항예정시간(ETD)',
        '양하'
      ],
      rows: []
    };

    // 테이블 데이터 추출
    const rows = Array.from(document.querySelectorAll('#mainframe_vframeset_hframeset_bodyframe_workframe_IST010_form_div_work_div_background_Grid00_gridrow_*'))
      .map(row => {
        const cells = Array.from(row.querySelectorAll('[id^="mainframe_vframeset_hframeset_bodyframe_workframe_IST010_form_div_work_div_background_Grid00_gridrow_"]'))
          .map(cell => cell.textContent?.trim() || '')
          .filter(text => text !== '');
        return cells;
      })
      .filter(row => row.length > 0);

    tableData.rows = rows;

    // 전체 DOM 트리 파싱
    const domTree = parseNode(document.documentElement);
    
    // 모든 텍스트 콘텐츠 추출
    const allTextContent = Array.from(document.querySelectorAll('*'))
      .map(node => node as Element)
      .filter(element => element.nodeType === 1)
      .filter(element => {
        const tagName = element.tagName.toLowerCase();
        if (tagName === 'script' || tagName === 'style') {
          return false;
        }
        return element.textContent?.trim();
      })
      .map(element => {
        const attributes = [];
        for (let i = 0; i < element.attributes.length; i++) {
          const attr = element.attributes[i];
          attributes.push({
            name: attr.name,
            value: attr.value
          });
        }
        return {
          element: element.tagName.toLowerCase(),
          text: element.textContent?.trim(),
          id: element.id || undefined,
          className: element.className || undefined,
          attributes
        };
      })
      .filter(content => content.text && content.text.length > 0);

    return NextResponse.json({
      success: true,
      data: domTree,
      allTextContent: allTextContent,
      tableData: tableData
    });

  } catch (error) {
    console.error('Detailed error information:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch website data',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}