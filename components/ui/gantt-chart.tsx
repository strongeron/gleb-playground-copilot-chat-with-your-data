"use client"

import React, { useState, useEffect } from 'react';
import { Modal } from './modal';
import { Maximize2 } from 'lucide-react';

// Define types for Gantt chart data
interface GanttDataItem {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  service: string;
  status?: string;
  category?: string;
  [key: string]: any;
}

interface GanttChartProps {
  data: GanttDataItem[]
  className?: string
  height?: number
  width?: number
  showGrid?: boolean
  showTimeMarkers?: boolean
  showDuration?: boolean
  showStatus?: boolean
  colors?: string[]
  timeFormat?: 'milliseconds' | 'seconds' | 'minutes' | 'auto'
  groupBy?: 'service' | 'category' | 'status' | 'none'
  title?: string
  description?: string
}

const DEFAULT_COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

export function GanttChart({
  data,
  className = "",
  height = 400,
  width = 800,
  showGrid = true,
  showTimeMarkers = true,
  showDuration = true,
  showStatus = true,
  colors = DEFAULT_COLORS,
  timeFormat = 'auto',
  groupBy = 'service',
  title,
  description
}: GanttChartProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewportDimensions, setViewportDimensions] = useState({ width: 1200, height: 800 });

  // Get actual viewport dimensions for full-view modal
  useEffect(() => {
    const updateDimensions = () => {
      setViewportDimensions({
        width: window.innerWidth - 100, // Leave some padding
        height: window.innerHeight - 200 // Leave space for header and padding
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-${height} text-gray-500 ${className}`}>
        No timeline data available
      </div>
    );
  }

  // Find time range for scaling
  const minTime = Math.min(...data.map(item => item.startTime));
  const maxTime = Math.max(...data.map(item => item.endTime));
  const timeRange = maxTime - minTime;
  
  // Determine time format automatically if needed
  const getTimeFormat = () => {
    if (timeFormat !== 'auto') return timeFormat;
    
    const maxDuration = Math.max(...data.map(item => item.duration));
    if (maxDuration < 1000000) return 'milliseconds';
    if (maxDuration < 60000000000) return 'seconds';
    return 'minutes';
  };

  const currentTimeFormat = getTimeFormat();
  
  // Convert timestamp to readable time
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp / 1000000); // Convert from nanoseconds
    const options: Intl.DateTimeFormatOptions = {
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit'
    };
    
    // Only add fractionalSecondDigits if we want milliseconds
    if (currentTimeFormat === 'milliseconds') {
      options.fractionalSecondDigits = 3;
    }
    
    return date.toLocaleTimeString('en-US', options);
  };

  // Convert duration to readable format
  const formatDuration = (duration: number) => {
    const ms = duration / 1000000;
    if (currentTimeFormat === 'milliseconds') return `${ms.toFixed(2)}ms`;
    if (currentTimeFormat === 'seconds') return `${(ms / 1000).toFixed(2)}s`;
    if (currentTimeFormat === 'minutes') return `${(ms / 60000).toFixed(2)}m`;
    return `${ms.toFixed(2)}ms`;
  };

  // Group data if needed
  const groupedData = groupBy !== 'none' ? 
    data.reduce((acc, item) => {
      const groupKey = item[groupBy] || 'Unknown';
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(item);
      return acc;
    }, {} as Record<string, GanttDataItem[]>) : 
    { 'All': data };

  // Calculate chart dimensions
  const chartWidth = Math.max(width, 800);
  const chartHeight = Math.max(height, Object.keys(groupedData).length * 50 + 150);
  const rowHeight = 40;
  const headerHeight = 80;

  const getBarPosition = (startTime: number) => {
    return ((startTime - minTime) / timeRange) * (chartWidth - 200); // Leave space for labels
  };

  const getBarWidth = (startTime: number, endTime: number) => {
    return ((endTime - startTime) / timeRange) * (chartWidth - 200);
  };

  const getStatusColor = (status?: string) => {
    if (!status) return colors[0];
    if (status === 'STATUS_CODE_ERROR') return '#ef4444';
    if (status === 'STATUS_CODE_OK') return '#10b981';
    return colors[0];
  };

  // Render chart function that can be reused with dynamic sizing
  const renderChart = (chartWidth: number, chartHeight: number, isExpanded: boolean = false) => {
    // For expanded view in modal, use full container width
    const actualWidth = isExpanded ? '100%' : chartWidth;
    const actualHeight = isExpanded ? '100%' : chartHeight;
    
    return (
      <svg width={actualWidth} height={actualHeight} className="w-full h-full">
        {/* Background grid */}
        {showGrid && (
          <defs>
            <pattern id={`gantt-grid-${isExpanded ? 'expanded' : 'compact'}`} width="50" height={rowHeight} patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 ${rowHeight}" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
            </pattern>
          </defs>
        )}
        {showGrid && <rect width="100%" height="100%" fill={`url(#gantt-grid-${isExpanded ? 'expanded' : 'compact'})`} />}
        
        {/* Time axis */}
        <line x1="200" y1={headerHeight} x2="100%" y2={headerHeight} stroke="#333" strokeWidth="2" />
        <text x="50%" y="25" textAnchor="middle" className="text-sm font-medium fill-current">
          Timeline
        </text>
        
        {/* Time markers - adjust for full width */}
        {showTimeMarkers && Array.from({ length: 11 }, (_, i) => {
          const time = minTime + (timeRange * i / 10);
          const x = 200 + (i / 10) * (window.innerWidth - 400); // Use viewport width
          return (
            <g key={i}>
              <line x1={x} y1={headerHeight - 5} x2={x} y2={headerHeight + 5} stroke="#333" strokeWidth="1" />
              <text x={x} y={headerHeight + 20} textAnchor="middle" className="text-xs fill-current">
                {formatTime(time)}
              </text>
            </g>
          );
        })}
        
        {/* Group headers and bars */}
        {Object.entries(groupedData).map(([groupName, groupItems], groupIndex) => {
          const groupY = headerHeight + 20 + groupIndex * 50;
          
          return (
            <g key={groupName}>
              {/* Group label */}
              <text 
                x="10" 
                y={groupY + 15} 
                className="text-sm font-medium fill-current"
                style={{ 
                  fontSize: isExpanded ? '16px' : '12px',
                  fontWeight: isExpanded ? '600' : '500'
                }}
              >
                {groupName}
              </text>
              
              {/* Group separator line */}
              <line x1="0" y1={groupY + 25} x2="100%" y2={groupY + 25} stroke="#e5e7eb" strokeWidth="1" />
              
              {/* Items in this group */}
              {groupItems.map((item, itemIndex) => {
                const itemY = groupY + 30 + itemIndex * 25;
                const x = 200 + getBarPosition(item.startTime);
                const barWidth = getBarWidth(item.startTime, item.endTime);
                const statusColor = getStatusColor(item.status);
                
                return (
                  <g key={item.id || `${groupName}-${itemIndex}`}>
                    {/* Item name label - with better spacing for expanded view */}
                    <text 
                      x="210" 
                      y={itemY + 15} 
                      className="fill-current"
                      style={{ 
                        fontSize: isExpanded ? '14px' : '10px',
                        fontWeight: isExpanded ? '500' : '400'
                      }}
                    >
                      {item.name}
                    </text>
                    
                    {/* Timeline bar */}
                    <rect
                      x={x}
                      y={itemY}
                      width={barWidth}
                      height="20"
                      fill={statusColor}
                      stroke="#333"
                      strokeWidth="1"
                      rx="3"
                      opacity="0.8"
                    />
                    
                    {/* Duration label */}
                    {showDuration && (
                      <text 
                        x={x + barWidth + 5} 
                        y={itemY + 15} 
                        className="fill-current"
                        style={{ 
                          fontSize: isExpanded ? '13px' : '10px'
                        }}
                      >
                        {formatDuration(item.duration)}
                      </text>
                    )}
                    
                    {/* Status indicator */}
                    {showStatus && item.status && (
                      <circle
                        cx={x - 10}
                        cy={itemY + 10}
                        r="4"
                        fill={statusColor}
                        stroke="#333"
                        strokeWidth="1"
                      />
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <>
      <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          {title && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
              {description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
              )}
            </div>
          )}
          
          {/* Expand Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors flex items-center gap-2"
          >
            <Maximize2 className="h-4 w-4" />
            Full Viewport View
          </button>
        </div>
        
        {/* Compact Chart View */}
        <div className="overflow-x-auto">
          {renderChart(chartWidth, chartHeight, false)}
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          {showStatus && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Success</span>
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Error</span>
            </div>
          )}
          <div className="text-gray-500">
            Time format: {currentTimeFormat}
          </div>
        </div>
      </div>

      {/* Full Viewport Modal - Rendered OUTSIDE chat component via Portal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={title || 'Timeline Chart - Full Viewport View'}
        size="viewport"
      >
        <div className="w-full h-full">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {description && <p className="mb-2">{description}</p>}
            <p>Full viewport view using 100% of available screen space for complete visibility.</p>
          </div>
          
          {/* Full Viewport Chart - Uses actual viewport dimensions */}
          <div className="w-full h-full border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
            {renderChart(window.innerWidth - 100, window.innerHeight - 200, true)}
          </div>
          
          {/* Additional Details */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Chart Information</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>Total Items: {data.length}</li>
                <li>Services: {Object.keys(groupedData).length}</li>
                <li>Time Range: {formatTime(minTime)} - {formatTime(maxTime)}</li>
                <li>Format: {currentTimeFormat}</li>
                <li>Viewport: {viewportDimensions.width} × {viewportDimensions.height}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Legend</h4>
              <div className="space-y-2">
                {showStatus && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Success Operations</span>
                  </div>
                )}
                {showStatus && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Error Operations</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Other Operations</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
