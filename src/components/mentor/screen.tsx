import { Screen } from '@/components/wellbeing/screen';
import { type ComponentProps } from 'react';

export function MentorScreen({
  navigation: _navigation,
  ...props
}: ComponentProps<typeof Screen> & { navigation?: boolean }) {
  return <Screen {...props} footer={false} />;
}