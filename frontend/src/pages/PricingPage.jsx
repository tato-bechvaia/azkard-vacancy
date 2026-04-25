import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { PageShell, Container } from '../components/ui';

const PLANS = [
  {
    tier: 'USUAL',
    name: 'Standard',
    nameGeo: 'სტანდარტული',
    price: 35,
    color: 'gray',
    features: [
      'ვაკანსია ძებნაში გამოჩნდება',
      '30 დღე განთავსება',
      'განაცხადების მართვა',
      'განმცხადებლების ნახვა',
      'სტატისტიკა',
    ],
    missing: [
      'Premium ბეჯი',
      'კარუსელში გამოჩენა',
      'მთავარ გვერდზე პრიორიტეტი',
    ],
  },
  {
    tier: 'PREMIUM',
    name: 'Premium',
    nameGeo: 'პრემიუმ',
    price: 65,
    color: 'amber',
    features: [
      'ყველაფერი Standard-ში',
      'Premium ბეჯი ვაკანსიაზე',
      'კარუსელში გამოჩენა',
      'ძებნაში პრიორიტეტული ჩვენება',
      '30 დღე განთავსება',
    ],
    missing: [
      'მთავარ გვერდზე Top კარუსელი',
      'მაქსიმალური პრიორიტეტი',
    ],
  },
  {
    tier: 'PREMIUM_PLUS',
    name: 'Premium+',
    nameGeo: 'პრემიუმ+',
    price: 95,
    color: 'brand',
    featured: true,
    features: [
      'ყველაფერი Premium-ში',
      'მთავარ გვერდზე Top კარუსელი',
      'მაქსიმალური პრიორიტეტი ყველგან',
      'Premium+ ბეჯი (ოქროსფერი)',
      'კანდიდატებთან პირველი კონტაქტი',
      '30 დღე განთავსება',
    ],
    missing: [],
  },
];

export default function PricingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSelect = (tier) => {
    if (!user) return navigate('/register');
    if (user.role === 'EMPLOYER') return navigate('/profile');
    navigate('/register');
  };

  return (
    <PageShell>
      <Container size='lg'>
        <div className='pt-12 pb-20'>
          {/* Header */}
          <div className='text-center mb-14'>
            <p className='text-[10.5px] tracking-[0.25em] uppercase text-brand-400 font-semibold mb-3'>
              ფასები
            </p>
            <h1 className='font-display font-bold text-3xl sm:text-4xl text-text-primary tracking-tight mb-4'>
              აირჩიეთ თქვენი გეგმა
            </h1>
            <p className='text-md text-text-secondary max-w-lg mx-auto leading-relaxed'>
              განათავსეთ ვაკანსია და მიიზიდეთ საუკეთესო კანდიდატები. რაც უფრო მაღალი პაკეტი, მით მეტი ხილვადობა.
            </p>
          </div>

          {/* Plans grid */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto'>
            {PLANS.map((plan) => {
              const isFeatured = plan.featured;
              return (
                <div
                  key={plan.tier}
                  className={[
                    'relative rounded-2xl border-2 p-6 flex flex-col transition-all duration-200',
                    isFeatured
                      ? 'border-brand-500 bg-surface-50 shadow-glow-brand scale-[1.03] z-10'
                      : plan.color === 'amber'
                        ? 'border-amber-200/40 bg-surface-50 hover:border-amber-300/60'
                        : 'border-border bg-surface-50 hover:border-border-strong',
                  ].join(' ')}
                >
                  {/* Featured badge */}
                  {isFeatured && (
                    <div className='absolute -top-3.5 left-1/2 -translate-x-1/2'>
                      <span className='inline-flex items-center gap-1.5 bg-brand-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full tracking-wider uppercase shadow-lg'>
                        <svg width='10' height='10' viewBox='0 0 24 24' fill='currentColor'>
                          <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'/>
                        </svg>
                        რეკომენდირებული
                      </span>
                    </div>
                  )}

                  {/* Plan name */}
                  <div className='mb-5 pt-2'>
                    <h3 className={[
                      'font-display font-bold text-xl tracking-tight',
                      isFeatured ? 'text-brand-400' : plan.color === 'amber' ? 'text-amber-400' : 'text-text-primary',
                    ].join(' ')}>
                      {plan.name}
                    </h3>
                    <p className='text-xs text-text-muted mt-1'>{plan.nameGeo}</p>
                  </div>

                  {/* Price */}
                  <div className='mb-6'>
                    <div className='flex items-baseline gap-1.5'>
                      <span className={[
                        'font-display font-bold text-[2.75rem] leading-none',
                        isFeatured ? 'text-brand-400' : 'text-text-primary',
                      ].join(' ')}>
                        {plan.price}
                      </span>
                      <span className='text-lg text-text-muted font-medium'>₾</span>
                    </div>
                    <p className='text-xs text-text-muted mt-1.5'>ერთი ვაკანსია · 30 დღე</p>
                  </div>

                  {/* Features */}
                  <ul className='flex-1 space-y-2.5 mb-8'>
                    {plan.features.map((feat) => (
                      <li key={feat} className='flex items-start gap-2.5 text-sm text-text-secondary'>
                        <svg width='14' height='14' viewBox='0 0 24 24' fill='none'
                          className={[
                            'flex-shrink-0 mt-0.5',
                            isFeatured ? 'text-brand-400' : plan.color === 'amber' ? 'text-amber-400' : 'text-success',
                          ].join(' ')}
                          stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                          <polyline points='20 6 9 17 4 12'/>
                        </svg>
                        {feat}
                      </li>
                    ))}
                    {plan.missing.map((feat) => (
                      <li key={feat} className='flex items-start gap-2.5 text-sm text-text-muted/40'>
                        <svg width='14' height='14' viewBox='0 0 24 24' fill='none'
                          className='flex-shrink-0 mt-0.5 text-text-muted/30'
                          stroke='currentColor' strokeWidth='2' strokeLinecap='round'>
                          <line x1='18' y1='6' x2='6' y2='18'/><line x1='6' y1='6' x2='18' y2='18'/>
                        </svg>
                        {feat}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => handleSelect(plan.tier)}
                    className={[
                      'w-full h-11 rounded-xl text-[13px] font-semibold transition-all duration-150',
                      isFeatured
                        ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/20'
                        : plan.color === 'amber'
                          ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-400/20'
                          : 'bg-surface-200 hover:bg-surface-300 text-text-primary border border-border',
                    ].join(' ')}
                  >
                    {user?.role === 'EMPLOYER' ? 'არჩევა' : 'დაიწყეთ ახლა'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Bottom note */}
          <div className='text-center mt-12'>
            <p className='text-sm text-text-muted max-w-md mx-auto'>
              ყველა გეგმა მოიცავს 30 დღიან განთავსებას, განაცხადების მართვას და სტატისტიკას.
              გადახდა ხორციელდება Stripe-ით.
            </p>
          </div>
        </div>
      </Container>
    </PageShell>
  );
}
