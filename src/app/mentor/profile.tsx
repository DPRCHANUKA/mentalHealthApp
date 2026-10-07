import { router } from 'expo-router';
import { MentorScreen } from '@/components/mentor/screen';
import { ProfileContent } from '@/components/wellbeing/profile-content';
import { clearMentorSession, saveProfile, useMentorSession } from '@/state/mentor-session';
export default function MentorProfileScreen() {
  const { profile } = useMentorSession();
  return <MentorScreen title="My Profile" subtitle="Your details, your space." contentStyle={{ gap: 18 }}>
    <ProfileContent role="Mentor" profile={profile} onSave={saveProfile} onLogout={() => { clearMentorSession(); router.replace('/role-selection'); }} />
  </MentorScreen>;
}

