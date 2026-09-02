'use client';

import { ArrowUp, ArrowUpRight } from 'lucide-react';

export function SiteNav() {
  return (
    <nav className="site-nav" aria-label="Main navigation">
      <a className="logo-lockup" href="/" aria-label="EIPI home">
        <img src="/eipi-logo-modern.svg" alt="EIPI Belettering" />
      </a>
      <div className="nav-links" aria-label="Page sections">
        <a href="/#work">Work</a>
        <a href="/#services">Services</a>
        <a href="/#why">Why Eipi</a>
        <a href="/#contact">Contact</a>
        <a href="/vacancies">Vacancies</a>
      </div>
      <a className="nav-cta" href="/#contact">
        Start a Project <ArrowUpRight aria-hidden="true" size={18} />
      </a>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <span>Eipi Belettering en Gevelreclame b.v.</span>
      <span>Volume 69 - 70, 1446 WG Purmerend</span>
    </footer>
  );
}

export function BackToTopButton() {
  return (
    <a
      className="back-to-top"
      href="#top"
      aria-label="Back to top"
      title="Back to top"
    >
      <ArrowUp aria-hidden="true" size={22} />
    </a>
  );
}
