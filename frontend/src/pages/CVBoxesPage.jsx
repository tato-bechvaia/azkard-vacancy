import { PageShell, Container } from '../components/ui';
import CompanyBoxes from '../components/CompanyBoxes';

export default function CVBoxesPage() {
  return (
    <PageShell>
      <Container size='lg'>
        <div className='pt-12 pb-20'>
          {/* Header */}
          <div className='mb-4'>
            <p className='text-[10.5px] tracking-[0.2em] uppercase text-brand-400 font-semibold mb-2'>
              CV Boxes
            </p>
            <h1 className='font-display font-bold text-2xl sm:text-3xl text-text-primary tracking-tight mb-3'>
              კომპანიების CV Boxes
            </h1>
            <p className='text-md text-text-secondary max-w-xl leading-relaxed'>
              გაგზავნეთ თქვენი CV პირდაპირ კომპანიებში, მაშინაც კი თუ აქტიური ვაკანსია არ აქვთ.
              კომპანიები თქვენს CV-ს შეინახავენ და დაგიკავშირდებიან შესაბამისი პოზიციის გახსნისას.
            </p>
          </div>

          <CompanyBoxes />
        </div>
      </Container>
    </PageShell>
  );
}
