import { XMLParser } from "fast-xml-parser";

type ArxivEntry = {
  title?: string;
  summary?: string;
};

type ArxivFeed = {
  feed?: {
    entry?: ArxivEntry | ArxivEntry[];
  };
};

const ARXIV_URL_PATTERN =
  /^https:\/\/arxiv\.org\/(?:abs|pdf)\/([a-z\-]+(?:\.[A-Z]{2})?\/\d{7}|\d{4}\.\d{4,5})(v\d+)?(?:\.pdf)?\/?$/i;

function extractPaperId(url: string): string {
  console.log("[fetchPaper] URL received:", url);
  const match = url.match(ARXIV_URL_PATTERN);

  if (!match) {
    throw new Error("Invalid arXiv URL");
  }

  const paperId = `${match[1]}${match[2] ?? ""}`;
  console.log("[fetchPaper] Extracted paper ID:", paperId);
  return paperId;
}

function cleanText(value: string | undefined): string {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

export async function fetchPaper(
  url: string
): Promise<{ title: string; abstract: string }> {
  console.log("[fetchPaper] Starting fetchPaper for URL:", url);
  const paperId = extractPaperId(url);
  const apiUrl = `https://export.arxiv.org/api/query?id_list=${encodeURIComponent(
    paperId
  )}`;

  let response: Response;

  try {
    response = await fetch(apiUrl, {
      headers: {
        Accept: "application/atom+xml, application/xml, text/xml",
      },
      cache: "no-store",
    });
    console.log("[fetchPaper] arXiv API response status:", response.status);
  } catch (error) {
    console.log(
      "[fetchPaper] Error fetching from arXiv API:",
      error instanceof Error ? error.message : String(error)
    );
    throw new Error("arXiv API is currently unavailable");
  }

  if (!response.ok) {
    throw new Error("arXiv API is currently unavailable");
  }

  let xml: string;

  try {
    xml = await response.text();
    console.log("[fetchPaper] Raw XML response:", xml);
  } catch (error) {
    console.log(
      "[fetchPaper] Error reading arXiv API response body:",
      error instanceof Error ? error.message : String(error)
    );
    throw new Error("arXiv API is currently unavailable");
  }

  let parsed: ArxivFeed;

  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      parseTagValue: true,
      trimValues: false,
    });

    parsed = parser.parse(xml) as ArxivFeed;
  } catch (error) {
    console.log(
      "[fetchPaper] Error parsing XML:",
      error instanceof Error ? error.message : String(error)
    );
    throw new Error("arXiv API is currently unavailable");
  }

  const entry = Array.isArray(parsed.feed?.entry)
    ? parsed.feed?.entry[0]
    : parsed.feed?.entry;

  const title = cleanText(entry?.title);
  const abstract = cleanText(entry?.summary);

  console.log("[fetchPaper] Parsed title:", title);
  console.log("[fetchPaper] Parsed abstract:", abstract);

  if (!title || !abstract) {
    throw new Error("Paper not found");
  }

  return {
    title,
    abstract,
  };
}
