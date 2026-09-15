import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        error: "TAVILY_API_KEY is not configured",
      },
      { status: 500 }
    );
  }

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: "latest Samsung smartphones available in India",
        search_depth: "basic",
        max_results: 5,
        include_answer: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data?.message ?? data?.error ?? "Tavily API request failed",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      query: "latest Samsung smartphones available in India",
      answer: data?.answer ?? null,
      result_count: data?.results?.length ?? 0,
      results: data?.results ?? [],
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}