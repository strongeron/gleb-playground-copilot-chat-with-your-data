# Charts & Graphs in CopilotKit Chat

## Overview

CopilotKit provides powerful capabilities to render interactive charts, graphs, and data visualizations directly within the chat interface. This is achieved through **Generative UI** using the `useCopilotAction` hook, which allows the AI to dynamically create and display custom components.

## 🎯 How It Works

### Core Mechanism: `useCopilotAction` with `render`

The key to rendering charts in chat is the `render` property of `useCopilotAction`:

```typescript
useCopilotAction({
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
    }
  ],
  render: ({args, status}) => {
    return (
      <ChartRenderer
        chartType={args?.chartType || 'bar'}
        title={args?.title || 'Chart'}
        data={args?.data || []}
      />
    );
  }
});
```

## 📊 Chart Types You Can Render

### 1. **Bar Charts**
- **Use Case**: Comparing categories, showing rankings
- **Data Format**: `{name: string, value: number}[]`
- **Example**: Product performance, regional sales, user metrics

```typescript
// Example bar chart data
const barData = [
  { name: "Product A", sales: 1200 },
  { name: "Product B", sales: 800 },
  { name: "Product C", sales: 1500 }
];
```

### 2. **Line Charts**
- **Use Case**: Time series data, trends over time
- **Data Format**: `{date: string, value: number}[]`
- **Example**: Sales trends, user growth, performance metrics

```typescript
// Example line chart data
const lineData = [
  { date: "Jan", value: 100 },
  { date: "Feb", value: 120 },
  { date: "Mar", value: 90 }
];
```

### 3. **Area Charts**
- **Use Case**: Cumulative data, filled trends
- **Data Format**: `{date: string, value: number, category: string}[]`
- **Example**: Revenue over time, stacked metrics

```typescript
// Example area chart data
const areaData = [
  { date: "Jan", Sales: 1000, Profit: 800 },
  { date: "Feb", Sales: 1200, Profit: 950 },
  { date: "Mar", Sales: 1100, Profit: 900 }
];
```

### 4. **Pie/Donut Charts**
- **Use Case**: Part-to-whole relationships, percentages
- **Data Format**: `{name: string, value: number}[]`
- **Example**: Market share, category distribution, user segments

```typescript
// Example pie chart data
const pieData = [
  { name: "Desktop", value: 45 },
  { name: "Mobile", value: 35 },
  { name: "Tablet", value: 20 }
];
```

### 5. **Scatter Plots**
- **Use Case**: Correlation analysis, distribution patterns
- **Data Format**: `{x: number, y: number, category?: string}[]`
- **Example**: User behavior analysis, performance correlation

```typescript
// Example scatter plot data
const scatterData = [
  { x: 10, y: 20, category: "Group A" },
  { x: 15, y: 25, category: "Group B" },
  { x: 20, y: 30, category: "Group A" }
];
```

## 🛠️ Implementation Examples

### Basic Chart Action

```typescript
import { useCopilotAction } from "@copilotkit/react-core";
import { ChartRenderer } from "./ChartRenderer";

export function YourComponent() {
  useCopilotAction({
    name: "createChart",
    description: "Creates a chart visualization based on data analysis.",
    parameters: [
      {
        name: "chartType",
        type: "string",
        description: "The type of chart to create (bar, line, pie, area, scatter)",
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
    render: ({args}) => {
      return (
        <ChartRenderer
          chartType={args?.chartType || 'bar'}
          title={args?.title || 'Chart'}
          data={args?.data || []}
          description={args?.description}
        />
      );
    }
  });

  return <div>Your component content</div>;
}
```

### Advanced Chart with Status Handling

