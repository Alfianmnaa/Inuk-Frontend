import HeroSection from "../components/landing/HeroSection";
import Navbar from "../components/layout/Navbar";
import RekapDonasi from "../components/landing/RekapDonasi";
import Tentang from "../components/landing/Tentang";
import Program from "../components/landing/Program";
import Layanan from "../components/landing/Layanan";
import Keunggulan from "../components/landing/Keunggulan";
import Blog from "../components/landing/Blog";
import FAQ from "../components/landing/FAQ";
import TimKami from "../components/landing/TimKami";
import Testimoni from "../components/landing/Testimoni";

const Landing = () => {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <RekapDonasi />
      <Tentang />
      <Program />
      <Layanan />
      <Keunggulan />
      <Blog />
      <FAQ />
      <TimKami />
      <Testimoni />
    </div>
  );
};

export default Landing;
