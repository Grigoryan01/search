import type { FormSubmission } from '../../types/form';
import './SubmissionCard.css';

interface SubmissionCardProps {
  submission: FormSubmission;
}

export function SubmissionCard({ submission }: SubmissionCardProps) {
  const formLabel =
    submission.formType === 'uncontrolled' ? 'Uncontrolled Form' : 'React Hook Form';

  return (
    <article
      className={`submission-card${submission.isNew ? ' submission-card--new' : ''}`}
      data-testid="submission-card"
    >
      <header className="submission-card__header">
        <h3>{submission.name}</h3>
        <span className="submission-card__badge">{formLabel}</span>
      </header>
      {submission.imageBase64 ? (
        <img
          src={submission.imageBase64}
          alt={`Profile uploaded by ${submission.name}`}
          className="submission-card__image"
        />
      ) : null}
      <dl className="submission-card__details">
        <div>
          <dt>Age</dt>
          <dd>{submission.age}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{submission.email}</dd>
        </div>
        <div>
          <dt>Gender</dt>
          <dd>{submission.gender}</dd>
        </div>
        <div>
          <dt>Country</dt>
          <dd>{submission.country}</dd>
        </div>
        <div>
          <dt>Terms accepted</dt>
          <dd>{submission.acceptTerms ? 'Yes' : 'No'}</dd>
        </div>
      </dl>
    </article>
  );
}
