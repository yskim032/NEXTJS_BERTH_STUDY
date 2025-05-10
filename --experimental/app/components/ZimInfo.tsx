'use client';

import { useState, useEffect } from 'react';

export default function ZimInfo() {
  const [elementText, setElementText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchElementText = async () => {
      try {
        const response = await fetch('/api/getDownload_study', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (data.success) {
          setElementText(data.data);
        } else {
          setError(data.error || 'Failed to fetch element information');
        }
      } catch (err) {
        setError('Error fetching element information');
      } finally {
        setLoading(false);
      }
    };

    fetchElementText();
  }, []);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Element Information</h2>
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="mb-2">
          <span className="font-semibold">Element ID:</span>
          <code className="ml-2 bg-gray-100 px-2 py-1 rounded">
            mainframe_vframeset_hframeset_bodyframe_workframe_IST010_form_div_work_div_background_Grid00_body_gridrow_0_cell_0_12
          </code>
        </div>
        <div className="mt-4">
          <span className="font-semibold">Text Content:</span>
          <p className="mt-2 text-gray-800">{elementText}</p>
        </div>
      </div>
    </div>
  );
} 