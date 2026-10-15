import { MentorScreen } from '@/components/mentor/screen';
import { DeleteProfileButton } from '@/components/wellbeing/delete-profile-button';
import { ProfileContent } from '@/components/wellbeing/profile-content';
import { clearMentorSession, deleteMentorProfile, saveProfile, useMentorSession } from '@/state/mentor-session';
import { router } from 'expo-router';

export default function MentorProfileScreen() {
  const { profile } = useMentorSession();
  return <MentorScreen title="My Profile" subtitle="Your details, your space." contentStyle={{ gap: 18 }}>
    <ProfileContent role="Mentor" profile={profile} onSave={saveProfile} onLogout={() => { clearMentorSession(); router.replace('/role-selection'); }} />
    <DeleteProfileButton onDelete={deleteMentorProfile} />
  </MentorScreen>;
}