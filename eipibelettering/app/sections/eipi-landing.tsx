'use client';

import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  MessageSquareText,
  Star,
  Tags,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import AutoScroll from 'embla-carousel-auto-scroll';
import useEmblaCarousel from 'embla-carousel-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ContactBand } from './contact-band';
import { BackToTopButton, SiteFooter, SiteNav } from './site-chrome';

const workItems = [
  {
    title: 'Truck Lettering',
    copy: 'Bold fleet graphics designed to stay sharp, readable, and professional on every route.',
    tone: 'Large-format visibility',
    image: '/truck_lettering.png',
  },
  {
    title: 'Vehicle Lettering',
    copy: 'Clean vehicle branding that turns daily movement into consistent local recognition.',
    tone: 'Road-ready branding',
    image: '/vehicle_lettering.png',
  },
  {
    title: 'Banner Flags',
    copy: 'Flexible promotional signage for events, storefronts, and campaigns that need fast attention.',
    tone: 'Outdoor campaign impact',
    image: '/banner_flags.png',
  },
];

const services = [
  {
    label: 'Vehicle lettering',
    copy: 'Fleet graphics, decals, and full-wrap branding that keep your business recognizable on every road.',
    image: '/vehicle_lettering.png',
  },
  {
    label: 'Facade signage',
    copy: 'Exterior signage that gives your building a clear, confident face from street level.',
    image: '/facade_signage.jpg',
  },
  {
    label: 'Interior signing',
    copy: 'Interior graphics, wall details, and branded finishes that make a space feel complete.',
    image: '/interior.jpg',
  },
  {
    label: 'Wayfinding',
    copy: 'Clear directional signs that help visitors, staff, and customers move without confusion.',
    image: '/wayfinding.jpg',
  },
  {
    label: 'Flags',
    copy: 'Outdoor flags that add motion, height, and instant visibility around your location.',
    image: '/banner_flags.png',
  },
  {
    label: 'Banners',
    copy: 'Flexible banner solutions for promotions, openings, construction sites, and campaigns.',
    image: '/banner.webp',
  },
];

const recentProjects = [
  {
    title: 'Decorative Window Film',
    image: '/decorative_window_film.jpg',
    alt: 'Decorative window film project by EIPI',
  },
  {
    title: 'Mercedes GLC Car Wrap',
    image: '/mercedes_car_wrap.jpg',
    alt: 'Mercedes GLC car wrap project by EIPI',
  },
  {
    title: 'Bouwmeesters Amsterdam',
    image: '/boumeesters.jpg',
    alt: 'Bouwmeesters Amsterdam signage project by EIPI',
  },
  {
    title: 'Hoogland Signage',
    image: '/hoogland.jpg',
    alt: 'Hoogland signage project by EIPI',
  },
];

const advantages = [
  {
    number: '01',
    title: 'Consistency',
    copy: 'One visual language across vehicles, buildings, windows, and interiors.',
    image: '/advantage_consistency.png',
    alt: 'Coordinated signage samples for vehicle, facade, window, and interior branding',
  },
  {
    number: '02',
    title: 'Materials',
    copy: 'Quality films, signage systems, and finishes selected for long-term use.',
    image: '/advantage_materials.png',
    alt: 'Premium vinyl, acrylic, and metal signage materials in a production studio',
  },
  {
    number: '03',
    title: 'Transparency',
    copy: 'Clear advice and an all-in quote before production begins.',
    image: '/advantage_transparency.png',
    alt: 'Clear signage project quote with material samples and a facade mockup',
  },
];

const brandProofs = [
  {
    icon: MessageSquareText,
    title: 'Unified branding',
  },
  {
    icon: Star,
    title: 'Only the best materials',
  },
  {
    icon: Tags,
    title: 'All-in quote',
  },
];

