import Navbar from './Navbar';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-black/20 border-b border-white/5">
      <div className="px-[162px] py-5">
        <Navbar />
      </div>
    </header>
  );
}
