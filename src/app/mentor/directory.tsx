import { MentorScreen } from '@/components/mentor/screen';
import { mentorStyles as s } from '@/components/mentor/styles';
import { Asset, Button, Chips, Dialog, palette, ui } from '@/components/wellbeing/screen';
import { wellbeingAssets as assets } from '@/constants/wellbeing-assets';
import { counsellors } from '@/constants/wellbeing-content';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

const filters = ['All', 'Psychologist', 'Counsellor'] as const;
export default function CounsellingDirectoryScreen() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const [selected, setSelected] = useState<(typeof counsellors)[number] | null>(null);
  const matches = counsellors.filter(person => (filter === 'All' || person.speciality === filter) && `${person.name} ${person.speciality}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <MentorScreen title="Counselling Directory" back subtitle="Find the right person to talk to." contentStyle={{ gap: 18, paddingTop: 8 }}>
    <View style={s.notice}><Text style={s.eyebrow}>SUPPORT, AT YOUR PACE</Text><Text style={ui.small}>Browse sample professionals by name or service. Live availability is not connected.</Text></View>

    {/* Premium search bar */}
    <View style={[ui.search, {
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: query ? palette.teal : palette.border,
      paddingHorizontal: 14,
      backgroundColor: '#FFF',
      shadowColor: palette.teal,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 8,
      elevation: 3,
    }]}>
      <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#E3EEEB', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="search" size={18} color={palette.teal} />
      </View>
      <TextInput
        accessibilityLabel="Search counsellors"
        placeholder="Search by name or speciality"
        placeholderTextColor={palette.muted}
        style={[ui.searchInput, { fontSize: 16, minHeight: 52 }]}
        value={query}
        onChangeText={setQuery}
        returnKeyType="search"
      />
      {query.length > 0 && (
        <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery('')} hitSlop={10}>
          <Ionicons name="close-circle" size={20} color={palette.muted} />
        </Pressable>
      )}
    </View>

    <Chips values={filters} value={filter} onChange={setFilter} />
    <View style={{ gap: 14, marginTop: 4 }}>
      {matches.map((person, index) => <Pressable key={person.id} accessibilityRole="button" accessibilityLabel={`View ${person.name}, ${person.speciality}`} onPress={() => setSelected(person)} style={[s.panel, ui.row, { minHeight: 104, borderLeftWidth: 4, borderLeftColor: index % 2 ? '#9F98C6' : palette.teal }]}>
        <Asset source={assets[person.asset]} width={52} />
        <View style={[ui.grow, { marginLeft: 4 }]}><Text style={[ui.title, { fontSize: 18 }]}>{person.name}</Text><Text style={[ui.small, { marginTop: 5 }]}>{person.speciality}</Text></View>
        <Asset source={assets.directoryImage34} width={27} />
      </Pressable>)}
      {!matches.length && <Text style={ui.body}>No counsellors match your search.</Text>}
    </View>
    <View style={[ui.card, { marginTop: 8, backgroundColor: '#E3EEEB', gap: 8, shadowOpacity: 0 }]}><Text style={[ui.title, { color: palette.muted, fontSize: 20 }]}>Next Appointment</Text><Text style={[ui.title, { fontSize: 16, color: palette.muted }]}>No upcoming appointment</Text></View>
    <Dialog title={selected?.name ?? 'Counsellor'} visible={!!selected} onClose={() => setSelected(null)}>
      <Text style={ui.title}>{selected?.speciality}</Text>
      <Text style={ui.body}>This is a sample directory from the design. Live availability and appointment booking have not been connected.</Text>
      <Button label="Support resources" onPress={() => { setSelected(null); router.push('/student/support-resources'); }} />
      <Button label="Prepare mentor referral" tone="secondary" onPress={() => { setSelected(null); router.push({ pathname: '/mentor/referral', params: { recipient: selected?.id } }); }} />
    </Dialog>
  </MentorScreen>;
}