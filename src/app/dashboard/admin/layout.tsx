import { redirect } from 'next/navigation';
import { getSessionOrThrow, hasRole } from '@/lib/authorization';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionOrThrow();
  
  if (!hasRole(user, "ADMIN")) {
    redirect('/dashboard?error=unauthorized');
  }

  return (
    <>
      {children}
    </>
  );
}
