import { useId, useState, type ChangeEvent, type FocusEvent, type FormEvent } from 'react';
import { SplitLines } from '../motion/SplitLines';
import { Reveal } from '../motion/Reveal';
import { SITE, SOCIALS } from '../../data/site';
import { SERVICE_CATEGORIES } from '../../data/services';

type Status = 'idle' | 'sending' | 'success' | 'error';

interface FormState {
  name: string;
  company: string;
  email: string;
  phone: string;
  service: string;
  budget: string;
  message: string;
  /** Honeypot — humans never see or fill this. */
  website: string;
}

const INITIAL: FormState = {
  name: '',
  company: '',
  email: '',
  phone: '',
  service: '',
  budget: '',
  message: '',
  website: '',
};

const BUDGETS = ['Under $1,000', '$1,000 – $5,000', '$5,000 – $15,000', '$15,000+', 'Prefer to discuss'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: FormState): Partial<Record<keyof FormState, string>> {
  const errors: Partial<Record<keyof FormState, string>> = {};
  if (!values.name.trim()) errors.name = 'Add your full name.';
  if (!values.email.trim()) errors.email = 'Add an email so we can reply.';
  else if (!EMAIL_RE.test(values.email)) errors.email = "That email doesn't look complete.";
  if (!values.message.trim() || values.message.trim().length < 10)
    errors.message = 'Tell us a little about the project (a sentence is enough).';
  return errors;
}

