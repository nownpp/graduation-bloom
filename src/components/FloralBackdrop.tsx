import type { ReactNode } from "react";

export function FloralBackdrop({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-hero">
      {/* floral decorations */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 -right-10 text-[180px] opacity-20 animate-float">🌹</div>
        <div className="absolute top-1/3 -left-12 text-[160px] opacity-15 animate-float" style={{ animationDelay: "1s" }}>🌸</div>
        <div className="absolute bottom-10 right-1/4 text-[140px] opacity-15 animate-float" style={{ animationDelay: "2s" }}>🌷</div>
        <div className="absolute top-20 left-1/3 text-[100px] opacity-10 animate-float" style={{ animationDelay: "3s" }}>🌺</div>
        <div className="absolute bottom-1/4 -right-8 text-[150px] opacity-15 animate-float" style={{ animationDelay: "1.5s" }}>💐</div>
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function GradHeader({ subtitle }: { subtitle?: string }) {
  return (
    <header className="text-center pt-12 pb-8 px-4">
      <div className="text-5xl mb-3">🎓 🌹 ✨</div>
      <h1 className="text-5xl md:text-7xl font-black tracking-tight text-gradient-rose">
        تجمع التخرج 2026
      </h1>
      <div className="mt-3 flex items-center justify-center gap-3 text-gold-deep">
        <span className="h-px w-16 bg-gradient-to-l from-transparent to-current" />
        <span className="text-xl">🌷</span>
        <span className="h-px w-16 bg-gradient-to-r from-transparent to-current" />
      </div>
      {subtitle && (
        <p className="mt-4 text-base md:text-lg text-muted-foreground font-medium">{subtitle}</p>
      )}
    </header>
  );
}
