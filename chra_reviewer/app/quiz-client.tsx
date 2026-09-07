'use client';

import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { reviewerBanks, type Question } from './question-banks';

type ToolRegistration = {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: {
    readOnlyHint?: boolean;
    untrustedContentHint?: boolean;
  };
  execute: (input: unknown) => unknown;
};

declare global {
  interface Document {
    modelContext?: {
      registerTool: (
        tool: ToolRegistration,
        options?: { signal?: AbortSignal },
      ) => void | Promise<void>;
    };
  }
}

function percent(score: number, total: number) {
  return total === 0 ? 0 : Math.round((score / total) * 100);
}

export default function QuizClient() {
  const [reviewerId, setReviewerId] = useState(reviewerBanks[0].id);
  const [topic, setTopic] = useState('All topics');
  const [query, setQuery] = useState('');
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answersByReviewer, setAnswersByReviewer] = useState<
    Record<string, Record<number, number>>
  >({});

  const activeBank =
    reviewerBanks.find((reviewer) => reviewer.id === reviewerId) ??
    reviewerBanks[0];
  const questions = activeBank.questions;
  const quickRules = activeBank.quickRules;
  const topics = useMemo(
    () => ['All topics', ...Array.from(new Set(questions.map((q) => q.topic)))],
    [questions],
  );
  const answers = answersByReviewer[reviewerId] ?? {};

  const filtered = useMemo(() => {
    return questions.filter((question) => {
      const matchesTopic = topic === 'All topics' || question.topic === topic;
      const searchText =
        `${question.topic} ${question.prompt} ${question.explanation}`.toLowerCase();
      return matchesTopic && searchText.includes(query.toLowerCase().trim());
    });
  }, [questions, topic, query]);

  const safeCurrent = Math.min(current, Math.max(filtered.length - 1, 0));
  const active = filtered[safeCurrent];
  const answeredCount = Object.keys(answers).length;
  const score = questions.reduce((total, question, index) => {
    return answers[index] === question.answer ? total + 1 : total;
  }, 0);

  function globalIndex(question: Question) {
    return questions.indexOf(question);
  }

  function choose(choice: number) {
    if (!active) return;
    setSelected(choice);
    setAnswersByReviewer((previous) => ({
      ...previous,
      [reviewerId]: {
        ...(previous[reviewerId] ?? {}),
        [globalIndex(active)]: choice,
      },
    }));
  }

  function move(direction: number) {
    const next = Math.min(
      Math.max(safeCurrent + direction, 0),
      filtered.length - 1,
    );
    setCurrent(next);
    setSelected(active ? answers[globalIndex(filtered[next])] ?? null : null);
  }

  function reset() {
    setAnswersByReviewer((previous) => ({
      ...previous,
      [reviewerId]: {},
    }));
    setSelected(null);
    setCurrent(0);
  }

  function changeReviewer(nextReviewerId: string) {
    setReviewerId(nextReviewerId);
    setTopic('All topics');
    setQuery('');
    setCurrent(0);
    setSelected(null);
  }

  function changeTopic(nextTopic: string) {
    setTopic(nextTopic);
    setCurrent(0);
    setSelected(null);
  }

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;

    const lifecycle = new AbortController();
    const reportError = (error: unknown) => {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      console.error('WebMCP registration failed', error);
    };

    const validateTopic = (input: unknown) => {
      if (!input || typeof input !== 'object' || !('topic' in input)) {
        throw new Error('Expected input with a topic string.');
      }
      const nextTopic = (input as { topic: unknown }).topic;
      if (typeof nextTopic !== 'string' || !topics.includes(nextTopic)) {
        throw new Error(`Topic must be one of: ${topics.join(', ')}.`);
      }
      return nextTopic;
    };

    try {
      void Promise.resolve(
        context.registerTool(
          {
            name: 'set_quiz_topic',
            title: 'Set quiz topic',
            description:
              'Filter the selected CHRA reviewer quiz to one visible topic.',
            inputSchema: {
              type: 'object',
              properties: {
                topic: {
                  type: 'string',
                  enum: topics,
                },
              },
              required: ['topic'],
              additionalProperties: false,
            },
            annotations: { readOnlyHint: false, untrustedContentHint: false },
            execute(input) {
              const nextTopic = validateTopic(input);
              setTopic(nextTopic);
              setCurrent(0);
              setSelected(null);
              return {
                topic: nextTopic,
                questionCount:
                  nextTopic === 'All topics'
                    ? activeBank.questions.length
                    : activeBank.questions.filter(
                        (question) => question.topic === nextTopic,
                      ).length,
              };
            },
          },
          { signal: lifecycle.signal },
        ),
      ).catch(reportError);

      void Promise.resolve(
        context.registerTool(
          {
            name: 'reset_quiz_progress',
            title: 'Reset quiz progress',
            description:
              'Clear all recorded answers and return the CHRA quiz to the first question.',
            inputSchema: {
              type: 'object',
              properties: {},
              additionalProperties: false,
            },
            annotations: { readOnlyHint: false, untrustedContentHint: false },
            execute() {
              setAnswersByReviewer((previous) => ({
                ...previous,
                [reviewerId]: {},
              }));
              setSelected(null);
              setCurrent(0);
              return { answered: 0, score: 0 };
            },
          },
          { signal: lifecycle.signal },
        ),
      ).catch(reportError);
    } catch (error) {
      reportError(error);
    }

    return () => lifecycle.abort();
  }, [activeBank.questions, reviewerId, topics]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
      <div className="border-b border-slate-200 p-4 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-800">
              {activeBank.shortLabel}
            </p>
            <h2 className="text-2xl font-semibold tracking-normal text-slate-950">
              {activeBank.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[230px_1fr_220px]">
          <label className="relative block">
            <span className="sr-only">Choose reviewer</span>
            <select
              value={reviewerId}
              onChange={(event) => changeReviewer(event.target.value)}
              className="h-11 w-full appearance-none rounded-md border border-slate-300 bg-white px-3 pr-9 text-base outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
            >
              {reviewerBanks.map((reviewer) => (
                <option key={reviewer.id} value={reviewer.id}>
                  {reviewer.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          </label>
          <label className="relative block">
            <span className="sr-only">Search question bank</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setCurrent(0);
                setSelected(null);
              }}
              placeholder={activeBank.searchPlaceholder}
              className="h-11 w-full rounded-md border border-slate-300 bg-white pl-10 pr-3 text-base outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
            />
          </label>
          <label className="relative block">
            <span className="sr-only">Filter by topic</span>
            <select
              value={topic}
              onChange={(event) => changeTopic(event.target.value)}
              className="h-11 w-full appearance-none rounded-md border border-slate-300 bg-white px-3 pr-9 text-base outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
            >
              {topics.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          </label>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_290px]">
        <section className="p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-slate-600">
              {filtered.length
                ? `Question ${safeCurrent + 1} of ${filtered.length}`
                : 'No matching questions'}
            </div>
            <div
              className="h-2 w-40 overflow-hidden rounded-full bg-slate-100"
              aria-hidden="true"
            >
              <div
                className="h-full rounded-full bg-emerald-700"
                style={{
                  width: `${
                    filtered.length ? ((safeCurrent + 1) / filtered.length) * 100 : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {active ? (
            <article className="min-h-[485px]">
              <p className="mb-3 inline-flex rounded-md bg-emerald-50 px-2.5 py-1 text-sm font-semibold text-emerald-800">
                {active.topic}
              </p>
              <h3 className="text-2xl font-semibold leading-snug tracking-normal text-slate-950">
                {active.prompt}
              </h3>

              <div className="mt-5 grid gap-3">
                {active.choices.map((choice, index) => {
                  const isPicked = selected === index;
                  const isCorrect = active.answer === index;
                  const showResult = selected !== null;
                  return (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => choose(index)}
                      className={[
                        'flex min-h-14 items-center justify-between rounded-lg border px-4 py-3 text-left text-base transition',
                        showResult && isCorrect
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950'
                          : '',
                        showResult && isPicked && !isCorrect
                          ? 'border-rose-500 bg-rose-50 text-rose-950'
                          : '',
                        !showResult
                          ? 'border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/60'
                          : '',
                        showResult && !isPicked && !isCorrect
                          ? 'border-slate-200 bg-white text-slate-500'
                          : '',
                      ].join(' ')}
                    >
                      <span>{choice}</span>
                      {showResult && isCorrect ? (
                        <Check className="h-5 w-5 shrink-0" />
                      ) : null}
                      {showResult && isPicked && !isCorrect ? (
                        <X className="h-5 w-5 shrink-0" />
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Explanation
                </p>
                <p className="mt-2 text-base leading-7 text-slate-700">
                  {selected === null
                    ? 'Choose an answer to reveal the rule and keep the recall honest.'
                    : active.explanation}
                </p>
              </div>
            </article>
          ) : (
            <div className="flex min-h-[485px] items-center justify-center rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-600">
              No questions match that search yet.
            </div>
          )}

          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => move(-1)}
              disabled={safeCurrent === 0}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Previous
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              disabled={!filtered.length || safeCurrent === filtered.length - 1}
              className="inline-flex h-11 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </section>

        <aside className="border-t border-slate-200 bg-slate-50 p-4 sm:p-5 lg:border-l lg:border-t-0">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-500">Score</p>
            <p className="mt-2 text-4xl font-semibold text-slate-950">
              {percent(score, questions.length)}%
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {score} correct out of {answeredCount} answered
            </p>
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-950">Topic coverage</p>
            <div className="mt-3 space-y-2">
              {topics.slice(1).map((item) => {
                const count = questions.filter(
                  (question) => question.topic === item,
                ).length;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => changeTopic(item)}
                    className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition hover:bg-slate-100"
                  >
                    <span className="text-slate-700">{item}</span>
                    <span className="font-semibold text-slate-950">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-950">High-yield rules</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              {quickRules.map((rule) => (
                <li key={rule} className="flex gap-2">
                  <Check
                    className="mt-1 h-4 w-4 shrink-0 text-emerald-700"
                    aria-hidden="true"
                  />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
