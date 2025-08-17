"use client";

import React from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ScatterChart as UIScatterChart } from '../ui/scatter-chart';
import { GanttChart as UIGanttChart } from '../ui/gantt-chart';

interface ChartRendererProps {
  chartType: string;
  title: string;
  data: any;
  description?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function ChartRenderer({ chartType, title, data, description }: ChartRendererProps) {
  // Add error boundary for chart rendering
  const renderChart = () => {
    try {
      // Validate data
      if (!data || (Array.isArray(data) && data.length === 0)) {
        return (
          <div className="text-center text-gray-500 py-8">
            No data available for chart
          </div>
        );
      }

      switch (chartType.toLowerCase()) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <UIScatterChart
            data={data}
            xAxis="x"
            yAxis="y"
            zAxis="service"
            xAxisLabel="Duration (ms)"
            yAxisLabel="Response Time (ms)"
            className="h-80"
            tooltipFormatter={(value, name) => [
              name === 'x' ? 'Duration' : 'Response Time', 
              `${value}ms`
            ]}
          />
        );

      case 'gantt':
        return (
          <UIGanttChart
            data={data}
            title={title}
            description={description}
            height={400}
            width={800}
            showGrid={true}
            showTimeMarkers={true}
            showDuration={true}
            showStatus={true}
            groupBy="service"
            timeFormat="auto"
          />
        );
      
      default:
        return (
          <div className="text-center text-gray-500 py-8">
            Chart type "{chartType}" not supported
          </div>
        );
    }
    } catch (error) {
      console.error('Error rendering chart:', error);
      return (
        <div className="text-center text-red-500 py-8">
          Error rendering chart: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>
      
      <div className="w-full">
        {renderChart()}
      </div>
      
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        Generated at {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}

 