"use client";

import { CopilotSidebar } from "@copilotkit/react-ui";
import { Dashboard } from "../../components/Dashboard";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { CustomAssistantMessage } from "../../components/AssistantMessage";
import { prompt } from "../../lib/prompt";
import { useCopilotReadable } from "@copilotkit/react-core";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  useCopilotReadable({
    description: "Current time",
    value: new Date().toLocaleTimeString(),
  })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex-grow">
        {/* Navigation back to traces */}
        <div className="mb-6">
          <Link href="/traces">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Trace Analysis
            </Button>
          </Link>
        </div>
        
        <Dashboard />
      </main>
      <Footer />
      <CopilotSidebar
        instructions={prompt}
        AssistantMessage={CustomAssistantMessage}
        labels={{
          title: "Data Assistant",
          initial: "Hello, I'm here to help you understand your data. How can I help?",
          placeholder: "Ask about sales, trends, or metrics...",
        }}
      />
    </div>
  );
}
