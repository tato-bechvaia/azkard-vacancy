import Navbar from '../Navbar';

/**
 * PageShell — consistent page wrapper.
 *
 * Renders Navbar + dark-themed full-height layout.
 * Applies top padding to clear the fixed nav (and optional test banner).
 *
 * Props:
 *  - withNav (default true): show the navbar
 *  - className: additional classes on the main content area
 *  - children: page content
 */
export default function PageShell({
  withNav = true,
  className = '',
  children,
}) {
  return (
    <div className='min-h-screen bg-surface text-text-primary'>
      {withNav && <Navbar />}
      <div className={withNav ? `pt-[5.25rem] ${className}` : className}>
        {children}
      </div>
    </div>
  );
}
