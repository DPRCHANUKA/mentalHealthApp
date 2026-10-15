import { DeleteProfileButton } from '@/components/wellbeing/delete-profile-button';
import { ProfileContent } from '@/components/wellbeing/profile-content';
import { Screen } from '@/components/wellbeing/screen';
import { clearStudentProfile, deleteStudentProfile, saveStudentProfile, useStudentProfile } from '@/state/student-profile';
import { router } from 'expo-router';

export default function StudentProfileScreen() {
  const profile = useStudentProfile();
  return <Screen title="My Profile" subtitle="Your details, your space." contentStyle={{ gap: 18 }}>
    <ProfileContent role="Student" profile={profile} onSave={saveStudentProfile} onLogout={() => { clearStudentProfile(); router.replace('/role-selection'); }} />
    <DeleteProfileButton onDelete={deleteStudentProfile} />
  </Screen>;
}