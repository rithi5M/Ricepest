import React, { useState, useEffect, useRef } from 'react';
import { 
  Sprout, 
  Bug, 
  CloudSun, 
  LayoutDashboard, 
  MessageSquare, 
  ChevronRight, 
  Upload, 
  AlertTriangle,
  CheckCircle2,
  Thermometer,
  Droplets,
  CloudRain,
  Languages,
  Send,
  Loader2,
  Camera,
  Volume2,
  Mic,
  Calendar,
  Waves,
  Zap,
  Leaf,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { predictPestRisk, detectPestFromImage, getChatResponse, generateSpeech } from './services/gemini';

// Constants
const DISTRICTS = ["Coimbatore", "Thanjavur", "Madurai", "Tiruchirappalli", "Salem", "Erode", "Tirunelveli", "Villupuram"];
const GROWTH_STAGES = ["Seedling", "Tillering", "Flowering", "Grain filling"];
const SEASONS = ["Kharif", "Rabi"];

const TRANSLATIONS = {
  en: {
    title: "RiceGuard TN",
    subtitle: "AI Farmer Assistant",
    predict: "Pest Prediction",
    detect: "Image Detection",
    dashboard: "Dashboard",
    chat: "Farmer Chat",
    lang: "தமிழ்",
    district: "District",
    stage: "Growth Stage",
    temp: "Temperature (°C)",
    humidity: "Humidity (%)",
    rainfall: "Rainfall (mm)",
    season: "Season",
    btnPredict: "Predict Pest Risk",
    btnDetect: "Detect Pest",
    riskReport: "Pest Risk Report",
    prevention: "Recommended Prevention",
    uploadPrompt: "Upload or Capture Crop Photo",
    chatPlaceholder: "Ask about rice pests...",
    history: "Recent Activity",
    questions: {
      q1: "What is the current temperature (°C) in your area?",
      q2: "What is the humidity level (%)?",
      q3: "Did it rain in the last 3 days?",
      q4: "How many days old is the rice crop?",
      q5: "What is the growth stage of the crop?",
      q6: "Is there standing water in the field?",
      q7: "Did you apply fertilizer recently?",
      q8: "Are the rice leaves turning yellow?",
      q9: "Are there holes in the rice leaves?",
      q10: "Are the leaves folded or rolled?",
      q11: "Do you see small insects on the plants?",
      q12: "Are there brown insects near the base of the plant?",
      q13: "Are there white heads in the rice panicles?",
      q14: "Are there brown spots on the leaves?",
      q15: "Have you used pesticide in the last 10 days?"
    }
  },
  ta: {
    title: "ரைஸ்கார்டு TN",
    subtitle: "AI விவசாய உதவியாளர்",
    predict: "பூச்சி கணிப்பு",
    detect: "படத்தைக் கண்டறிதல்",
    dashboard: "டாஷ்போர்டு",
    chat: "விவசாயி அரட்டை",
    lang: "English",
    district: "மாவட்டம்",
    stage: "வளர்ச்சி நிலை",
    temp: "வெப்பநிலை (°C)",
    humidity: "ஈரப்பதம் (%)",
    rainfall: "மழைப்பொழிவு (mm)",
    season: "பருவம்",
    btnPredict: "பூச்சி அபாயத்தைக் கணி",
    btnDetect: "பூச்சியைக் கண்டறி",
    riskReport: "பூச்சி அபாய அறிக்கை",
    prevention: "பரிந்துரைக்கப்பட்ட தடுப்பு",
    uploadPrompt: "பயிர் புகைப்படத்தைப் பதிவேற்றவும்",
    chatPlaceholder: "நெல் பூச்சிகளைப் பற்றி கேளுங்கள்...",
    history: "சமீபத்திய செயல்பாடு",
    questions: {
      q1: "உங்கள் பகுதியில் தற்போதைய வெப்பநிலை (°C) என்ன?",
      q2: "ஈரப்பதம் (%) எவ்வளவு?",
      q3: "கடந்த 3 நாட்களில் மழை பெய்ததா?",
      q4: "நெல் பயிர் எத்தனை நாட்கள் பழமையானது?",
      q5: "பயிரின் வளர்ச்சி நிலை என்ன?",
      q6: "வயலில் தேங்கி நிற்கும் தண்ணீர் உள்ளதா?",
      q7: "சமீபத்தில் உரம் போட்டீர்களா?",
      q8: "நெல் இலைகள் மஞ்சளாக மாறுகிறதா?",
      q9: "நெல் இலைகளில் துளைகள் உள்ளதா?",
      q10: "இலைகள் மடிந்து அல்லது உருட்டப்பட்டுள்ளதா?",
      q11: "செடிகளில் சிறிய பூச்சிகளைப் பார்க்கிறீர்களா?",
      q12: "செடியின் அடிப்பகுதிக்கு அருகில் பழுப்பு நிற பூச்சிகள் உள்ளதா?",
      q13: "நெல் கதிர்களில் வெண்மையான தலைகள் உள்ளதா?",
      q14: "இலைகளில் பழுப்பு நிற புள்ளிகள் உள்ளதா?",
      q15: "கடந்த 10 நாட்களில் பூச்சிக்கொல்லி மருந்தைப் பயன்படுத்தினீர்களா?"
    }
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [lang, setLang] = useState<'en' | 'ta'>('en');
  const t = TRANSLATIONS[lang];

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#1A1A1A] font-sans">
      {/* Navigation */}
      <nav className="bg-white border-b border-[#E5E5E0] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
              <div className="w-10 h-10 bg-[#5A5A40] rounded-xl flex items-center justify-center text-white">
                <Sprout size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">{t.title}</h1>
                <p className="text-[10px] uppercase tracking-widest text-[#5A5A40] font-semibold">{t.subtitle}</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <NavButton active={activeTab === 'predict'} onClick={() => setActiveTab('predict')} icon={<Bug size={18} />} label={t.predict} />
              <NavButton active={activeTab === 'detect'} onClick={() => setActiveTab('detect')} icon={<Camera size={18} />} label={t.detect} />
              <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={18} />} label={t.dashboard} />
              <NavButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={<MessageSquare size={18} />} label={t.chat} />
            </div>

            <button 
              onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#5A5A40]/20 hover:bg-[#5A5A40]/5 transition-colors text-sm font-medium"
            >
              <Languages size={16} />
              {t.lang}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && <HomeView key="home" setActiveTab={setActiveTab} t={t} />}
          {activeTab === 'predict' && <PredictView key="predict" t={t} />}
          {activeTab === 'detect' && <DetectView key="detect" t={t} />}
          {activeTab === 'dashboard' && <DashboardView key="dashboard" t={t} />}
          {activeTab === 'chat' && <ChatView key="chat" t={t} />}
        </AnimatePresence>
      </main>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E5E0] px-4 py-2 flex justify-around items-center z-50">
        <MobileNavButton active={activeTab === 'predict'} onClick={() => setActiveTab('predict')} icon={<Bug size={20} />} />
        <MobileNavButton active={activeTab === 'detect'} onClick={() => setActiveTab('detect')} icon={<Camera size={20} />} />
        <MobileNavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Sprout size={20} />} />
        <MobileNavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20} />} />
        <MobileNavButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={<MessageSquare size={20} />} />
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 text-sm font-medium transition-colors ${active ? 'text-[#5A5A40]' : 'text-[#8E8E8E] hover:text-[#5A5A40]'}`}
    >
      {icon}
      {label}
      {active && <motion.div layoutId="nav-underline" className="absolute bottom-0 h-0.5 bg-[#5A5A40] w-full" />}
    </button>
  );
}

function MobileNavButton({ active, onClick, icon }: any) {
  return (
    <button 
      onClick={onClick}
      className={`p-3 rounded-xl transition-colors ${active ? 'bg-[#5A5A40] text-white' : 'text-[#8E8E8E]'}`}
    >
      {icon}
    </button>
  );
}

function HomeView({ setActiveTab, t }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-16"
    >
      <section className="relative h-[600px] rounded-[48px] overflow-hidden bg-[#1A1A1A] flex items-center px-12 text-white shadow-2xl">
        <img 
          src="https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?auto=format&fit=crop&q=80&w=1920" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105 hover:scale-100 transition-transform duration-1000"
          alt="Rice Field"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="relative max-w-3xl space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-500/30"
          >
            <Zap size={14} /> Powered by Gemini 3.1
          </motion.div>
          <h2 className="text-7xl font-black leading-[0.9] tracking-tighter">
            Smart Farming <br />
            <span className="text-emerald-400">Rice Heritage.</span>
          </h2>
          <p className="text-xl text-white/70 leading-relaxed max-w-xl">
            Protecting Tamil Nadu's rice crops with advanced AI. Predict risks, detect pests, and chat with experts in English & Tamil.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab('predict')}
              className="bg-emerald-500 text-black px-10 py-5 rounded-2xl font-black text-lg hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-3 group"
            >
              Start Prediction <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => setActiveTab('chat')}
              className="bg-white/10 backdrop-blur-md text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-white/20 transition-all border border-white/20"
            >
              Talk to AI
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard 
          icon={<Bug className="text-emerald-500" size={32} />}
          title={t.predict}
          desc="15-point diagnostic analysis to predict Brown Planthopper, Stem Borer, Leaf Folder & Gall Midge."
          onClick={() => setActiveTab('predict')}
        />
        <FeatureCard 
          icon={<Camera className="text-emerald-500" size={32} />}
          title={t.detect}
          desc="Instant visual identification of pests using your camera. Get treatment advice in seconds."
          onClick={() => setActiveTab('detect')}
        />
        <FeatureCard 
          icon={<MessageSquare className="text-emerald-500" size={32} />}
          title={t.chat}
          desc="Bilingual AI assistant available 24/7. Voice-enabled support for all your farming questions."
          onClick={() => setActiveTab('chat')}
        />
      </div>
    </motion.div>
  );
}

function FeatureCard({ icon, title, desc, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className="bg-white p-10 rounded-[40px] border border-[#E5E5E0] hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150" />
      <div className="w-20 h-20 bg-[#F5F5F0] rounded-[24px] flex items-center justify-center mb-8 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
        {icon}
      </div>
      <h3 className="text-2xl font-black mb-4 tracking-tight">{title}</h3>
      <p className="text-[#8E8E8E] leading-relaxed text-sm font-medium">{desc}</p>
    </div>
  );
}

function PredictView({ t }: any) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    district: DISTRICTS[0],
    temperature: 28,
    humidity: 75,
    recentRain: 'No',
    cropAge: 30,
    growthStage: GROWTH_STAGES[0],
    standingWater: 'No',
    recentFertilizer: 'No',
    yellowLeaves: 'No',
    holesInLeaves: 'No',
    foldedLeaves: 'No',
    smallInsects: 'No',
    brownInsectsBase: 'No',
    whiteHeads: 'No',
    brownSpots: 'No',
    recentPesticide: 'No'
  });

  const fetchWeather = async () => {
    try {
      const res = await fetch(`/api/weather?district=${formData.district}`);
      const data = await res.json();
      
      if (res.ok && data.main) {
        setFormData(prev => ({
          ...prev,
          temperature: Math.round(data.main.temp),
          humidity: data.main.humidity
        }));
      } else {
        console.error("Weather fetch failed:", data.error || "Unknown error");
        alert(data.error || "Failed to fetch weather. Please check your API key in the Secrets panel.");
      }
    } catch (e) {
      console.error("Weather fetch failed", e);
      alert("Failed to connect to weather service.");
    }
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const prediction = await predictPestRisk(formData);
      setResult(prediction);
      
      // Save to DB
      await fetch('/api/save-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          district: formData.district,
          temperature: formData.temperature,
          humidity: formData.humidity,
          rainfall: 0, // Simplified for DB
          bph_risk: prediction.bphRisk,
          stem_risk: prediction.stemRisk,
          leaf_risk: prediction.leafRisk,
          gall_risk: prediction.gallMidgeRisk
        })
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      <div className="bg-white p-8 rounded-[32px] border border-[#E5E5E0] shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Bug className="text-[#5A5A40]" size={32} /> {t.predict}
          </h2>
          <div className="flex items-center gap-4">
            <select 
              className="bg-[#F5F5F0] border-none rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-[#5A5A40]"
              value={formData.district}
              onChange={(e) => setFormData({...formData, district: e.target.value})}
            >
              {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <button 
              type="button" 
              onClick={fetchWeather}
              className="bg-[#5A5A40] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-[#4A4A30] transition-colors"
            >
              <CloudSun size={16} /> Auto-fill Weather
            </button>
          </div>
        </div>
        
        <form onSubmit={handlePredict} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Environmental Data */}
            <QuestionCard icon={<Thermometer size={20} />} label={t.questions.q1} tamil="(உங்கள் பகுதியில் தற்போதைய வெப்பநிலை என்ன?)">
              <input 
                type="number" 
                className="w-full bg-[#F5F5F0] border-none rounded-xl p-3 focus:ring-2 focus:ring-[#5A5A40]"
                value={formData.temperature}
                onChange={(e) => setFormData({...formData, temperature: Number(e.target.value)})}
              />
            </QuestionCard>

            <QuestionCard icon={<Droplets size={20} />} label={t.questions.q2} tamil="(ஈரப்பதம் எவ்வளவு?)">
              <input 
                type="number" 
                className="w-full bg-[#F5F5F0] border-none rounded-xl p-3 focus:ring-2 focus:ring-[#5A5A40]"
                value={formData.humidity}
                onChange={(e) => setFormData({...formData, humidity: Number(e.target.value)})}
              />
            </QuestionCard>

            <QuestionCard icon={<CloudRain size={20} />} label={t.questions.q3} tamil="(கடந்த 3 நாட்களில் மழை பெய்ததா?)">
              <YesNoToggle value={formData.recentRain} onChange={(val) => setFormData({...formData, recentRain: val})} />
            </QuestionCard>

            {/* Crop Data */}
            <QuestionCard icon={<Calendar size={20} />} label={t.questions.q4} tamil="(நெல் பயிர் எத்தனை நாட்கள் பழமையானது?)">
              <input 
                type="number" 
                className="w-full bg-[#F5F5F0] border-none rounded-xl p-3 focus:ring-2 focus:ring-[#5A5A40]"
                value={formData.cropAge}
                onChange={(e) => setFormData({...formData, cropAge: Number(e.target.value)})}
              />
            </QuestionCard>

            <QuestionCard icon={<Sprout size={20} />} label={t.questions.q5} tamil="(பயிரின் வளர்ச்சி நிலை என்ன?)">
              <select 
                className="w-full bg-[#F5F5F0] border-none rounded-xl p-3 focus:ring-2 focus:ring-[#5A5A40]"
                value={formData.growthStage}
                onChange={(e) => setFormData({...formData, growthStage: e.target.value})}
              >
                {GROWTH_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </QuestionCard>

            <QuestionCard icon={<Waves size={20} />} label={t.questions.q6} tamil="(வயலில் தேங்கி நிற்கும் தண்ணீர் உள்ளதா?)">
              <YesNoToggle value={formData.standingWater} onChange={(val) => setFormData({...formData, standingWater: val})} />
            </QuestionCard>

            <QuestionCard icon={<Zap size={20} />} label={t.questions.q7} tamil="(சமீபத்தில் உரம் போட்டீர்களா?)">
              <YesNoToggle value={formData.recentFertilizer} onChange={(val) => setFormData({...formData, recentFertilizer: val})} />
            </QuestionCard>

            {/* Symptoms */}
            <QuestionCard icon={<Leaf size={20} />} label={t.questions.q8} tamil="(நெல் இலைகள் மஞ்சளாக மாறுகிறதா?)">
              <YesNoToggle value={formData.yellowLeaves} onChange={(val) => setFormData({...formData, yellowLeaves: val})} />
            </QuestionCard>

            <QuestionCard icon={<Info size={20} />} label={t.questions.q9} tamil="(நெல் இலைகளில் துளைகள் உள்ளதா?)">
              <YesNoToggle value={formData.holesInLeaves} onChange={(val) => setFormData({...formData, holesInLeaves: val})} />
            </QuestionCard>

            <QuestionCard icon={<Info size={20} />} label={t.questions.q10} tamil="(இலைகள் மடிந்து அல்லது உருட்டப்பட்டுள்ளதா?)">
              <YesNoToggle value={formData.foldedLeaves} onChange={(val) => setFormData({...formData, foldedLeaves: val})} />
            </QuestionCard>

            <QuestionCard icon={<Bug size={20} />} label={t.questions.q11} tamil="(செடிகளில் சிறிய பூச்சிகளைப் பார்க்கிறீர்களா?)">
              <YesNoToggle value={formData.smallInsects} onChange={(val) => setFormData({...formData, smallInsects: val})} />
            </QuestionCard>

            <QuestionCard icon={<Bug size={20} />} label={t.questions.q12} tamil="(செடியின் அடிப்பகுதிக்கு அருகில் பழுப்பு நிற பூச்சிகள் உள்ளதா?)">
              <YesNoToggle value={formData.brownInsectsBase} onChange={(val) => setFormData({...formData, brownInsectsBase: val})} />
            </QuestionCard>

            <QuestionCard icon={<Sprout size={20} />} label={t.questions.q13} tamil="(நெல் கதிர்களில் வெண்மையான தலைகள் உள்ளதா?)">
              <YesNoToggle value={formData.whiteHeads} onChange={(val) => setFormData({...formData, whiteHeads: val})} />
            </QuestionCard>

            <QuestionCard icon={<AlertTriangle size={20} />} label={t.questions.q14} tamil="(இலைகளில் பழுப்பு நிற புள்ளிகள் உள்ளதா?)">
              <YesNoToggle value={formData.brownSpots} onChange={(val) => setFormData({...formData, brownSpots: val})} />
            </QuestionCard>

            <QuestionCard icon={<Zap size={20} />} label={t.questions.q15} tamil="(கடந்த 10 நாட்களில் பூச்சிக்கொல்லி மருந்தைப் பயன்படுத்தினீர்களா?)">
              <YesNoToggle value={formData.recentPesticide} onChange={(val) => setFormData({...formData, recentPesticide: val})} />
            </QuestionCard>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#5A5A40] text-white py-6 rounded-2xl font-bold text-xl hover:bg-[#4A4A30] transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <Bug size={24} />}
            {t.btnPredict}
          </button>
        </form>
      </div>

      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[32px] border border-[#E5E5E0] space-y-8 shadow-md"
        >
          <div>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <AlertTriangle className="text-amber-500" size={28} /> {t.riskReport}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <RiskBadge label="Brown Planthopper" risk={result.bphRisk} />
              <RiskBadge label="Rice Stem Borer" risk={result.stemRisk} />
              <RiskBadge label="Leaf Folder" risk={result.leafRisk} />
              <RiskBadge label="Gall Midge" risk={result.gallMidgeRisk} />
            </div>
          </div>

          <div className="bg-[#F5F5F0] p-8 rounded-3xl border border-[#E5E5E0]">
            <h4 className="text-xl font-bold mb-6 flex items-center gap-3">
              <CheckCircle2 className="text-[#5A5A40]" size={24} /> {t.prevention}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-xs font-black uppercase tracking-widest text-[#5A5A40]">English</p>
                <ul className="space-y-3">
                  {result.tips.map((tip: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[#4A4A4A] bg-white p-4 rounded-xl">
                      <span className="w-6 h-6 bg-[#5A5A40] text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">{i+1}</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <p className="text-xs font-black uppercase tracking-widest text-[#5A5A40]">தமிழ் (Tamil)</p>
                <ul className="space-y-3">
                  {result.tipsTamil.map((tip: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[#4A4A4A] bg-white p-4 rounded-xl">
                      <span className="w-6 h-6 bg-[#5A5A40] text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">{i+1}</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function QuestionCard({ icon, label, tamil, children }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-[#F0F0F0] space-y-3 hover:border-[#5A5A40]/30 transition-colors">
      <div className="flex items-center gap-2 text-[#5A5A40]">
        {icon}
        <span className="text-xs font-black uppercase tracking-wider">Question</span>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-bold leading-tight">{label}</p>
        <p className="text-[11px] text-[#8E8E8E] italic">{tamil}</p>
      </div>
      {children}
    </div>
  );
}

function YesNoToggle({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  return (
    <div className="flex gap-2">
      {['Yes', 'No'].map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
            value === opt 
              ? 'bg-[#5A5A40] text-white shadow-md' 
              : 'bg-[#F5F5F0] text-[#8E8E8E] hover:bg-[#E5E5E0]'
          }`}
        >
          {opt === 'Yes' ? 'Yes / ஆம்' : 'No / இல்லை'}
        </button>
      ))}
    </div>
  );
}

