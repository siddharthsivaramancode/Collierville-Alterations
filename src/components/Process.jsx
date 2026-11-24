import { MILESTONES, PROCESS } from '../data/content';
import { Reveal, SectionHead } from './ui';

export default function Process({ onRequest }) {
  return (
    <section id="process" className="scroll-mt-24 py-16 sm:py-20 lg:py-28">
      <div className="shell">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <SectionHead
              number="03"
              eyebrow="The Atelier Process"
              title={
                <>
                  Four calm steps from <em className="italic text-brass-dark">walk-in to pickup.</em>
                </>
              }
              copy="No mystery, no rushed handoffs. You will know what happens at each visit — and who is doing the work."
            />
          </Reveal>
          <Reveal delay={120}>
            <button type="button" onClick={() => onRequest()} className="btn-ghost shrink-0">
              Start with a fitting
            </button>
          </Reveal>
        </div>

        <div className="relative mt-11 lg:mt-14">
          <svg
            aria-hidden="true"
            viewBox="0 0 1200 12"
            preserveAspectRatio="none"
            className="absolute left-0 right-0 top-[44px] hidden h-3 w-full lg:block"
            fill="none"
          >
            <path
              d="M0 6H1200"
              stroke="#B88E4A"
              strokeOpacity="0.5"
              strokeWidth="1.1"
              strokeDasharray="6 6"
            />
          </svg>

          <div className="relative grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((step, index) => (
              <Reveal key={step.number} delay={index * 90} className="h-full">
                <div className="group relative flex h-full flex-col rounded-[4px] border border-line bg-ivory p-6 shadow-card transition-colors duration-300 hover:border-brass/45">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-brass/35 bg-linen font-display text-[13px] italic text-brass-dark">
                      {step.number}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-brass/50 transition-transform duration-500 group-hover:scale-150" />
                  </div>
                  <h3 className="mt-6 font-display text-[21px] leading-[1.2] text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2.5 text-[12px] leading-relaxed text-muted">{step.copy}</p>
                  <span className="mt-5 block h-px w-full bg-line" />
                  <span className="mt-3 text-[8.5px] font-semibold uppercase tracking-[0.2em] text-muted/50">
                    Step {step.number} of 04
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Bridal & formal milestone strip */}
        <Reveal delay={100}>
          <div className="mt-9 overflow-hidden rounded-[4px] border border-line bg-ivory">
            <div className="flex flex-col gap-4 border-b border-line bg-silk/35 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <div>
                <p className="eyebrow">Bridal &amp; Formal Timeline</p>
                <h3 className="mt-2 font-display text-[23px] leading-tight text-ink">
                  Work backward from the day.
                </h3>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-brass/35 bg-white px-3.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-brass-dark">
                <span className="h-1 w-1 rounded-full bg-brass" />
                First fitting 6–8 weeks out
              </span>
            </div>

            <div className="relative grid gap-8 px-6 py-7 sm:px-8 md:grid-cols-3 md:gap-6">
              <div
                aria-hidden="true"
                className="absolute left-8 right-8 top-[47px] hidden border-t border-dashed border-brass/40 md:block"
              />
              {MILESTONES.map((milestone, index) => (
                <div key={milestone.stage} className="relative flex gap-4 md:block">
                  <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-brass/40 bg-ivory md:mb-4">
                    <span className="h-1.5 w-1.5 rounded-full bg-brass" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted/60">
                      {milestone.stage}
                    </p>
                    <p className="mt-1.5 font-display text-[22px] leading-none text-ink">
                      {milestone.window}
                    </p>
                    <p className="mt-2.5 max-w-[19rem] text-[11.5px] leading-relaxed text-muted">
                      {milestone.copy}
                    </p>
                    <span className="mt-3 inline-block text-[8px] font-semibold uppercase tracking-[0.18em] text-brass/70">
                      Milestone 0{index + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <p className="border-t border-line/80 px-6 py-4 text-[10.5px] leading-relaxed text-muted/80 sm:px-8">
              Rush bridal work is possible when the calendar allows. Call the studio before you come
              in so we can be honest about the timeline.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
