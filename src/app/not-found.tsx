import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold">404</h1>
          <h2 className="text-2xl font-semibold text-muted-foreground">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist.
          </p>
        </div>

        <Link href="/dashboard">
          <Button className="w-full">Go to Dashboard</Button>
        </Link>

        <Link href="/">
          <Button variant="outline" className="w-full">
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
