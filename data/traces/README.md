# AI Trace Data

This directory contains AI agent trace files for analysis and debugging purposes.

## Available Trace Files

### 1. RAG Earnings Agent (`rag_earnings_agent.json`)
- **Size**: 94KB
- **Format**: OpenTelemetry
- **Description**: AI agent traces for earnings reports RAG system
- **Use Case**: Analyze RAG system performance and retrieval patterns

### 2. Smol Deep Research Agent (`smol_deep_research_agent.json`)
- **Size**: 246KB
- **Format**: OpenTelemetry
- **Description**: Deep research agent with comprehensive trace data
- **Use Case**: Research workflow analysis and optimization

### 3. Quo Tav Agent (`quo_tav_agent.json`)
- **Size**: 2.4MB
- **Format**: OpenTelemetry
- **Description**: Large-scale agent traces with Tavily integration
- **Use Case**: Large-scale agent performance analysis

### 4. Trace Analysis (`trace-6c410c665ee8cf1efc9d0e6256f96dd7.json`)
- **Size**: 120KB
- **Format**: Langfuse
- **Description**: Detailed trace analysis and debugging data
- **Use Case**: Debugging and performance analysis

## Data Formats

### OpenTelemetry Format
- Standard format for distributed tracing
- Contains resource spans, scope spans, and individual spans
- Includes timing, status, and metadata information
- Compatible with observability platforms

### Langfuse Format
- Langfuse-specific trace format
- Contains trace metadata, observations, and scores
- Includes cost and usage analytics
- Useful for LLM application monitoring

## Usage

These trace files are used by the application to:

1. **Analyze Performance**: Identify bottlenecks and optimization opportunities
2. **Debug Issues**: Trace through execution paths and identify errors
3. **Monitor Costs**: Track API usage and costs for LLM operations
4. **Understand Workflows**: Visualize agent execution patterns and dependencies

## API Endpoints

- `GET /api/traces/[filename]` - Retrieve trace data by filename
- Files are served from this directory via the Next.js API routes

## Analysis Features

The application provides several analysis capabilities:

- **Bottleneck Analysis**: Identify slow operations and performance issues
- **Error Analysis**: Track and categorize errors across services
- **Timeline Analysis**: Visualize execution flow and timing
- **Dependency Analysis**: Map service dependencies and relationships
- **Chart Generation**: Create visualizations for various metrics

## Integration

These traces are integrated with:

- **CopilotKit**: AI-powered analysis and insights
- **Chart Components**: Interactive data visualization
- **Dashboard**: Overview and navigation to detailed analysis
- **Search**: Internet research capabilities for context and best practices
