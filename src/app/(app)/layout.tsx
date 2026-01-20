import { authConfig } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || headersList.get('referer') || '';

  // Only require auth for campaign URLs
  if (pathname.includes('/campaigns/')) {
    const session = await getServerSession(authConfig);

    if (!session?.user) {
      redirect('/login');
    }
  }

  return <div className="">{children}</div>;
}
