import { Loader2 } from 'lucide-react';

export default function PlayerSkeleton() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-3 text-[#999]">
        <Loader2 size={32} className="animate-spin text-[#E50000]" />
        <span className="text-sm">Загрузка плеера…</span>
      </div>
    </div>
  );
}
