"use client";

import { useState, useEffect } from "react";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, MessageSquare, Activity, Database, Search, AlertCircle, CheckCircle, Loader2, BarChart3 } from "lucide-react";
import { TraceAnalysis } from "../../components/generative-ui/TraceAnalysis";
import { ChartRenderer } from "../../components/generative-ui/ChartRenderer";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import Link from "next/link";
import { prompt } from "../../lib/prompt";
import { traceFiles, TraceFile } from "../../data/traces-data";

export default function TracesPage() {
  const [selectedFile, setSelectedFile] = useState<TraceFile>(traceFiles[0]);
  const [traceData, setTraceData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<'idle' | 'thinking' | 'ready'>('idle');

  useEffect(() => {
    // Check for file parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const fileParam = urlParams.get('file');
    
    if (fileParam) {
      const file = traceFiles.find(f => f.path === fileParam);
      if (file) {
        setSelectedFile(file);
      }
    } else {
      loadTraceFile(selectedFile);
    }
  }, [selectedFile]);

  useEffect(() => {
    loadTraceFile(selectedFile);
  }, [selectedFile]);

  const loadTraceFile = async (file: TraceFile) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/traces/${file.path}`);
      if (!response.ok) {
        throw new Error(`Failed to load trace file: ${response.statusText}`);
      }
      const data = await response.json();
      setTraceData(data);
      analyzeTraceData(data);
      setAiStatus('ready');
    } catch (error) {
      console.error("Error loading trace file:", error);
      setError(error instanceof Error ? error.message : "Failed to load trace file");
      setAiStatus('idle');
    } finally {
      setLoading(false);
    }
  };

  const analyzeTraceData = (data: any) => {
    if (!data || !Array.isArray(data)) return;

    const analysis = {
      totalSpans: 0,
      services: new Set<string>(),
      spanTypes: new Set<string>(),
      timeRange: { start: null as number | null, end: null as number | null },
      errors: 0,
      avgDuration: 0
    };

    data.forEach((resourceSpan: any) => {
      if (resourceSpan.resourceSpans) {
        resourceSpan.resourceSpans.forEach((span: any) => {
          analysis.totalSpans++;
          
          // Extract service name
          const serviceAttr = span.resource?.attributes?.find((attr: any) => 
            attr.key === "service.name"
          );
          if (serviceAttr) {
            analysis.services.add(serviceAttr.value.stringValue);
          }

          // Analyze spans
          if (span.scopeSpans) {
            span.scopeSpans.forEach((scopeSpan: any) => {
              if (scopeSpan.spans) {
                scopeSpan.spans.forEach((spanData: any) => {
                  analysis.spanTypes.add(spanData.name);
                  
                  // Check for errors
                  if (spanData.status?.code === "STATUS_CODE_ERROR") {
                    analysis.errors++;
                  }

                  // Time analysis
                  const startTime = parseInt(spanData.startTimeUnixNano);
                  const endTime = parseInt(spanData.endTimeUnixNano);
                  if (!analysis.timeRange.start || startTime < analysis.timeRange.start) {
                    analysis.timeRange.start = startTime;
                  }
                  if (!analysis.timeRange.end || endTime > analysis.timeRange.end) {
                    analysis.timeRange.end = endTime;
                  }
                });
              }
            });
          }
        });
      }
    });

    setStats({
      totalSpans: analysis.totalSpans,
      services: Array.from(analysis.services),
      spanTypes: Array.from(analysis.spanTypes),
      errors: analysis.errors,
      timeRange: analysis.timeRange
    });
  };

  // Helper functions for trace analysis
  interface Bottleneck {
    name: string;
    duration: number;
    service: string;
  }

  const analyzeBottlenecks = (data: any) => {
    const bottlenecks: Bottleneck[] = [];
    
    if (data && Array.isArray(data)) {
      data.forEach((resourceSpan: any) => {
        if (resourceSpan.resourceSpans) {
          resourceSpan.resourceSpans.forEach((span: any) => {
            if (span.scopeSpans) {
              span.scopeSpans.forEach((scopeSpan: any) => {
                if (scopeSpan.spans) {
                  scopeSpan.spans.forEach((spanData: any) => {
                    const duration = parseInt(spanData.endTimeUnixNano) - parseInt(spanData.startTimeUnixNano);
                    if (duration > 1000000000) { // 1 second threshold
                      bottlenecks.push({
                        name: spanData.name,
                        duration: duration / 1000000000, // Convert to seconds
                        service: span.resource?.attributes?.find((attr: any) => 
                          attr.key === "service.name"
                        )?.value?.stringValue || "Unknown"
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
    
    return {
      bottlenecks: bottlenecks.sort((a, b) => b.duration - a.duration).slice(0, 10),
      totalBottlenecks: bottlenecks.length
    };
  };

  interface Error {
    name: string;
    service: string;
    message: string;
  }

  const analyzeErrors = (data: any) => {
    const errors: Error[] = [];
    
    if (data && Array.isArray(data)) {
      data.forEach((resourceSpan: any) => {
        if (resourceSpan.resourceSpans) {
          resourceSpan.resourceSpans.forEach((span: any) => {
            if (span.scopeSpans) {
              span.scopeSpans.forEach((scopeSpan: any) => {
                if (scopeSpan.spans) {
                  scopeSpan.spans.forEach((spanData: any) => {
                    if (spanData.status?.code === "STATUS_CODE_ERROR") {
                      errors.push({
                        name: spanData.name,
                        service: span.resource?.attributes?.find((attr: any) => 
                          attr.key === "service.name"
                        )?.value?.stringValue || "Unknown",
                        message: spanData.status?.message || "Unknown error"
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
    
    return {
      errors: errors,
      totalErrors: errors.length,
      errorByService: errors.reduce((acc, error) => {
        acc[error.service] = (acc[error.service] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  };

  interface TimelineItem {
    name: string;
    startTime: number;
    endTime: number;
    duration: number;
    service: string;
  }

  const analyzeTimeline = (data: any) => {
    const timeline: TimelineItem[] = [];
    
    if (data && Array.isArray(data)) {
      data.forEach((resourceSpan: any) => {
        if (resourceSpan.resourceSpans) {
          resourceSpan.resourceSpans.forEach((span: any) => {
            if (span.scopeSpans) {
              span.scopeSpans.forEach((scopeSpan: any) => {
                if (scopeSpan.spans) {
                  scopeSpan.spans.forEach((spanData: any) => {
                    timeline.push({
                      name: spanData.name,
                      startTime: parseInt(spanData.startTimeUnixNano),
                      endTime: parseInt(spanData.endTimeUnixNano),
                      duration: parseInt(spanData.endTimeUnixNano) - parseInt(spanData.startTimeUnixNano),
                      service: span.resource?.attributes?.find((attr: any) => 
                        attr.key === "service.name"
                      )?.value?.stringValue || "Unknown"
                    });
                  });
                }
              });
            }
          });
        }
      });
    }
    
    return {
      timeline: timeline.sort((a, b) => a.startTime - b.startTime),
      totalSpans: timeline.length,
      timeRange: {
        start: Math.min(...timeline.map(t => t.startTime)),
        end: Math.max(...timeline.map(t => t.endTime))
      }
    };
  };

  const analyzeDependencies = (data: any) => {
    const dependencies = new Map();
    
    if (data && Array.isArray(data)) {
      data.forEach((resourceSpan: any) => {
        if (resourceSpan.resourceSpans) {
          resourceSpan.resourceSpans.forEach((span: any) => {
            const serviceName = span.resource?.attributes?.find((attr: any) => 
              attr.key === "service.name"
            )?.value?.stringValue || "Unknown";
            
            if (span.scopeSpans) {
              span.scopeSpans.forEach((scopeSpan: any) => {
                if (scopeSpan.spans) {
                  scopeSpan.spans.forEach((spanData: any) => {
                    if (!dependencies.has(serviceName)) {
                      dependencies.set(serviceName, new Set());
                    }
                    
                    // Look for parent-child relationships
                    if (spanData.parentSpanId) {
                      // This is a child span, add dependency
                      const parentService = findServiceBySpanId(data, spanData.parentSpanId);
                      if (parentService && parentService !== serviceName) {
                        dependencies.get(serviceName).add(parentService);
                      }
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
    
    return {
      dependencies: Array.from(dependencies.entries()).map(([service, deps]) => ({
        service,
        dependencies: Array.from(deps)
      })),
      totalServices: dependencies.size
    };
  };

  const findServiceBySpanId = (data: any, spanId: string): string | null => {
    for (const resourceSpan of data) {
      if (resourceSpan.resourceSpans) {
        for (const span of resourceSpan.resourceSpans) {
          if (span.scopeSpans) {
            for (const scopeSpan of span.scopeSpans) {
              if (scopeSpan.spans) {
                for (const spanData of scopeSpan.spans) {
                  if (spanData.spanId === spanId) {
                    return span.resource?.attributes?.find((attr: any) => 
                      attr.key === "service.name"
                    )?.value?.stringValue || "Unknown";
                  }
                }
              }
            }
          }
        }
      }
    }
    return null;
  };

  // Make trace data readable to CopilotKit
  useCopilotReadable({
    description: `Current trace data from ${selectedFile.name}`,
    value: {
      currentFile: selectedFile,
      traceData: traceData,
      statistics: stats,
      availableFiles: traceFiles,
      loading: loading,
      error: error
    }
  });

  // Define trace analysis action
  useCopilotAction({
    name: "analyzeTracePerformance",
    available: "enabled",
    description: "Analyzes trace data and creates performance visualizations.",
    parameters: [
      {
        name: "analysisType",
        type: "string",
        description: "Type of analysis (bottlenecks, errors, timeline, dependencies)",
        required: true,
      },
    ],
    render: ({args}: {args: any}) => {
      // Use the current trace data from the readable context
      const analysisType = args?.analysisType || 'bottlenecks';
      
      // Analyze the current trace data
      let analysis = {};
      if (traceData) {
        switch (analysisType) {
          case 'bottlenecks':
            analysis = analyzeBottlenecks(traceData);
            break;
          case 'errors':
            analysis = analyzeErrors(traceData);
            break;
          case 'timeline':
            analysis = analyzeTimeline(traceData);
            break;
          case 'dependencies':
            analysis = analyzeDependencies(traceData);
            break;
        }
      }
      
      return (
        <TraceAnalysis
          analysisType={analysisType}
          analysis={analysis}
        />
      );
    }
  });

  // Define chart creation action for traces
  useCopilotAction({
    name: "createChart",
    available: "enabled",
    description: "Creates a chart visualization based on trace data analysis.",
    parameters: [
      {
        name: "chartType",
        type: "string",
        description: "The type of chart to create (bar, line, pie, area, scatter, gantt)",
        required: true,
      },
      {
        name: "title",
        type: "string",
        description: "The title of the chart",
        required: true,
      },
      {
        name: "data",
        type: "object",
        description: "The data to visualize in the chart",
        required: true,
      },
      {
        name: "description",
        type: "string",
        description: "Description of what the chart shows",
        required: false,
      },
    ],
    render: ({args}: {args: any}) => {
      return (
        <ErrorBoundary>
          <ChartRenderer
            chartType={args?.chartType || 'bar'}
            title={args?.title || 'Chart'}
            data={args?.data || []}
            description={args?.description}
          />
        </ErrorBoundary>
      );
    }
  });

  // Specialized timeline chart action for trace analysis
  useCopilotAction({
    name: "createTimelineChart",
    available: "enabled",
    description: "Creates timeline-specific charts (Gantt, scatter) from trace data with automatic data formatting.",
    parameters: [
      {
        name: "chartType",
        type: "string",
        description: "Timeline chart type (gantt, scatter)",
        required: true,
      },
      {
        name: "title",
        type: "string",
        description: "Chart title",
        required: true,
      },
      {
        name: "dataType",
        type: "string",
        description: "Type of timeline data to extract (all, errors, bottlenecks, specific-service)",
        required: false,
      },
      {
        name: "serviceFilter",
        type: "string",
        description: "Specific service to filter by (optional)",
        required: false,
      }
    ],
    render: ({args}: {args: any}) => {
      if (!traceData) {
        return (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-yellow-800 dark:text-yellow-200">
              ⚠️ No trace data available. Please load a trace file first.
            </p>
          </div>
        );
      }

      const { chartType, title, dataType = 'all', serviceFilter } = args;
      
      // Extract and format timeline data based on type
      let formattedData = [];
      
      if (chartType === 'gantt') {
        formattedData = extractGanttData(traceData, dataType, serviceFilter);
      } else if (chartType === 'scatter') {
        formattedData = extractScatterData(traceData, dataType, serviceFilter);
      }

      if (formattedData.length === 0) {
        return (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">
              ❌ No data available for {chartType} chart with filters: {dataType} {serviceFilter ? `(service: ${serviceFilter})` : ''}
            </p>
          </div>
        );
      }

              return (
          <ErrorBoundary>
            <ChartRenderer
              chartType={chartType}
              title={title}
              data={formattedData}
              description={`Timeline analysis: ${dataType}${serviceFilter ? ` for ${serviceFilter}` : ''}`}
            />
          </ErrorBoundary>
        );
    }
  });

  // Add this new action to your traces page
  useCopilotAction({
    name: "showFullPageChart",
    available: "enabled",
    description: "Shows a full-page chart using the entire page width, outside of chat constraints.",
    parameters: [
      {
        name: "chartType",
        type: "string",
        description: "Type of chart to display (gantt, scatter, bar, line, pie, area)",
        required: true,
      },
      {
        name: "title",
        type: "string",
        description: "Chart title",
        required: true,
      },
      {
        name: "dataType",
        type: "string",
        description: "Type of data to analyze (all, errors, bottlenecks, specific-service)",
        required: false,
      },
      {
        name: "serviceFilter",
        type: "string",
        description: "Specific service to filter by (optional)",
        required: false,
      }
    ],
    render: ({args}: {args: any}) => {
      const { chartType, title, dataType = 'all', serviceFilter } = args;
      
      if (!traceData) {
        return (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-yellow-800 dark:text-yellow-200">
              ⚠️ No trace data available. Please load a trace file first.
            </p>
          </div>
        );
      }

      // Extract data based on chart type
      let chartData = [];
      let chartTitle = title;
      
      if (chartType === 'gantt') {
        chartData = extractGanttData(traceData, dataType, serviceFilter);
        chartTitle = `Gantt Chart: ${dataType}${serviceFilter ? ` for ${serviceFilter}` : ''}`;
      } else if (chartType === 'scatter') {
        chartData = extractScatterData(traceData, dataType, serviceFilter);
        chartTitle = `Scatter Plot: ${dataType}${serviceFilter ? ` for ${serviceFilter}` : ''}`;
      } else {
        // For other chart types, use the existing createChart action
        return (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-blue-800 dark:text-blue-200">
              Use "Create {chartType} chart" for basic charts, or "Show full page {chartType} chart" for full-page view.
            </p>
          </div>
        );
      }

      if (chartData.length === 0) {
        return (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-yellow-800 dark:text-yellow-200">
              ⚠️ No data available for {chartType} chart with filters: {dataType} {serviceFilter ? `(service: ${serviceFilter})` : ''}
            </p>
          </div>
        );
      }

      // Return a full-page chart component
      return (
        <div className="fixed inset-0 z-[9999] bg-white dark:bg-gray-900 overflow-auto">
          {/* Full-page header */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{chartTitle}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Full-page view using entire page width
                </p>
              </div>
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Close Full View
              </button>
            </div>
          </div>

          {/* Full-page chart content */}
          <div className="p-6">
            {chartType === 'gantt' && (
              <div className="w-full">
                <svg width="100%" height={Math.max(600, chartData.length * 60 + 200)}>
                  {/* Render full-width Gantt chart here */}
                  {/* This will use the full page width, not constrained by chat */}
                  <rect width="100%" height="100%" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                  <text x="50%" y="30" textAnchor="middle" className="text-xl font-bold fill-current">
                    {chartTitle}
                  </text>
                  {/* Add your full Gantt chart rendering logic here */}
                </svg>
              </div>
            )}
            
            {chartType === 'scatter' && (
              <div className="w-full">
                {/* Render full-width scatter plot here */}
                <div className="text-center text-gray-500 py-8">
                  Full-page scatter plot rendering (implement chart logic)
                </div>
              </div>
            )}

            {/* Chart information */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h3 className="font-semibold mb-2">Chart Information</h3>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>Total Items: {chartData.length}</li>
                  <li>Chart Type: {chartType}</li>
                  <li>Data Filter: {dataType}</li>
                  {serviceFilter && <li>Service: {serviceFilter}</li>}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Navigation</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Use the "Close Full View" button to return to the chat interface.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  });

  // Helper function to extract Gantt chart data
  const extractGanttData = (data: any, dataType: string, serviceFilter?: string) => {
    const timeline: any[] = [];
    
    try {
      if (data && Array.isArray(data)) {
        data.forEach((resourceSpan: any) => {
          if (resourceSpan.resourceSpans) {
            resourceSpan.resourceSpans.forEach((span: any) => {
              const serviceName = span.resource?.attributes?.find((attr: any) => 
                attr.key === "service.name"
              )?.value?.stringValue || "Unknown";
              
              // Apply service filter if specified
              if (serviceFilter && serviceName !== serviceFilter) return;
              
              if (span.scopeSpans) {
                span.scopeSpans.forEach((scopeSpan: any) => {
                  if (scopeSpan.spans) {
                    scopeSpan.spans.forEach((spanData: any) => {
                      try {
                        // Validate required fields
                        if (!spanData.startTimeUnixNano || !spanData.endTimeUnixNano || !spanData.name) {
                          return; // Skip invalid spans
                        }
                        
                        const startTime = parseInt(spanData.startTimeUnixNano);
                        const endTime = parseInt(spanData.endTimeUnixNano);
                        
                        // Check for valid timestamps
                        if (isNaN(startTime) || isNaN(endTime) || startTime >= endTime) {
                          return; // Skip invalid timestamps
                        }
                        
                        const duration = endTime - startTime;
                        
                        // Apply data type filters
                        let shouldInclude = true;
                        if (dataType === 'errors' && spanData.status?.code !== "STATUS_CODE_ERROR") {
                          shouldInclude = false;
                        } else if (dataType === 'bottlenecks') {
                          if (duration <= 1000000000) shouldInclude = false; // Less than 1 second
                        }
                        
                        if (shouldInclude) {
                          timeline.push({
                            name: spanData.name,
                            startTime: startTime,
                            endTime: endTime,
                            duration: duration,
                            service: serviceName,
                            status: spanData.status?.code || "STATUS_CODE_OK"
                          });
                        }
                      } catch (spanError) {
                        console.warn('Error processing span:', spanError, spanData);
                        // Continue processing other spans
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    } catch (error) {
      console.error('Error in extractGanttData:', error);
      return [];
    }
    
    return timeline.sort((a, b) => a.startTime - b.startTime);
  };

  // Helper function to extract scatter plot data
  const extractScatterData = (data: any, dataType: string, serviceFilter?: string) => {
    const scatterData: any[] = [];
    
    try {
      if (data && Array.isArray(data)) {
        data.forEach((resourceSpan: any) => {
          if (resourceSpan.resourceSpans) {
            resourceSpan.resourceSpans.forEach((span: any) => {
              const serviceName = span.resource?.attributes?.find((attr: any) => 
                attr.key === "service.name"
              )?.value?.stringValue || "Unknown";
              
              // Apply service filter if specified
              if (serviceFilter && serviceName !== serviceFilter) return;
              
              if (span.scopeSpans) {
                span.scopeSpans.forEach((scopeSpan: any) => {
                  if (scopeSpan.spans) {
                    scopeSpan.spans.forEach((spanData: any) => {
                      try {
                        // Validate required fields
                        if (!spanData.endTimeUnixNano || !spanData.startTimeUnixNano || !spanData.name) {
                          return; // Skip invalid spans
                        }
                        
                        const startTime = parseInt(spanData.startTimeUnixNano);
                        const endTime = parseInt(spanData.endTimeUnixNano);
                        
                        // Check for valid timestamps
                        if (isNaN(startTime) || isNaN(endTime) || startTime >= endTime) {
                          return; // Skip invalid timestamps
                        }
                        
                        const duration = endTime - startTime;
                        
                        // Apply data type filters
                        let shouldInclude = true;
                        if (dataType === 'errors' && spanData.status?.code !== "STATUS_CODE_ERROR") {
                          shouldInclude = false;
                        } else if (dataType === 'bottlenecks' && duration <= 1000000000) {
                          shouldInclude = false; // Less than 1 second
                        }
                        
                        if (shouldInclude) {
                          scatterData.push({
                            x: duration / 1000000, // Convert to milliseconds
                            y: startTime / 1000000, // Convert to milliseconds
                            service: serviceName,
                            name: spanData.name,
                            status: spanData.status?.code || "STATUS_CODE_OK"
                          });
                        }
                      } catch (spanError) {
                        console.warn('Error processing span for scatter:', spanError, spanData);
                        // Continue processing other spans
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    } catch (error) {
      console.error('Error in extractScatterData:', error);
      return [];
    }
    
    return scatterData;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation Header */}
        <div className="mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              AI Trace Analysis
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Explore and analyze AI agent traces with CopilotKit
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            ) : error ? (
              <AlertCircle className="h-4 w-4 text-red-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            <span className="text-sm font-medium">
              {loading ? "Loading trace data..." : 
               error ? "Error loading data" : 
               "Trace data loaded"}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {aiStatus === 'ready' ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : aiStatus === 'thinking' ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            )}
            <span className="text-sm font-medium">
              AI Assistant: {aiStatus === 'ready' ? 'Ready' : 
                            aiStatus === 'thinking' ? 'Analyzing...' : 'Initializing'}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="font-medium text-red-800 dark:text-red-200">Error</span>
            </div>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File Selector */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Trace Files
                </CardTitle>
                <CardDescription>
                  Select a trace file to analyze
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedFile.path} onValueChange={(value: string) => {
                  const file = traceFiles.find(f => f.path === value);
                  if (file) setSelectedFile(file);
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {traceFiles.map((file) => (
                      <SelectItem key={file.path} value={file.path}>
                        <div className="flex flex-col">
                          <span className="font-medium">{file.name}</span>
                          <span className="text-sm text-gray-500">{file.size}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="mt-4">
                  <h3 className="font-semibold mb-2">{selectedFile.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {selectedFile.description}
                  </p>
                  <Badge variant="secondary">{selectedFile.size}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            {stats && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Trace Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Spans:</span>
                      <Badge variant="outline">{stats.totalSpans}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Services:</span>
                      <Badge variant="outline">{stats.services.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Span Types:</span>
                      <Badge variant="outline">{stats.spanTypes.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Errors:</span>
                      <Badge variant={stats.errors > 0 ? "destructive" : "outline"}>
                        {stats.errors}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Trace Data Display */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Trace Data
                </CardTitle>
                <CardDescription>
                  {loading ? "Loading trace data..." : "Raw trace data for analysis"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                      <span className="text-gray-600 dark:text-gray-400">Loading trace data...</span>
                    </div>
                  </div>
                ) : traceData ? (
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 max-h-96 overflow-auto">
                    <pre className="text-xs text-gray-800 dark:text-gray-200">
                      {JSON.stringify(traceData, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    {error ? "Failed to load trace data" : "No trace data loaded"}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Copilot Integration */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                AI Analysis Assistant
              </CardTitle>
              <CardDescription>
                Ask Copilot about the trace data, performance, errors, or any analysis questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Tool Call Examples */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      🔧 Tool Call Examples (Interactive Analysis)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium text-green-700 dark:text-green-300">"Analyze bottlenecks in this trace"</span>
                      <span className="text-green-600 dark:text-green-400 ml-2">→ Calls analyzeTracePerformance(bottlenecks)</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-green-700 dark:text-green-300">"Show me error analysis"</span>
                      <span className="text-green-600 dark:text-green-400 ml-2">→ Calls analyzeTracePerformance(errors)</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-green-700 dark:text-green-300">"Create timeline analysis"</span>
                      <span className="text-green-600 dark:text-green-400 ml-2">→ Calls analyzeTracePerformance(timeline)</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-green-700 dark:text-green-300">"Analyze service dependencies"</span>
                      <span className="text-green-600 dark:text-green-400 ml-2">→ Calls analyzeTracePerformance(dependencies)</span>
                    </div>
                  </div>
                </div>

                {/* Chart Examples */}
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                      📊 Chart Creation Examples
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium text-purple-700 dark:text-purple-300">"Create a bar chart of span durations"</span>
                      <span className="text-purple-600 dark:text-purple-400 ml-2">→ Calls createChart(bar)</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-purple-700 dark:text-purple-300">"Show me a pie chart of services"</span>
                      <span className="text-purple-600 dark:text-purple-400 ml-2">→ Calls createChart(pie)</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-purple-700 dark:text-purple-300">"Display a line chart of timeline"</span>
                      <span className="text-purple-600 dark:text-purple-400 ml-2">→ Calls createChart(line)</span>
                    </div>
                  </div>
                </div>

                {/* Timeline Chart Examples */}
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
                      ⏱️ Timeline Chart Examples (New!)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium text-indigo-700 dark:text-indigo-300">"Create a Gantt chart of service timeline"</span>
                      <span className="text-indigo-600 dark:text-indigo-400 ml-2">→ Calls createTimelineChart(gantt)</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-indigo-700 dark:text-indigo-300">"Show Gantt chart of only errors"</span>
                      <span className="text-indigo-600 dark:text-indigo-400 ml-2">→ Calls createTimelineChart(gantt, errors)</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-indigo-700 dark:text-indigo-300">"Create scatter plot of duration vs time"</span>
                      <span className="text-indigo-600 dark:text-indigo-400 ml-2">→ Calls createTimelineChart(scatter)</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-indigo-700 dark:text-indigo-300">"Show bottleneck scatter for specific service"</span>
                      <span className="text-indigo-600 dark:text-indigo-400 ml-2">→ Calls createTimelineChart(scatter, bottlenecks, serviceName)</span>
                    </div>
                  </div>
                </div>

                {/* Research Examples */}
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                      🔍 Research Examples (Tavily Search)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium text-orange-700 dark:text-orange-300">"Search for microservice performance best practices"</span>
                      <span className="text-orange-600 dark:text-orange-400 ml-2">→ Calls searchInternet()</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-orange-700 dark:text-orange-300">"Find OpenTelemetry trace visualization tips"</span>
                      <span className="text-orange-600 dark:text-orange-400 ml-2">→ Calls searchInternet()</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-orange-700 dark:text-orange-300">"Search for distributed tracing error patterns"</span>
                      <span className="text-orange-600 dark:text-orange-400 ml-2">→ Calls searchInternet()</span>
                    </div>
                  </div>
                </div>

                {/* General Analysis */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      💬 General Analysis (Text Response)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium text-blue-700 dark:text-blue-300">"What's the average response time for each service?"</span>
                      <span className="text-blue-600 dark:text-blue-400 ml-2">→ Text analysis with statistics</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-blue-700 dark:text-blue-300">"Compare this trace with other files"</span>
                      <span className="text-blue-600 dark:text-blue-400 ml-2">→ Comparative analysis</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-blue-700 dark:text-blue-300">"Identify optimization opportunities"</span>
                      <span className="text-blue-600 dark:text-blue-400 ml-2">→ Recommendations and insights</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Copilot Sidebar */}
      <CopilotSidebar
        instructions={prompt}
        labels={{
          title: "Trace Analysis Assistant",
          initial: "Hello! I'm here to help you analyze AI trace data. I can see you have trace data loaded. What would you like to know about the current trace?",
          placeholder: "Ask about performance, errors, patterns, or analysis...",
        }}
      />
    </div>
  );
}