```typescript
useCopilotAction({
  name: "analyzeDataAndChart",
  description: "Analyzes data and creates an appropriate visualization.",
  parameters: [
    {
      name: "analysisType",
      type: "string",
      description: "Type of analysis (trends, comparison, distribution)",
      required: true,
    },
    {
      name: "data",
      type: "object",
      description: "Data to analyze and visualize",
      required: true,
    }
  ],
  render: ({args, status}) => {
    if (status === 'inProgress') {
      return <div>Analyzing data...</div>;
    }

    const { analysisType, data } = args;
    
    // Determine chart type based on analysis
    let chartType = 'bar';
    let processedData = data;
    
    switch (analysisType) {
      case 'trends':
        chartType = 'line';
        processedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'comparison':
        chartType = 'bar';
        break;
      case 'distribution':
        chartType = 'pie';
        break;
    }

    return (
      <div>
        <h3>Analysis: {analysisType}</h3>
        <ChartRenderer
          chartType={chartType}
          title={`${analysisType} Analysis`}
          data={processedData}
        />
      </div>
    );
  }
});
```

## 🎨 Chart Libraries Integration

### Recharts (Recommended)
```typescript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const ChartRenderer = ({ chartType, title, data, description }) => {
  switch (chartType) {
    case 'bar':
      return (
        <div>
          <h3>{title}</h3>
          <BarChart width={600} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
          {description && <p>{description}</p>}
        </div>
      );
    // Add other chart types...
  }
};
```

### Chart.js
```typescript
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ChartRenderer = ({ chartType, title, data, description }) => {
  if (chartType === 'bar') {
    const chartData = {
      labels: data.map(item => item.name),
      datasets: [{
        label: title,
        data: data.map(item => item.value),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      }],
    };

    return (
      <div>
        <h3>{title}</h3>
        <Bar data={chartData} />
        {description && <p>{description}</p>}
      </div>
    );
  }
};
```

### D3.js (Advanced)
```typescript
import * as d3 from 'd3';

const ChartRenderer = ({ chartType, title, data, description }) => {
  useEffect(() => {
    if (chartType === 'bar') {
      // D3 implementation
      const svg = d3.select('#chart-container');
      // ... D3 chart code
    }
  }, [chartType, data]);

  return (
    <div>
      <h3>{title}</h3>
      <div id="chart-container"></div>
      {description && <p>{description}</p>}
    </div>
  );
};
```

## 🔄 Dynamic Chart Generation

### AI-Powered Chart Selection

```typescript
useCopilotAction({
  name: "smartChartCreation",
  description: "Intelligently creates the best chart type for the given data.",
  parameters: [
    {
      name: "data",
      type: "object",
      description: "Data to visualize",
      required: true,
    },
    {
      name: "insight",
      type: "string",
      description: "What insight the user wants to see",
      required: true,
    }
  ],
  render: ({args}) => {
    const { data, insight } = args;
    
    // AI determines best chart type
    let chartType = 'bar';
    let chartTitle = 'Data Visualization';
    
    if (insight.includes('trend') || insight.includes('over time')) {
      chartType = 'line';
      chartTitle = 'Trend Analysis';
    } else if (insight.includes('compare') || insight.includes('ranking')) {
      chartType = 'bar';
      chartTitle = 'Comparison Chart';
    } else if (insight.includes('distribution') || insight.includes('percentage')) {
      chartType = 'pie';
      chartTitle = 'Distribution Chart';
    }

    return (
      <ChartRenderer
        chartType={chartType}
        title={chartTitle}
        data={data}
        description={`AI-generated ${chartType} chart for: ${insight}`}
      />
    );
  }
});
```

## 📱 Responsive Charts

### Mobile-First Chart Design

```typescript
const ChartRenderer = ({ chartType, title, data, description }) => {
  const [dimensions, setDimensions] = useState({ width: 300, height: 200 });

  useEffect(() => {
    const updateDimensions = () => {
      const isMobile = window.innerWidth < 768;
      setDimensions({
        width: isMobile ? 300 : 600,
        height: isMobile ? 200 : 300
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      <div className="chart-wrapper">
        {/* Render chart with responsive dimensions */}
        <ResponsiveChart
          chartType={chartType}
          data={data}
          width={dimensions.width}
          height={dimensions.height}
        />
      </div>
      {description && <p className="chart-description">{description}</p>}
    </div>
  );
};
```

## 🎯 Real-World Use Cases

