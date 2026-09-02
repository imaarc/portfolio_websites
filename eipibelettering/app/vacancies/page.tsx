import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import { ContactBand } from '../sections/contact-band';
import { SiteFooter, SiteNav } from '../sections/site-chrome';

const jobs = [
  {
    title: 'Experienced Advertising Installer',
    image: '/1st_item.jpg',
    alt: 'EIPI installer working on exterior signage from an installation lift',
    subject: 'Application - Experienced Advertising Installer',
    about:
      'You are an experienced sign installer with several years of practical experience and excellent manual skills. You are an expert installer and working at heights is no problem for you. You handle fine interior work with ease. You have technical insight and can work both independently and as part of a team.',
    offer:
      'As a sign installer at Eipi Belettering, you are guaranteed a fun and varied position at a friendly company. Eipi Belettering has an informal atmosphere where you can develop yourself, and of course, the Friday afternoon drinks are never missing. Naturally, we offer a good salary in accordance with the collective labor agreement for sign companies, and we have a pension scheme. You will also receive reimbursement for telephone usage costs. Moreover, a fully equipped installation van is waiting for you! In our team, you will have plenty of room to work independently. Because we work for international companies, we offer you the opportunity to go on work trips abroad.',
  },
  {
    title: 'Signmaker',
    image: '/2nd_item.jpg',
    alt: 'EIPI vehicle lettering and signage project outside the Purmerend studio',
    subject: 'Application - Signmaker',
    about:
      'You are an experienced signmaker with several years of practical experience. You are skilled in working with foils. You have technical insight and can work both independently and as part of a team. The ability to perform minor installation tasks is a great bonus.',
    offer:
      'As a signmaker at Eipi Belettering, you are assured of a fun and varied position at a friendly company. Eipi Belettering has an informal atmosphere where you can develop yourself, and of course, the Friday afternoon drinks are never missing. Naturally, we offer a good salary in accordance with the collective labor agreement for sign companies, and we have a pension scheme. You will also receive reimbursement for telephone usage costs. Moreover, a company car is waiting for you! In our team, you will have plenty of room to work independently. Because we work for international companies, we offer you the opportunity to go on work trips abroad.',
  },
];

export const metadata: Metadata = {
  title: 'Vacancies | EIPI Belettering',
  description:
    'Open roles at EIPI Belettering and Gevelreclame BV for experienced signage installers and signmakers.',
};

export default function VacanciesPage() {
  return (
    <main className="site-shell vacancies-page">
      <SiteNav />

      <section className="vacancies-hero">
        <div className="vacancies-hero-inner">
          <p className="eyebrow">Careers at EIPI</p>
          <h1>Vacancies</h1>
          <strong>Eipi Lettering and Facade Advertising BV</strong>
          <p>
            is a full-service signage company specializing in the supply and
            installation of various types of signage. Thanks to our years of
            experience, we are always able to provide you with appropriate
            advice. With us, you receive a clear design and a no-obligation
            quote in advance. Whether it concerns vehicle lettering, facade
            advertising, or a construction site sign, we will always work with
            you to achieve the best result.
          </p>
        </div>
      </section>

      <section className="vacancies-list" aria-label="Open vacancies">
        {jobs.map((job, index) => (
          <article
            className="vacancy-card"
            data-layout={index % 2 === 0 ? 'image-first' : 'copy-first'}
            key={job.title}
          >
            <div className="vacancy-media">
              <img src={job.image} alt={job.alt} />
            </div>
            <div className="vacancy-copy">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h2>{job.title}</h2>
              <h3>About you</h3>
              <p>{job.about}</p>
              <h3>What we offer you</h3>
              <p>{job.offer}</p>
              <a
                className="primary-action"
                href={`mailto:info@eipi.nl?subject=${encodeURIComponent(
                  job.subject,
                )}`}
              >
                Apply here! <ArrowUpRight aria-hidden="true" size={20} />
              </a>
            </div>
          </article>
        ))}
      </section>

      <ContactBand />
      <SiteFooter />
    </main>
  );
}
