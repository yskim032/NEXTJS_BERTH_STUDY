'use client';

import { useEffect, useState } from 'react';

interface MscChinaInfo {
  text: string;
  style: string;
  parent: string;
}

export default function MscChinaInfo() {
  const [mscChinaInfo, setMscChinaInfo] = useState<MscChinaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/bct');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setMscChinaInfo(data.mscChina);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!mscChinaInfo) return <div>No data available</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">MSC CHINA Information</h2>
      <div className="bg-white p-4 rounded shadow">
        <div 
          className="inline-block p-2 border rounded"
          style={{ 
            display: 'table-cell',
            whiteSpace: 'pre-wrap',
            width: '34px',
            height: '34px',
            font: '9pt "Malgun Gothic", Gulim, tahoma',
            color: 'rgb(51, 51, 51)',
            textAlign: 'center',
            verticalAlign: 'middle',
            overflowWrap: 'break-word',
            wordBreak: 'break-all',
            textOverflow: 'ellipsis'
          }}
        >
          {mscChinaInfo.text}
        </div>
      </div>
    </div>
  );
} 