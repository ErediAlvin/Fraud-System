import { Header } from '../components/Header';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header breadcrumbs={[title]} />

      <main className="flex-1 overflow-y-auto bg-[#F4F6F9] p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#2471A3] text-white mb-4">
            <Construction className="w-8 h-8" />
          </div>
          <h2 className="font-bold text-2xl mb-2">{title}</h2>
          <p className="text-[#6B7280]">{description}</p>
        </div>
      </main>
    </div>
  );
}