function buildMailto(values: FormState): string {
  const subject = `Project inquiry — ${values.name}${values.company ? `, ${values.company}` : ''}`;
  const body = [
    `Name: ${values.name}`,
    values.company && `Company: ${values.company}`,
    `Email: ${values.email}`,
    values.phone && `Phone: ${values.phone}`,
    values.service && `Service interest: ${values.service}`,
    values.budget && `Estimated budget: ${values.budget}`,
    '',
    values.message,
  ]
    .filter(Boolean)
    .join('\n');
  return `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Project-inquiry experience. Submits to VITE_CONTACT_ENDPOINT when
 * configured (JSON POST — Formspree/Basin/own API all work); otherwise it
 * opens a prefilled email draft to info@solu1ions.com. Field-level and
 * form-level errors, duplicate-submit protection, honeypot spam guard.
 */
export function Contact() {
  const uid = useId();
  const [values, setValues] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [status, setStatus] = useState<Status>('idle');

  const fieldId = (name: keyof FormState) => `${uid}-${name}`;

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (touched[name as keyof FormState]) {
      setErrors(validate({ ...values, [name]: value }));
    }
  };

  const onBlur = (e: FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const name = e.target.name as keyof FormState;
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors(validate(values));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'sending') return;
    if (values.website) return; // Honeypot tripped — silently drop.

    const nextErrors = validate(values);
    setErrors(nextErrors);
    setTouched({ name: true, email: true, message: true });
    if (Object.keys(nextErrors).length > 0) return;

    const endpoint = import.meta.env.VITE_CONTACT_ENDPOINT;
    if (!endpoint) {
      // No backend configured — hand off to the visitor's mail client.
      window.location.href = buildMailto(values);
      setStatus('success');
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: values.name,
          company: values.company,
          email: values.email,
          phone: values.phone,
          service: values.service,
          budget: values.budget,
          message: values.message,
        }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const invalid = (name: keyof FormState) => Boolean(touched[name] && errors[name]);

  return (
    <section id="contact" className="section contact" aria-labelledby="contact-heading">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow t-label">Contact</p>
          <SplitLines as="h2" id="contact-heading" className="contact__title t-display">
            Let's build <em className="t-accent t-italic">what comes next.</em>
          </SplitLines>
        </div>

        <div className="contact__grid">
          {status === 'success' ? (
            <div className="contact__success" role="status">
              <p className="contact__success-title t-display">Request received.</p>
              <p>
                Thank you — the brief is on its way. We reply from{' '}
                <a href={`mailto:${SITE.email}`} className="t-accent">
                  {SITE.email}
                </a>
                .
              </p>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setValues(INITIAL);
                  setTouched({});
                  setErrors({});
                  setStatus('idle');
                }}
              >
                Send another inquiry
              </button>
            </div>
          ) : (
            <form className="contact__form" onSubmit={onSubmit} noValidate>
              <div className="contact__fields">
                <div className={`field ${invalid('name') ? 'is-invalid' : ''}`}>
                  <label htmlFor={fieldId('name')} className="t-label">
                    Full name *
                  </label>
                  <input
                    id={fieldId('name')}
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={values.name}
                    onChange={onChange}
                    onBlur={onBlur}
                    aria-invalid={invalid('name')}
                    aria-describedby={invalid('name') ? `${fieldId('name')}-err` : undefined}
                    required
                  />
                  {invalid('name') && (
                    <p id={`${fieldId('name')}-err`} className="field__error">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="field">
                  <label htmlFor={fieldId('company')} className="t-label">
                    Company
                  </label>
                  <input
                    id={fieldId('company')}
                    name="company"
                    type="text"
                    autoComplete="organization"
                    value={values.company}
                    onChange={onChange}
                  />
                </div>

                <div className={`field ${invalid('email') ? 'is-invalid' : ''}`}>
                  <label htmlFor={fieldId('email')} className="t-label">
                    Email *
                  </label>
                  <input
                    id={fieldId('email')}
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={values.email}
                    onChange={onChange}
                    onBlur={onBlur}
                    aria-invalid={invalid('email')}
                    aria-describedby={invalid('email') ? `${fieldId('email')}-err` : undefined}
                    required
                  />
                  {invalid('email') && (
                    <p id={`${fieldId('email')}-err`} className="field__error">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="field">
                  <label htmlFor={fieldId('phone')} className="t-label">
                    Phone
                  </label>
                  <input
                    id={fieldId('phone')}
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={values.phone}
                    onChange={onChange}
                  />
                </div>

                <div className="field">
                  <label htmlFor={fieldId('service')} className="t-label">
                    Service interest
                  </label>
                  <select id={fieldId('service')} name="service" value={values.service} onChange={onChange}>
                    <option value="">Select a discipline…</option>
                    {SERVICE_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.title.join(' ')}>
                        {c.title.join(' ')}
                      </option>
                    ))}
                    <option value="Not sure yet">Not sure yet</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor={fieldId('budget')} className="t-label">
                    Estimated budget
                  </label>
                  <select id={fieldId('budget')} name="budget" value={values.budget} onChange={onChange}>
                    <option value="">Select a range…</option>
                    {BUDGETS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={`field field--full ${invalid('message') ? 'is-invalid' : ''}`}>
                  <label htmlFor={fieldId('message')} className="t-label">
                    About the project *
                  </label>
                  <textarea
                    id={fieldId('message')}
                    name="message"
                    rows={5}
                    value={values.message}
                    onChange={onChange}
                    onBlur={onBlur}
                    aria-invalid={invalid('message')}
                    aria-describedby={invalid('message') ? `${fieldId('message')}-err` : undefined}
                    required
                  />
                  {invalid('message') && (
                    <p id={`${fieldId('message')}-err`} className="field__error">
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* Honeypot — hidden from people, tempting to bots. */}
                <div className="field field--hp" aria-hidden="true">
                  <label htmlFor={fieldId('website')}>Website</label>
                  <input
                    id={fieldId('website')}
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={values.website}
                    onChange={onChange}
                  />
                </div>
              </div>

              <div className="contact__actions">
                <button type="submit" className="btn btn--solid" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : 'Send the brief'}
                </button>
                <p className="contact__status" role="status" aria-live="polite">
                  {status === 'error' && (
                    <>
                      Something interrupted the send.{' '}
                      <a href={buildMailto(values)} className="t-accent">
                        Email us directly instead
                      </a>
                      .
                    </>
                  )}
                </p>
              </div>
            </form>
          )}

          <Reveal className="contact__aside" delay={0.1}>
            <p className="t-label t-accent">Direct</p>
            <a href={`mailto:${SITE.email}`} className="contact__email t-display">
              {SITE.email}
            </a>
            <p className="t-muted">{SITE.location}</p>

            <p className="t-label t-accent contact__aside-label">Follow</p>
            <ul className="contact__socials">
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="arrow-link">
                    {s.label} <span className="arrow" aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
