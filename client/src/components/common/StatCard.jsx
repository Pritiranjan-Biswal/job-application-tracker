import React from 'react';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  trendType = 'positive',
  color = 'indigo',
}) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
      glow: 'group-hover:border-indigo-500/40 group-hover:shadow-[0_0_25px_rgba(99,102,241,0.15)]',
      iconBox: 'bg-gradient-to-br from-indigo-500/20 to-indigo-600/30 text-indigo-300 border-indigo-500/30',
    },
    emerald: {
      bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      glow: 'group-hover:border-emerald-500/40 group-hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]',
      iconBox: 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 text-emerald-300 border-emerald-500/30',
    },
    amber: {
      bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      glow: 'group-hover:border-amber-500/40 group-hover:shadow-[0_0_25px_rgba(245,158,11,0.15)]',
      iconBox: 'bg-gradient-to-br from-amber-500/20 to-amber-600/30 text-amber-300 border-amber-500/30',
    },
    purple: {
      bg: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
      glow: 'group-hover:border-purple-500/40 group-hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]',
      iconBox: 'bg-gradient-to-br from-purple-500/20 to-purple-600/30 text-purple-300 border-purple-500/30',
    },
    cyan: {
      bg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
      glow: 'group-hover:border-cyan-500/40 group-hover:shadow-[0_0_25px_rgba(6,182,212,0.15)]',
      iconBox: 'bg-gradient-to-br from-cyan-500/20 to-cyan-600/30 text-cyan-300 border-cyan-500/30',
    },
    rose: {
      bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
      glow: 'group-hover:border-rose-500/40 group-hover:shadow-[0_0_25px_rgba(244,63,94,0.15)]',
      iconBox: 'bg-gradient-to-br from-rose-500/20 to-rose-600/30 text-rose-300 border-rose-500/30',
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-6 glass-card glass-card-hover group transition-all duration-300 ${scheme.glow}`}
    >
      {/* Decorative gradient corner light */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-all" />

      <div className="flex items-center justify-between relative z-10">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-xs transition-transform duration-300 group-hover:scale-110 ${scheme.iconBox}`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-3 relative z-10">
        <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
              trendType === 'positive'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : trendType === 'negative'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : 'bg-slate-500/10 text-slate-300 border-slate-500/30'
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-slate-400 leading-relaxed relative z-10">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default StatCard;
