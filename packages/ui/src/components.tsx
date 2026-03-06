"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "./utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variantStyles = {
  primary: "bg-emerald-500 hover:bg-emerald-400 text-black font-bold border-2 border-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.3)]",
  secondary: "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-600",
  ghost: "bg-transparent hover:bg-zinc-800 text-zinc-300 border border-transparent",
  danger: "bg-red-600 hover:bg-red-500 text-white border border-red-400",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-8 py-3.5 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={cn(
        "rounded-lg font-mono uppercase tracking-wider transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || loading}
      {...(props as any)}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          />
          Loading...
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export function Badge({ children, color, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider",
        className
      )}
      style={color ? { backgroundColor: `${color}22`, color, borderColor: `${color}44`, borderWidth: 1 } : undefined}
    >
      {children}
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative w-8 h-8">
        <motion.div
          className="absolute inset-0 rounded-full bg-emerald-500"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-1 rounded-full bg-emerald-400"
          animate={{ scale: [1, 0.8, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
        />
      </div>
      <span className="font-mono font-bold text-xl tracking-tight text-zinc-100">
        CHAIN<span className="text-emerald-400">RX</span>
      </span>
    </div>
  );
}
