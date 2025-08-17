"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { AreaChart } from "./ui/area-chart";
import { BarChart } from "./ui/bar-chart";
import { DonutChart } from "./ui/pie-chart";
import { SearchResults } from "./generative-ui/SearchResults";
import { ChartRenderer } from "./generative-ui/ChartRenderer";
import { 
  salesData, 
  productData, 
  categoryData, 
  regionalData,
  demographicsData,
  calculateTotalRevenue,
  calculateTotalProfit,
  calculateTotalCustomers,
  calculateConversionRate,
  calculateAverageOrderValue,
  calculateProfitMargin
} from "../data/dashboard-data";
import { traceFiles } from "../data/traces-data";
import { FileText, Activity, Database } from "lucide-react";
import { Badge } from "./ui/badge";
import Link from "next/link";
import { Button } from "./ui/button";

export function Dashboard() {
  // Calculate metrics
  const totalRevenue = calculateTotalRevenue();
  const totalProfit = calculateTotalProfit();
  const totalCustomers = calculateTotalCustomers();
  const conversionRate = calculateConversionRate();
  const averageOrderValue = calculateAverageOrderValue();
  const profitMargin = calculateProfitMargin();

  // Make data available to the Copilot
  useCopilotReadable({
    description: "Dashboard data including sales trends, product performance, and category distribution",
    value: {
      salesData,
      productData,
      categoryData,
      regionalData,
      demographicsData,
      metrics: {
        totalRevenue,
        totalProfit,
        totalCustomers,
        conversionRate,
        averageOrderValue,
        profitMargin
      }
    }
  });

  // Define render only search action
  useCopilotAction({
    name: "searchInternet",
    available: "enabled",
    description: "Searches the internet for information.",
    parameters: [
      {
        name: "query",
        type: "string",
        description: "The query to search the internet for.",
        required: true,
      }
    ],
    render: ({args, status}) => {
      return <SearchResults query={args.query || 'No query provided'} status={status} />;
    }
  });

  // Define chart creation action
  useCopilotAction({
    name: "createChart",
    available: "enabled",
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
    render: ({args}) => {
      return (
        <ChartRenderer
          chartType={args.chartType || 'bar'}
          title={args.title || 'Chart'}
          data={args.data || []}
          description={args.description}
        />
      );
    }
  });

  // Color palettes for different charts
  const colors = {
    salesOverview: ["#3b82f6", "#10b981", "#ef4444"],  // Blue, Green, Red
    productPerformance: ["#8b5cf6", "#6366f1", "#4f46e5"],  // Purple spectrum
    categories: ["#3b82f6", "#64748b", "#10b981", "#f59e0b", "#94a3b8"],  // Mixed
    regional: ["#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0"],  // Green spectrum
    demographics: ["#f97316", "#f59e0b", "#eab308", "#facc15", "#fde047"]  // Orange to Yellow
  };
  
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full">
      {/* Key Metrics */}
      <div className="col-span-1 md:col-span-2 lg:col-span-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">Total Revenue</p>
            <p className="text-xl font-semibold text-gray-900">${totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">Total Profit</p>
            <p className="text-xl font-semibold text-gray-900">${totalProfit.toLocaleString()}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">Customers</p>
            <p className="text-xl font-semibold text-gray-900">{totalCustomers.toLocaleString()}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">Conversion Rate</p>
            <p className="text-xl font-semibold text-gray-900">{conversionRate}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">Avg Order Value</p>
            <p className="text-xl font-semibold text-gray-900">${averageOrderValue}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">Profit Margin</p>
            <p className="text-xl font-semibold text-gray-900">{profitMargin}</p>
          </div>
        </div>
      </div>

      {/* Trace Information */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-4">
        <CardHeader className="pb-1 pt-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Database className="h-5 w-5" />
            Available Trace Files
          </CardTitle>
          <CardDescription className="text-xs">AI agent traces for analysis and debugging</CardDescription>
        </CardHeader>
        <CardContent className="p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {traceFiles.map((trace) => (
              <div key={trace.path} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <h3 className="font-medium text-sm">{trace.name}</h3>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {trace.type}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  {trace.description}
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {trace.size}
                  </Badge>
                  <Link href={`/traces?file=${trace.path}`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      Analyze
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link href="/traces">
              <Button variant="default" className="w-full">
                <Activity className="h-4 w-4 mr-2" />
                Go to Trace Analysis
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-4">
        <CardHeader className="pb-1 pt-3">
          <CardTitle className="text-base font-medium">Sales Overview</CardTitle>
          <CardDescription className="text-xs">Monthly sales and profit data</CardDescription>
        </CardHeader>
        <CardContent className="p-3">
          <div className="h-60">
            <AreaChart
              data={salesData}
              index="date"
              categories={["Sales", "Profit", "Expenses"]}
              colors={colors.salesOverview}
              valueFormatter={(value) => `$${value.toLocaleString()}`}
              showLegend={true}
              showGrid={true}
              showXAxis={true}
              showYAxis={true}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-1 lg:col-span-2">
        <CardHeader className="pb-1 pt-3">
          <CardTitle className="text-base font-medium">Product Performance</CardTitle>
          <CardDescription className="text-xs">Top selling products</CardDescription>
        </CardHeader>
        <CardContent className="p-3">
          <div className="h-60">
            <BarChart
              data={productData}
              index="name"
              categories={["sales"]}
              colors={colors.productPerformance}
              valueFormatter={(value) => `$${value.toLocaleString()}`}
              showLegend={false}
              showGrid={true}
              layout="horizontal"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-1 lg:col-span-2">
        <CardHeader className="pb-1 pt-3">
          <CardTitle className="text-base font-medium">Sales by Category</CardTitle>
          <CardDescription className="text-xs">Distribution across categories</CardDescription>
        </CardHeader>
        <CardContent className="p-3">
          <div className="h-60">
            <DonutChart
              data={categoryData}
              category="value"
              index="name"
              valueFormatter={(value) => `${value}%`}
              colors={colors.categories}
              centerText="Categories"
              paddingAngle={0}
              showLabel={false}
              showLegend={true}
              innerRadius={45}
              outerRadius="90%"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-1 lg:col-span-2">
        <CardHeader className="pb-1 pt-3">
          <CardTitle className="text-base font-medium">Regional Sales</CardTitle>
          <CardDescription className="text-xs">Sales by geographic region</CardDescription>
        </CardHeader>
        <CardContent className="p-3">
          <div className="h-60">
            <BarChart
              data={regionalData}
              index="region"
              categories={["sales"]}
              colors={colors.regional}
              valueFormatter={(value) => `$${value.toLocaleString()}`}
              showLegend={false}
              showGrid={true}
              layout="horizontal"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-1 lg:col-span-2">
        <CardHeader className="pb-1 pt-3">
          <CardTitle className="text-base font-medium">Customer Demographics</CardTitle>
          <CardDescription className="text-xs">Spending by age group</CardDescription>
        </CardHeader>
        <CardContent className="p-3">
          <div className="h-60">
            <BarChart
              data={demographicsData}
              index="ageGroup"
              categories={["spending"]}
              colors={colors.demographics}
              valueFormatter={(value) => `$${value}`}
              showLegend={false}
              showGrid={true}
              layout="horizontal"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 