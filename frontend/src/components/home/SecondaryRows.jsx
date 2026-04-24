import CarouselSection from '../CarouselSection';
import CompanyBoxes    from '../CompanyBoxes';

/**
 * SecondaryRows — shown below <MainJobList> only when no filters are active.
 *
 * Sections:
 *  1. სტაჟირება     — internship carousel (only if data exists)
 *  2. Direct Connect — CompanyBoxes CV-drop feature (self-managed data fetch)
 *
 * NOTE: CarouselSection uses abbreviated Georgian labels (დისტ., ჰიბრ., ადგ.)
 * and inline styles. That is a known Phase 1 audit issue; fixing it is deferred
 * to the CarouselSection refactor in Phase 3.
 */
export default function SecondaryRows({ filtersActive, internships = [] }) {
  if (filtersActive) return null;

  const hasInternships = internships.length > 0;
  if (!hasInternships) {
    // No internship data yet — still render CompanyBoxes (it self-fetches)
    return (
      <div className='max-w-6xl mx-auto px-6 border-t border-border-subtle'>
        <CompanyBoxes />
      </div>
    );
  }

  return (
    <div className='max-w-6xl mx-auto px-6'>

      {/* ── Internships ────────────────────────────────────────────── */}
      <div className='py-8 border-t border-border-subtle'>
        <CarouselSection
          title='სტაჟირება'
          icon='🚀'
          jobs={internships}
          dark={true}
          badge={internships.length}
        />
      </div>

      {/* ── Direct Connect / CV Drop ───────────────────────────────── */}
      <div className='border-t border-border-subtle'>
        <CompanyBoxes />
      </div>

    </div>
  );
}
