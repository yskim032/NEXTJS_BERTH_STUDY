"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

function MyPage() {
  const [data, setData] = useState<{
    main?: string;
    analysis?: {
      hasFrames: boolean;
      frameCount: number;
      frameTags: string[];
    };
    frames?: Record<string, string>;
    dynamicElements?: Record<string, string>;
    berthButton?: Array<{
      tagName: string;
      id: string;
      className: string;
      text: string;
      html: string;
      style: string;
      parentHTML: string;
      attributes: Array<{ name: string; value: string }>;
    }>;
    dynamicContent?: {
      divs: Array<{
        id: string;
        className: string;
        text: string;
        style: string;
        html: string;
      }>;
      tables: Array<{
        id: string;
        className: string;
        rows: Array<{
          cells: Array<{
            text: string;
            html: string;
          }>;
        }>;
      }>;
      specificElements: Record<string, string>;
      inputs: Array<{
        type: string;
        id: string;
        name: string;
        value: string;
        html: string;
      }>;
      selects: Array<{
        id: string;
        name: string;
        options: Array<{
          value: string;
          text: string;
          selected: boolean;
        }>;
      }>;
    };
    clickSuccess?: boolean;
    clickError?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [status, setStatus] = useState<string>('대기 중');

  const copyDebugInfo = () => {
    if (debugInfo) {
      navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2))
        .then(() => alert('디버그 정보가 클립보드에 복사되었습니다.'))
        .catch(err => console.error('복사 실패:', err));
    }
  };

  const fetchContent = async () => {
    console.log('Fetching website content...');
    setStatus('로딩 중');
    setIsLoading(true);
    setError('');
    setDebugInfo(null);
    
    try {
      console.log('Making API request...');
      const response = await fetch('/api/fetch-bct-content', {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        cache: 'no-store'
      });
      
      console.log('API response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error response:', errorData);
        throw new Error(errorData.details || errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Content received:', {
        mainContentLength: data.main?.length,
        frameCount: Object.keys(data.frames || {}).length,
        hasAnalysis: !!data.analysis,
        hasDynamicElements: !!data.dynamicElements,
        berthButtonCount: data.berthButton?.length
      });
      
      setData(data);
      setDebugInfo({
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        mainContentLength: data.main?.length,
        frameCount: Object.keys(data.frames || {}).length,
        frameUrls: Object.keys(data.frames || {}),
        analysis: data.analysis,
        dynamicElements: data.dynamicElements,
        berthButton: data.berthButton
      });
      setStatus('완료');
    } catch (err: any) {
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      setError(err?.message || '데이터를 가져오는데 실패했습니다.');
      setStatus('에러 발생');
      setDebugInfo({
        error: {
          message: err?.message,
          stack: err?.stack,
          name: err?.name
        },
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderBerthButton = () => {
    if (!data?.berthButton || data.berthButton.length === 0) {
      return (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-700">선석 배정현황(목록) 버튼을 찾을 수 없습니다.</p>
        </div>
      );
    }

    return (
      <div className="mt-4 space-y-4">
        <h2 className="text-xl font-bold mb-2">선석 배정현황(목록) 버튼 정보:</h2>
        {data.berthButton.map((button, index) => (
          <div key={index} className="border rounded p-4 bg-white">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold mb-2">기본 정보:</h3>
                <p><span className="font-semibold">태그:</span> {button.tagName}</p>
                <p><span className="font-semibold">ID:</span> {button.id || '-'}</p>
                <p><span className="font-semibold">클래스:</span> {button.className || '-'}</p>
                <p><span className="font-semibold">텍스트:</span> {button.text}</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">속성:</h3>
                {button.attributes.map((attr: any, attrIndex: number) => (
                  <p key={attrIndex}>
                    <span className="font-semibold">{attr.name}:</span> {attr.value}
                  </p>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-bold mb-2">HTML:</h3>
              <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-2 rounded">
                {button.html}
              </pre>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDynamicContent = () => {
    if (!data?.dynamicContent) return null;

    return (
      <div className="mt-8 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">동적 콘텐츠</h2>
        
        {/* 테이블 데이터 */}
        {data.dynamicContent.tables.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">테이블 데이터</h3>
            {data.dynamicContent.tables.map((table, tableIndex) => (
              <div key={tableIndex} className="mb-4">
                <div className="text-sm text-gray-600 mb-1">
                  Table ID: {table.id || 'N/A'} | Class: {table.className || 'N/A'}
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full border">
                    <tbody>
                      {table.rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.cells.map((cell, cellIndex) => (
                            <td key={cellIndex} className="border p-2">
                              {cell.text}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 입력 필드 */}
        {data.dynamicContent.inputs.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">입력 필드</h3>
            <div className="grid grid-cols-2 gap-4">
              {data.dynamicContent.inputs.map((input, index) => (
                <div key={index} className="p-2 border rounded">
                  <div className="text-sm text-gray-600">Type: {input.type}</div>
                  <div>ID: {input.id || 'N/A'}</div>
                  <div>Name: {input.name || 'N/A'}</div>
                  <div>Value: {input.value || 'N/A'}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 선택 필드 */}
        {data.dynamicContent.selects.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">선택 필드</h3>
            <div className="grid grid-cols-2 gap-4">
              {data.dynamicContent.selects.map((select, index) => (
                <div key={index} className="p-2 border rounded">
                  <div className="text-sm text-gray-600">ID: {select.id || 'N/A'}</div>
                  <div>Name: {select.name || 'N/A'}</div>
                  <div className="mt-1">
                    <div className="font-medium">Options:</div>
                    {select.options.map((option, optIndex) => (
                      <div key={optIndex} className="text-sm">
                        {option.text} {option.selected && '(선택됨)'}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 특정 요소들 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">특정 요소</h3>
          {Object.entries(data.dynamicContent.specificElements).map(([key, value]) => (
            value && (
              <div key={key} className="mb-2">
                <div className="text-sm font-medium">{key}:</div>
                <div className="text-sm bg-gray-50 p-2 rounded">{value}</div>
              </div>
            )
          ))}
        </div>
      </div>
    );
  };

  const renderFrames = () => {
    if (!data?.frames || Object.keys(data.frames).length === 0) {
      return (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-700">프레임을 찾을 수 없습니다.</p>
        </div>
      );
    }

    return (
      <div className="mt-4 space-y-4">
        <h2 className="text-xl font-bold mb-2">프레임 정보:</h2>
        {Object.entries(data.frames).map(([url, html]) => (
          <div key={url} className="border rounded p-4 bg-white">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold mb-2">URL:</h3>
                <p>{url}</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">HTML:</h3>
                <pre className="whitespace-pre-wrap text-sm overflow-auto" style={{ maxHeight: '400px' }}>
                  {html}
                </pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">BCT 웹사이트 내용</h1>
      
      <button
        onClick={fetchContent}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
      >
        웹사이트 내용 가져오기
      </button>

      <div className="mt-4 p-4 bg-gray-100 border border-gray-400 rounded">
        <p className="font-bold">현재 상태: {status}</p>
        {isLoading && <p className="text-blue-600">데이터를 가져오는 중입니다...</p>}
        {error && <p className="text-red-600">에러: {error}</p>}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-bold">에러 발생:</p>
          <p>{error}</p>
        </div>
      )}

      {debugInfo && (
        <div className="mt-4 p-4 bg-gray-100 border border-gray-400 rounded">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">디버그 정보:</h3>
            <button
              onClick={copyDebugInfo}
              className="bg-gray-500 hover:bg-gray-700 text-white text-sm py-1 px-2 rounded"
            >
              복사
            </button>
          </div>
          <pre className="whitespace-pre-wrap text-sm select-text bg-white p-2 rounded border">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}

      {data && (
        <div className="space-y-4">
          {renderBerthButton()}
          {renderDynamicContent()}
          {renderFrames()}
        </div>
      )}
    </div>
  );
}

export default MyPage;
