import { BookOpenCheck, Calculator, ClipboardList, Scale } from 'lucide-react';
import QuizClient from './quiz-client';

const statCards = [
  { label: 'Question bank', value: '68', icon: ClipboardList },
  { label: 'Reviewers', value: '2', icon: BookOpenCheck },
  { label: 'Core topics', value: '19', icon: Scale },
  { label: 'Modes', value: 'Switch + drill', icon: Calculator },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border bg-[linear-gradient(135deg,rgb(245_248_243),rgb(236_242_247)_45%,rgb(249_246_238))]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-8">
          <div className="flex flex-col justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-800">
                CHRA board exam reviewer
              </p>
              <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-5xl">
                CHRA review drill room
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-700">
                Switch between statutory benefits and HR theories, then drill
                fast board-style items with concise explanations after every answer.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {statCards.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="rounded-lg border border-white/70 bg-white/70 p-3 shadow-sm backdrop-blur"
                >
                  <Icon className="h-5 w-5 text-emerald-800" aria-hidden="true" />
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {value}
                  </p>
                  <p className="text-sm text-slate-600">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <QuizClient />
        </div>
      </section>
    </main>
  );
}
