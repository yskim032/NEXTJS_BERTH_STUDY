import { Metadata } from 'next';
import BCTClient from './BCTClient';

export const metadata: Metadata = {
  title: 'Web Scraping',
  description: 'Dynamic Web Scraping test',
};

export default function BCTPage() {
  return <BCTClient />;
}

