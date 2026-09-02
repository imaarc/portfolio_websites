'use client';

import { ArrowUpRight, Check, Mail, Phone } from 'lucide-react';
import { FormEvent, useState } from 'react';

export function ContactBand() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact" className="contact-band">
      <div>
        <p className="eyebrow">Start a Project</p>
        <h2>Ready to be seen?</h2>
        <div className="contact-actions">
          <a href="tel:+31299667700">
            <Phone aria-hidden="true" size={18} /> 0299 - 66 77 00
          </a>
          <a href="mailto:info@eipi.nl">
            <Mail aria-hidden="true" size={18} /> info@eipi.nl
          </a>
        </div>
      </div>
      <form className="contact-form" onSubmit={handleSubmit}>
        {submitted ? (
          <div className="form-success" role="status">
            <Check aria-hidden="true" size={24} />
            <strong>Thanks. Your project request is ready to send.</strong>
            <p>
              This trial form is not connected yet, but the interaction and
              success state are in place for the final integration.
            </p>
          </div>
        ) : null}
        <label>
          Name
          <input name="name" autoComplete="name" required />
        </label>
        <label>
          Company
          <input name="company" autoComplete="organization" />
        </label>
        <label>
          Email
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          Phone
          <input name="phone" type="tel" autoComplete="tel" />
        </label>
        <label className="wide-field">
          Project
          <textarea name="message" rows={4} required />
        </label>
        <button type="submit">
          Send Request <ArrowUpRight aria-hidden="true" size={20} />
        </button>
      </form>
    </section>
  );
}
