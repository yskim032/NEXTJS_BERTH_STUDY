'use client';
import { useState, useEffect, useCallback } from 'react';

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
}

export default function BCTClient_study() {
  const [domTree, setDomTree] = useState<DOMNode | null>(null);
  const [allTextContent, setAllTextContent] = useState<TextContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching data from API...');
      const response = await fetch('/api/getDownload_study', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        cache: 'no-store',
        next: { revalidate: 0 }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.details || errorData.error || `HTTP error! status: ${response.status}`;
        console.error('API request failed:', errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Frontend received data:', {
        success: result.success,
        hasDomTree: !!result.data,
        textContentCount: result.allTextContent?.length,
        error: result.error,
        details: result.details,
        status: response.status
      });

      if (!result.success) {
        throw new Error(result.details || result.error || 'Failed to fetch data');
      }

      setDomTree(result.data);
      setAllTextContent(result.allTextContent || []);
    } catch (err) {
      console.error('Frontend error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const renderNode = (node: DOMNode, level: number = 0, path: string = '') => {
    const nodeId = `${path}-${node.tagName || 'text'}`;
    const isExpanded = expandedNodes.has(nodeId);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={nodeId} style={{ marginLeft: `${level * 20}px` }}>
        <div className="flex items-start gap-2 py-1 hover:bg-gray-50">
          {hasChildren && (
            <button
              onClick={() => toggleNode(nodeId)}
              className="w-4 h-4 flex items-center justify-center"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          {!hasChildren && <div className="w-4" />}
          
          <div className="flex-1">
            {node.type === 'element' ? (
              <div className="flex flex-wrap gap-2">
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {node.tagName}
                </span>
                {node.id && (
                  <span className="text-blue-600">#{node.id}</span>
                )}
                {node.className && (
                  <span className="text-green-600">.{node.className}</span>
                )}
                {node.text && (
                  <span className="text-gray-600">"{node.text}"</span>
                )}
              </div>
            ) : (
              <span className="text-gray-600">"{node.text}"</span>
            )}

            {node.attributes && node.attributes.length > 0 && (
              <div className="mt-1 text-xs text-gray-500">
                {node.attributes.map((attr, index) => (
                  <span key={index} className="mr-2">
                    <span className="text-purple-600">{attr.name}</span>
                    <span className="text-gray-400">=</span>
                    <span className="text-orange-600">"{attr.value}"</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="border-l-2 border-gray-200 ml-2">
            {node.children?.map((child, index) => 
              renderNode(child, level + 1, `${nodeId}-${index}`)
            )}
          </div>
        )}
      </div>
    );
  };

  const renderAllTextContent = () => {
    if (!allTextContent || allTextContent.length === 0) {
      return (
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-700">추출된 내용이 없습니다.</p>
        </div>
      );
    }

    return (
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">페이지의 모든 텍스트 내용</h3>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    요소
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    클래스
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    텍스트
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allTextContent.map((content, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {content.element}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                      {content.id || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      {content.className || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {content.text}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      {loading && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-blue-700">데이터를 불러오는 중입니다...</p>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
          <h3 className="text-red-700 font-bold mb-2">오류가 발생했습니다</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => fetchData()}
            className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            다시 시도
          </button>
        </div>
      )}

      {!loading && !error && domTree && (
        <div>
          <h2 className="text-2xl font-bold mb-4">DOM 트리 구조</h2>
          {renderNode(domTree)}
          {renderAllTextContent()}
        </div>
      )}
    </div>
  );
} 