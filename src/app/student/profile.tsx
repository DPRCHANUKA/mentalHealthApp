import { router } from 'expo-router';
import { Screen } from '@/components/wellbeing/screen';
import { ProfileContent } from '@/components/wellbeing/profile-content';
import { clearStudentProfile, saveStudentProfile, useStudentProfile } from '@/state/student-profile';
export default function StudentProfileScreen() {
  const profile = useStudentProfile();
  return <Screen title="My Profile" subtitle="Your details, your space." contentStyle={{ gap: 18 }}>
    <ProfileContent role="Student" profile={profile} onSave={saveStudentProfile} onLogout={() => { clearStudentProfile(); router.replace('/role-selection'); }} />
  </Screen>;
}

