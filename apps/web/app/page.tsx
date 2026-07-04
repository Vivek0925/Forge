import { Navbar, Footer } from "@/components/layout";
import { Hero, WhyForge, Features, HowItWorks, CTA } from "@/components/home";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <WhyForge />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
    </>
  );
}
