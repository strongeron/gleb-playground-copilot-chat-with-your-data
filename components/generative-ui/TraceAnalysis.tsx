import React from 'react';
import { AlertTriangle, Clock, Activity, BarChart3, TrendingUp, AlertCircle } from 'lucide-react';
import { ChartRenderer } from './ChartRenderer';

interface TraceAnalysisProps {
  analysisType: string;
  analysis: any;
}

export function TraceAnalysis({ analysisType, analysis }: TraceAnalysisProps) {
  const renderAnalysis = () => {
    switch (analysisType) {
      case 'bottlenecks':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <h3 className="text-lg font-semibold">Performance Bottlenecks</h3>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
                Found {analysis.totalBottlenecks} bottlenecks in the trace
              </p>
              
              {analysis.bottlenecks && analysis.bottlenecks.length > 0 && (
                <ChartRenderer
                  chartType="bar"
                  title="Top Performance Bottlenecks"
                  data={analysis.bottlenecks.map((bottleneck: any) => ({
                    name: bottleneck.name,
                    value: bottleneck.duration
                  }))}
                  description="Service calls taking longer than 1 second"
                />
              )}
              
              <div className="mt-4 space-y-2">
                {analysis.bottlenecks?.slice(0, 5).map((bottleneck: any, index: number) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="font-medium">{bottleneck.name}</span>
                    <span className="text-orange-600 dark:text-orange-400">
                      {bottleneck.duration.toFixed(2)}s
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'errors':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-semibold">Error Analysis</h3>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                Found {analysis.totalErrors} errors in the trace
              </p>
              
              {analysis.errorByService && Object.keys(analysis.errorByService).length > 0 && (
                <ChartRenderer
                  chartType="pie"
                  title="Errors by Service"
                  data={Object.entries(analysis.errorByService).map(([service, count]) => ({
                    name: service,
                    value: count as number
                  }))}
                  description="Distribution of errors across services"
                />
              )}
              
              <div className="mt-4 space-y-2">
                {analysis.errors?.slice(0, 5).map((error: any, index: number) => (
                  <div key={index} className="text-sm">
                    <div className="font-medium text-red-800 dark:text-red-200">
                      {error.name}
                    </div>
                    <div className="text-red-600 dark:text-red-400 text-xs">
                      Service: {error.service}
                    </div>
                    {error.message && (
                      <div className="text-red-500 dark:text-red-300 text-xs mt-1">
                        {error.message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'timeline':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold">Timeline Analysis</h3>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                Timeline spans {analysis.totalSpans} operations
              </p>
              
              {analysis.timeline && analysis.timeline.length > 0 && (
                <ChartRenderer
                  chartType="line"
                  title="Service Timeline"
                  data={analysis.timeline.slice(0, 20).map((span: any, index: number) => ({
                    name: `Span ${index + 1}`,
                    value: span.duration / 1000000000 // Convert to seconds
                  }))}
                  description="Duration of spans over time"
                />
              )}
              
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Total Spans:</span>
                  <span className="ml-2">{analysis.totalSpans}</span>
                </div>
                <div>
                  <span className="font-medium">Time Range:</span>
                  <span className="ml-2">
                    {analysis.timeRange ? 
                      `${((analysis.timeRange.end - analysis.timeRange.start) / 1000000000).toFixed(2)}s` : 
                      'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'dependencies':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold">Service Dependencies</h3>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                Found {analysis.totalServices} services with dependencies
              </p>
              
              <div className="space-y-3">
                {analysis.dependencies?.map((dep: any, index: number) => (
                  <div key={index} className="border border-green-200 dark:border-green-700 rounded p-3">
                    <div className="font-medium text-green-800 dark:text-green-200">
                      {dep.service}
                    </div>
                    {dep.dependencies.length > 0 ? (
                      <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                        Depends on: {dep.dependencies.join(', ')}
                      </div>
                    ) : (
                      <div className="text-sm text-green-500 dark:text-green-300 mt-1">
                        No dependencies
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-center text-gray-500 py-8">
            Analysis type "{analysisType}" not supported
          </div>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      {renderAnalysis()}
    </div>
  );
} 