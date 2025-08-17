import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from '@copilotkit/runtime';
import { tavily } from '@tavily/core';
import { NextRequest } from 'next/server';

const serviceAdapter = new OpenAIAdapter({});
const runtime = new CopilotRuntime({
  actions: () => {
    return [
      {
        name: "searchInternet",
        description: "Searches the internet for information.",
        parameters: [
          {
            name: "query",
            type: "string",
            description: "The query to search the internet for.",
            required: true,
          },
        ],
        handler: async ({query}: {query: string}) => {
          // can safely reference sensitive information like environment variables
          const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
          return await tvly.search(query, {max_results: 5});
        },
      },
      {
        name: "createChart",
        description: "Creates a chart visualization based on data analysis.",
        parameters: [
          {
            name: "chartType",
            type: "string",
            description: "The type of chart to create (bar, line, pie, area)",
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
        handler: async ({chartType, title, data, description}: {
          chartType: string;
          title: string;
          data: any;
          description?: string;
        }) => {
          return {
            chartType,
            title,
            data,
            description,
            timestamp: new Date().toISOString()
          };
        },
      },
      {
        name: "analyzeTracePerformance",
        description: "Analyzes trace data and creates performance visualizations.",
        parameters: [
          {
            name: "analysisType",
            type: "string",
            description: "Type of analysis (bottlenecks, errors, timeline, dependencies)",
            required: true,
          },
          {
            name: "traceData",
            type: "object",
            description: "The trace data to analyze",
            required: true,
          },
        ],
        handler: async ({analysisType, traceData}: {
          analysisType: string;
          traceData: any;
        }) => {
          // Analyze trace data based on type
          let analysis = {};
          
          switch (analysisType) {
            case "bottlenecks":
              analysis = analyzeBottlenecks(traceData);
              break;
            case "errors":
              analysis = analyzeErrors(traceData);
              break;
            case "timeline":
              analysis = analyzeTimeline(traceData);
              break;
            case "dependencies":
              analysis = analyzeDependencies(traceData);
              break;
          }
          
          return {
            analysisType,
            analysis,
            timestamp: new Date().toISOString()
          };
        },
      },
    ]
  }
});

// Helper functions for trace analysis
function analyzeBottlenecks(traceData: any) {
  const bottlenecks = [];
  
  if (traceData && Array.isArray(traceData)) {
    traceData.forEach((resourceSpan: any) => {
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
                      service: span.resource?.attributes?.find((attr: any) => attr.key === "service.name")?.value?.stringValue || "Unknown"
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
}

function analyzeErrors(traceData: any) {
  const errors = [];
  
  if (traceData && Array.isArray(traceData)) {
    traceData.forEach((resourceSpan: any) => {
      if (resourceSpan.resourceSpans) {
        resourceSpan.resourceSpans.forEach((span: any) => {
          if (span.scopeSpans) {
            span.scopeSpans.forEach((scopeSpan: any) => {
              if (scopeSpan.spans) {
                scopeSpan.spans.forEach((spanData: any) => {
                  if (spanData.status?.code === "STATUS_CODE_ERROR") {
                    errors.push({
                      name: spanData.name,
                      service: span.resource?.attributes?.find((attr: any) => attr.key === "service.name")?.value?.stringValue || "Unknown",
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
}

function analyzeTimeline(traceData: any) {
  const timeline = [];
  
  if (traceData && Array.isArray(traceData)) {
    traceData.forEach((resourceSpan: any) => {
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
                    service: span.resource?.attributes?.find((attr: any) => attr.key === "service.name")?.value?.stringValue || "Unknown"
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
}

function analyzeDependencies(traceData: any) {
  const dependencies = new Map();
  
  if (traceData && Array.isArray(traceData)) {
    traceData.forEach((resourceSpan: any) => {
      if (resourceSpan.resourceSpans) {
        resourceSpan.resourceSpans.forEach((span: any) => {
          const serviceName = span.resource?.attributes?.find((attr: any) => attr.key === "service.name")?.value?.stringValue || "Unknown";
          
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
                    const parentService = findServiceBySpanId(traceData, spanData.parentSpanId);
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
}

function findServiceBySpanId(traceData: any, spanId: string): string | null {
  for (const resourceSpan of traceData) {
    if (resourceSpan.resourceSpans) {
      for (const span of resourceSpan.resourceSpans) {
        if (span.scopeSpans) {
          for (const scopeSpan of span.scopeSpans) {
            if (scopeSpan.spans) {
              for (const spanData of scopeSpan.spans) {
                if (spanData.spanId === spanId) {
                  return span.resource?.attributes?.find((attr: any) => attr.key === "service.name")?.value?.stringValue || "Unknown";
                }
              }
            }
          }
        }
      }
    }
  }
  return null;
}

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: '/api/copilotkit',
  });

  return handleRequest(req);
};