import { Redirect } from 'expo-router';
import { useAppStore } from '@/lib/store';

export default function Index() {
  const { isAuthenticated } = useAppStore();

  if (isAuthenticated) {
    return <Redirect href={'/calculator' as any} />;
  }

  return <Redirect href={'/login' as any} />;
}
