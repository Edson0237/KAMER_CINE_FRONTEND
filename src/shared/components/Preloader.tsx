import { Film } from 'lucide-react';

export function Preloader() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-kct-noir">
      <div className="relative flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-kct-gold flex items-center justify-center shadow-2xl animate-pulse">
            <Film className="h-10 w-10 text-white" />
          </div>
          <div className="absolute -inset-4 rounded-3xl border-2 border-kct-gold/30 animate-ping" />
        </div>
        <div className="text-center">
          <h1 className="text-white font-bold text-xl tracking-wide">KAMER CINÉ TALENTS</h1>
          <p className="text-kct-gold text-sm font-medium mt-1">Manager Web</p>
        </div>
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-kct-gold animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-kct-gold animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-kct-gold animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
