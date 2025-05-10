import Link from "next/link";
import MscChinaInfo from './components/MscChinaInfo';
import ZimInfo from './components/ZimInfo';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-8">BCT Terminal Information</h1>
      <MscChinaInfo />
      <ZimInfo />
    </main>
  );
}
