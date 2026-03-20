"use client";

import { useRef, useState } from "react";

type DigestResult = {
  title: string;
  problem: string;
  method: string;
  results: string;
  limitations: string;
  score: number;
  score_reason: string;
};

function getScoreStyles(score: number): string {
  if (score >= 7) {
    return "border-emerald-500/30 bg-emerald-500/15 text-emerald-300";
  }

  if (score >= 5) {
    return "border-amber-500/30 bg-amber-500/15 text-amber-300";
  }

  return "border-rose-500/30 bg-rose-500/15 text-rose-300";
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DigestResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function handleDigest() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/digest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = (await response.json()) as DigestResult & { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopySummary() {
    if (!result) {
      return;
    }

    const summaryText = [
      `Title: ${result.title}`,
      `Problem: ${result.problem}`,
      `Method: ${result.method}`,
      `Results: ${result.results}`,
      `Limitations: ${result.limitations}`,
      `Should I read this? ${result.score}/10`,
      `Score reason: ${result.score_reason}`,
    ].join("\n\n");

    await navigator.clipboard.writeText(summaryText);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  function handleTryAnotherPaper() {
    setResult(null);
    inputRef.current?.focus();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#0d0a1a] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-10 sm:px-8 lg:px-12">
        <section className="relative mx-auto flex w-full max-w-3xl flex-col items-center pt-8 text-center sm:pt-14">
          <div className="absolute top-10 h-36 w-36 rounded-full bg-[#7c3aed]/25 blur-3xl sm:h-44 sm:w-44" />
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.24em] text-white/70">
            Open Source {"\u2022"} Free Forever
          </div>
          <h1 className="relative mt-7 text-5xl font-bold tracking-tight text-white sm:text-6xl">
            PaperDigest
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-zinc-300 sm:text-xl">
            Paste any arXiv link. Get the full picture in seconds.
          </p>
          <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-500 sm:text-base">
            No more reading 40-page papers to know if they&apos;re worth your
            time.
          </p>
        </section>

        <section className="mx-auto mt-12 w-full max-w-4xl">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 shadow-2xl shadow-black/30 backdrop-blur sm:p-5">
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                ref={inputRef}
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://arxiv.org/abs/2301.07041"
                className="h-16 flex-1 rounded-2xl border border-white/10 bg-[#101010] px-6 text-base text-white outline-none transition focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/30"
              />
              <button
                type="button"
                onClick={handleDigest}
                disabled={loading}
                className="inline-flex h-16 items-center justify-center gap-3 rounded-2xl bg-[#7c3aed] px-6 text-sm font-semibold text-white transition hover:bg-[#8b5cf6] disabled:cursor-not-allowed disabled:bg-[#7c3aed]/60 md:min-w-[180px]"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Digesting...
                  </>
                ) : (
                  "Digest Paper"
                )}
              </button>
            </div>
          </div>
        </section>

        {error ? (
          <section className="mx-auto mt-8 w-full max-w-4xl">
            <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-5 text-sm text-rose-200 shadow-lg shadow-rose-950/20 sm:p-6">
              {error}
            </div>
          </section>
        ) : null}

        {loading ? (
          <section className="mx-auto mt-8 w-full max-w-5xl flex-1">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40 backdrop-blur sm:p-8">
              <div className="pb-6">
                <div className="h-3 w-28 animate-pulse rounded-full bg-[#7c3aed]/40" />
                <div className="mt-4 h-8 w-3/4 animate-pulse rounded-full bg-white/10 sm:h-10" />
                <div className="mt-5 h-px w-full bg-gradient-to-r from-[#7c3aed]/50 via-[#7c3aed]/20 to-transparent" />
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                {[0, 1, 2, 3].map((item) => (
                  <article
                    key={item}
                    className="rounded-xl border border-[#1f1f1f] bg-[#111111] p-6"
                  >
                    <div className="h-4 w-28 animate-pulse rounded-full bg-[#7c3aed]/25" />
                    <div className="mt-4 space-y-3">
                      <div className="h-3 w-full animate-pulse rounded-full bg-white/10" />
                      <div className="h-3 w-11/12 animate-pulse rounded-full bg-white/10" />
                      <div className="h-3 w-4/5 animate-pulse rounded-full bg-white/10" />
                    </div>
                  </article>
                ))}

                <article className="rounded-xl border border-[#1f1f1f] bg-[#111111] p-6 md:col-span-2">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="w-full max-w-2xl">
                      <div className="h-4 w-40 animate-pulse rounded-full bg-[#7c3aed]/25" />
                      <div className="mt-4 h-4 w-full animate-pulse rounded-full bg-white/10" />
                      <div className="mt-3 h-4 w-5/6 animate-pulse rounded-full bg-white/10" />
                    </div>
                    <div className="h-20 w-32 animate-pulse rounded-2xl bg-white/10" />
                  </div>
                </article>
              </div>
            </div>
          </section>
        ) : null}

        {result ? (
          <section className="mx-auto mt-8 w-full max-w-5xl flex-1">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40 backdrop-blur sm:p-8">
              <div className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#7c3aed]">
                    PAPER DIGEST
                  </p>
                  <h2 className="mt-3 text-2xl font-bold leading-tight text-white sm:text-4xl">
                    {result.title}
                  </h2>
                  <div className="mt-5 h-px w-full bg-gradient-to-r from-[#7c3aed] via-[#7c3aed]/50 to-transparent" />
                </div>

                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-zinc-200 transition hover:border-[#7c3aed] hover:text-white"
                >
                  {copied ? "Copied!" : "Copy Summary"}
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <article className="rounded-xl border border-[#1f1f1f] bg-[#111111] p-6 transition-colors hover:border-[#7c3aed]">
                  <p className="flex items-center gap-2 text-sm font-bold text-[#7c3aed]">
                    <span>{"\u{1F50D}"}</span>
                    <span>Problem</span>
                  </p>
                  <p className="mt-4 text-sm leading-7 text-[#d1d5db]">
                    {result.problem}
                  </p>
                </article>

                <article className="rounded-xl border border-[#1f1f1f] bg-[#111111] p-6 transition-colors hover:border-[#7c3aed]">
                  <p className="flex items-center gap-2 text-sm font-bold text-[#7c3aed]">
                    <span>{"\u2699\uFE0F"}</span>
                    <span>Method</span>
                  </p>
                  <p className="mt-4 text-sm leading-7 text-[#d1d5db]">
                    {result.method}
                  </p>
                </article>

                <article className="rounded-xl border border-[#1f1f1f] bg-[#111111] p-6 transition-colors hover:border-[#7c3aed]">
                  <p className="flex items-center gap-2 text-sm font-bold text-[#7c3aed]">
                    <span>{"\u{1F4CA}"}</span>
                    <span>Results</span>
                  </p>
                  <p className="mt-4 text-sm leading-7 text-[#d1d5db]">
                    {result.results}
                  </p>
                </article>

                <article className="rounded-xl border border-[#1f1f1f] bg-[#111111] p-6 transition-colors hover:border-[#7c3aed]">
                  <p className="flex items-center gap-2 text-sm font-bold text-[#7c3aed]">
                    <span>{"\u26A0\uFE0F"}</span>
                    <span>Limitations</span>
                  </p>
                  <p className="mt-4 text-sm leading-7 text-[#d1d5db]">
                    {result.limitations}
                  </p>
                </article>

                <article className="rounded-xl border border-[#1f1f1f] bg-[#111111] p-6 md:col-span-2">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-[#7c3aed]">
                        Should I read this?
                      </p>
                      <p className="mt-4 max-w-2xl text-base leading-8 text-[#d1d5db] sm:text-lg">
                        {result.score_reason}
                      </p>
                    </div>

                    <div
                      className={`animate-score-in inline-flex items-center gap-4 self-start rounded-2xl border px-5 py-4 ${getScoreStyles(
                        result.score
                      )}`}
                    >
                      <span className="text-4xl font-bold leading-none sm:text-5xl">
                        {result.score}
                      </span>
                      <span className="text-sm font-bold uppercase tracking-[0.22em] sm:text-base">
                        / 10
                      </span>
                    </div>
                  </div>
                </article>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={handleTryAnotherPaper}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-medium text-zinc-200 transition hover:border-[#7c3aed] hover:text-white"
              >
                Try another paper
              </button>
            </div>
          </section>
        ) : null}

        <footer className="mt-12 pb-4 text-center text-sm text-zinc-500">
          Built by @avikcodes {"\u2022"} Project 2 of 30
        </footer>
      </div>

      <style jsx global>{`
        @keyframes score-pop {
          0% {
            opacity: 0;
            transform: scale(0.94);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-score-in {
          animation: score-pop 280ms ease-out;
        }
      `}</style>
    </main>
  );
}