const reviews = [
  {
    name: 'Judith Huijsman',
    company: 'Local retail studio',
    quote:
      'The window film changed the whole entrance. Clean finish, clear advice, and exactly the privacy we wanted.',
  },
  {
    name: 'Marco de Vries',
    company: 'De Vries Installatie',
    quote:
      'Our vans finally look like one professional fleet. The lettering is sharp and still looks fresh after daily use.',
  },
  {
    name: 'Sanne Bakker',
    company: 'Bakker & Co',
    quote:
      'Fast communication and a design that matched our brand immediately. The facade sign stands out beautifully.',
  },
  {
    name: 'Peter Jansen',
    company: 'Jansen Logistics',
    quote:
      'EIPI understood visibility from the road. The truck graphics are readable, bold, and very professionally installed.',
  },
  {
    name: 'Noura El Amrani',
    company: 'Studio Noura',
    quote:
      'The interior signing made our space feel finished. Subtle, modern, and much easier for visitors to navigate.',
  },
  {
    name: 'Thomas Smit',
    company: 'Smit Bouwgroep',
    quote:
      'From design to placement, everything felt organized. The team gave practical suggestions that improved the result.',
  },
  {
    name: 'Eva Koster',
    company: 'Koster Clinic',
    quote:
      'The wayfinding signs look calm and premium. Clients immediately understand where to go now.',
  },
  {
    name: 'Ruben Meijer',
    company: 'Meijer Events',
    quote:
      'The banners and flags were delivered quickly and looked strong outdoors. Great color, clean print, no fuss.',
  },
  {
    name: 'Anouk Visser',
    company: 'Visser Makelaars',
    quote:
      'They made our office windows look more polished without blocking too much light. Very happy with the finish.',
  },
  {
    name: 'Daan Vermeer',
    company: 'Vermeer Automotive',
    quote:
      'The car wrap has real presence. Details line up neatly and the overall look feels much more modern.',
  },
];

