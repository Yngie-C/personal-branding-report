import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/server';
import BriefProfileLayout from './BriefProfileLayout';
import FullProfileLayout from './FullProfileLayout';

interface ProfilePageProps {
  params: {
    slug: string;
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { slug } = params;

  // 웹 프로필 데이터 로드
  const { data: profile, error } = await supabaseAdmin
    .from('web_profiles')
    .select('*')
    .eq('slug', slug)
    .eq('is_public', true)
    .single();

  if (error || !profile) {
    notFound();
  }

  const profileData = profile.profile_data as any;
  const profileType = profile.type as 'brief' | 'full' | undefined;
  const seoData = profile.seo_data as any;

  console.log(`[ProfilePage] Rendering ${profileType || 'full'} profile for slug: ${slug}`);

  // Brief 프로필 렌더링
  if (profileType === 'brief') {
    return <BriefProfileLayout profileData={profileData} />;
  }

  // Full 프로필 렌더링 (기본값)
  return <FullProfileLayout profileData={profileData} seoData={seoData} />;
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { slug } = params;

  const { data: profile } = await supabaseAdmin
    .from('web_profiles')
    .select('seo_data')
    .eq('slug', slug)
    .single();

  const seoData = profile?.seo_data as any;

  return {
    title: seoData?.title || '퍼스널 브랜딩 프로필',
    description: seoData?.description || '',
  };
}
