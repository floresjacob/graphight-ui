// app/explore/layout.tsx
export default function Layout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="w-full min-h-screen">
        {children}
      </div>
    );
  }