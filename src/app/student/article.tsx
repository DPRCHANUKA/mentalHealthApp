import { resourcePhotos } from '@/constants/resource-photos';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { Modal, Pressable, Share, Text, View } from 'react-native';
import { Asset, Button, Dialog, Screen, ui, palette } from '@/components/wellbeing/screen';
import { wellbeingAssets as assets } from '@/constants/wellbeing-assets';
import { articles } from '@/constants/wellbeing-content';

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const article = articles.find(item => item.id === (id ?? 'calming'));
  const extraGuide = article && ['study-stress', 'grounding', 'self-compassion', 'daily-routine'].includes(article.id);
  const guideUrl = article?.id === 'study-stress'
    ? 'https://www.nhs.uk/mental-health/feelings-symptoms-behaviours/feelings-and-symptoms/stress/'
    : 'https://www.who.int/news-room/questions-and-answers/item/stress';
  const insets = useSafeAreaInsets();
  const [fullImage, setFullImage] = useState(false);
  const topicPhoto = article && article.id in resourcePhotos ? resourcePhotos[article.id as keyof typeof resourcePhotos] : undefined;
  const hero = topicPhoto ? topicPhoto.source : article?.id === 'anxiety' ? require('../../../assets/images/wellbeing/daily-anxiety.png')
    : article?.id === 'sleep' ? require('../../../assets/images/wellbeing/sleep-meditation-bedroom.png')
    : assets.articleTranquilSteamingHerbalTeaRiverStonesAndFreshEucalyptusLeafInWarmMorningSunlight;
  const heroLabel = topicPhoto ? topicPhoto.label : article?.id === 'anxiety' ? 'A student taking a quiet pause beside a sunlit window'
    : article?.id === 'sleep' ? 'A peaceful moonlit bedroom with soft linen pillows and a warm bedside lamp'
    : 'Steaming herbal tea, river stones and eucalyptus in morning sunlight';
  const [largeText, setLargeText] = useState(false);
  const [settings, setSettings] = useState(false);
  const [message, setMessage] = useState('');
  async function share() {
    if (!article) return;
    try { await Share.share({ title: article.title, message: [article.title, ...article.paragraphs].join('\n\n') }); }
    catch { setMessage('Sharing is unavailable on this device. You can select and copy the article text.'); }
  }
  return <Screen title={article?.id === 'sleep' ? 'Sleep Meditation' : 'Self-Help Article'} back>
    {!article || !article.paragraphs.length ? <>
      <Text style={ui.heading}>{article?.title ?? 'Article not found'}</Text>
      <Text style={ui.body}>This resource could not be found. Choose another item from the library.</Text>
      <Button label="Explore the self-help library" onPress={() => router.replace('/student/self-help')} />
    </> : <>
      <Pressable accessibilityRole="button" accessibilityLabel="View photo full screen" onPress={() => setFullImage(true)} style={{ height: 227, borderRadius: 16, overflow: 'hidden', backgroundColor: palette.surface, marginBottom: 8 }}>
        <Image source={hero} style={{ width: '100%', height: 227 }} contentFit="cover" accessibilityLabel={heroLabel} />
        <Text style={{ position: 'absolute', top: 12, right: 12, color: '#FFF', backgroundColor: 'rgba(0,0,0,0.55)', padding: 8, borderRadius: 12 }}>⛶ Full screen</Text>
        <View style={{ position: 'absolute', bottom: 12, right: 12, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Asset source={assets.articleContainer} width={12} height={8} /><Text style={{ fontSize: 11 }}>{article.readTime}</Text>
        </View>
      </Pressable>
      <View><Text style={[ui.title, { fontSize: 24, fontWeight: '700' }]}>{article.title}</Text>{!!article.author && <Text style={[ui.small, { marginTop: 5 }]}>By Author - {article.author}</Text>}</View>
      {article.paragraphs.map((paragraph, index) => <Text selectable key={index} style={[ui.body, { fontSize: largeText ? 20 : 16, lineHeight: largeText ? 32 : 26 }]}>{paragraph}</Text>)}
            {article.id !== 'sleep' && <Button label="Try the guided breathing exercise" onPress={() => router.push('/student/breathing')} />}
      {article.id !== 'calming' && <>
        <Button label="Explore support resources" tone="secondary" onPress={() => router.push('/student/support-resources')} />
        <Text style={ui.small}>General wellbeing information, not a diagnosis or a replacement for individual care.</Text>
        <Pressable accessibilityRole="link" style={{ minHeight: 44, justifyContent: 'center' }} onPress={async () => {
          const url = extraGuide ? guideUrl : article.id === 'sleep'
            ? 'https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/how-to-fall-asleep-faster-and-sleep-better/how-can-meditation-help-with-sleep/'
            : 'https://www.nhs.uk/mental-health/feelings-symptoms-behaviours/feelings-and-symptoms/anxiety-fear-panic/';
          try { await Linking.openURL(url); }
          catch { setMessage('Could not open the NHS guidance. Please try again when a browser is available.'); }
        }}><Text style={ui.link}>{extraGuide ? 'Read more about managing stress' : 'Read NHS guidance on ' + (article.id === 'sleep' ? 'sleep meditation' : 'anxiety')}</Text></Pressable>
      </>}
      <View style={[ui.row, { justifyContent: 'space-between' }]}>
        <Text style={[ui.title, { color: palette.muted }]}>Article tools</Text>
        <View style={ui.row}>
          <Pressable accessibilityRole="button" accessibilityLabel="Share article" style={ui.iconButton} onPress={share}><Asset source={assets.articleSvg} width={14} /></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Article settings" style={ui.iconButton} onPress={() => setSettings(true)}><Asset source={assets.articleSvg1} width={14} /></Pressable>
        </View>
      </View>
      {!!message && <Text accessibilityLiveRegion="polite" style={ui.small}>{message}</Text>}
    </>}
    <Modal visible={fullImage} animationType="fade" onRequestClose={() => setFullImage(false)}>
      <View accessibilityViewIsModal style={{ flex: 1, backgroundColor: '#101820', paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close full-screen photo" onPress={() => setFullImage(false)} style={{ minHeight: 48, alignSelf: 'flex-end', padding: 16 }}>
          <Text style={{ color: '#FFF', fontSize: 16 }}>Close ✕</Text>
        </Pressable>
        <Image source={hero} style={{ flex: 1, width: '100%' }} contentFit="contain" accessibilityLabel={heroLabel} />
        <Text style={{ color: '#FFF', textAlign: 'center', padding: 20 }}>{article?.title}</Text>
      </View>
    </Modal>
    <Dialog title="Reading settings" visible={settings} onClose={() => setSettings(false)}>
      <Button label={largeText ? 'Use standard text' : 'Use larger text'} onPress={() => setLargeText(!largeText)} />
    </Dialog>
  </Screen>;
}








