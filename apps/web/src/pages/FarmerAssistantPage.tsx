import React, { useState } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Languages,
  HelpCircle,
  ShieldCheck,
  Droplet,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';

export const FarmerAssistantPage: React.FC = () => {
  const { activeFarm, activeZone } = useFarm();
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(
    typeof window !== 'undefined' && 'speechSynthesis' in window
  );

  const sampleExplanation = {
    en: {
      title: "Today's Irrigation Guidance for Your Farm",
      status: "NO IRRIGATION NEEDED TODAY",
      body: "Good morning! For your Wheat crop in Zone A1, no irrigation is needed today. The soil moisture at the active root depth (1.1m) is currently 24.5%, which is well above the refill safety threshold (21.0%). Furthermore, Open-Meteo forecasts light showers tomorrow afternoon. If soil moisture drops below 21.0% by tomorrow or the rain misses your field, check back and we will update your recommendation.",
      safetyNote: "Notice: Decision is derived directly from deterministic FAO-56 Penman-Monteith physical equations. AI does not hallucinate recommendations."
    },
    hi: {
      title: "आपके खेत के लिए आज की सिंचाई सलाह",
      status: "आज सिंचाई की कोई आवश्यकता नहीं है",
      body: "नमस्ते किसान भाई! ज़ोन A1 में आपके गेहूँ की फसल के लिए आज सिंचाई की आवश्यकता नहीं है। सक्रिय जड़ क्षेत्र (1.1 मीटर) में वर्तमान मृदा नमी 24.5% है, जो सुरक्षित न्यूनतम सीमा (21.0%) से काफी ऊपर है। इसके अतिरिक्त, मौसम पूर्वानुमान कल दोपहर हल्की बारिश की संभावना दर्शा रहा है। यदि कल तक नमी 21.0% से नीचे जाती है या बारिश नहीं होती है, तो प्रणाली स्वतः नया परामर्श जारी करेगी।",
      safetyNote: "सूचना: यह निर्णय एफएओ-56 (FAO-56) भौतिक जल संतुलन गणना पर आधारित है। कोई कृत्रिम अनुमान नहीं लगाया गया है।"
    }
  };

  const handleSpeak = () => {
    if (!speechSupported) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = lang === 'hi' ? sampleExplanation.hi.body : sampleExplanation.en.body;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.95; // Clear natural pace

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-forest-700" />
            <span>Farmer Assistant & Plain-Language Explanations</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Bilingual audio and textual guidance translating hydrologic telemetry into farmer-friendly action.
          </p>
        </div>

        {/* Language selector */}
        <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-slate-300 shadow-sm">
          <Languages className="w-4 h-4 text-forest-700" />
          <button
            onClick={() => {
              if (isSpeaking) window.speechSynthesis.cancel();
              setIsSpeaking(false);
              setLang('en');
            }}
            className={`px-2.5 py-1 text-xs font-bold rounded ${lang === 'en' ? 'bg-forest-700 text-white' : 'text-slate-600'}`}
          >
            English
          </button>
          <button
            onClick={() => {
              if (isSpeaking) window.speechSynthesis.cancel();
              setIsSpeaking(false);
              setLang('hi');
            }}
            className={`px-2.5 py-1 text-xs font-bold rounded ${lang === 'hi' ? 'bg-forest-700 text-white' : 'text-slate-600'}`}
          >
            हिन्दी (Hindi)
          </button>
        </div>
      </div>

      {/* Main Guidance Card with Audio Voiceover */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700 block">
              {lang === 'hi' ? 'दैनिक किसान परामर्श' : 'DAILY FIELD ADVISORY'}
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              {lang === 'hi' ? sampleExplanation.hi.title : sampleExplanation.en.title}
            </h2>
          </div>

          {/* Voice button */}
          <button
            onClick={handleSpeak}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm flex items-center space-x-2 ${
              isSpeaking
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-forest-700 hover:bg-forest-800 text-white'
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>{lang === 'hi' ? 'रोकें (Stop Audio)' : 'Stop Voice'}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>{lang === 'hi' ? 'आवाज़ में सुनें (Listen)' : 'Listen to Advice (Audio)'}</span>
              </>
            )}
          </button>
        </div>

        {/* Decision Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{lang === 'hi' ? sampleExplanation.hi.status : sampleExplanation.en.status}</span>
        </div>

        {/* Narrative Body */}
        <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-medium bg-slate-50 p-5 rounded-2xl border border-slate-200">
          {lang === 'hi' ? sampleExplanation.hi.body : sampleExplanation.en.body}
        </p>

        {/* Integrity Rule #5 Compliance Note */}
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <span>{lang === 'hi' ? sampleExplanation.hi.safetyNote : sampleExplanation.en.safetyNote}</span>
        </div>
      </div>

      {/* Common Agronomic Questions & Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs mb-2">
            1
          </div>
          <h3 className="font-bold text-sm text-slate-900">
            {lang === 'hi' ? 'सिस्टम "अपर्याप्त डेटा" कब दिखाता है?' : 'When does the system say "Insufficient Data"?'}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {lang === 'hi'
              ? 'यदि मुख्य मिट्टी नमी सेंसर डिस्कनेक्ट हो गया हो, या डेटा 3 घंटे से अधिक पुराना हो, तो प्रणाली गलत निर्णय देने के बजाय सुरक्षित रूप से मना कर देती है।'
              : 'If root-zone moisture is unmeasured, readings exhibit severe spike faults, or data is stale (>3h), the engine refuses to guess and asks for manual verification.'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-lg bg-forest-100 text-forest-800 flex items-center justify-center font-bold text-xs mb-2">
            2
          </div>
          <h3 className="font-bold text-sm text-slate-900">
            {lang === 'hi' ? 'रेत और चिकनी मिट्टी में नमी का अंतर क्यों होता है?' : 'Why do sandy and clay soils read differently?'}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {lang === 'hi'
              ? 'चिकनी मिट्टी (Clay) 32% पर सुरक्षित होती है, जबकि रेतीली मिट्टी 18% पर पूरी भरी मानी जाती है। सिस्टम हर मिट्टी के प्रकार के अनुसार गणना करता है।'
              : 'Clay soil holds water tighter and requires 32% moisture for field capacity, while sandy loam drains rapidly and is full at 18%. Our engine normalizes for soil texture.'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs mb-2">
            3
          </div>
          <h3 className="font-bold text-sm text-slate-900">
            {lang === 'hi' ? 'काउंटरफैक्चुअल (क्या-अगर) सीमा क्या है?' : 'What is a counterfactual threshold?'}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {lang === 'hi'
              ? 'यह आपको ठीक-ठीक बताता है कि निर्णय बदलने के लिए कितनी बारिश या नमी की गिरावट आवश्यक है, ताकि आप पहले से योजना बना सकें।'
              : 'Instead of confusing equations, it tells you the exact physical change needed to flip the advice (e.g. "If moisture drops below 21%, turn on irrigation").'}
          </p>
        </div>
      </div>
    </div>
  );
};

