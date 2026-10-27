'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Languages, Square, Volume2 } from 'lucide-react';

export type SupportedLanguage = {
  code: string;
  label: string;
  nativeLabel: string;
  direction?: 'rtl';
};

/**
 * Voice selection is intentionally broader than the app's initial written translations.
 * The browser chooses an installed voice for the worker's preferred language and falls
 * back safely when that exact voice is unavailable.
 */
export const supportedLanguages: SupportedLanguage[] = [
  { code: 'ar-SA', label: 'Arabic', nativeLabel: 'العربية', direction: 'rtl' },
  { code: 'as-IN', label: 'Assamese', nativeLabel: 'অসমীয়া' },
  { code: 'bn-IN', label: 'Bengali', nativeLabel: 'বাংলা' },
  { code: 'zh-CN', label: 'Chinese, Simplified', nativeLabel: '简体中文' },
  { code: 'zh-TW', label: 'Chinese, Traditional', nativeLabel: '繁體中文' },
  { code: 'cs-CZ', label: 'Czech', nativeLabel: 'Čeština' },
  { code: 'nl-NL', label: 'Dutch', nativeLabel: 'Nederlands' },
  { code: 'en-IN', label: 'English (India)', nativeLabel: 'English (India)' },
  { code: 'en-US', label: 'English (United States)', nativeLabel: 'English (United States)' },
  { code: 'fil-PH', label: 'Filipino', nativeLabel: 'Filipino' },
  { code: 'fr-FR', label: 'French', nativeLabel: 'Français' },
  { code: 'de-DE', label: 'German', nativeLabel: 'Deutsch' },
  { code: 'gu-IN', label: 'Gujarati', nativeLabel: 'ગુજરાતી' },
  { code: 'hi-IN', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'id-ID', label: 'Indonesian', nativeLabel: 'Bahasa Indonesia' },
  { code: 'it-IT', label: 'Italian', nativeLabel: 'Italiano' },
  { code: 'ja-JP', label: 'Japanese', nativeLabel: '日本語' },
  { code: 'kn-IN', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
  { code: 'ko-KR', label: 'Korean', nativeLabel: '한국어' },
  { code: 'ml-IN', label: 'Malayalam', nativeLabel: 'മലയാളം' },
  { code: 'mr-IN', label: 'Marathi', nativeLabel: 'मराठी' },
  { code: 'ne-NP', label: 'Nepali', nativeLabel: 'नेपाली' },
  { code: 'or-IN', label: 'Odia', nativeLabel: 'ଓଡ଼ିଆ' },
  { code: 'pl-PL', label: 'Polish', nativeLabel: 'Polski' },
  { code: 'pt-BR', label: 'Portuguese (Brazil)', nativeLabel: 'Português (Brasil)' },
  { code: 'pa-IN', label: 'Punjabi', nativeLabel: 'ਪੰਜਾਬੀ' },
  { code: 'ru-RU', label: 'Russian', nativeLabel: 'Русский' },
  { code: 'es-ES', label: 'Spanish', nativeLabel: 'Español' },
  { code: 'ta-IN', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: 'te-IN', label: 'Telugu', nativeLabel: 'తెలుగు' },
  { code: 'ur-PK', label: 'Urdu', nativeLabel: 'اردو', direction: 'rtl' },
  { code: 'vi-VN', label: 'Vietnamese', nativeLabel: 'Tiếng Việt' },
];

const localizedShiftBriefings: Record<string, string> = {
  'ar-SA': 'اليوم الثلاثاء 27 أكتوبر. تبدأ ورديتك من الساعة 9 صباحاً حتى 6 مساءً في موقع مترو نهرو، المنطقة باء. سجّل حضورك عند البوابة باء، ثم احضر إحاطة السلامة في الساعة 9:05. استراحة قصيرة في 10:45، واستراحة الوجبة في 1:00 ظهراً. قبل المغادرة، سلّم العمل غير المكتمل، وأبلغ عن أي خطر، ثم سجّل الانصراف في الساعة 6 مساءً.',
  'bn-IN': 'আজ মঙ্গলবার, ২৭ অক্টোবর। আপনার শিফট সকাল ৯টা থেকে সন্ধ্যা ৬টা পর্যন্ত নেহরু মেট্রো সাইট, জোন বি-তে। গেট বি-তে চেক ইন করুন, তারপর সকাল ৯টা ৫ মিনিটে নিরাপত্তা ব্রিফিংয়ে যোগ দিন। ছোট বিরতি ১০টা ৪৫ মিনিটে, খাবারের বিরতি দুপুর ১টায়। যাওয়ার আগে অসমাপ্ত কাজ হস্তান্তর করুন, কোনো বিপদ থাকলে জানান এবং সন্ধ্যা ৬টায় চেক আউট করুন।',
  'gu-IN': 'આજે મંગળવાર, ૨૭ ઑક્ટોબર છે. તમારી શિફ્ટ સવારે ૯ વાગ્યાથી સાંજે ૬ વાગ્યા સુધી નેહરુ મેટ્રો સાઇટ, ઝોન બી ખાતે છે. ગેટ બી પર ચેક ઇન કરો અને સવારે ૯:૦૫ વાગ્યે સલામતી બ્રીફિંગમાં જોડાઓ. ટૂંકો વિરામ ૧૦:૪૫ વાગ્યે અને ભોજન વિરામ બપોરે ૧ વાગ્યે છે. જતાં પહેલાં અધૂરું કામ સોંપો, કોઈ જોખમ જણાવો અને સાંજે ૬ વાગ્યે ચેક આઉટ કરો.',
  'hi-IN': 'आज मंगलवार, 27 अक्टूबर है। आपकी शिफ्ट सुबह 9 बजे से शाम 6 बजे तक नेहरू मेट्रो साइट, ज़ोन बी में है। गेट बी पर चेक इन करें, फिर 9 बजकर 5 मिनट पर सुरक्षा ब्रीफिंग में शामिल हों। छोटा विश्राम 10 बजकर 45 मिनट पर है और भोजन का विश्राम दोपहर 1 बजे है। जाने से पहले अधूरा काम सौंपें, किसी भी खतरे की रिपोर्ट करें और शाम 6 बजे चेक आउट करें।',
  'kn-IN': 'ಇಂದು ಮಂಗಳವಾರ, ಅಕ್ಟೋಬರ್ 27. ನಿಮ್ಮ ಪಾಳಿ ಬೆಳಿಗ್ಗೆ 9 ರಿಂದ ಸಂಜೆ 6 ರವರೆಗೆ ನೆಹರೂ ಮೆಟ್ರೋ ಸೈಟ್, ವಲಯ ಬಿ ನಲ್ಲಿ ಇದೆ. ಗೇಟ್ ಬಿ ನಲ್ಲಿ ಚೆಕ್ ಇನ್ ಮಾಡಿ, ನಂತರ 9:05 ಕ್ಕೆ ಸುರಕ್ಷತಾ ಮಾಹಿತಿ ಸಭೆಗೆ ಸೇರಿ. ಸಣ್ಣ ವಿರಾಮ 10:45 ಕ್ಕೆ ಮತ್ತು ಊಟದ ವಿರಾಮ ಮಧ್ಯಾಹ್ನ 1 ಕ್ಕೆ ಇದೆ. ಹೊರಡುವ ಮೊದಲು ಪೂರ್ಣವಾಗದ ಕೆಲಸವನ್ನು ಹಸ್ತಾಂತರಿಸಿ, ಯಾವುದೇ ಅಪಾಯವನ್ನು ವರದಿ ಮಾಡಿ ಮತ್ತು ಸಂಜೆ 6 ಕ್ಕೆ ಚೆಕ್ ಔಟ್ ಮಾಡಿ.',
  'ml-IN': 'ഇന്ന് ചൊവ്വാഴ്ച, ഒക്ടോബർ 27 ആണ്. നിങ്ങളുടെ ഷിഫ്റ്റ് രാവിലെ 9 മുതൽ വൈകുന്നേരം 6 വരെ നെഹ്റു മെട്രോ സൈറ്റ്, സോൺ ബി യിലാണ്. ഗേറ്റ് ബി യിൽ ചെക്ക് ഇൻ ചെയ്യുക, തുടർന്ന് 9:05 ന് സുരക്ഷാ ബ്രീഫിംഗിൽ പങ്കെടുക്കുക. ചെറിയ ഇടവേള 10:45 ന്, ഭക്ഷണ ഇടവേള ഉച്ചയ്ക്ക് 1 ന്. പോകുന്നതിന് മുമ്പ് പൂർത്തിയാകാത്ത ജോലി കൈമാറുക, അപകടസാധ്യത റിപ്പോർട്ട് ചെയ്യുക, വൈകുന്നേരം 6 ന് ചെക്ക് ഔട്ട് ചെയ്യുക.',
  'mr-IN': 'आज मंगळवार, २७ ऑक्टोबर आहे. तुमची शिफ्ट सकाळी ९ ते संध्याकाळी ६ वाजेपर्यंत नेहरू मेट्रो साइट, झोन बी येथे आहे. गेट बी येथे चेक इन करा आणि सकाळी ९:०५ वाजता सुरक्षा माहिती बैठकीला उपस्थित रहा. छोटा ब्रेक १०:४५ वाजता आणि जेवणाची सुट्टी दुपारी १ वाजता आहे. जाण्यापूर्वी अपूर्ण काम सुपूर्द करा, कोणताही धोका कळवा आणि संध्याकाळी ६ वाजता चेक आउट करा.',
  'pa-IN': 'ਅੱਜ ਮੰਗਲਵਾਰ, 27 ਅਕਤੂਬਰ ਹੈ। ਤੁਹਾਡੀ ਸ਼ਿਫਟ ਸਵੇਰੇ 9 ਵਜੇ ਤੋਂ ਸ਼ਾਮ 6 ਵਜੇ ਤੱਕ ਨਹਿਰੂ ਮੈਟਰੋ ਸਾਈਟ, ਜ਼ੋਨ ਬੀ ਵਿਖੇ ਹੈ। ਗੇਟ ਬੀ ਉੱਤੇ ਚੈਕ ਇਨ ਕਰੋ ਅਤੇ ਫਿਰ 9:05 ਵਜੇ ਸੁਰੱਖਿਆ ਬ੍ਰੀਫਿੰਗ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ। ਛੋਟੀ ਬ੍ਰੇਕ 10:45 ਵਜੇ ਅਤੇ ਖਾਣੇ ਦੀ ਬ੍ਰੇਕ ਦੁਪਹਿਰ 1 ਵਜੇ ਹੈ। ਜਾਣ ਤੋਂ ਪਹਿਲਾਂ ਅਧੂਰਾ ਕੰਮ ਸੌਂਪੋ, ਕਿਸੇ ਵੀ ਖ਼ਤਰੇ ਦੀ ਰਿਪੋਰਟ ਕਰੋ ਅਤੇ ਸ਼ਾਮ 6 ਵਜੇ ਚੈਕ ਆਉਟ ਕਰੋ।',
  'ta-IN': 'இன்று செவ்வாய்க்கிழமை, அக்டோபர் 27. உங்கள் பணி நேரம் காலை 9 மணி முதல் மாலை 6 மணி வரை நேரு மெட்ரோ தளம், மண்டலம் பி-யில் உள்ளது. கேட் பி-யில் செக் இன் செய்து, காலை 9:05 மணிக்கு பாதுகாப்பு விளக்கக் கூட்டத்தில் கலந்துகொள்ளுங்கள். சிறிய இடைவேளை 10:45 மணிக்கும், உணவு இடைவேளை மதியம் 1 மணிக்கும் உள்ளது. புறப்படுவதற்கு முன் முடிக்காத பணியை ஒப்படைத்து, ஏதேனும் ஆபத்து இருந்தால் தெரிவித்து, மாலை 6 மணிக்கு செக் அவுட் செய்யுங்கள்.',
  'te-IN': 'ఈ రోజు మంగళవారం, అక్టోబర్ 27. మీ షిఫ్ట్ ఉదయం 9 గంటల నుండి సాయంత్రం 6 గంటల వరకు నెహ్రూ మెట్రో సైట్, జోన్ బి లో ఉంది. గేట్ బి వద్ద చెక్ ఇన్ చేసి, ఉదయం 9:05 కు భద్రతా వివరణకు హాజరుకండి. చిన్న విరామం 10:45 కు, భోజన విరామం మధ్యాహ్నం 1 గంటకు ఉంది. వెళ్లే ముందు పూర్తి కాని పనిని అప్పగించి, ఏదైనా ప్రమాదాన్ని నివేదించి, సాయంత్రం 6 గంటలకు చెక్ అవుట్ చేయండి.',
  'ur-PK': 'آج منگل، 27 اکتوبر ہے۔ آپ کی شفٹ صبح 9 بجے سے شام 6 بجے تک نہرو میٹرو سائٹ، زون بی میں ہے۔ گیٹ بی پر چیک ان کریں، پھر 9 بج کر 5 منٹ پر حفاظتی بریفنگ میں شامل ہوں۔ مختصر وقفہ 10:45 پر اور کھانے کا وقفہ دوپہر 1 بجے ہے۔ جانے سے پہلے نامکمل کام حوالے کریں، کسی بھی خطرے کی اطلاع دیں اور شام 6 بجے چیک آؤٹ کریں۔',
};

export function getLocalizedShiftBriefing(languageCode: string, fallback: string) {
  return localizedShiftBriefings[languageCode] ?? fallback;
}

type AssistiveContextValue = {
  language: SupportedLanguage;
  setLanguage: (code: string) => void;
  speaking: boolean;
  supported: boolean;
  announcement: string;
  speak: (text: string) => void;
  stop: () => void;
};

const AssistiveContext = createContext<AssistiveContextValue | null>(null);
const languageStorageKey = 'fairshift-preferred-speech-language-v1';

function resolveLanguage(code: string | null): SupportedLanguage {
  return supportedLanguages.find(language => language.code === code) ?? supportedLanguages[7];
}

function pickVoice(voices: SpeechSynthesisVoice[], languageCode: string) {
  const exact = voices.find(voice => voice.lang.toLowerCase() === languageCode.toLowerCase());
  if (exact) return exact;

  const rootLanguage = languageCode.split('-')[0].toLowerCase();
  return voices.find(voice => voice.lang.toLowerCase().startsWith(rootLanguage));
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(supportedLanguages[7]);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const [announcement, setAnnouncement] = useState('Read-aloud is ready when you need it.');

  useEffect(() => {
    setSupported('speechSynthesis' in window);
    try {
      setLanguageState(resolveLanguage(window.localStorage.getItem(languageStorageKey)));
    } catch {
      // A browser can block local storage; English remains a safe default.
    }
  }, []);

  useEffect(() => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    const updateVoices = () => setVoices(synth.getVoices());
    updateVoices();
    synth.addEventListener('voiceschanged', updateVoices);
    return () => synth.removeEventListener('voiceschanged', updateVoices);
  }, [supported]);

  useEffect(() => () => {
    if (supported) window.speechSynthesis.cancel();
  }, [supported]);

  const setLanguage = useCallback((code: string) => {
    const nextLanguage = resolveLanguage(code);
    setLanguageState(nextLanguage);
    try {
      window.localStorage.setItem(languageStorageKey, nextLanguage.code);
    } catch {
      // Preference still applies for this session when persistence is unavailable.
    }
    setAnnouncement(`${nextLanguage.label} selected for read-aloud.`);
  }, []);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setAnnouncement('Read-aloud stopped.');
  }, [supported]);

  const speak = useCallback((text: string) => {
    if (!supported) {
      setAnnouncement('Read-aloud is not supported in this browser. You can still use a screen reader or view the written details.');
      return;
    }

    const cleanText = text.replace(/\s+/g, ' ').trim();
    if (!cleanText) return;

    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language.code;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.voice = pickVoice(voices, language.code) ?? null;
    utterance.onstart = () => {
      setSpeaking(true);
      setAnnouncement(`Reading in ${language.label}.`);
    };
    utterance.onend = () => {
      setSpeaking(false);
      setAnnouncement('Read-aloud finished.');
    };
    utterance.onerror = () => {
      setSpeaking(false);
      setAnnouncement('Read-aloud could not start. Try another installed language voice or use the written briefing.');
    };
    synth.speak(utterance);
  }, [language, supported, voices]);

  const value = useMemo(() => ({ language, setLanguage, speaking, supported, announcement, speak, stop }), [announcement, language, setLanguage, speak, speaking, stop, supported]);
  return <AssistiveContext.Provider value={value}>{children}<p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p></AssistiveContext.Provider>;
}

