import { BUSINESS, REVIEWS } from '../data/content';
import { ArrowRight, Check, Reveal, SectionHead, Stars } from './ui';

function RatingTile({ score, label, detail }) {
  return (
    <div className="flex-1 rounded-[3px] border border-line bg-white px-4 py-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-display text-[30px] leading-none text-ink">{score}</p>
        <Stars rating={Number(score)} className="h-3 w-3" />
      </div>
      <p className="mt-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink">{label}</p>
      <p className="mt-1 text-[10px] text-muted/75">{detail}</p>
    </div>
  );
}

export default function Reviews() {
  return (
    <section
      id="reviews"
      className="scroll-mt-24 border-y border-line/70 bg-silk/40 py-16 sm:py-20 lg:py-28"
    >
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Reveal>
              <SectionHead
                number="04"
                eyebrow="Verified Local Reviews"
                title={
                  <>
                    Counted on for the days that <em className="italic text-brass-dark">matter.</em>
                  </>
                }
                copy="Brides, grooms and everyday wardrobes across Collierville — here is what clients say about the work."
              />
            </Reveal>

            <Reveal delay={100}>
              <div className="mt-7 flex gap-3">
                <RatingTile score="4.6" label="Google" detail="42 reviews" />
                <RatingTile score="5.0" label="Yelp" detail="Local reviews" />
              </div>
            </Reveal>

            <Reveal delay={160}>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                <a
                  href={BUSINESS.googleReviewsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline"
                >
                  Read on Google
                  <ArrowRight className="h-3 w-3" />
                </a>
                <a
                  href={BUSINESS.yelpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline"
                >
                  Read on Yelp
                  <ArrowRight className="h-3 w-3" />
                </a>
              </div>
              <p className="mt-5 flex items-center gap-2 text-[10px] leading-relaxed text-muted/70">
                <Check className="h-3.5 w-3.5 text-sage" />
                Local clients, local reviews — no aggregated stock quotes.
              </p>
            </Reveal>
          </div>

          <div className="grid gap-4 sm:gap-5 lg:col-span-8">
            {REVIEWS.map((review, index) => (
              <Reveal key={review.author} delay={index * 100}>
                <figure className="group relative h-full overflow-hidden rounded-[4px] border border-line bg-ivory px-6 py-6 transition-colors duration-300 hover:border-brass/40 sm:px-8 sm:py-7">
                  <span
                    aria-hidden="true"
                    className="absolute right-5 top-2 select-none font-display text-[64px] leading-none text-brass/10"
                  >
                    &rdquo;
                  </span>
                  <div className="flex items-center justify-between gap-4">
                    <Stars rating={5} className="h-3.5 w-3.5" />
                    <span className="rounded-full border border-sage/25 bg-sage-wash px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.14em] text-sage">
                      Verified
                    </span>
                  </div>
                  <blockquote className="relative mt-4 max-w-2xl font-display text-[17.5px] leading-[1.55] text-ink sm:text-[19px]">
                    “{review.quote}”
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 border-t border-line/80 pt-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-brass/30 bg-silk font-display text-[11px] italic text-brass-dark">
                      {review.author
                        .split(' ')
                        .slice(0, 2)
                        .map((word) => word[0])
                        .join('')}
                    </span>
                    <div>
                      <p className="text-[11.5px] font-semibold text-ink">— {review.author}</p>
                      <p className="text-[9.5px] uppercase tracking-[0.14em] text-muted/60">
                        {review.source}
                      </p>
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
