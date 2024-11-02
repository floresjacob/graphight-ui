// app/explore/loading.tsx

export default function Loading() {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="space-y-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading graph visualization...</p>
        </div>
      </div>
    );
  }