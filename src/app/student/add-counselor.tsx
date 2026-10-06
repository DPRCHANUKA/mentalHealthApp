import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Change this if you use a different currency
const CURRENCY = 'Rs.';

const SPECIALTIES = [
  'Anxiety Management',
  'Self-Compassion',
  'Overthinking',
  'Stress',
];

type SessionKey = 'video' | 'audio' | 'office';
type Gender = 'Male' | 'Female';

const SESSION_FORMATS: { key: SessionKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'video', label: '1 to 1 Video', icon: 'videocam-outline' },
  { key: 'audio', label: 'Audio Call', icon: 'call-outline' },
  { key: 'office', label: 'Live in Office', icon: 'business-outline' },
];

export default function AddCounselorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [age, setAge] = useState('');
  const [about, setAbout] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [formats, setFormats] = useState<SessionKey[]>([]);
  const [fees, setFees] = useState<Record<SessionKey, string>>({
    video: '',
    audio: '',
    office: '',
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const toggleItem = <T,>(list: T[], item: T): T[] =>
    list.includes(item) ? list.filter((i) => i !== item) : [...list, item];

  const validate = (): string | null => {
    if (!firstName.trim()) return 'Please enter the first name.';
    if (!lastName.trim()) return 'Please enter the last name.';
    if (!gender) return 'Please select a gender.';
    const ageNumber = Number(age);
    if (!age || ageNumber < 18 || ageNumber > 100) {
      return 'Please enter a valid age (18 - 100).';
    }
    if (!about.trim()) return 'Please write a short description in About Me.';
    if (specialties.length === 0) return 'Please select at least one specialty.';
    if (formats.length === 0) return 'Please select at least one session format.';
    for (const key of formats) {
      if (!fees[key] || Number(fees[key]) <= 0) {
        const label = SESSION_FORMATS.find((f) => f.key === key)?.label;
        return `Please enter the fee for ${label}.`;
      }
    }
    return null;
  };

  const handleAdd = () => {
    const error = validate();
    if (error) {
      Alert.alert('Missing information', error);
      return;
    }

    const counselor = {
      photoUri,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender,
      age: Number(age),
      about: about.trim(),
      specialties,
      sessions: formats.map((key) => ({
        format: key,
        fee: Number(fees[key]),
      })),
    };

    // TODO: save to your backend / database / shared state here
    console.log('New counselor:', counselor);

    Alert.alert('Counselor added', `${counselor.firstName} ${counselor.lastName} has been added.`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back" size={26} color="#6B7280" />
          </Pressable>
          <Text style={styles.heading}>Add Counselor</Text>
        </View>

        {/* Photo */}
        <View style={styles.photoSection}>
          <Pressable onPress={pickImage} style={styles.photoCircle}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="camera-outline" size={34} color="#4FA69E" />
                <Text style={styles.photoHint}>Add photo</Text>
              </View>
            )}
          </Pressable>
          {photoUri && (
            <Pressable onPress={pickImage}>
              <Text style={styles.changePhoto}>Change photo</Text>
            </Pressable>
          )}
        </View>

        {/* Name */}
        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Enter first name"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="words"
        />

        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Enter last name"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="words"
        />

        {/* Gender */}
        <Text style={styles.label}>Gender</Text>
        <View style={styles.row}>
          {(['Male', 'Female'] as Gender[]).map((g) => {
            const selected = gender === g;
            return (
              <Pressable
                key={g}
                onPress={() => setGender(g)}
                style={[styles.optionBox, selected && styles.optionBoxSelected]}
              >
                <Ionicons
                  name={selected ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={selected ? '#FFFFFF' : '#4FA69E'}
                />
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                  {g}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Age */}
        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ''))}
          placeholder="Enter age"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          maxLength={3}
        />

        {/* About */}
        <Text style={styles.label}>About Me</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={about}
          onChangeText={setAbout}
          placeholder="Write a short description about the counselor"
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />

        {/* Specialties */}
        <Text style={styles.label}>Specialties & Focus</Text>
        <View style={styles.chipWrap}>
          {SPECIALTIES.map((item) => {
            const selected = specialties.includes(item);
            return (
              <Pressable
                key={item}
                onPress={() => setSpecialties((prev) => toggleItem(prev, item))}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                {selected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Session format */}
        <Text style={styles.label}>Session Format</Text>
        <View style={styles.chipWrap}>
          {SESSION_FORMATS.map((item) => {
            const selected = formats.includes(item.key);
            return (
              <Pressable
                key={item.key}
                onPress={() => setFormats((prev) => toggleItem(prev, item.key))}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                <Ionicons
                  name={item.icon}
                  size={16}
                  color={selected ? '#FFFFFF' : '#4FA69E'}
                />
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Fees (one for each selected format) */}
        {formats.length > 0 && (
          <>
            <Text style={styles.label}>Fee (per session)</Text>
            {SESSION_FORMATS.filter((f) => formats.includes(f.key)).map((item) => (
              <View key={item.key} style={styles.feeRow}>
                <Text style={styles.feeLabel}>{item.label}</Text>
                <View style={styles.feeInputWrap}>
                  <Text style={styles.currency}>{CURRENCY}</Text>
                  <TextInput
                    style={styles.feeInput}
                    value={fees[item.key]}
                    onChangeText={(t) =>
                      setFees((prev) => ({
                        ...prev,
                        [item.key]: t.replace(/[^0-9.]/g, ''),
                      }))
                    }
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            ))}
          </>
        )}

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>

          <Pressable
            onPress={handleAdd}
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
          >
            <Text style={styles.addText}>Add</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const TEAL = '#4FA69E';
const NAVY = '#1F2D45';

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#EAF1F4' },
  content: { paddingHorizontal: 20 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  heading: { fontSize: 28, fontWeight: '700', color: NAVY },

  photoSection: { alignItems: 'center', marginBottom: 8 },
  photoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: TEAL,
    borderStyle: 'dashed',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: { alignItems: 'center', gap: 4 },
  photoHint: { color: TEAL, fontSize: 13, fontWeight: '600' },
  changePhoto: { color: TEAL, fontWeight: '600', marginTop: 8 },

  label: { fontSize: 15, fontWeight: '600', color: NAVY, marginTop: 18, marginBottom: 8 },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 16,
    color: NAVY,
    borderWidth: 1,
    borderColor: '#D9E2E7',
  },
  textArea: { minHeight: 120 },

  row: { flexDirection: 'row', gap: 12 },
  optionBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#D9E2E7',
  },
  optionBoxSelected: { backgroundColor: TEAL, borderColor: TEAL },
  optionText: { fontSize: 16, color: NAVY, fontWeight: '500' },
  optionTextSelected: { color: '#FFFFFF' },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#D9E2E7',
  },
  chipSelected: { backgroundColor: TEAL, borderColor: TEAL },
  chipText: { fontSize: 14, color: NAVY, fontWeight: '500' },
  chipTextSelected: { color: '#FFFFFF' },

  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  feeLabel: { fontSize: 15, color: NAVY, flex: 1 },
  feeInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D9E2E7',
    paddingHorizontal: 14,
    width: 150,
  },
  currency: { color: '#6B7280', fontSize: 15, marginRight: 6 },
  feeInput: { flex: 1, paddingVertical: 11, fontSize: 16, color: NAVY },

  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 32 },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: TEAL,
  },
  cancelText: { color: TEAL, fontSize: 16, fontWeight: '700' },
  addButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor: TEAL,
  },
  addText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  pressed: { opacity: 0.85 },
});