export function useAccessibilityTools() {
  const context = useContext(AssistiveContext);
  if (!context) throw new Error('useAccessibilityTools must be used inside AccessibilityProvider');
  return context;
}

export function LanguagePicker({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useAccessibilityTools();
  return <label className={`language-picker ${compact ? 'compact' : ''}`}>
    <Languages size={17} aria-hidden="true" />
    <span className="language-picker-label">Voice language</span>
    <select value={language.code} onChange={event => setLanguage(event.target.value)} aria-label="Preferred language for read-aloud">
      {supportedLanguages.map(option => <option key={option.code} value={option.code} dir={option.direction}>{option.label} — {option.nativeLabel}</option>)}
    </select>
  </label>;
}

export function VoiceButton({ text, label = 'Read this page aloud', compact = false }: { text: string; label?: string; compact?: boolean }) {
  const { speak, speaking, stop, supported } = useAccessibilityTools();
  const actionLabel = speaking ? 'Stop read-aloud' : label;
  return <button
    type="button"
    className={`btn soft voice-button ${compact ? 'compact' : ''}`}
    onClick={() => speaking ? stop() : speak(text)}
    aria-label={actionLabel}
    aria-pressed={speaking}
    title={supported ? actionLabel : 'Read-aloud is unavailable in this browser'}
  >
    {speaking ? <Square size={16} fill="currentColor" aria-hidden="true" /> : <Volume2 size={17} aria-hidden="true" />}
    <span>{speaking ? 'Stop' : compact ? 'Listen' : 'Read aloud'}</span>
  </button>;
}

export function VoiceBriefing({ eyebrow = 'Accessible briefing', title, summary }: { eyebrow?: string; title: string; summary: string }) {
  const { language, supported } = useAccessibilityTools();
  return <section className="voice-briefing" aria-labelledby="voice-briefing-heading">
    <div>
      <div className="eyebrow">{eyebrow}</div>
      <h2 id="voice-briefing-heading">{title}</h2>
      <p>{summary}</p>
      <small>{supported ? `Uses your device voice in ${language.label}. You stay in control: it never starts automatically.` : 'Read-aloud is unavailable in this browser. All information remains available as text.'}</small>
    </div>
    <VoiceButton text={summary} label={`Read ${title.toLowerCase()} aloud`} />
  </section>;
}
