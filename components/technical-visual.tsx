"use client";

import { motion } from "framer-motion";
import { Activity, Cloud, Droplets, Gauge, Zap } from "lucide-react";

const nodes = [
  { label: "PLC Online", value: "99.98%", icon: Activity, className: "left-4 top-8" },
  { label: "Utilities Monitoring", value: "Live", icon: Gauge, className: "right-0 top-24" },
  { label: "Water Treatment", value: "RO · UF · EDI", icon: Droplets, className: "left-0 bottom-28" },
  { label: "Cloud Data", value: "Secure", icon: Cloud, className: "right-8 bottom-12" },
  { label: "Energy Optimization", value: "-18%", icon: Zap, className: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" },
];

export function TechnicalVisual() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[560px] overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-panel backdrop-blur-xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(19,216,255,.22),transparent_34%),linear-gradient(135deg,rgba(255,255,255,.08),transparent)]" />
      <svg className="absolute inset-0 h-full w-full opacity-50" viewBox="0 0 500 500" aria-hidden="true">
        <defs>
          <linearGradient id="line" x1="0" x2="1">
            <stop offset="0" stopColor="#13d8ff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#13d8ff" />
            <stop offset="1" stopColor="#13d8ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M84 96 C180 170 330 112 420 158" stroke="url(#line)" strokeWidth="2" fill="none" />
        <path d="M88 365 C180 270 305 310 417 405" stroke="url(#line)" strokeWidth="2" fill="none" />
        <path d="M250 112 L250 390 M102 250 L398 250" stroke="#13d8ff" strokeOpacity="0.18" strokeWidth="1" />
      </svg>
      <div className="absolute inset-10 rounded-full border border-cyanx/15" />
      <div className="absolute inset-24 rounded-full border border-cyanx/10" />
      <motion.div
        className="absolute left-1/2 top-1/2 grid size-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-cyanx/30 bg-cyanx/10 shadow-glow"
        animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-center text-xs font-black uppercase tracking-[0.22em] text-cyanx">Control Core</span>
      </motion.div>
      {nodes.map((node, index) => {
        const Icon = node.icon;
        return (
          <motion.div
            key={node.label}
            className={`glass-panel absolute w-44 rounded-2xl p-4 ${node.className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: [0, -8, 0] }}
            transition={{ opacity: { delay: index * 0.12 }, y: { duration: 4 + index * 0.35, repeat: Infinity, ease: "easeInOut" } }}
          >
            <div className="mb-3 flex items-center justify-between">
              <Icon className="size-5 text-cyanx" aria-hidden="true" />
              <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,.9)]" />
            </div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{node.label}</p>
            <p className="mt-1 text-sm font-bold text-white">{node.value}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
