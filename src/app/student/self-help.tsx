import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Asset, Chips, Screen, ui, palette } from '@/components/wellbeing/screen';
import { wellbeingAssets as assets } from '@/constants/wellbeing-assets';
import { articles } from '@/constants/wellbeing-content';

const filters = ['All resources', 'Tips', 'Articles', 'Actions', 'Contact'] as const;
export default function SelfHelpScreen() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof filters)[number]>('All resources');
  const items = [
    ...articles.map(article => ({ title: article.title, meta: article.meta, icon: assets[article.icon], action: ['sleep', 'grounding', 'calming'].includes(article.id), open: () => router.push({ pathname: '/student/article', params: { id: article.id } }) })),
    { title: 'Box Breathing Technique', meta: 'Exercise, 5 min', icon: assets.libraryContainer5, action: true, open: () => router.push('/student/breathing') },
    ...(filter === 'Contact' ? [{ title: 'Support Resources', meta: 'Campus contacts and urgent help', icon: assets.supportSvg2, action: false, open: () => router.push('/student/support-resources') }] : []),
  ].filter(item => (filter === 'Contact' ? item.title === 'Support Resources' : filter !== 'Actions' || item.action) && (filter !== 'Tips' || item.meta.startsWith('Tips')) && (filter !== 'Articles' || item.meta.startsWith('Article')) && (item.title + ' ' + item.meta).toLowerCase().includes(query.trim().toLowerCase()));
  return <Screen title="Self-Help Library" subtitle="Practical tips, articles & exercises for student life" contentStyle={{ paddingHorizontal: 20, gap: 12 }}>
    <View style={ui.search}><Asset source={assets.libraryContainer} width={13} /><TextInput accessibilityLabel="Search resources" placeholder="Search articles, content..." placeholderTextColor={palette.muted} value={query} onChangeText={setQuery} style={ui.searchInput} returnKeyType="search" /></View>
    <Chips values={filters} value={filter} onChange={setFilter} />
    {items.map(item => <Pressable key={item.title} accessibilityRole="button" onPress={item.open} style={({ pressed }) => [ui.card, ui.row, { minHeight: 70, padding: 10, opacity: pressed ? 0.7 : 1 }]}>
      <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: palette.pink, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: palette.border }}><Asset source={item.icon} width={18} /></View>
      <View style={ui.grow}><Text style={[ui.title, { fontSize: 15.5 }]}>{item.title}</Text><Text style={[ui.small, { fontSize: 11, marginTop: 5 }]}>{item.meta}</Text></View>
      <Asset source={assets.libraryContainer2} width={17} height={14.5} />
    </Pressable>)}
    {!items.length && <Text style={ui.body}>No resources match your search. Try another word or category.</Text>}
  </Screen>;
}



