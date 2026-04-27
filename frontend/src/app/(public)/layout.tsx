import { SiteNav } from "@/components/site-nav";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteNav />
      <div className="flex-1">{children}</div>
    </>
  );
}
