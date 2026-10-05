import { Navbar, Footer } from "@/components/layout";
import { Hero, WhyForge, Features, HowItWorks, Pricing, FAQ } from "@/components/home";
import { RedirectIfAuthenticated } from "@/components/auth/AuthRedirect";

export default function Home() {
  return (
    <RedirectIfAuthenticated>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <WhyForge />
      <Pricing />
      <FAQ />
      <Footer />
    </RedirectIfAuthenticated>
  );
}
