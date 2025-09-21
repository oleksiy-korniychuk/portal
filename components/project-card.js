import Link from 'next/link';
import clsx from 'clsx';

export default function ProjectCard({ project, isAuthenticated }) {
  return (
    <article className="project-card">
      <header className="project-card__header">
        <div>
          <h3 className="project-card__title">{project.name}</h3>
          <p className="project-card__status">{project.status}</p>
        </div>
      </header>
      <p className="project-card__description">{project.description}</p>
      <ul className="project-card__highlights">
        {project.highlights.map((highlight) => (
          <li key={highlight} className="project-card__highlight">
            {highlight}
          </li>
        ))}
      </ul>
      <footer className="project-card__footer">
        <Link
          href={project.href}
          className={clsx('button', 'button--secondary')}
          prefetch={false}
        >
          {isAuthenticated ? 'Launch (SSO ready)' : 'Preview project'}
        </Link>
      </footer>
    </article>
  );
}
