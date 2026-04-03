import { useMemo, useState } from 'react';
import { useTheme } from '../../theme/ThemeProvider';

interface AnalyticsHeatmapCell {
  xLabel: string;
  yLabel: string;
  value: number;
}

interface AnalyticsHeatmapProps {
  xLabels: string[];
  yLabels: string[];
  rows: Array<{ label: string; values: number[] }>;
  tooltipFormatter?: (cell: AnalyticsHeatmapCell) => { title: string; description: string };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function truncateLabel(label: string, max = 12) {
  return label.length > max ? `${label.slice(0, max - 1)}...` : label;
}

export function AnalyticsHeatmap({
  xLabels,
  yLabels,
  rows,
  tooltipFormatter,
}: AnalyticsHeatmapProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [hoveredCell, setHoveredCell] = useState<{
    cell: AnalyticsHeatmapCell;
    x: number;
    y: number;
  } | null>(null);

  const maxValue = useMemo(
    () => Math.max(0, ...rows.flatMap((row) => row.values)),
    [rows],
  );

  function getCellStyle(_rowLabel: string, value: number) {
    const normalized = maxValue <= 0 ? 0 : clamp(value / maxValue, 0, 1);
    const opacity = value <= 0 ? (isDark ? 0.09 : 0.28) : 0.18 + normalized * 0.74;

    return {
      backgroundColor: isDark ? `rgba(249, 115, 22, ${opacity})` : `rgba(251, 146, 60, ${opacity})`,
      borderColor: isDark ? 'rgba(251, 146, 60, 0.18)' : 'rgba(249, 115, 22, 0.16)',
    };
  }

  const tooltipContent = hoveredCell
    ? tooltipFormatter?.(hoveredCell.cell) ?? {
        title: `${hoveredCell.cell.yLabel} - ${hoveredCell.cell.xLabel}`,
        description: `${hoveredCell.cell.value} students are at ${hoveredCell.cell.yLabel} level in ${hoveredCell.cell.xLabel}.`,
      }
    : null;

  return (
    <div className="space-y-4">
      <div className={`rounded-[28px] border p-4 shadow-sm ${isDark ? 'border-slate-700 bg-slate-950/70' : 'border-slate-200 bg-white/95'}`}>
        <div className={`mb-4 flex items-center gap-3 rounded-2xl border px-4 py-3 ${isDark ? 'border-slate-700/80 bg-slate-900/70' : 'border-slate-200 bg-slate-50/80'}`}>
          <span className={`shrink-0 text-xs font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
            Low students
          </span>
          <div
            className={`h-3 flex-1 rounded-full border ${isDark ? 'border-orange-400/20' : 'border-orange-300/40'}`}
            style={{
              background: isDark
                ? 'linear-gradient(90deg, rgba(249,115,22,0.10) 0%, rgba(249,115,22,0.95) 100%)'
                : 'linear-gradient(90deg, rgba(251,146,60,0.18) 0%, rgba(234,88,12,0.92) 100%)',
            }}
          />
          <span className={`shrink-0 text-xs font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
            High students
          </span>
        </div>

        <div className="relative overflow-x-auto pb-4" data-heatmap-root>
          <div className="min-w-[720px]">
            <div
              className="grid grid-cols-[72px_repeat(var(--heatmap-cols),minmax(86px,1fr))] gap-2"
              style={{ ['--heatmap-cols' as string]: xLabels.length }}
            >
              <div />
              {xLabels.map((label) => (
                <div
                  key={label}
                  className={`px-1 pt-1 text-center text-xs font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-slate-300' : 'text-slate-500'}`}
                  title={label}
                >
                  {truncateLabel(label)}
                </div>
              ))}

              {rows.map((row, rowIndex) => (
                <FragmentRow
                  key={row.label}
                  rowLabel={yLabels[rowIndex] ?? row.label}
                  values={row.values}
                  xLabels={xLabels}
                  isDark={isDark}
                  getCellStyle={getCellStyle}
                  onHover={setHoveredCell}
                  onLeave={() => setHoveredCell(null)}
                />
              ))}
            </div>
          </div>

          {hoveredCell && tooltipContent ? (
            <div
              className={`pointer-events-none absolute z-10 w-72 rounded-2xl border px-4 py-3 shadow-xl ${isDark ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-900'}`}
              style={{
                left: hoveredCell.x,
                top: hoveredCell.y,
                transform: 'translate(-50%, calc(-100% - 12px))',
              }}
            >
              <p className="text-sm font-semibold">{tooltipContent.title}</p>
              <p className={`mt-2 text-sm leading-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{tooltipContent.description}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function FragmentRow({
  rowLabel,
  values,
  xLabels,
  isDark,
  getCellStyle,
  onHover,
  onLeave,
}: {
  rowLabel: string;
  values: number[];
  xLabels: string[];
  isDark: boolean;
  getCellStyle: (_rowLabel: string, value: number) => { backgroundColor: string; borderColor: string };
  onHover: (value: { cell: AnalyticsHeatmapCell; x: number; y: number } | null) => void;
  onLeave: () => void;
}) {
  return (
    <>
      <div className={`flex items-center justify-end pr-2 text-xs font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
        {rowLabel}
      </div>
      {values.map((value, columnIndex) => {
        const cell = {
          xLabel: xLabels[columnIndex] ?? '',
          yLabel: rowLabel,
          value,
        };
        const tone = getCellStyle(rowLabel, value);

        return (
          <button
            key={`${rowLabel}-${cell.xLabel}`}
            type="button"
            onMouseMove={(event) => {
              const container = event.currentTarget.closest('[data-heatmap-root]') as HTMLElement | null;
              const bounds = container?.getBoundingClientRect();
              if (!bounds) {
                return;
              }

              onHover({
                cell,
                x: event.clientX - bounds.left,
                y: event.clientY - bounds.top,
              });
            }}
            onMouseLeave={onLeave}
            className={`h-14 rounded-xl border transition duration-150 hover:scale-[1.02] ${isDark ? 'shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]' : 'shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]'}`}
            style={tone}
            title={`${cell.value} students at ${cell.yLabel} in ${cell.xLabel}`}
          />
        );
      })}
    </>
  );
}
