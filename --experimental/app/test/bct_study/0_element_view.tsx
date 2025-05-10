'use client';

import React, { useState, useEffect } from 'react';

// Types
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

interface TextContent {
  element: string;
  text: string;
  id?: string;
  className?: string;
  attributes?: Array<{ name: string; value: string }>;
}

interface TableData {
  headers: string[];
  rows: string[][];
}

interface ApiResponse {
  success: boolean;
  data: DOMNode;
  allTextContent: TextContent[];
  menuElements: TextContent[];
}

// Element Type Colors
const elementColors: { [key: string]: string } = {
  // Block Elements
  div: 'bg-blue-50 border-l-4 border-blue-500',
  p: 'bg-yellow-50 border-l-4 border-yellow-500',
  h1: 'bg-cyan-50 border-l-4 border-cyan-500',
  h2: 'bg-cyan-100 border-l-4 border-cyan-600',
  h3: 'bg-cyan-200 border-l-4 border-cyan-700',
  h4: 'bg-cyan-300 border-l-4 border-cyan-800',
  h5: 'bg-cyan-400 border-l-4 border-cyan-900',
  h6: 'bg-cyan-500 border-l-4 border-cyan-950',
  
  // Form Elements
  form: 'bg-pink-50 border-l-4 border-pink-500',
  input: 'bg-orange-50 border-l-4 border-orange-500',
  button: 'bg-red-50 border-l-4 border-red-500',
  select: 'bg-violet-50 border-l-4 border-violet-500',
  option: 'bg-violet-100 border-l-4 border-violet-600',
  textarea: 'bg-fuchsia-50 border-l-4 border-fuchsia-500',
  label: 'bg-rose-50 border-l-4 border-rose-500',
  
  // Table Elements
  table: 'bg-indigo-50 border-l-4 border-indigo-500',
  tr: 'bg-indigo-100 border-l-4 border-indigo-600',
  td: 'bg-indigo-200 border-l-4 border-indigo-700',
  th: 'bg-indigo-300 border-l-4 border-indigo-800',
  
  // List Elements
  ul: 'bg-teal-50 border-l-4 border-teal-500',
  li: 'bg-teal-100 border-l-4 border-teal-600',
  
  // Inline Elements
  span: 'bg-green-50 border-l-4 border-green-500',
  a: 'bg-purple-50 border-l-4 border-purple-500',
  img: 'bg-emerald-50 border-l-4 border-emerald-500',
  
  // Default
  default: 'bg-gray-50 border-l-4 border-gray-500'
};

