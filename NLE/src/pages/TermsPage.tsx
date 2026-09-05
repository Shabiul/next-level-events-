import { useLocation } from 'react-router-dom';
import { TermsPage as TermsContent } from '../components/TermsPage';
import { useAppBack } from '../hooks/useAppBack';
import { SeoHead } from '../components/layout/SeoHead';

const ROUTE_TO_PAGEKEY = {
  '/terms': 'terms',
  '/privacy': 'privacy',
  '/refund': 'refund',
  '/about': 'about',
} as const;

const TITLES: Record<string, string> = {
  terms: 'Terms of Service — The Decor Party',
  privacy: 'Privacy Policy — The Decor Party',
  refund: 'Refund & Cancellation Policy — The Decor Party',
  about: 'About Us — The Decor Party',
};

export default function TermsPage() {
  const location = useLocation();
  const goBackToHome = useAppBack('/');

  const pageKey =
    ROUTE_TO_PAGEKEY[
      location.pathname as keyof typeof ROUTE_TO_PAGEKEY
    ] || 'terms';

  return (
    <>
      <SeoHead
        title={TITLES[pageKey] || 'Legal & Policies — The Decor Party'}
        description={`Read The Decor Party's ${pageKey} policies for transparent booking, payment terms, and party styling services in Bengaluru.`}
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: TITLES[pageKey] || 'Policies', item: location.pathname },
        ]}
      />
      <TermsContent
        pageKey={pageKey}
        onClose={goBackToHome}
      />
    </>
  );
}