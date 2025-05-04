'use client';

import axios from 'axios';
import * as cheerio from 'cheerio';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface VesselData {
  terminal: string;
  vesselName: string;
  routeCode: string;
  carrier: string;
  portInfo: string;
  arrivalTime: string;
  departureTime: string;
}

export default function TestPage() {
  const [vessels, setVessels] = useState<VesselData[]>([]);
  const [startDate, setStartDate] = useState('20250504');
  const [endDate, setEndDate] = useState('20250511');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (start = startDate, end = endDate) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('STARTDATE', start);
      formData.append('ENDDATE', end);

      const response = await axios.post('/api/pnc', formData);
      const $ = cheerio.load(response.data);
      const newVessels: VesselData[] = [];

      $('tbody tr').each((index, element) => {
        const $row = $(element);
        const vessel: VesselData = {
          terminal: 'PNC',
          vesselName: $row.find('td').eq(1).text().trim(),
          routeCode: $row.find('td').eq(3).text().trim(),
          carrier: $row.find('td').eq(4).text().trim(),
          portInfo: $row.find('td').eq(5).find('a').text().trim(),
          arrivalTime: $row.find('td').eq(7).text().trim(),
          departureTime: $row.find('td').eq(8).text().trim()
        };
        newVessels.push(vessel);
      });

      setVessels(newVessels);
    } catch (error) {
      console.error('데이터 추출 중 오류 발생:', error);
      setError('데이터를 가져오는 데 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchData(startDate, endDate);
  };

  return (
    <div className="container mx-auto p-4">
      <Link href="/" className="text-blue-500 hover:underline">Home</Link>
      <h1 className="text-2xl font-bold mb-4">PNC 터미널 선박 입출항 정보</h1>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex items-center gap-4">
          <div>
            <input
              type="text"
              id="STARTDATE"
              name="STARTDATE"
              className="text cal w120 border rounded px-2 py-1"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="YYYYMMDD"
              pattern="[0-9]{8}"
              title="YYYYMMDD 형식으로 입력하세요 (예: 20250504)"
            />
          </div>
          <span>~</span>
          <div>
            <input
              type="text"
              id="ENDDATE"
              name="ENDDATE"
              className="text cal w120 border rounded px-2 py-1"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="YYYYMMDD"
              pattern="[0-9]{8}"
              title="YYYYMMDD 형식으로 입력하세요 (예: 20250511)"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? '로딩중...' : '검색'}
          </button>
        </div>
      </form>

      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}

      {isLoading ? (
        <div className="text-center py-4">데이터를 불러오는 중...</div>
      ) : vessels.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border">터미널</th>
                <th className="px-4 py-2 border">선박명</th>
                <th className="px-4 py-2 border">항로코드</th>
                <th className="px-4 py-2 border">선사명</th>
                <th className="px-4 py-2 border">항구정보</th>
                <th className="px-4 py-2 border">도착시간</th>
                <th className="px-4 py-2 border">출발시간</th>
              </tr>
            </thead>
            <tbody>
              {vessels.map((vessel, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-4 py-2 border">{vessel.terminal}</td>
                  <td className="px-4 py-2 border">{vessel.vesselName}</td>
                  <td className="px-4 py-2 border">{vessel.routeCode}</td>
                  <td className="px-4 py-2 border">{vessel.carrier}</td>
                  <td className="px-4 py-2 border">{vessel.portInfo}</td>
                  <td className="px-4 py-2 border">{vessel.arrivalTime}</td>
                  <td className="px-4 py-2 border">{vessel.departureTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-4">데이터가 없습니다.</div>
      )}
    </div>
  );
}

