"use client";

import Link from "next/link";
import { BarChart3, Activity } from "lucide-react";

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">CopilotKit Demo</h1>
          <p className="text-sm text-gray-500 mt-1">Interactive data visualization with AI assistance</p>
        </div>
        
        <nav className="mt-4 sm:mt-0 flex space-x-4">
          <Link 
            href="/" 
            className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <Link 
            href="/traces" 
            className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
          >
            <Activity className="h-4 w-4" />
            <span>Trace Analysis</span>
          </Link>
        </nav>
      </div>
    </header>
  );
} 