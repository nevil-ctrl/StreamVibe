import Navbar from './Navbar';

export default function Header() {
  return (
    <header className="sticky top-0 left-0 z-50 w-full">
      <div className="mx-auto max-w-[1600px] px-18 pt-8">
        <Navbar />
      </div>
    </header>
  );
}
