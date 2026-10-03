import { Navbar, Footer } from "@/components/layout";
import { Hero, WhyForge, Features, HowItWorks, CTA } from "@/components/home";
import { RedirectIfAuthenticated } from "@/components/auth/AuthRedirect";

export default function Home() {
  return (
    <RedirectIfAuthenticated>
      <Navbar />
      <Hero />
      <WhyForge />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
    </RedirectIfAuthenticated>
  );
}
