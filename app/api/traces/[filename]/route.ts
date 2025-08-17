import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const filePath = join(process.cwd(), "[gleb]ideas", "ai-traces-assistant", "demo json files", filename);
    
    const fileContent = readFileSync(filePath, "utf-8");
    const jsonData = JSON.parse(fileContent);
    
    return NextResponse.json(jsonData);
  } catch (error) {
    console.error("Error reading trace file:", error);
    return NextResponse.json(
      { error: "Failed to load trace file" },
      { status: 500 }
    );
  }
} 