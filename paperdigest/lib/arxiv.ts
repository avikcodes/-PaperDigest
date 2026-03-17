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
  const match = url.match(ARXIV_URL_PATTERN);

  if (!match) {
    throw new Error("Invalid arXiv URL");
  }

  return `${match[1]}${match[2] ?? ""}`;
}

function cleanText(value: string | undefined): string {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

export async function fetchPaper(
  url: string
): Promise<{ title: string; abstract: string }> {
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
  } catch {
    throw new Error("arXiv API is currently unavailable");
  }

  if (!response.ok) {
    throw new Error("arXiv API is currently unavailable");
  }

  let xml: string;

  try {
    xml = await response.text();
  } catch {
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
  } catch {
    throw new Error("arXiv API is currently unavailable");
  }

  const entry = Array.isArray(parsed.feed?.entry)
    ? parsed.feed?.entry[0]
    : parsed.feed?.entry;

  const title = cleanText(entry?.title);
  const abstract = cleanText(entry?.summary);

  if (!title || !abstract) {
    throw new Error("Paper not found");
  }

  return {
    title,
    abstract,
  };
}
