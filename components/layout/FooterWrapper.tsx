// components/layout/FooterWrapper.tsx
import { Suspense } from 'react';
import Footer from './Footer';
import FooterController from './FooterController';

export default function FooterWrapper() {
  return (
    <FooterController>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </FooterController>
  );
}