export default function EipiLanding() {
  const rootRef = useRef<HTMLElement>(null);
  const reviewPlugins = useMemo(
    () => [
      AutoScroll({
        speed: 0.6,
        startDelay: 500,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ],
    [],
  );
  const [reviewsCarouselRef, reviewsCarouselApi] = useEmblaCarousel(
    {
      align: 'start',
      dragFree: true,
      loop: true,
      skipSnaps: true,
    },
    reviewPlugins,
  );
  const [activeService, setActiveService] = useState(0);
  const [activeWorkIndex, setActiveWorkIndex] = useState(0);
  const [activeWork, setActiveWork] = useState<(typeof workItems)[number]>();
  const activeWorkItem = workItems[activeWorkIndex];

  useEffect(() => {
    if (!rootRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const ctx = gsap.context(() => {
      if (!reduceMotion) {
        gsap.from('[data-split-hero]', {
          y: 42,
          opacity: 0,
          duration: 0.9,
          ease: 'power4.out',
        });

        gsap.to('[data-red-line]', {
          scaleX: 1,
          transformOrigin: 'left center',
          duration: 1.1,
          ease: 'power3.out',
          delay: 0.18,
        });

        gsap.from('[data-work-card]', {
          y: 70,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.11,
          scrollTrigger: {
            trigger: '[data-selected-work]',
            start: 'top 70%',
            once: true,
          },
        });

        gsap.utils
          .toArray<HTMLElement>('[data-reveal-section]')
          .forEach((section) => {
            gsap.from(section.children, {
              y: 48,
              opacity: 0,
              duration: 0.85,
              ease: 'power3.out',
              stagger: 0.08,
              scrollTrigger: {
                trigger: section,
                start: 'top 76%',
                once: true,
              },
            });
          });
      }

      return undefined;
    }, rootRef);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  useEffect(() => {
    if (!activeWork) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveWork(undefined);
      }
    };

    document.body.classList.add('modal-open');
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeWork]);

  useEffect(() => {
    if (!reviewsCarouselApi) return;

    reviewsCarouselApi.plugins().autoScroll?.play();
  }, [reviewsCarouselApi]);

  const showPreviousWork = () => {
    setActiveWorkIndex((current) =>
      current === 0 ? workItems.length - 1 : current - 1,
    );
  };

  const showNextWork = () => {
    setActiveWorkIndex((current) =>
      current === workItems.length - 1 ? 0 : current + 1,
    );
  };

  return (
    <main ref={rootRef} className="site-shell">
      <SiteNav />

      <section id="top" className="hero-section" data-hero>
        <div className="hero-kicker">
          <span>01</span>
          <span data-red-line />
          <span>Purmerend signage studio</span>
        </div>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Belettering & gevelreclame</p>
            <h1 data-split-hero>SHOW WHO YOU ARE.</h1>
            <p className="hero-intro">
              Make your business impossible to ignore, from vehicle lettering to
              illuminated facade signage.
            </p>
            <div className="hero-actions">
              <a href="#contact" className="primary-action">
                Start a Project <ArrowUpRight aria-hidden="true" size={20} />
              </a>
              <a href="#work" className="secondary-action">
                View Work
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="work" className="selected-work" data-selected-work>
        <div className="section-heading">
          <p className="eyebrow">Selected Work</p>
          <h2>Brands made visible.</h2>
        </div>

        <div className="work-carousel" data-work-card>
          <div className="work-carousel-copy">
            <p className="eyebrow">Featured project</p>
            <h3>{activeWorkItem.title}</h3>
            <p>{activeWorkItem.copy}</p>
            <div className="work-carousel-actions">
              <button
                type="button"
                onClick={showPreviousWork}
                aria-label="Show previous project"
              >
                <ChevronLeft aria-hidden="true" size={20} />
              </button>
              <button
                type="button"
                onClick={showNextWork}
                aria-label="Show next project"
              >
                <ChevronRight aria-hidden="true" size={20} />
              </button>
            </div>
          </div>

          <button
            className="work-carousel-media"
            type="button"
            onClick={() => setActiveWork(activeWorkItem)}
            onMouseDown={() => setActiveWork(activeWorkItem)}
            aria-label={`View full image for ${activeWorkItem.title}`}
          >
            <img
              src={activeWorkItem.image}
              alt={`${activeWorkItem.title} by EIPI`}
            />
            <span>
              View full image <Maximize2 aria-hidden="true" size={16} />
            </span>
          </button>

          <div className="work-carousel-thumbs" aria-label="Project carousel">
            {workItems.map((item, index) => (
              <button
                type="button"
                key={item.title}
                className={index === activeWorkIndex ? 'is-active' : ''}
                onClick={() => setActiveWorkIndex(index)}
                aria-label={`Show ${item.title}`}
                aria-pressed={index === activeWorkIndex}
              >
                <img src={item.image} alt="" />
                <span>{item.title}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {activeWork ? (
        <div
          className="work-modal-overlay"
          role="presentation"
          onMouseDown={() => setActiveWork(undefined)}
        >
          <div
            aria-labelledby="work-modal-title"
            aria-modal="true"
            className="work-modal"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
          >
            <button
              aria-label="Close image viewer"
              className="work-modal-close"
              onClick={() => setActiveWork(undefined)}
              type="button"
            >
              <X aria-hidden="true" size={20} />
            </button>
            {activeWork ? (
              <>
                <div className="work-modal-image">
                  <img
                    src={activeWork.image}
                    alt={`${activeWork.title} by EIPI`}
                  />
                </div>
                <div className="work-modal-copy">
                  <h3 id="work-modal-title">{activeWork.title}</h3>
                  <p>{activeWork.copy}</p>
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      <section id="why" className="impact-section">
        <p className="eyebrow">Impact</p>
        <h2>One vehicle. 160,000+ monthly contact moments.</h2>
        <p>
          The redesign pulls this existing EIPI claim forward as a signature
          storytelling moment instead of hiding it deep in copy.
        </p>
      </section>

      <section id="services" className="services-section">
        <div className="services-intro">
          <p className="eyebrow">What We Do</p>
          <h2>Full-service signage from vehicle to building.</h2>
          <div className="service-preview" aria-live="polite">
            <div className="service-preview-surface">
              <img
                src={services[activeService].image}
                alt={`${services[activeService].label} example by EIPI`}
              />
            </div>
            <p>{services[activeService].copy}</p>
          </div>
        </div>

        <div className="service-list">
          {services.map((service, index) => (
            <a
              href="#contact"
              className="service-row"
              key={service.label}
              onBlur={() => setActiveService(0)}
              onFocus={() => setActiveService(index)}
              onMouseEnter={() => setActiveService(index)}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{service.label}</strong>
              <ArrowUpRight aria-hidden="true" size={24} />
              <img
                className="service-row-image"
                src={service.image}
                alt={`${service.label} example by EIPI`}
              />
              <small>{service.copy}</small>
            </a>
          ))}
        </div>
      </section>

      <section className="why-section" data-reveal-section>
        <p className="eyebrow">WHY EIPI?</p>
        <h2>
          Something beautiful can blossom between us! May we help you equip your
          company with the most professional signage? Ensure your customer is
          blown away by your business the moment they walk in!
        </h2>
        <a
          href="https://www.eipibelettering.nl/wp-content/uploads/2014/10/styleplus-eipi.pdf"
          className="secondary-action"
          target="_blank"
          rel="noreferrer"
          aria-label="Download EIPI brochure PDF"
        >
          Download Brochure
        </a>
      </section>

      <section className="recent-projects" data-reveal-section>
        <div className="section-heading">
          <p className="eyebrow">Recent Projects</p>
          <h2>Seen in the real world.</h2>
        </div>
        <div className="project-cloud">
          {recentProjects.map((project) => (
            <article className="project-tile" key={project.title}>
              <div className="project-surface">
                <img src={project.image} alt={project.alt} />
              </div>
              <h3>{project.title}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="brand-statement" data-reveal-section>
        <div className="brand-story-copy">
          <p className="eyebrow">Perhaps you know this from us?</p>
          <h2>One vehicle can work for your brand every month.</h2>
          <div className="brand-story-text">
            <p>
              Vehicle lettering can generate an average of 160,000 contact
              moments per month. It keeps your company visible while your team
              is already on the road.
            </p>
            <p>
              From a single car to a full fleet, EIPI designs clear, memorable
              signage that connects vehicles, windows, buildings, and campaigns
              into one recognizable visual language.
            </p>
          </div>
          <div className="brand-proof-grid">
            {brandProofs.map((proof) => {
              const Icon = proof.icon;

              return (
                <div className="brand-proof-item" key={proof.title}>
                  <Icon aria-hidden="true" size={26} />
                  <strong>{proof.title}</strong>
                </div>
              );
            })}
          </div>
        </div>
        <div className="brand-story-image">
          <img
            src="/Spare-Rib-Expres-scaled.jpg"
            alt="Spare Rib Express truck lettering project by EIPI"
          />
        </div>
      </section>

      <section className="advantages-section" data-reveal-section>
        <div className="section-heading">
          <p className="eyebrow">Why Work With Us</p>
          <h2>Built for every touchpoint.</h2>
        </div>
        <div className="advantage-grid">
          {advantages.map((item) => (
            <article className="advantage-item" key={item.number}>
              <div className="advantage-image">
                <img src={item.image} alt={item.alt} />
              </div>
              <div className="advantage-copy">
                <span>{item.number}</span>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="testimonial-section" data-reveal-section>
        <div className="reviews-heading">
          <p className="eyebrow">Client Reviews</p>
          <h2>What clients say after the work is seen.</h2>
        </div>
        <div className="reviews-carousel" aria-label="Client reviews">
          <div className="reviews-viewport" ref={reviewsCarouselRef}>
            <div className="reviews-track">
              {reviews.map((review) => (
                <div className="review-slide" key={review.name}>
                  <article className="review-card">
                    <div className="review-stars" aria-label="5 out of 5 stars">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          aria-hidden="true"
                          fill="currentColor"
                          key={index}
                          size={16}
                        />
                      ))}
                    </div>
                    <p>"{review.quote}"</p>
                    <footer>
                      <strong>{review.name}</strong>
                      <span>{review.company}</span>
                    </footer>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ContactBand />

      <SiteFooter />
      <BackToTopButton />
    </main>
  );
}
