import { extraResources } from './extra-resources';
export const articles = [
  ...extraResources,
  {
    id: 'calming', title: 'Calming Your Mind in 3 Steps', meta: 'Tools, 15 minutes', icon: 'libraryContainer1',
    author: 'Cartom', readTime: '5 min reflective read',
    paragraphs: [
      'Calming your mind is a practical routine proposed continuously. Taking ten or fifteen minutes to settle into quiet focus, relaxing breathing exercises, and letting intrusive thoughts pass without tension will soothe stressful situations.',
      'Maintain this pause carefully whenever anxiety starts to increase, letting both body and mind recover natural clarity and balance.',
    ],
  },
  {
    id: 'anxiety', title: 'Understanding Daily Anxiety', meta: 'Article · 2 min read', icon: 'libraryContainer3',
    author: '', readTime: '2 min read',
    paragraphs: [
      'Recognise what you are feeling\nAnxiety can show up as worry, tension, restlessness or difficulty concentrating. It can happen before an exam or a difficult conversation. These feelings alone do not mean you have an anxiety disorder.',
      'Pause and notice\nName the concern: “I am worried about tomorrow.” Notice what is happening around you and let your breathing settle at a comfortable pace. You do not need to force deep breaths.',
      'Choose one manageable step\nBreak a difficult task into something small, such as opening your notes or asking a question. Make room for regular meals, rest, movement and a conversation with someone you trust.',
      'Make space for worries\nWrite down what is on your mind. A short, planned worry time can help you separate a problem you can act on from something you cannot solve right now.',
      'Know when to get support\nIf anxiety keeps affecting your studies, sleep or relationships, or self-help is not enough, speak with a qualified mental health professional. You can explore support options below.',
    ],
  },
  {
    id: 'sleep', title: 'Guided Sleep Meditation', meta: 'Written exercise · At your own pace', icon: 'libraryContainer4',
    author: '', readTime: 'Self-paced exercise',
    paragraphs: [
      'Prepare for rest\nRead these steps first, then dim or put away your screen. Settle into a comfortable position in a quiet place. This is a written practice; there is no audio recording to play.',
      '1. Settle in\nLet your eyes close if that feels comfortable, or keep a soft gaze. Notice where the bed or chair supports you. There is nothing you need to achieve.',
      '2. Notice your breathing\nFeel a few natural breaths coming and going. Let breathing find its own easy rhythm without holding your breath or trying to control it.',
      '3. Soften gently\nBring attention to your forehead, jaw and shoulders, then your hands, legs and feet. Let each area relax where it can. Skip any part that feels uncomfortable.',
      '4. Let thoughts pass\nWhen a thought appears, quietly notice it and return your attention to your breath or the feeling of support beneath you. Wandering attention is normal.',
      '5. Rest without pressure\nStay here for as long as feels comfortable. Sleep does not need to happen immediately. Stop if the practice increases discomfort. If sleep problems persist or affect daily life, speak with a healthcare professional.',
    ],
  },
] as const;

export const counsellors = [
  { id: 'perera', name: 'Dr. N. Perera', speciality: 'Psychologist', asset: 'directoryImage26' },
  { id: 'fernando', name: 'Mr. S. Fernando', speciality: 'Counsellor', asset: 'directoryImage27' },
  { id: 'silva', name: 'Dr. K. Silva', speciality: 'Psychologist', asset: 'directoryImage28' },
] as const;

// Verified against SLIIT Health and Wellbeing and Contact pages, 7 October 2026.
export const campusResources = [
  { title: 'Campus Counseling', phone: '+94 11 754 3206', dial: '+94117543206', detail: 'SLIIT counselling service', asset: 'supportSvg', source: 'https://www.sliit.lk/life-at-sliit/support-services/health-and-wellbeing' },
  { title: 'Medical Health Centre', phone: '+94 11 754 3394', dial: '+94117543394', detail: 'SLIIT Medical Centre · Doctor', asset: 'supportSvg1', source: 'https://www.sliit.lk/life-at-sliit/support-services/health-and-wellbeing' },
  { title: 'Peer Support', phone: '+94 11 754 4910', dial: '+94117544910', detail: 'Via Student Services. Ask about peer support; this is not a dedicated crisis helpline.', asset: 'supportSvg2', source: 'https://www.sliit.lk/about/contact' },
  { title: 'Academic Advising', phone: '+94 11 754 4910', dial: '+94117544910', detail: 'Student Services can direct you to your faculty or academic adviser.', asset: 'supportSvg3', source: 'https://www.sliit.lk/about/contact' },
] as const;

