import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function TestPage() {
  const data = await extractData();
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">스크래핑된 데이터</h1>
      <div className="border p-4 rounded-lg bg-white shadow">
        {/* __html은 React에서 HTML 문자열을 직접 렌더링하기 위한 특별한 prop입니다.
            dangerouslySetInnerHTML와 함께 사용되며 보안상 위험할 수 있어 'dangerous'라는 이름이 붙었습니다. */}
        <div dangerouslySetInnerHTML={{ __html: data }} />
      </div>
    </div>
  );
}

async function extractData() {
  try {
    const response = await axios.get("https://svc.pncport.com/info/CMS/Ship/Info.pnc?mCode=MN014");
    const $ = cheerio.load(response.data);
    const tableData = $('table').html();  // 테이블 데이터만 추출
    const specificElement = $('#specific-id').text();  // 특정 ID를 가진 요소의 텍스트만 추출
    return $.html(); // 전체 HTML을 문자열로 반환
  } catch (error) {
    console.error('데이터 추출 중 오류 발생:', error);
    return '데이터를 가져오는 중 오류가 발생했습니다.';
  }
}