function renderTableData(tableData: TableData) {
  if (!tableData || !tableData.headers || !tableData.rows) return null;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            {tableData.headers.map((header, index) => (
              <th key={index} className="px-4 py-2 border-b text-left font-semibold text-gray-700">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-2 border-b text-gray-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ElementView() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedElementType, setSelectedElementType] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/getDownload_study');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const getElementColor = (tagName: string) => {
    return elementColors[tagName.toLowerCase()] || elementColors.default;
  };

  const renderNode = (node: DOMNode, level: number = 0, path: string = '') => {
    const nodeId = `${path}-${node.tagName || 'text'}`;
    const isExpanded = expandedNodes.has(nodeId);
    const hasChildren = node.children && node.children.length > 0;
    const indent = level * 2;

    if (node.type === 'text' && node.text) {
      return (
        <div key={nodeId} className="flex items-start">
          <div className="w-8 flex-shrink-0"></div>
          <div className="ml-4 text-gray-600 bg-gray-50 p-2 rounded">
            {node.text}
          </div>
        </div>
      );
    }

    if (node.type === 'element') {
      const elementColor = getElementColor(node.tagName || '');
      return (
        <div key={nodeId} className="flex flex-col">
          <div className="flex items-start">
            <div className="w-8 flex-shrink-0"></div>
            <div className={`${elementColor} rounded-r-lg p-2 my-1 flex-grow`}>
              <div className="flex items-center">
                {hasChildren && (
                  <button
                    onClick={() => toggleNode(nodeId)}
                    className="mr-2 text-gray-500 hover:text-gray-700"
                  >
                    {isExpanded ? '▼' : '▶'}
                  </button>
                )}
                <span className="font-mono">
                  &lt;{node.tagName}
                  {node.id && ` id="${node.id}"`}
                  {node.className && ` class="${node.className}"`}
                  {node.attributes?.map(attr => ` ${attr.name}="${attr.value}"`).join('')}
                  {!hasChildren ? ' /&gt;' : '&gt;'}
                </span>
              </div>
            </div>
          </div>
          {isExpanded && hasChildren && (
            <div className="ml-8">
              {node.children?.map((child, index) => 
                renderNode(child, level + 1, `${nodeId}-${index}`)
              )}
            </div>
          )}
          {isExpanded && hasChildren && (
            <div className="flex items-start">
              <div className="w-8 flex-shrink-0"></div>
              <div className={`${elementColor} rounded-r-lg p-2 my-1`}>
                <span className="font-mono">
                  &lt;/{node.tagName}&gt;
                </span>
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  const renderElementFilter = () => {
    if (!data?.allTextContent) return null;

    const elementTypes = Array.from(new Set(data.allTextContent.map(content => content.element)));
    
    return (
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Filter by Element Type</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedElementType(null)}
            className={`px-3 py-1 rounded ${
              selectedElementType === null 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          {elementTypes.map(type => (
            <button
              key={type}
              onClick={() => setSelectedElementType(type)}
              className={`px-3 py-1 rounded ${
                selectedElementType === type 
                  ? getElementColor(type) 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderAllTextContent = () => {
    if (!data?.allTextContent) return null;

    const filteredContent = selectedElementType
      ? data.allTextContent.filter(content => content.element === selectedElementType)
      : data.allTextContent;

    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Element Analysis</h2>
        {renderElementFilter()}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border">Element</th>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Class</th>
                <th className="px-4 py-2 border">Text</th>
                <th className="px-4 py-2 border">Attributes</th>
              </tr>
            </thead>
            <tbody>
              {filteredContent.map((content, index) => (
                <tr key={index} className={`${getElementColor(content.element)} hover:bg-opacity-75`}>
                  <td className="px-4 py-2 border font-mono">{content.element}</td>
                  <td className="px-4 py-2 border">{content.id || '-'}</td>
                  <td className="px-4 py-2 border">{content.className || '-'}</td>
                  <td className="px-4 py-2 border">{content.text}</td>
                  <td className="px-4 py-2 border">
                    {content.attributes?.map((attr, i) => (
                      <div key={i} className="text-sm">
                        {attr.name}: {attr.value}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderTableData = () => {
    if (!data?.tableData) return null;

    const { headers, rows } = data.tableData;

    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">선석 배정현황 (목록)</h2>
        {renderTableData(data.tableData)}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">웹사이트 구조 분석</h1>
      
      {loading && <div className="text-center py-4">데이터를 불러오는 중...</div>}
      {error && <div className="text-red-500 py-4">{error}</div>}
      
      {data && (
        <div className="space-y-8">
          {/* 메뉴 구조 분석 */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">메뉴 구조 분석</h2>
            <div className="space-y-2">
              {data.menuElements.map((element, index) => (
                <div
                  key={index}
                  className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <div className="font-semibold text-blue-800">{element.element}</div>
                  <div className="text-blue-600">{element.text}</div>
                  {element.id && (
                    <div className="text-sm text-blue-500">ID: {element.id}</div>
                  )}
                  {element.className && (
                    <div className="text-sm text-blue-500">Class: {element.className}</div>
                  )}
                  {element.attributes && element.attributes.length > 0 && (
                    <div className="mt-2">
                      <div className="text-sm font-semibold text-blue-700">Attributes:</div>
                      {element.attributes.map((attr, attrIndex) => (
                        <div key={attrIndex} className="text-sm text-blue-600">
                          {attr.name}: {attr.value}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* DOM 구조 분석 */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">DOM 구조 분석</h2>
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedElementType(null)}
                className={`px-3 py-1 rounded ${
                  selectedElementType === null
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                전체
              </button>
              {Object.keys(elementColors).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedElementType(type)}
                  className={`px-3 py-1 rounded ${
                    selectedElementType === type
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="font-mono text-sm">
              {renderNode(data.data)}
            </div>
          </div>

          {/* 모든 텍스트 콘텐츠 */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">모든 텍스트 콘텐츠</h2>
            <div className="space-y-2">
              {data.allTextContent
                .filter(content => !selectedElementType || content.element === selectedElementType)
                .map((content, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded ${
                      elementColors[content.element] || 'bg-gray-100'
                    }`}
                  >
                    <div className="font-semibold">{content.element}</div>
                    <div className="text-gray-700">{content.text}</div>
                    {content.id && <div className="text-sm text-gray-500">ID: {content.id}</div>}
                    {content.className && <div className="text-sm text-gray-500">Class: {content.className}</div>}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 