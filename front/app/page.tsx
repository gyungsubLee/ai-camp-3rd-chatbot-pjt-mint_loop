import { Header } from '@/components/layout/Header';
import { Hero } from '@/components/landing/Hero';
import { ConceptPreview } from '@/components/landing/ConceptPreview';
import { FeatureShowcase } from '@/components/landing/FeatureShowcase';
import { CallToAction } from '@/components/landing/CallToAction';
import { Footer } from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <ConceptPreview />
      <FeatureShowcase />
      <CallToAction />
      <Footer />
    </main>
  );
}
