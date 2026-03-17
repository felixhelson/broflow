'use client';
import React from 'react';
import { Colors } from '../utils/theme';

// ─── Card ─────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, style, className = '', onClick }: CardProps) {
  const base = 'bg-white rounded-xl p-4 border shadow-sm';
  const borderColor = { borderColor: Colors.border };
  if (onClick) {
    return (
      <button
        onClick={onClick}
        style={{ ...borderColor, ...style, textAlign: 'left', width: '100%' }}
        className={`${base} ${className} cursor-pointer hover:opacity-90 active:opacity-80 transition-opacity`}
      >
        {children}
      </button>
    );
  }
  return (
    <div style={{ ...borderColor, ...style }} className={`${base} ${className}`}>
      {children}
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export function Button({
  label, onClick, variant = 'primary', size = 'md',
  loading, disabled, style, className = '',
}: ButtonProps) {
  const variantStyles: Record<string, React.CSSProperties> = {
    primary:   { backgroundColor: Colors.coral, color: Colors.white },
    secondary: { backgroundColor: Colors.coralLight, border: `1.5px solid ${Colors.coralMid}`, color: Colors.coral },
    ghost:     { backgroundColor: 'transparent', border: `1px solid ${Colors.border}`, color: Colors.text },
    danger:    { backgroundColor: '#FEE2E2', color: '#B91C1C' },
  };
  const sizeClass = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  }[size];

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{ ...variantStyles[variant], ...style }}
      className={`${sizeClass} ${className} rounded-xl font-medium flex items-center justify-center gap-1.5 disabled:opacity-55 transition-opacity hover:opacity-90 active:opacity-80`}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : label}
    </button>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ name, color, size = 40 }: { name: string; color: string; size?: number }) {
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div
      style={{ backgroundColor: color, width: size, height: size, borderRadius: size / 2, fontSize: size * 0.35 }}
      className="flex items-center justify-center text-white font-semibold"
    >
      {initials}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({
  label, color = Colors.coral, textColor = Colors.white, style, className = '',
}: { label: string; color?: string; textColor?: string; style?: React.CSSProperties; className?: string }) {
  return (
    <span
      style={{ backgroundColor: color, color: textColor, ...style }}
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}

// ─── PhaseBar ─────────────────────────────────────────────────────────────────
export function PhaseBar({ progress, phase }: { progress: number; phase: string }) {
  const phaseColor = (Colors.phase as Record<string, string>)[phase] ?? Colors.coral;
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: Colors.grayLight }}>
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: phaseColor }}
      />
    </div>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: Colors.textMid }}>
        {title}
      </span>
      {action && (
        <button onClick={onAction} className="text-sm font-medium" style={{ color: Colors.coral }}>
          {action}
        </button>
      )}
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider({ className = '' }: { className?: string }) {
  return <div className={`h-px my-3 ${className}`} style={{ backgroundColor: Colors.border }} />;
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({
  emoji, title, subtitle, action, onAction,
}: { emoji: string; title: string; subtitle?: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex flex-col items-center py-16 px-6 text-center">
      <span className="text-5xl mb-4">{emoji}</span>
      <p className="text-lg font-semibold mb-2" style={{ color: Colors.text }}>{title}</p>
      {subtitle && <p className="text-sm leading-relaxed mb-0" style={{ color: Colors.textMid }}>{subtitle}</p>}
      {action && onAction && (
        <Button label={action} onClick={onAction} className="mt-5" />
      )}
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
export function Toggle({ value, onToggle }: { value: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="relative w-11 h-6 rounded-full transition-colors"
      style={{ backgroundColor: value ? Colors.coral : Colors.grayLight }}
    >
      <span
        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
        style={{ transform: value ? 'translateX(22px)' : 'translateX(2px)' }}
      />
    </button>
  );
}