### 1. **Business Analytics Dashboard**
```typescript
// User asks: "Show me sales performance by region"
useCopilotAction({
  name: "salesAnalytics",
  description: "Creates sales performance visualizations",
  parameters: [
    {
      name: "metric",
      type: "string",
      description: "Sales metric to visualize (revenue, units, growth)",
      required: true,
    },
    {
      name: "groupBy",
      type: "string", 
      description: "Grouping dimension (region, product, time)",
      required: true,
    }
  ],
  render: ({args}) => {
    // Generate appropriate chart based on parameters
    return <SalesChart metric={args.metric} groupBy={args.groupBy} />;
  }
});
```

### 2. **User Behavior Analysis**
```typescript
// User asks: "Show me user engagement patterns"
useCopilotAction({
  name: "userEngagement",
  description: "Analyzes and visualizes user engagement data",
  parameters: [
    {
      name: "timeframe",
      type: "string",
      description: "Analysis timeframe (daily, weekly, monthly)",
      required: true,
    }
  ],
  render: ({args}) => {
    return <EngagementChart timeframe={args.timeframe} />;
  }
});
```

### 3. **Performance Monitoring**
```typescript
// User asks: "Create a performance dashboard"
useCopilotAction({
  name: "performanceDashboard",
  description: "Creates comprehensive performance visualizations",
  parameters: [
    {
      name: "metrics",
      type: "array",
      description: "Performance metrics to include",
      required: true,
    }
  ],
  render: ({args}) => {
    return <PerformanceDashboard metrics={args.metrics} />;
  }
});
```

## 🚀 Best Practices

### 1. **Data Validation**
```typescript
const validateChartData = (data, chartType) => {
  if (!Array.isArray(data) || data.length === 0) {
    return { isValid: false, error: "No data provided" };
  }

  switch (chartType) {
    case 'line':
      return data.every(item => item.date && typeof item.value === 'number');
    case 'bar':
      return data.every(item => item.name && typeof item.value === 'number');
    case 'pie':
      return data.every(item => item.name && typeof item.value === 'number');
    default:
      return { isValid: true };
  }
};
```

### 2. **Error Handling**
```typescript
const ChartRenderer = ({ chartType, title, data, description }) => {
  const validation = validateChartData(data, chartType);
  
  if (!validation.isValid) {
    return (
      <div className="chart-error">
        <p>❌ Chart Error: {validation.error}</p>
        <p>Please provide valid data for a {chartType} chart.</p>
      </div>
    );
  }

  // Render chart...
};
```

### 3. **Loading States**
```typescript
const ChartRenderer = ({ chartType, title, data, description, status }) => {
  if (status === 'inProgress') {
    return (
      <div className="chart-loading">
        <div className="spinner"></div>
        <p>Generating {chartType} chart...</p>
      </div>
    );
  }

  // Render chart...
};
```

## 🔧 Advanced Features

### Interactive Charts
```typescript
const InteractiveChart = ({ data, onDataPointClick }) => {
  const handleClick = (dataPoint) => {
    onDataPointClick(dataPoint);
  };

  return (
    <BarChart data={data} onClick={handleClick}>
      {/* Chart configuration */}
    </BarChart>
  );
};
```

### Real-time Updates
```typescript
const LiveChart = ({ data, updateInterval = 5000 }) => {
  const [liveData, setLiveData] = useState(data);

  useEffect(() => {
    const interval = setInterval(() => {
      // Update data from API or WebSocket
      fetchLatestData().then(setLiveData);
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  return <ChartRenderer data={liveData} />;
};
```

## 📚 Resources

- **Recharts**: [https://recharts.org/](https://recharts.org/)
- **Chart.js**: [https://www.chartjs.org/](https://www.chartjs.org/)
- **D3.js**: [https://d3js.org/](https://d3js.org/)
- **CopilotKit Documentation**: [https://docs.copilotkit.ai/](https://docs.copilotkit.ai/)

## 🎉 Conclusion

CopilotKit's Generative UI capabilities make it possible to create rich, interactive data visualizations directly within chat conversations. By leveraging `useCopilotAction` with the `render` property, you can build sophisticated chart systems that respond intelligently to user requests and provide meaningful insights through visual representation.

The key is to design your chart actions with clear parameters, implement robust data validation, and create responsive, accessible visualizations that enhance the user experience.
