import { NextResponse } from "next/server";

import { fetchPaper } from "../../../lib/arxiv";

const SYSTEM_PROMPT = `You are a research paper summarizer. Given a paper abstract, return ONLY a valid JSON object with exactly these fields:
{
  problem: string (what problem does this paper solve, 2 sentences max),
  method: string (what approach or technique did they use, 2 sentences max),
  results: string (what were the key findings or results, 2 sentences max),
  limitations: string (what are the limitations or future work, 2 sentences max),
  score: number (should I read this, score from 1 to 10),
  score_reason: string (one sentence explaining the score)
}
Return only the JSON object. No markdown, no explanation, no extra text.`;

function isArxivUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.hostname === "arxiv.org" || parsed.hostname === "www.arxiv.org";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  let url = "";

  try {
    const body = (await request.json()) as { url?: string };
    url = body.url?.trim() ?? "";
    console.log("[digest] URL received:", url);
  } catch (error) {
    console.log(
      "[digest] Error parsing request body:",
      error instanceof Error ? error.message : String(error)
    );
    url = "";
  }

  if (!url) {
    return NextResponse.json(
      { error: "arXiv URL is required" },
      { status: 400 }
    );
  }

  if (!isArxivUrl(url)) {
    return NextResponse.json({ error: "Invalid arXiv URL" }, { status: 400 });
  }

  try {
    const { title, abstract } = await fetchPaper(url);
    const groqApiKey = process.env.GROQ_API_KEY;
    const groqPayload = {
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: "Summarize this abstract: " + abstract,
        },
      ],
    };

    console.log("[digest] Parsed title:", title);
    console.log("[digest] Parsed abstract:", abstract);
    console.log("[digest] Sending to Groq:", groqPayload);

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify(groqPayload),
    });

    const groqData = (await groqResponse.json()) as {
      error?: { message?: string };
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
    };

    console.log("[digest] Raw Groq response:", groqData);

    if (!groqResponse.ok) {
      throw new Error(groqData.error?.message || "Failed to generate digest");
    }

    const rawContent = groqData.choices?.[0]?.message?.content ?? "";
    const firstBraceIndex = rawContent.indexOf("{");
    const lastBraceIndex = rawContent.lastIndexOf("}");
    const extractedJson =
      firstBraceIndex !== -1 && lastBraceIndex !== -1 && lastBraceIndex > firstBraceIndex
        ? rawContent.slice(firstBraceIndex, lastBraceIndex + 1)
        : rawContent;

    let parsedResponse: {
      problem: string;
      method: string;
      results: string;
      limitations: string;
      score: number;
      score_reason: string;
    };

    try {
      parsedResponse = JSON.parse(extractedJson) as typeof parsedResponse;
    } catch (error) {
      console.log(
        "[digest] Error parsing AI response:",
        error instanceof Error ? error.message : String(error)
      );
      console.log("[digest] Raw AI response text:", rawContent);
      return NextResponse.json(
        { error: `Failed to parse AI response: ${rawContent}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      title,
      problem: parsedResponse.problem,
      method: parsedResponse.method,
      results: parsedResponse.results,
      limitations: parsedResponse.limitations,
      score: parsedResponse.score,
      score_reason: parsedResponse.score_reason,
    });
  } catch (error) {
    console.log(
      "[digest] Error in POST handler:",
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
