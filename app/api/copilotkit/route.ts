import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from '@copilotkit/runtime';
import { tavily } from '@tavily/core';
import { NextRequest } from 'next/server';

const serviceAdapter = new OpenAIAdapter({});

const runtime = new CopilotRuntime({
  actions: ({properties, url}) => {
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
            default:
              analysis = { error: "Unknown analysis type" };
          }
          
          return {
            analysisType,
            analysis,
            timestamp: new Date().toISOString()
          };
        },
      },
      {
        name: "createTimelineChart",
        description: "Creates timeline-based charts (Gantt, Scatter) for trace analysis.",
        parameters: [
          {
            name: "chartType",
            type: "string",
            description: "The type of timeline chart (gantt, scatter)",
            required: true,
          },
          {
            name: "title",
            type: "string",
            description: "The title of the chart",
            required: true,
          },
          {
            name: "dataType",
            type: "string",
            description: "Type of data to extract (operations, services, errors)",
            required: true,
          },
          {
            name: "serviceFilter",
            type: "string",
            description: "Optional service name to filter by",
            required: false,
          },
        ],
        handler: async ({chartType, title, dataType, serviceFilter}: {
          chartType: string;
          title: string;
          dataType: string;
          serviceFilter?: string;
        }) => {
          return {
            chartType,
            title,
            dataType,
            serviceFilter,
            timestamp: new Date().toISOString()
          };
        },
      },
      {
        name: "showFullPageChart",
        description: "Shows a full-page chart view for maximum visibility.",
        parameters: [
          {
            name: "chartType",
            type: "string",
            description: "The type of chart to display (gantt, scatter, bar, line, pie, area)",
            required: true,
          },
          {
            name: "title",
            type: "string",
            description: "The title of the chart",
            required: true,
          },
          {
            name: "dataType",
            type: "string",
            description: "Type of data to extract (operations, services, errors)",
            required: true,
          },
          {
            name: "serviceFilter",
            type: "string",
            description: "Optional service name to filter by",
            required: false,
          },
        ],
        handler: async ({chartType, title, dataType, serviceFilter}: {
          chartType: string;
          title: string;
          dataType: string;
          serviceFilter?: string;
        }) => {
          return {
            chartType,
            title,
            dataType,
            serviceFilter,
            timestamp: new Date().toISOString()
          };
        },
      }
    ] as any;
  },
});

// Helper functions for trace analysis
function analyzeBottlenecks(traceData: any) {
  if (!traceData || !Array.isArray(traceData)) {
    return { totalBottlenecks: 0, bottlenecks: [] };
  }

  const bottlenecks: any[] = [];
  const threshold = 1000; // 1 second threshold

  traceData.forEach((resourceSpan: any) => {
    if (resourceSpan.resourceSpans) {
      resourceSpan.resourceSpans.forEach((span: any) => {
        if (span.spans) {
          span.spans.forEach((operation: any) => {
            const duration = operation.endTimeUnixNano - operation.startTimeUnixNano;
            if (duration > threshold * 1000000) { // Convert to nanoseconds
              bottlenecks.push({
                name: operation.name || 'Unknown Operation',
                duration: duration / 1000000, // Convert back to milliseconds
                service: span.resource?.attributes?.['service.name'] || 'Unknown Service',
                startTime: operation.startTimeUnixNano,
                endTime: operation.endTimeUnixNano
              });
            }
          });
        }
      });
    }
  });

  // Sort by duration descending
  bottlenecks.sort((a, b) => b.duration - a.duration);

  return {
    totalBottlenecks: bottlenecks.length,
    bottlenecks: bottlenecks.slice(0, 10) // Top 10 bottlenecks
  };
}

function analyzeErrors(traceData: any) {
  if (!traceData || !Array.isArray(traceData)) {
    return { totalErrors: 0, errors: [], errorByService: {} };
  }

  const errors: any[] = [];
  const errorByService: Record<string, number> = {};

  traceData.forEach((resourceSpan: any) => {
    if (resourceSpan.resourceSpans) {
      resourceSpan.resourceSpans.forEach((span: any) => {
        if (span.spans) {
          span.spans.forEach((operation: any) => {
            if (operation.status?.code === 2) { // Error status
              const serviceName = span.resource?.attributes?.['service.name'] || 'Unknown Service';
              errors.push({
                name: operation.name || 'Unknown Operation',
                service: serviceName,
                message: operation.status?.message || 'Unknown error',
                startTime: operation.startTimeUnixNano,
                endTime: operation.endTimeUnixNano
              });
              
              errorByService[serviceName] = (errorByService[serviceName] || 0) + 1;
            }
          });
        }
      });
    }
  });

  return {
    totalErrors: errors.length,
    errors: errors.slice(0, 10), // Top 10 errors
    errorByService
  };
}

function analyzeTimeline(traceData: any) {
  if (!traceData || !Array.isArray(traceData)) {
    return { totalOperations: 0, timeline: [], timeRange: { start: 0, end: 0 } };
  }

  const timeline: any[] = [];
  let minTime = Infinity;
  let maxTime = -Infinity;

  traceData.forEach((resourceSpan: any) => {
    if (resourceSpan.resourceSpans) {
      resourceSpan.resourceSpans.forEach((span: any) => {
        if (span.spans) {
          span.spans.forEach((operation: any) => {
            const startTime = operation.startTimeUnixNano;
            const endTime = operation.endTimeUnixNano;
            const duration = endTime - startTime;
            
            timeline.push({
              name: operation.name || 'Unknown Operation',
              service: span.resource?.attributes?.['service.name'] || 'Unknown Service',
              startTime,
              endTime,
              duration: duration / 1000000, // Convert to milliseconds
              status: operation.status?.code === 2 ? 'error' : 'success'
            });
            
            minTime = Math.min(minTime, startTime);
            maxTime = Math.max(maxTime, endTime);
          });
        }
      });
    }
  });

  // Sort by start time
  timeline.sort((a, b) => a.startTime - b.startTime);

  return {
    totalOperations: timeline.length,
    timeline: timeline.slice(0, 50), // First 50 operations
    timeRange: { start: minTime, end: maxTime }
  };
}

function analyzeDependencies(traceData: any) {
  if (!traceData || !Array.isArray(traceData)) {
    return { totalServices: 0, dependencies: [], serviceCallCount: {} };
  }

  const dependencies: any[] = [];
  const serviceCallCount: Record<string, number> = {};
  const serviceMap = new Map();

  traceData.forEach((resourceSpan: any) => {
    if (resourceSpan.resourceSpans) {
      resourceSpan.resourceSpans.forEach((span: any) => {
        const serviceName = span.resource?.attributes?.['service.name'] || 'Unknown Service';
        serviceCallCount[serviceName] = (serviceCallCount[serviceName] || 0) + 1;
        
        if (span.spans) {
          span.spans.forEach((operation: any) => {
            // Look for parent-child relationships
            if (operation.parentSpanId) {
              dependencies.push({
                from: 'Parent Operation',
                to: operation.name || 'Unknown Operation',
                service: serviceName,
                type: 'parent-child'
              });
            }
          });
        }
      });
    }
  });

  return {
    totalServices: Object.keys(serviceCallCount).length,
    dependencies: dependencies.slice(0, 20), // Top 20 dependencies
    serviceCallCount
  };
}

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: '/api/copilotkit',
  });

  return handleRequest(req);
};