export default function WatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="hide-layout">{children}</div>;
}