function RiskBadge({ label, risk }: any) {
  const colors: any = {
    High: "bg-red-100 text-red-700 border-red-200",
    Medium: "bg-amber-100 text-amber-700 border-amber-200",
    Low: "bg-emerald-100 text-emerald-700 border-emerald-200"
  };
  return (
    <div className={`p-4 rounded-2xl border ${colors[risk] || "bg-gray-100"}`}>
      <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">{label}</p>
      <p className="text-lg font-black">{risk}</p>
    </div>
  );
}

function DetectView({ t }: any) {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDetect = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const detection = await detectPestFromImage(image);
      setResult(detection);
      
      // Save to DB
      await fetch('/api/save-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_path: 'base64_stored',
          detected_pest: detection.pestName
        })
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <div className="bg-white p-8 rounded-[32px] border border-[#E5E5E0] text-center">
        <h2 className="text-2xl font-bold mb-8 flex items-center justify-center gap-2">
          <Camera className="text-[#5A5A40]" /> {t.detect}
        </h2>

        <div 
          onClick={() => fileInputRef.current?.click()}
          className="aspect-square w-full max-w-sm mx-auto bg-[#F5F5F0] rounded-[32px] border-2 border-dashed border-[#5A5A40]/20 flex flex-col items-center justify-center cursor-pointer hover:bg-[#5A5A40]/5 transition-all overflow-hidden relative group"
        >
          {image ? (
            <>
              <img src={image} className="w-full h-full object-cover" alt="Upload" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-white font-bold">Change Image</p>
              </div>
            </>
          ) : (
            <>
              <Upload className="text-[#5A5A40] mb-4" size={48} />
              <p className="font-bold text-[#5A5A40]">{t.uploadPrompt}</p>
              <p className="text-xs text-[#8E8E8E] mt-2">JPG, PNG up to 5MB</p>
            </>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            className="hidden" 
            accept="image/*"
          />
        </div>

        {image && !result && (
          <button 
            onClick={handleDetect}
            disabled={loading}
            className="mt-8 w-full max-w-sm bg-[#5A5A40] text-white py-4 rounded-xl font-bold hover:bg-[#4A4A30] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Bug size={20} />}
            {t.btnDetect}
          </button>
        )}

        {result && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 p-6 bg-[#F5F5F0] rounded-2xl text-left"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#5A5A40] rounded-full flex items-center justify-center text-white">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-[#5A5A40]">Detected Pest</p>
                <h3 className="text-xl font-black">{result.pestName}</h3>
              </div>
            </div>
            <p className="text-sm text-[#4A4A4A] leading-relaxed italic">"{result.advice}"</p>
            <button 
              onClick={() => {setImage(null); setResult(null)}}
              className="mt-6 text-xs font-bold text-[#5A5A40] hover:underline"
            >
              Try another photo
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function DashboardView({ t }: any) {
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any>(null);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats);
    fetch('/api/history').then(r => r.json()).then(setHistory);
  }, []);

  if (!stats) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" /></div>;

  const chartData = stats.districtStats.map((s: any) => ({
    name: s.district,
    count: s.count
  }));

  const riskData = [
    { name: 'BPH High', value: stats.riskStats.bph_high || 0, color: '#EF4444' },
    { name: 'Stem High', value: stats.riskStats.stem_high || 0, color: '#F59E0B' },
    { name: 'Leaf High', value: stats.riskStats.leaf_high || 0, color: '#10B981' },
    { name: 'Gall Midge High', value: 0, color: '#6366F1' }, // Placeholder for Gall Midge
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-white p-10 rounded-[48px] border border-[#E5E5E0] shadow-xl">
          <h3 className="text-2xl font-black mb-10 tracking-tight">District Activity <span className="text-emerald-500">Live</span></h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px' }}
                  cursor={{ fill: '#F5F5F0' }}
                />
                <Bar dataKey="count" fill="#10B981" radius={[12, 12, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[48px] border border-[#E5E5E0] shadow-xl">
          <h3 className="text-2xl font-black mb-10 tracking-tight">Risk Distribution</h3>
          <div className="h-[400px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  innerRadius={80}
                  outerRadius={130}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-black text-[#1A1A1A]">{riskData.reduce((a, b) => a + b.value, 0)}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#8E8E8E]">Total Alerts</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {riskData.map(d => (
              <div key={d.name} className="flex items-center gap-3 bg-[#F5F5F0] p-3 rounded-2xl">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-[10px] font-black uppercase tracking-wider text-[#4A4A4A] truncate">{d.name}</span>
                <span className="ml-auto font-black text-xs">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[48px] border border-[#E5E5E0] shadow-xl">
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-2xl font-black tracking-tight">{t.history}</h3>
          <button className="text-xs font-black uppercase tracking-widest text-emerald-600 hover:underline">Export CSV</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-[#8E8E8E] border-b border-[#F5F5F0]">
                <th className="pb-6 font-black uppercase tracking-widest text-[10px]">Date</th>
                <th className="pb-6 font-black uppercase tracking-widest text-[10px]">District</th>
                <th className="pb-6 font-black uppercase tracking-widest text-[10px]">BPH Risk</th>
                <th className="pb-6 font-black uppercase tracking-widest text-[10px]">Stem Risk</th>
                <th className="pb-6 font-black uppercase tracking-widest text-[10px]">Leaf Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F0]">
              {history?.predictions.map((p: any) => (
                <tr key={p.id} className="hover:bg-[#F5F5F0]/50 transition-colors group">
                  <td className="py-6 font-medium text-[#8E8E8E]">{new Date(p.date).toLocaleDateString()}</td>
                  <td className="py-6 font-black text-lg tracking-tight">{p.district}</td>
                  <td className="py-6"><RiskDot risk={p.bph_risk} /></td>
                  <td className="py-6"><RiskDot risk={p.stem_risk} /></td>
                  <td className="py-6"><RiskDot risk={p.leaf_risk} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

function RiskDot({ risk }: any) {
  const colors: any = { High: 'bg-red-500', Medium: 'bg-amber-500', Low: 'bg-emerald-500' };
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${colors[risk] || 'bg-gray-300'}`} />
      <span className="font-medium">{risk}</span>
    </div>
  );
}

function ChatView({ t }: any) {
  const [messages, setMessages] = useState<any[]>([
    { role: 'ai', text: 'Vanakkam! I am your AI Farmer Assistant. How can I help you today? / வணக்கம்! நான் உங்கள் AI விவசாய உதவியாளர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await getChatResponse(userMsg);
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const speak = async (text: string, index: number) => {
    if (playing !== null) return;
    setPlaying(index);
    try {
      const base64Audio = await generateSpeech(text);
      if (base64Audio) {
        const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
        audio.onended = () => setPlaying(null);
        await audio.play();
      }
    } catch (err) {
      console.error(err);
      setPlaying(null);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto h-[650px] flex flex-col bg-white rounded-[32px] border border-[#E5E5E0] overflow-hidden shadow-2xl"
    >
      <div className="p-6 border-b border-[#F5F5F0] flex justify-between items-center bg-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#5A5A40] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#5A5A40]/20">
            <MessageSquare size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg">{t.chat}</h3>
            <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Online • Bilingual Assistant
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-[#8E8E8E] hover:text-[#5A5A40] transition-colors">
            <Info size={20} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FBFBFA]">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="flex flex-col gap-2 max-w-[85%]">
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-[#5A5A40] text-white rounded-tr-none shadow-md' 
                  : 'bg-white border border-[#E5E5E0] text-[#1A1A1A] rounded-tl-none shadow-sm'
              }`}>
                {m.text}
              </div>
              {m.role === 'ai' && (
                <button 
                  onClick={() => speak(m.text, i)}
                  disabled={playing !== null}
                  className={`self-start flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    playing === i ? 'text-emerald-500' : 'text-[#8E8E8E] hover:text-[#5A5A40]'
                  }`}
                >
                  {playing === i ? <Loader2 size={12} className="animate-spin" /> : <Volume2 size={12} />}
                  {playing === i ? 'Speaking...' : 'Listen (கேளுங்கள்)'}
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-[#E5E5E0] p-4 rounded-2xl rounded-tl-none shadow-sm">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-[#5A5A40] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-[#5A5A40] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-[#5A5A40] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-[#F5F5F0]">
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <input 
              type="text" 
              className="w-full bg-[#F5F5F0] border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-[#5A5A40] pr-12"
              placeholder={t.chatPlaceholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8E8E8E] hover:text-[#5A5A40] transition-colors">
              <Mic size={20} />
            </button>
          </div>
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-[#5A5A40] text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-[#4A4A30] transition-all shadow-lg shadow-[#5A5A40]/20 disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
