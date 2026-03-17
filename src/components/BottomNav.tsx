'use client';
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Colors } from '../utils/theme';

const TABS = [
  { label: 'Home',     icon: '🏠', path: '/home' },
  { label: 'Gifts',    icon: '🎁', path: '/gifts' },
  { label: 'Calendar', icon: '📅', path: '/calendar' },
  { label: 'Profile',  icon: '👤', path: '/profile' },
];

export function BottomNav() {
  const router   = useRouter();
  const pathname = usePathname();

  return (
    <div
      className="fixed bottom-0 left-0 right-0 border-t z-50"
      style={{ backgroundColor: Colors.white, borderColor: Colors.border }}
    >
      <div className="flex max-w-lg mx-auto">
        {TABS.map(tab => {
          const active = pathname.startsWith(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => router.push(tab.path)}
              className="flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-opacity active:opacity-60"
            >
              <span className="text-xl leading-none">{tab.icon}</span>
              <span
                className="text-xs font-medium"
                style={{ color: active ? Colors.coral : Colors.textMid }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
