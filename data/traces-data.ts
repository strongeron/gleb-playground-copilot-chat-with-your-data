export interface TraceFile {
  name: string;
  path: string;
  size: string;
  description: string;
  type: 'langfuse' | 'opentelemetry' | 'custom';
}

export const traceFiles: TraceFile[] = [
  {
    name: "RAG Earnings Agent",
    path: "rag_earnings_agent.json",
    size: "94KB",
    description: "AI agent traces for earnings reports RAG system with OpenTelemetry format",
    type: "opentelemetry"
  },
  {
    name: "Smol Deep Research Agent", 
    path: "smol_deep_research_agent.json",
    size: "246KB",
    description: "Deep research agent with comprehensive trace data in OpenTelemetry format",
    type: "opentelemetry"
  },
  {
    name: "Quo Tav Agent",
    path: "quo_tav_agent.json", 
    size: "2.4MB",
    description: "Large-scale agent traces with Tavily integration in OpenTelemetry format",
    type: "opentelemetry"
  },
  {
    name: "Trace Analysis",
    path: "trace-6c410c665ee8cf1efc9d0e6256f96dd7.json",
    size: "120KB", 
    description: "Detailed trace analysis and debugging data in Langfuse format",
    type: "langfuse"
  }
];

export const getTraceFile = (path: string): TraceFile | undefined => {
  return traceFiles.find(file => file.path === path);
};

export const getTraceFilesByType = (type: TraceFile['type']): TraceFile[] => {
  return traceFiles.filter(file => file.type === type);
};
