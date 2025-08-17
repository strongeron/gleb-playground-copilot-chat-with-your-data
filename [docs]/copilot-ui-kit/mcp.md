Vibe Coding
Use our MCP server to connect your Mastra agents to CopilotKit.

Overview

The CopilotKit MCP server equips AI coding agents with deep knowledge about CopilotKit's APIs, patterns, and best practices. When connected to your development environment, it enables AI assistants to:

Provide expert guidance
Generate accurate code
Give your AI agents a user interface
Help you implement CopilotKit features correctly
Powered by 🪄 Tadata - The platform for instantly building and hosting MCP servers.
Cursor

Cursor is an AI-powered code editor built for productivity. It features built-in AI assistance and supports MCP for extending AI capabilities with external tools.

Open MCP Settings in Cursor

Press Shift+Command+J (Mac) or Shift+Ctrl+J (Windows/Linux) to open Cursor's settings.
Look for "MCP Tools" in the left sidebar categories.
Click "+ New MCP Server". This will open the mcp.json file in the editor, which you need to edit.
Add MCP Server to Cursor

Copy CopilotKit MCP's configuration and paste it under the mcpServers key in the mcp.json file.

HTTP

{
  "mcpServers": {
    "CopilotKit MCP": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://mcp.copilotkit.ai"
      ]
    }
  }
}


SSE 
{
  "mcpServers": {
    "CopilotKit MCP": {
      "url": "https://mcp.copilotkit.ai/sse"
    }
  }
}