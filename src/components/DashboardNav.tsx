"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useVoice } from "./voice/VoiceProvider";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Nyumbani", icon: "M3 11l9-8 9 8M5 10v10h14V10" },
  { href: "/dashboard/records", label: "Rekodi", icon: "M4 6h16M4 12h16M4 18h10" },
  { href: "/dashboard/ai", label: "Uliza AI", icon: "M21 11.5a8.4 8.4 0 01-8.9 8.4 9 9 0 01-3.6-.8L3 20l1-4.5A8.4 8.4 0 0112.5 3a8.4 8.4 0 018.5 8.5z" },
  { href: "/dashboard/farm", label: "Shamba", icon: "M12 3c-3 3-5 6-5 9a5 5 0 0010 0c0-3-2-6-5-9z" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { openRecorder } = useVoice();

  return (
    <nav className="fixed left-0 right-0 bottom-0 z-50 bg-[color:var(--paper)] border-t border-[color:var(--line)] flex justify-around px-1.5 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] max-w-[480px] mx-auto md:hidden">
      {NAV_ITEMS.slice(0, 2).map((item) => (
        <NavButton key={item.href} item={item} active={pathname === item.href} />
      ))}
      <button onClick={openRecorder} className="flex flex-col items-center gap-0.5 text-[10.5px] font-medium text-[color:var(--forest)] px-2.5">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 15a3 3 0 003-3V6a3 3 0 00-6 0v6a3 3 0 003 3z" />
          <path d="M19 11a7 7 0 01-14 0M12 18v3" />
        </svg>
        Ongea
      </button>
      {NAV_ITEMS.slice(2).map((item) => (
        <NavButton key={item.href} item={item} active={pathname === item.href} />
      ))}
    </nav>
  );
}

function NavButton({ item, active }: { item: (typeof NAV_ITEMS)[number]; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={`flex flex-col items-center gap-0.5 text-[10.5px] font-medium px-2.5 ${active ? "text-[color:var(--forest)]" : "text-[color:var(--ink-faint)]"}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d={item.icon} />
      </svg>
      {item.label}
    </Link>
  );
}

export function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav className="hidden md:flex items-center gap-7">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`text-[14.5px] font-medium ${pathname === item.href ? "text-[color:var(--forest)]" : "text-[color:var(--ink-soft)]"} hover:text-[color:var(--forest)]`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
