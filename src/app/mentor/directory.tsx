import { MentorScreen } from '@/components/mentor/screen';
import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Asset, Button, Chips, Dialog, ui, palette } from '@/components/wellbeing/screen';
import { wellbeingAssets as assets } from '@/constants/wellbeing-assets';
import { counsellors } from '@/constants/wellbeing-content';

const filters = ['All', 'Psychologist', 'Counsellor'] as const;
export default function CounsellingDirectoryScreen() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const [selected, setSelected] = useState<(typeof counsellors)[number] | null>(null);
  const matches = counsellors.filter(person => (filter === 'All' || person.speciality === filter) && `${person.name} ${person.speciality}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <MentorScreen title="Counselling Directory" back contentStyle={{ gap: 26, paddingTop: 8 }}>
    <View style={[ui.search, { borderRadius: 10 }]}><Asset source={assets.directoryFrame} width={24} /><TextInput accessibilityLabel="Search counsellors" placeholder="Search by name or speciality" placeholderTextColor={palette.muted} style={[ui.searchInput, { fontFamily: 'IrishGrover', fontSize: 16 }]} value={query} onChangeText={setQuery} /></View>
    <Chips values={filters} value={filter} onChange={setFilter} />
    <View style={{ gap: 28, marginTop: 16 }}>
      {matches.map((person, index) => <Pressable key={person.id} accessibilityRole="button" accessibilityLabel={`View ${person.name}, ${person.speciality}`} onPress={() => setSelected(person)} style={[ui.card, ui.row, { minHeight: 80, backgroundColor: index % 2 ? palette.lavender : palette.pink, borderRadius: 20, paddingHorizontal: 20 }]}>
        <Asset source={assets[person.asset]} width={43} />
        <View style={[ui.grow, { marginLeft: 18 }]}><Text style={[ui.title, { fontSize: 23 }]}>{person.name}</Text><Text style={[ui.title, { fontSize: 16 }]}>{person.speciality}</Text></View>
        <Asset source={assets.directoryImage34} width={27} />
      </Pressable>)}
      {!matches.length && <Text style={ui.body}>No counsellors match your search.</Text>}
    </View>
    <View style={[ui.card, { marginTop: 32, backgroundColor: palette.surface, gap: 12 }]}><Text style={[ui.title, { color: palette.muted, fontSize: 20 }]}>Next Appointment</Text><Text style={[ui.title, { fontSize: 16, color: palette.muted }]}>No upcoming appointment</Text></View>
    <Dialog title={selected?.name ?? 'Counsellor'} visible={!!selected} onClose={() => setSelected(null)}>
      <Text style={ui.title}>{selected?.speciality}</Text>
      <Text style={ui.body}>This is a sample directory from the design. Live availability and appointment booking have not been connected.</Text>
      <Button label="Support resources" onPress={() => { setSelected(null); router.push('/student/support-resources'); }} />
      <Button label="Prepare mentor referral" tone="secondary" onPress={() => { setSelected(null); router.push({ pathname: '/mentor/referral', params: { recipient: selected?.id } }); }} />
    </Dialog>
  </MentorScreen>;
}



