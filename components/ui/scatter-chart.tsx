"use client"

import { Scatter, ScatterChart as RechartsScatterChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, ZAxis } from "recharts"

// Define a generic type for scatter chart data
interface ScatterDataItem {
  x: number;
  y: number;
  z?: number; // Optional size/weight for bubble charts
  [key: string]: string | number | undefined;
}

interface ScatterChartProps {
  data: ScatterDataItem[]
  xAxis: string
  yAxis: string
  zAxis?: string
  colors?: string[]
  className?: string
  showLegend?: boolean
  showXAxis?: boolean
  showYAxis?: boolean
  showGrid?: boolean
  xAxisLabel?: string
  yAxisLabel?: string
  zAxisLabel?: string
  xAxisFormatter?: (value: number) => string
  yAxisFormatter?: (value: number) => string
  tooltipFormatter?: (value: number, name: string) => [string, string]
  shape?: "circle" | "square" | "triangle" | "diamond"
  sizeRange?: [number, number] // [min, max] for bubble size
}

export function ScatterChart({
  data,
  xAxis,
  yAxis,
  zAxis,
  colors = ["#3b82f6", "#10b981", "#6366f1", "#f59e0b", "#ef4444"],
  className,
  showLegend = true,
  showXAxis = true,
  showYAxis = true,
  showGrid = true,
  xAxisLabel,
  yAxisLabel,
  zAxisLabel,
  xAxisFormatter = (value: number) => `${value}`,
  yAxisFormatter = (value: number) => `${value}`,
  tooltipFormatter,
  shape = "circle",
  sizeRange = [5, 20],
}: ScatterChartProps) {
  // Group data by category if zAxis is provided
  const groupedData = zAxis ? 
    data.reduce((acc, item) => {
      const category = item[zAxis]?.toString() || "default";
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {} as Record<string, ScatterDataItem[]>) : 
    { "default": data };

  const getTooltipContent = (value: number, name: string) => {
    if (tooltipFormatter) {
      return tooltipFormatter(value, name);
    }
    return [name === xAxis ? xAxisLabel || xAxis : yAxisLabel || yAxis, `${value}`];
  };

  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      <RechartsScatterChart
        data={data}
        margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
        
        {showXAxis && (
          <XAxis 
            dataKey={xAxis}
            type="number"
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "#6b7280", fontSize: 12 }}
            dy={10}
            label={xAxisLabel ? { value: xAxisLabel, position: 'bottom', offset: 0 } : undefined}
            tickFormatter={xAxisFormatter}
          />
        )}
        
        {showYAxis && (
          <YAxis 
            dataKey={yAxis}
            type="number"
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "#6b7280", fontSize: 12 }}
            dx={-10}
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'left', offset: 0 } : undefined}
            tickFormatter={yAxisFormatter}
          />
        )}

        {zAxis && (
          <ZAxis 
            dataKey={zAxis}
            range={sizeRange}
            type="number"
          />
        )}
        
        <Tooltip 
          formatter={getTooltipContent}
          separator=""
          itemStyle={{ padding: "2px 0" }}
          cursor={{ strokeDasharray: "3 3" }}
          contentStyle={{ 
            backgroundColor: "white", 
            borderRadius: "0.375rem",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            padding: "0.5rem 0.75rem",
          }}
        />
        
        {showLegend && (
          <Legend 
            verticalAlign="top" 
            height={36}
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>{value}</span>
            )}
          />
        )}
        
        {Object.entries(groupedData).map(([category, categoryData], index) => (
          <Scatter
            key={category}
            data={categoryData}
            fill={colors[index % colors.length]}
            shape={shape}
            name={zAxis ? category : undefined}
          />
        ))}
      </RechartsScatterChart>
    </ResponsiveContainer>
  );
}
