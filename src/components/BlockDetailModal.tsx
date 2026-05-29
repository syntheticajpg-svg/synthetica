import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { 
  X, 
  ArrowRight, 
  Check, 
  Send, 
  Code, 
  Sparkles, 
  Mail, 
  User, 
  Briefcase, 
  BookOpen, 
  Globe, 
  MessageSquare,
  DollarSign,
  HelpCircle,
  Award,
  Lock,
  Calendar,
  Layers,
  Zap,
  Cpu,
  Database,
  Shield,
  RefreshCw
} from 'lucide-react';
import { BlockId, PortfolioBlock, QuoteRequest, DirectMessage } from '../types';

interface BlockDetailModalProps {
  block: PortfolioBlock;
  onClose: () => void;
  onSubmitContact: (msg: DirectMessage) => void;
  onChatWithAi: (text: string, callback: (reply: string, err?: string) => void) => Promise<void>;
  isAiLoading: boolean;
  language?: 'RU' | 'EN';
  onOpenPaymentWidget?: (itemName: string, price?: number) => void;
}

export default function BlockDetailModal({ 
  block, 
  onClose, 
  onSubmitContact, 
  onChatWithAi,
  isAiLoading,
  language = 'RU',
  onOpenPaymentWidget
}: BlockDetailModalProps) {
  // Modal states
  const [activeTab, setActiveTab] = useState<'info' | 'interactive'>('info');
  
  // Custom states per block
  // 1. Services Quote customizer
  const [selectedServices, setSelectedServices] = useState<string[]>(['neuro_branding']);
  const [clientBudget, setClientBudget] = useState<'low' | 'mid' | 'high'>('mid');
  const [isServiceSaved, setIsServiceSaved] = useState(false);

  // 2. Midjourney Quiz state
  const [mjQuizAnswer, setMjQuizAnswer] = useState<string | null>(null);
  const [mjFeedback, setMjFeedback] = useState<string>('');

  // 3. Marketing Diagnosis Quiz states
  const [marketingAnswers, setMarketingAnswers] = useState<{
    q1?: string;
    q2?: string;
    q3?: string;
  }>({});
  const [marketingQuizScore, setMarketingQuizScore] = useState<number | null>(null);

  // 4. Contact Form states
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [isMsgSent, setIsMsgSent] = useState(false);

  // 5. Twin AI chat history state
  const [aiChatHistory, setAiChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [aiChatInput, setAiChatInput] = useState('');
  const [localAiLoading, setLocalAiLoading] = useState(false);
  const [localAiError, setLocalAiError] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize and language swap triggers for AI chat twin history
  useEffect(() => {
    setAiChatHistory([
      { 
        role: 'assistant', 
        content: language === 'RU'
          ? 'ПРИВЕТСТВУЕМ! Я ИИ-соавтор Ирины. Буду рада помочь! Чем сейчас занимается ваш бренд? Могу подробно описать программу курсов, составить концепцию или рассчитать стоимость айдентики.'
          : "WELCOME! I am Irina's intelligent AI twin. I am programmed to assist. Tell me about your branding vision. I can outline course syllabi, propose dynamic concepts, or estimate identity costs."
      }
    ]);
  }, [language]);

  // Auto-scroll chat Twin
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiChatHistory, localAiLoading]);

  // Pricing calculator helper
  const getEstimatedPrice = (): number => {
    let base = 0;
    if (selectedServices.includes('neuro_branding')) base += 45000;
    if (selectedServices.includes('ai_campaigns')) base += 75000;
    if (selectedServices.includes('prompt_architecture')) base += 35000;
    if (selectedServices.includes('consulting_workshop')) base += 25000;

    if (clientBudget === 'low') return base * 0.8;
    if (clientBudget === 'high') return base * 1.3;
    return base;
  };

  const handleMjQuiz = (option: string) => {
    setMjQuizAnswer(option);
    if (option === 'no_bg') {
      setMjFeedback(language === 'RU'
        ? 'АБСОЛЮТНО ВЕРНО! Отрицательный промпт --no background (или --no backdrop) заставляет Midjourney минимизировать окружающие элементы, предоставляя изолированный объект.'
        : 'ABSOLUTELY CORRECT! The negative prompt --no background forces Midjourney to completely strip away backdrop clutter, providing an isolated product model.');
    } else if (option === 'wrong_white') {
      setMjFeedback(language === 'RU'
        ? 'НЕ СОВСЕМ. Студийные белые фоны часто создают размытые градиенты и тени на полу, которые потом очень сложно вырезать в автоматическом режиме.'
        : 'NOT QUITE. Studio white backgrounds often generate subtle floor shadows and drop-shadow bleed and gradients that complicate automated mask outlines.');
    } else {
      setMjFeedback(language === 'RU'
        ? 'Термин "isolated object" часто игнорируется нейросетью, если в самом промпте содержится много художественных деталей. Параметр --no является более строгим.'
        : 'The literal phrase "isolated object" gets bypassed easily as diffuse styles stack up. Mathematical negative prompts like --no act as rigid boundaries.');
    }
  };

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!senderName || !senderEmail || !contactMsg) return;
    onSubmitContact({
      id: Date.now().toString(),
      name: senderName,
      email: senderEmail,
      topic: block.title,
      message: contactMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    setIsMsgSent(true);
    setSenderName('');
    setSenderEmail('');
    setContactMsg('');
  };

  const handleAiChatSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!aiChatInput.trim() || localAiLoading) return;

    const userMsg = aiChatInput.trim();
    setAiChatInput('');
    setAiChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setLocalAiLoading(true);
    setLocalAiError(null);

    try {
      await onChatWithAi(userMsg, (reply, err) => {
        if (err) {
          setLocalAiError(language === 'RU' 
            ? 'Не удалось связаться с ИИ-сервером. Проверьте подключение.' 
            : 'Failed to establish connection with AI Twin gateway. Check your network.');
        } else {
          setAiChatHistory(prev => [...prev, { role: 'assistant', content: reply }]);
        }
        setLocalAiLoading(false);
      });
    } catch {
      setLocalAiError(language === 'RU' ? 'Внутренняя непредвиденная ошибка сопряжения' : 'Internal interface linkage fault');
      setLocalAiLoading(false);
    }
  };

  const handleMarketingQuizSubmit = () => {
    let score = 0;
    if (marketingAnswers.q1 === 'yes' || marketingAnswers.q1 === 'sometimes') score += 1;
    if (marketingAnswers.q2 === 'ai_human' || marketingAnswers.q2 === 'auto') score += 1;
    if (marketingAnswers.q3 === 'regular') score += 1;
    setMarketingQuizScore(score);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      id="modal-container" 
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-2 sm:p-4 bg-neutral-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in cursor-pointer"
    >
      
      {/* Sharp clean cards layout matching Swiss computer minimalism */}
      <div 
        id="modal-card" 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl h-auto md:h-[85vh] bg-white border border-neutral-300 rounded-none overflow-visible md:overflow-hidden shadow-2xl flex flex-col md:flex-row text-neutral-900 relative cursor-default"
      >
        
        {/* Floating absolute close button on top right to ensure close option is always visible and clickable */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 z-[60] p-1.5 bg-white/90 hover:bg-white text-neutral-950 border border-neutral-300 hover:border-neutral-950 transition-all rounded-none shadow-md flex items-center justify-center cursor-pointer"
          title={language === 'RU' ? 'Закрыть окно' : 'Close window'}
        >
          <X className="w-4 h-4" />
        </button>

        {/* LEFT COLUMN: Clean Minimalist Poster Panel */}
        <div 
          id="modal-sidebar" 
          className="md:w-5/12 bg-neutral-50 relative md:overflow-y-auto flex flex-col justify-between p-6 border-b md:border-b-0 md:border-r border-neutral-200 h-auto md:h-full shrink-0"
        >
          
          <div className="absolute inset-0 z-0 opacity-10">
            <img 
              src={block.image || undefined} 
              key={block.image || undefined}
              alt={block.title} 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
          </div>

          {block.id === 'about_me' ? (
            <div className="relative z-10 flex flex-col gap-4 items-center w-full my-auto pb-4">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] px-3 py-1 bg-neutral-900 text-white w-max font-bold">
                {language === 'RU' ? 'АВТОР' : 'AUTHOR'}
              </span>
              <div className="w-36 h-44 border border-neutral-300 bg-neutral-200 overflow-hidden relative shadow-sm mt-2">
                <img 
                  src={block.customConfig?.authorImage || block.image || undefined} 
                  key={block.customConfig?.authorImage || block.image || undefined}
                  alt="Ирина SYNTHETICA" 
                  className="w-full h-full object-cover contrast-110 animate-fade-in" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-center">
                <h2 className="text-base font-sans font-bold tracking-widest text-neutral-900 uppercase">
                  ИРИНА SYNTHETICA
                </h2>
                <div className="mt-2.5 flex flex-col gap-1 items-center font-mono text-[9px] text-neutral-500 font-bold uppercase tracking-wider">
                  <span>{language === 'RU' ? '✦ Арт-директор' : '✦ Art Director'}</span>
                  <span>{language === 'RU' ? '✦ генеративный AI-дизайнер' : '✦ Generative AI-Designer'}</span>
                  <span>{language === 'RU' ? '✦ маркетолог' : '✦ Marketer'}</span>
                  <span>{language === 'RU' ? '✦ бренд-продюсер' : '✦ Brand Producer'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col gap-2 shrink-0">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] px-3 py-1 bg-neutral-900 text-white w-max font-bold">
                {block.id === 'services'
                  ? (language === 'RU' ? 'УСЛУГИ И ПРАЙС' : 'SERVICES & PRICING')
                  : block.id === 'mentorship'
                    ? (language === 'RU' ? 'НАСТАВНИЧЕСТВО И ОБУЧЕНИЕ' : 'MENTORSHIP & ACADEMY')
                    : (block.id === 'course_midjourney' || block.id === 'course_marketing')
                      ? (language === 'RU' ? 'ДЕТАЛИ КУРСА' : 'COURSE DETAILS')
                      : (language === 'RU' ? 'ДЕТАЛИ ПРОЕКТА' : 'PROJECT DETAILS')}
              </span>
              <h2 className="text-xl font-sans mt-4 font-bold tracking-widest leading-tight text-neutral-900 uppercase">
                {(() => {
                  const prefixes = [
                    'ОСНОВНОЙ КУРС', 'Основной курс', 'CORE COURSE', 'MAIN COURSE',
                    'МИНИ-КУРС', 'Мини-курс', 'MINI-COURSE'
                  ];
                  let label = '';
                  let mainTitle = block.title;
                  for (const p of prefixes) {
                    if (block.title.toUpperCase().startsWith(p.toUpperCase())) {
                      label = block.title.substring(0, p.length);
                      mainTitle = block.title.substring(p.length).trim();
                      break;
                    }
                  }
                  if (label && mainTitle) {
                    return (
                      <span className="flex flex-col gap-1">
                        <span className="text-[10px] text-neutral-400 tracking-[0.2em] font-normal">{label}</span>
                        <span>{mainTitle}</span>
                      </span>
                    );
                  }
                  return block.title;
                })()}
              </h2>
              <p className="text-[11px] text-neutral-500 leading-relaxed font-sans mt-2 whitespace-pre-line font-light">
                {block.subtitle}
              </p>
            </div>
          )}

          <div className="relative z-10 pt-6 flex flex-col gap-4 mt-auto shrink-0 pb-2">
            {block.customConfig?.customPrice ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-1">
                    <span className="text-[9px] text-neutral-400 font-mono tracking-wider uppercase font-bold">
                      {language === 'RU' ? 'СТОИМОСТЬ' : 'INVESTMENT'}
                    </span>
                    <div className="flex items-baseline gap-2.5 font-mono">
                      <span className="text-[14px] text-[#cbdc19] underline font-black">
                        {block.customConfig.customPrice}
                      </span>
                    </div>
                  </div>
                  <a 
                    href="https://t.me/syntheticajpg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block p-4 bg-neutral-950 border border-neutral-900 transition-all duration-200 hover:bg-neutral-900 text-center relative rounded-none shadow-md"
                  >
                    <span className="text-[#cbdc19] font-mono text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-2">
                      <Send className="w-3.5 h-3.5 text-[#cbdc19]" />
                      {language === 'RU' ? 'СВЯЗАТЬСЯ СО МНОЙ ДЛЯ ЗАПИСИ' : 'CONTACT ME TO REGISTER'}
                    </span>
                  </a>
                </div>
            ) : block.id !== 'about_me' && (
              block.id === 'services' ? (
                /* Glowing neon color block matching the ticker citation text color #cbdc19 */
                <a 
                  href="https://t.me/syntheticajpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block p-4 bg-neutral-950 border border-neutral-900 transition-all duration-200 hover:bg-neutral-900 text-center relative rounded-none shadow-md"
                >
                  <span className="text-[#cbdc19] font-mono text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-2">
                    <Send className="w-3.5 h-3.5 text-[#cbdc19]" />
                    {language === 'RU' ? 'СВЯЗАТЬСЯ СО МНОЙ ДЛЯ РАСЧЕТА СТОИМОСТИ УСЛУГИ' : 'CONTACT ME FOR A SERVICE COST ESTIMATION'}
                  </span>
                </a>
              ) : block.id === 'mentorship' ? (
                <div className="flex flex-col gap-4">
                  {/* Premium Price Tag with old crossed out price */}
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-1">
                    <span className="text-[9px] text-neutral-400 font-mono tracking-wider uppercase font-bold">
                      {language === 'RU' ? 'СТОИМОСТЬ' : 'INVESTMENT'}
                    </span>
                    <div className="flex items-baseline gap-2.5 font-mono">
                      <span className="text-[11px] text-neutral-400 line-through">
                        {language === 'RU' ? '35 000 ₽' : '35,000 RUB'}
                      </span>
                      <span className="text-[14px] text-neutral-950 font-black">
                        {language === 'RU' ? '30 000 ₽' : '30,000 RUB'}
                      </span>
                    </div>
                  </div>

                  {/* Dedicated mentorship params box without "Sector" label */}
                  <div className="grid grid-cols-2 gap-3 bg-white border border-neutral-200 p-4 rounded-none shadow-none">
                    <div>
                      <span className="text-[8px] text-neutral-400 font-mono tracking-wider block uppercase">
                        {language === 'RU' ? 'ЛИМИТ' : 'LIMIT'}
                      </span>
                      <span className="text-[11px] font-mono text-neutral-800 mt-1 font-bold block uppercase">
                        {language === 'RU' ? '3 человека в месяц' : '3 people / month'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] text-neutral-400 font-mono tracking-wider block uppercase">
                        {language === 'RU' ? 'ФОРМАТ' : 'FORMAT'}
                      </span>
                      <span className="text-[11px] font-mono text-neutral-950 mt-1 font-bold block uppercase">
                        {language === 'RU' ? 'ЛИЧНО 1-НА-1' : '1-ON-1 PERSONAL'}
                      </span>
                    </div>
                  </div>
                  {/* Glowing neon enroll button matching the ticker citation text color #cbdc19 */}
                  <a 
                    href="https://t.me/syntheticajpg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block p-4 bg-neutral-950 border border-neutral-900 transition-all duration-200 hover:bg-neutral-900 text-center relative rounded-none shadow-md"
                  >
                    <span className="text-[#cbdc19] font-mono text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-2">
                      <Send className="w-3.5 h-3.5 text-[#cbdc19]" />
                      {language === 'RU' ? 'СВЯЗАТЬСЯ СО МНОЙ ДЛЯ ЗАПИСИ' : 'CONTACT ME TO REGISTER'}
                    </span>
                  </a>
                </div>
              ) : block.id === 'course_midjourney' ? (
                <div className="flex flex-col gap-4">
                  {/* Premium Price Tag with old crossed out price for Block 3 */}
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-1">
                    <span className="text-[9px] text-neutral-400 font-mono tracking-wider uppercase font-bold">
                      {language === 'RU' ? 'СТОИМОСТЬ' : 'INVESTMENT'}
                    </span>
                    <div className="flex items-baseline gap-2.5 font-mono">
                      <span className="text-[11px] text-neutral-400 line-through">
                        {language === 'RU' ? '30 000 ₽' : '30,000 RUB'}
                      </span>
                      <span className="text-[14px] text-neutral-950 font-black">
                        {language === 'RU' ? '25 000 ₽' : '25,000 RUB'}
                      </span>
                    </div>
                  </div>

                  {/* Dedicated course params box */}
                  <div className="flex flex-col gap-3 bg-white border border-neutral-200 p-4 rounded-none shadow-none">
                    <div className="grid grid-cols-2 gap-3 border-b border-neutral-100 pb-3">
                      <div>
                        <span className="text-[8px] text-neutral-400 font-mono tracking-wider block uppercase">
                          {language === 'RU' ? 'ВРЕМЯ ИЗУЧЕНИЯ' : 'STUDY PERIOD'}
                        </span>
                        <span className="text-[11px] font-mono text-neutral-800 mt-1 font-bold block uppercase">
                          {language === 'RU' ? '3 недели' : '3 weeks'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[8px] text-neutral-400 font-mono tracking-wider block uppercase">
                          {language === 'RU' ? 'ФОРМАТ' : 'FORMAT'}
                        </span>
                        <span className="text-[11px] font-mono text-neutral-950 mt-1 font-bold block uppercase">
                          {language === 'RU' ? 'учебник + видео' : 'handbook + video'}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 pt-1">
                      <div>
                        <span className="text-[8px] text-neutral-400 font-mono tracking-wider block uppercase">
                          {language === 'RU' ? 'ПРАКТИКА' : 'PRACTICE'}
                        </span>
                        <span className="text-[11px] font-mono text-neutral-850 mt-1 font-bold block uppercase">
                          {language === 'RU' ? 'задания с обратной связью' : 'assignments with feedback'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[8px] text-green-600 font-mono tracking-wider block uppercase">
                          {language === 'RU' ? 'БОНУС' : 'BONUS'}
                        </span>
                        <span className="text-[11px] font-mono text-neutral-950 mt-1 font-bold block uppercase">
                          {language === 'RU' ? 'доступ к мини-курсу Pin & Profit' : 'Pin & Profit mini-course access'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Register link button */}
                  <button 
                    onClick={() => onOpenPaymentWidget?.(language === 'RU' ? 'Курс по нейросъемкам Fake It. Shake it.' : 'Fake It. Shake it. Course', 25000)}
                    className="w-full group block p-4 bg-neutral-950 border border-neutral-900 transition-all duration-200 hover:bg-neutral-900 text-center relative rounded-none shadow-md"
                  >
                    <span className="text-[#cbdc19] font-mono text-[13px] font-black uppercase tracking-wider flex items-center justify-center gap-2">
                      {language === 'RU' ? 'ПРИОБРЕСТИ СЕЙЧАС' : 'PURCHASE NOW!'}
                    </span>
                  </button>
                </div>
              ) : block.id === 'course_marketing' ? (
                <div className="flex flex-col gap-4">
                  {/* Premium Price Tag with cost for Block 4 */}
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-1">
                    <span className="text-[9px] text-neutral-400 font-mono tracking-wider uppercase font-bold">
                      {language === 'RU' ? 'СТОИМОСТЬ' : 'INVESTMENT'}
                    </span>
                    <div className="flex items-baseline gap-2.5 font-mono">
                      <span className="text-[14px] text-neutral-950 font-black">
                        {language === 'RU' ? '5 900 ₽' : '5,900 RUB'}
                      </span>
                    </div>
                  </div>

                  {/* Dedicated course params box */}
                  <div className="flex flex-col gap-3 bg-white border border-neutral-200 p-4 rounded-none shadow-none">
                    <div className="grid grid-cols-2 gap-3 border-b border-neutral-100 pb-3">
                      <div>
                        <span className="text-[8px] text-neutral-400 font-mono tracking-wider block uppercase">
                          {language === 'RU' ? 'ВРЕМЯ ИЗУЧЕНИЯ' : 'STUDY PERIOD'}
                        </span>
                        <span className="text-[11px] font-mono text-neutral-800 mt-1 font-bold block uppercase">
                          {language === 'RU' ? '2-3 дня' : '2-3 days'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[8px] text-neutral-400 font-mono tracking-wider block uppercase">
                          {language === 'RU' ? 'ФОРМАТ' : 'FORMAT'}
                        </span>
                        <span className="text-[11px] font-mono text-neutral-950 mt-1 font-bold block uppercase">
                          {language === 'RU' ? 'учебник' : 'handbook'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[8px] text-green-600 font-mono tracking-wider block uppercase">
                        {language === 'RU' ? 'БОНУС' : 'BONUS'}
                      </span>
                      <span className="text-[11px] font-mono text-neutral-950 mt-1 font-bold block uppercase">
                        {language === 'RU' ? 'доступ к мини-курсу Pin & Profit' : 'Pin & Profit mini-course access'}
                      </span>
                    </div>
                  </div>

                  {/* Register link button */}
                  <button 
                    onClick={() => onOpenPaymentWidget?.(language === 'RU' ? 'Мини-курс AI-модели You\'re NOT perfect' : "AI Models You're NOT perfect", 5900)}
                    className="w-full group block p-4 bg-neutral-950 border border-neutral-900 transition-all duration-200 hover:bg-neutral-900 text-center relative rounded-none shadow-md"
                  >
                    <span className="text-[#cbdc19] font-mono text-[13px] font-black uppercase tracking-wider flex items-center justify-center gap-2">
                      {language === 'RU' ? 'ПРИОБРЕСТИ СЕЙЧАС' : 'PURCHASE NOW!'}
                    </span>
                  </button>
                </div>
              ) : block.id === 'contact_me' ? (
                <div className="flex flex-col gap-4">
                  {/* Premium Price Tag with old crossed out price for Block 6 Pinterest Mini-course */}
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-1">
                    <span className="text-[9px] text-neutral-400 font-mono tracking-wider uppercase font-bold">
                      {language === 'RU' ? 'СТОИМОСТЬ' : 'INVESTMENT'}
                    </span>
                    <div className="flex items-baseline gap-2.5 font-mono">
                      <span className="text-[11px] text-neutral-400 line-through">
                        {language === 'RU' ? '5 900 ₽' : '5,900 RUB'}
                      </span>
                      <span className="text-[14px] text-neutral-950 font-black">
                        {language === 'RU' ? '3 500 ₽' : '3,500 RUB'}
                      </span>
                    </div>
                  </div>

                  {/* Dedicated course params box */}
                  <div className="flex flex-col gap-3 bg-white border border-neutral-200 p-4 rounded-none shadow-none">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[8px] text-neutral-400 font-mono tracking-wider block uppercase">
                          {language === 'RU' ? 'ВРЕМЯ ИЗУЧЕНИЯ' : 'STUDY PERIOD'}
                        </span>
                        <span className="text-[11px] font-mono text-neutral-800 mt-1 font-bold block uppercase">
                          {language === 'RU' ? '2 часа' : '2 hours'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[8px] text-neutral-400 font-mono tracking-wider block uppercase">
                          {language === 'RU' ? 'ФОРМАТ' : 'FORMAT'}
                        </span>
                        <span className="text-[11px] font-mono text-neutral-950 mt-1 font-bold block uppercase">
                          {language === 'RU' ? 'учебник' : 'handbook'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Register/Purchase link button */}
                  <button 
                    onClick={() => onOpenPaymentWidget?.(language === 'RU' ? 'Мини-курс Pinterest Pin & Profit' : "Pinterest Pin & Profit", 3500)}
                    className="w-full group block p-4 bg-neutral-950 border border-neutral-900 transition-all duration-200 hover:bg-neutral-900 text-center relative rounded-none shadow-md"
                  >
                    <span className="text-[#cbdc19] font-mono text-[13px] font-black uppercase tracking-wider flex items-center justify-center gap-2">
                      {language === 'RU' ? 'ПРИОБРЕСТИ СЕЙЧАС' : 'PURCHASE NOW!'}
                    </span>
                  </button>
                </div>
              ) : (
                /* Elegant neutral parameter box */
                <div className="grid grid-cols-2 gap-3 bg-white border border-neutral-200 p-4 rounded-none shadow-none">
                  <div>
                    <span className="text-[8px] text-neutral-400 font-mono tracking-wider block uppercase">
                      {language === 'RU' ? 'НАПРАВЛЕНИЕ' : 'SECTOR'}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-800 mt-1 font-semibold block">
                      {block.id.includes('course')
                        ? (language === 'RU' ? 'ОБУЧЕНИЕ' : 'ACADEMY') 
                        : (language === 'RU' ? 'БРЕНДИНГ' : 'BRANDING')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] text-neutral-400 font-mono tracking-wider block uppercase">
                      {language === 'RU' ? 'ФОРМАТ' : 'FORMAT'}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-950 mt-1 font-bold block uppercase">
                      {language === 'RU' ? 'ИНТЕРАКТИВНО' : 'INTERACTIVE'}
                    </span>
                  </div>
                </div>
              )
            )}

            <button 
              onClick={onClose}
              className="w-full py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-white transition-all duration-250 font-mono tracking-widest text-[10px] uppercase flex items-center justify-center gap-2 rounded-none font-bold"
            >
              <X className="w-3.5 h-3.5" /> {language === 'RU' ? '[ ЗАКРЫТЬ ОКНО ]' : '[ CLOSE WINDOW ]'}
            </button>
          </div>
          
          {/* Spacer to fix bottom cutoff on some scaled screens / mobile browsers */}
          <div className="h-4 w-full shrink-0 md:h-12"></div>
        </div>

        {/* RIGHT COLUMN: Minimal Slate Detailed Content Work Area */}
        <div id="modal-content" className="md:w-7/12 flex flex-col h-auto md:h-full bg-white relative">
          
          {/* Stark Line Action Header Tab Options */}
          {block.isActive && block.id !== 'about_me' && block.id !== 'mentorship' && (
            <div className="flex border-b border-neutral-200 bg-neutral-50 p-1">
              <button 
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-3 text-[10px] font-mono font-bold uppercase tracking-widest transition-colors ${
                  activeTab === 'info' 
                    ? 'text-neutral-900 border-b-2 border-neutral-900 bg-white font-black' 
                    : 'text-neutral-400 hover:text-neutral-700'
                }`}
              >
                {block.customConfig?.tab1Name || (block.id === 'services'
                  ? (language === 'RU' ? 'НАПРАВЛЕНИЯ' : 'REPERTOIRE')
                  : (block.id === 'course_midjourney' || block.id === 'course_marketing' || block.id === 'contact_me')
                    ? (language === 'RU' ? 'ПРО КУРС' : 'ABOUT COURSE')
                    : (language === 'RU' ? 'ХАРАКТЕРИСТИКИ И СУТЬ' : 'OVERVIEW & DESCRIPTION'))}
              </button>
              <button 
                onClick={() => setActiveTab('interactive')}
                className={`flex-1 py-3 text-[10px] font-mono font-bold uppercase tracking-widest transition-colors ${
                  activeTab === 'interactive' 
                    ? 'text-neutral-900 border-b-2 border-neutral-900 bg-white font-black' 
                    : 'text-neutral-400 hover:text-neutral-700'
                }`}
              >
                {block.customConfig?.tab2Name || (block.id === 'services'
                  ? (language === 'RU' ? 'СТОИМОСТЬ' : 'PRICING POLICY')
                  : (block.id === 'course_midjourney' || block.id === 'course_marketing' || block.id === 'contact_me')
                    ? (language === 'RU' ? 'СОДЕРЖАНИЕ' : 'SYLLABUS')
                    : (language === 'RU' ? 'ИНТЕРАКТИВНОЕ ВОВЛЕЧЕНИЕ' : 'INTERACTIVE PRACTICE'))}
              </button>
            </div>
          )}

          {block.id === 'about_me' && (
            <div className="border-b border-neutral-200 bg-neutral-50 px-6 py-4 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-900">
                {language === 'RU' ? 'О БРЕНД-ЛИДЕРЕ & ЭКСПЕРТЕ' : 'ABOUT THE BRAND LEADER & EXPERT'}
              </span>
              <span className="text-[9px] font-mono text-neutral-400 uppercase font-black tracking-widest">
                [ {language === 'RU' ? 'БЕКГРАУНД' : 'BACKGROUND'} ]
              </span>
            </div>
          )}

          {/* Core scroll container */}
          <div className="flex-grow p-6 md:p-8 md:overflow-y-auto text-xs text-neutral-800 space-y-6">

            {block.customConfig?.customModalText && (
              <div className="p-5 border border-dashed border-[#0284c7]/30 bg-[#0284c7]/5 mb-6 text-sm whitespace-pre-line leading-relaxed text-neutral-800">
                {block.customConfig.customModalText}
              </div>
            )}

            {/* Special Clean Experience Timeline for About Me Block */}
            {block.id === 'about_me' && (
              block.customConfig?.tab1Content ? (
                <div className="space-y-6 animate-fade-in text-left font-sans text-sm text-neutral-800 whitespace-pre-line leading-relaxed">
                  {block.customConfig.tab1Content}
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in text-left font-sans">
                  <section className="space-y-3">
                  <p className="text-neutral-750 leading-relaxed text-[13px] font-light">
                    {language === 'RU' 
                      ? 'Привет! Меня зовут Ирина, я автор студии SYNTHETICA, коммерческий арт-директор, маркетолог и генеративный дизайнер.\nСегодня визуальный контент меняется с невероятной скоростью. Эпоха глянцевых, «пластиковых» нейросетевых картинок осталась в прошлом. Современному бизнесу и аудитории нужен премиальный фотореализм, глубина, проработка текстур и уникальный характер, который заставляет поверить в кадр с первой секунды.\nМой подход объединяет классические законы маркетинга, психологию восприятия и передовые AI-технологии. Я не просто генерирую графику — я создаю управляемый, предсказуемый и дорогой визуал, который решает задачи бренда.'
                      : 'Hi! My name is Irina, I am the founder of SYNTHETICA studio, a commercial art director, marketer, and generative designer.\nToday, visual content is evolving at an incredible pace. The era of glossy, "plastic" AI-generated images is over. Modern businesses and audiences demand premium photorealism, depth, textured details, and a unique character that makes you believe in the shot from the first second.\nMy approach combines classical marketing laws, the psychology of perception, and cutting-edge AI technologies. I don’t just generate graphics — I create controlled, predictable, and high-end visuals that solve brand objectives.'}
                  </p>
                </section>

                <section className="space-y-4">
                  <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-950 font-bold border-b border-neutral-150 pb-2">
                    ✦ {language === 'RU' ? 'ПРОФЕССИОНАЛЬНЫЙ ОПЫТ' : 'PROFESSIONAL EXPERIENCE'}
                  </h4>
                  
                  {/* Grid Timeline of her 5 distinct unique items */}
                  <div className="space-y-4 font-sans text-neutral-800">
                    
                    {/* Item 1: COO Jewelry design */}
                    <div className="p-4 bg-neutral-50/50 border border-neutral-200 hover:border-neutral-300 transition-colors rounded-none flex flex-col md:flex-row gap-4">
                      <div className="md:w-1/4 flex-shrink-0">
                        <span className="font-mono text-sm font-black text-neutral-950 block">3 {language === 'RU' ? 'ГОДА' : 'YEARS'}</span>
                        <span className="text-[8px] font-mono text-neutral-400 uppercase tracking-widest block mt-0.5">{language === 'RU' ? 'БОРД-УПРАВЛЕНИЕ' : 'EXECUTIVE ACTION'}</span>
                      </div>
                      <div className="md:w-3/4">
                        <span className="text-xs font-bold font-mono text-neutral-900 uppercase block">
                          {language === 'RU' ? 'COO ювелирного бренда' : 'COO of a Jewelry Brand'}
                        </span>
                        <p className="text-[11px] text-neutral-500 font-light mt-1.5 leading-relaxed">
                          {language === 'RU'
                            ? '3 года успешного операционного управления ювелирным брендом: масштабирование бизнеса, менеджмент креативных команд и выстраивание производственных процессов.'
                            : '3 years of operational leadership managing operational scaling and production lines for a boutique designer jewelry brand.'}
                        </p>
                      </div>
                    </div>

                    {/* Item 2: Graphic Design 4 Years */}
                    <div className="p-4 bg-neutral-50/50 border border-neutral-200 hover:border-neutral-300 transition-colors rounded-none flex flex-col md:flex-row gap-4">
                      <div className="md:w-1/4 flex-shrink-0">
                        <span className="font-mono text-sm font-black text-neutral-950 block">4 {language === 'RU' ? 'ГОДА' : 'YEARS'}</span>
                        <span className="text-[8px] font-mono text-neutral-400 uppercase tracking-widest block mt-0.5">{language === 'RU' ? 'ВИЗУАЛЬНЫЙ СИНТЕЗ' : 'VISUAL IDENTITY'}</span>
                      </div>
                      <div className="md:w-3/4">
                        <span className="text-xs font-bold font-mono text-neutral-900 uppercase block">
                          {language === 'RU' ? 'Графический дизайн' : 'Graphic Design'}
                        </span>
                        <p className="text-[11px] text-neutral-500 font-light mt-1.5 leading-relaxed">
                          {language === 'RU'
                            ? '4 года в сфере графического дизайна: разработка концептуальной айдентики, знаковых систем визуальных коммуникаций и упаковочных решений.'
                            : '4 years of active graphic design work: drafting custom brand corporate systems, sleek visual packaging, and corporate materials.'}
                        </p>
                      </div>
                    </div>

                    {/* Item 3: Generative design 3 Years */}
                    <div className="p-4 bg-neutral-50/50 border border-neutral-200 hover:border-neutral-300 transition-colors rounded-none flex flex-col md:flex-row gap-4">
                      <div className="md:w-1/4 flex-shrink-0">
                        <span className="font-mono text-sm font-black text-neutral-950 block">3 {language === 'RU' ? 'ГОДА' : 'YEARS'}</span>
                        <span className="text-[8px] font-mono text-neutral-450 uppercase tracking-widest block mt-0.5">{language === 'RU' ? 'НЕЙРО-АРХИТЕКТУРА' : 'SYNTHETIC SYSTEMS'}</span>
                      </div>
                      <div className="md:w-3/4">
                        <span className="text-xs font-bold font-mono text-neutral-900 uppercase block">
                          {language === 'RU' ? 'Генеративный дизайн' : 'Generative Design Production'}
                        </span>
                        <p className="text-[11px] text-neutral-500 font-light mt-1.5 leading-relaxed">
                          {language === 'RU'
                            ? '3 года работы в сфере генеративного дизайна как на русском, так и на зарубежном рынке. Создание уникального рекламного и бренд-контента.'
                            : '3 years scaling art direction using AI generation models for both Russian and global markets, crafting outstanding promotional material.'}
                        </p>
                      </div>
                    </div>

                    {/* Item 4: Digital Marketing Degree */}
                    <div className="p-4 bg-neutral-50/50 border border-neutral-200 hover:border-neutral-300 transition-colors rounded-none flex flex-col md:flex-row gap-4">
                      <div className="md:w-1/4 flex-shrink-0">
                        <span className="font-mono text-[10px] font-black text-neutral-900 block uppercase">DEGREE</span>
                        <span className="text-[8px] font-mono text-neutral-400 uppercase tracking-widest block mt-0.5">{language === 'RU' ? 'ОБРАЗОВАНИЕ' : 'EDUCATION'}</span>
                      </div>
                      <div className="md:w-3/4">
                        <span className="text-xs font-bold font-mono text-neutral-900 uppercase block">
                          {language === 'RU' ? 'Образование в сфере Digital-маркетинга' : 'Education in Digital Marketing'}
                        </span>
                        <p className="text-[11px] text-neutral-500 font-light mt-1.5 leading-relaxed">
                          {language === 'RU'
                            ? 'Профессиональное профильное образование в сфере диджитал-маркетинга: построение воронок, стратегия продвижения и перформанс-аналитика.'
                            : 'Full qualification in digital marketing ecosystems, structuring smart customer journeys, and performance optimization models.'}
                        </p>
                      </div>
                    </div>

                    {/* Item 5: Online Education & Mentorship 2 Years */}
                    <div className="p-4 bg-neutral-50/50 border border-neutral-200 hover:border-neutral-300 transition-colors rounded-none flex flex-col md:flex-row gap-4">
                      <div className="md:w-1/4 flex-shrink-0">
                        <span className="font-mono text-sm font-black text-neutral-950 block">2 {language === 'RU' ? 'ГОДА' : 'YEARS'}</span>
                        <span className="text-[8px] font-mono text-neutral-400 uppercase tracking-widest block mt-0.5">{language === 'RU' ? 'НАСЛЕДИЕ & МЕНТОРИНГ' : 'MENTORSHIP'}</span>
                      </div>
                      <div className="md:w-3/4">
                        <span className="text-xs font-bold font-mono text-neutral-900 uppercase block">
                          {language === 'RU' ? 'Онлайн-образование и наставничество' : 'Online Education & Mentorship'}
                        </span>
                        <p className="text-[11px] text-neutral-500 font-light mt-1.5 leading-relaxed">
                          {language === 'RU'
                            ? '2 года в сфере разработки образовательных платформ и менторского ведения до результатов. Помощь в создании AI-портфолио.'
                            : '2 years of active online platform design and direct mentoring tracks to guide generative designers build world-class portfolios.'}
                        </p>
                      </div>
                    </div>

                  </div>
                </section>
              </div>
              )
            )}

            {block.id !== 'about_me' && block.isActive && activeTab === 'info' && (
              <div className="space-y-6 animate-fade-in text-left">
                {block.customConfig?.tab1Content ? (
                  <div className="text-sm text-neutral-800 whitespace-pre-line leading-relaxed pb-4">
                    {block.customConfig.tab1Content}
                  </div>
                ) : (
                  <>
                {/* SERVICES DETAILED EXPLANATORY DETAILS */}
                {block.id === 'services' && (
                  <div className="space-y-6 animate-fade-in font-sans">
                    <div className="border-b border-neutral-150 pb-3">
                      <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-900 font-bold">
                        ✦ {language === 'RU' ? 'ОСНОВНЫЕ НАПРАВЛЕНИЯ ДЕЯТЕЛЬНОСТИ' : 'CORE SERVICE AREAS'}
                      </h4>
                      <p className="text-neutral-500 text-[11px] font-light mt-1 font-mono uppercase tracking-wider">
                        {language === 'RU' 
                          ? 'системный подход к креативным задачам и генеративным технологиям' 
                          : 'systematic integration of creative vision and generative pipelines'}
                      </p>
                    </div>

                    <div className="space-y-4">
                      {[
                        {
                          num: '01',
                          title: language === 'RU' ? 'AI-визуал' : 'AI-Visuals & Art Direction',
                          desc: language === 'RU'
                            ? 'Создание сверхреалистичного кастомного AI-контента под любые маркетинговые и рекламные задачи.'
                            : 'Creation of hyper-realistic, high-fidelity generative AI brand content calibrated for custom advertising.'
                        },
                        {
                          num: '02',
                          title: language === 'RU' ? 'Брендинг' : 'Visual Branding & Identity',
                          desc: language === 'RU'
                            ? 'Сквозная разработка бренд-стратегии, формулирование уникального позиционирования и целостной визуальной айдентики.'
                            : 'End-to-end brand architecture design, strategic positioning profiles, and multi-channel creative systems.'
                        },
                        {
                          num: '03',
                          title: language === 'RU' ? 'Стратегия' : 'Strategic Architecture & Audience Maps',
                          desc: language === 'RU'
                            ? 'Детальный анализ рынков и конкурентов, глубокое сегментирование ЦА и построение эффективных каналов дистрибуции.'
                            : 'Comprehensive competitive landscape studies, deep consumer segment mapping, and custom traffic-funnel diagnostics.'
                        },
                        {
                          num: '04',
                          title: language === 'RU' ? 'Обучение' : 'AI Education & Enterprise Training',
                          desc: language === 'RU'
                            ? 'Практические экспресс-курсы, индивидуальное менторство по генерации AI-контента и системное продвижение в Pinterest.'
                            : 'Targeted deep-dive masterclasses, executive AI coaching, and growth structures for organic Pinterest loops.'
                        },
                        {
                          num: '05',
                          title: language === 'RU' ? 'Продюсирование' : 'Creative Producing & Launch Operations',
                          desc: language === 'RU'
                            ? 'Проектирование и запуск новых сложных инфопродуктов, разработка дорожных карт запуска и управление командами.'
                            : 'Forming luxury product lines, deploying strategic launch sequences, and managing production teams.'
                        }
                      ].map(item => (
                        <div key={item.num} className="p-4 bg-neutral-50 border border-neutral-200 hover:border-neutral-300 hover:bg-white transition-all duration-200 rounded-none flex gap-4">
                          <span className="font-mono text-xs font-black text-neutral-900 border-r border-neutral-200 pr-3.5 flex items-center col-span-1">
                            {item.num}
                          </span>
                          <div className="flex-1 text-left">
                            <span className="text-[11px] font-bold font-mono text-neutral-900 uppercase block tracking-wider">
                              {item.title}
                            </span>
                            <p className="text-[11px] text-neutral-500 font-light mt-1 leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* COURSE MIDJOURNEY EXPLANATION */}
                {block.id === 'course_midjourney' && (
                  <div className="space-y-6 font-sans">
                    <section className="space-y-3 text-left">
                      <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-900 font-bold border-b border-neutral-150 pb-2">
                        ✦ {language === 'RU' ? 'О КУРСЕ // «FAKE IT. SHAKE IT!»' : 'ABOUT THE COURSE // "FAKE IT. SHAKE IT!"'}
                      </h4>
                      <div className="flex flex-wrap gap-4 bg-purple-50/50 border border-purple-100 p-4 mb-2 font-mono text-[10.5px]">
                        <div>
                          <span className="text-neutral-400 block text-[8px] uppercase tracking-wider">{language === 'RU' ? 'ДАТА НАЧАЛА' : 'START DATE'}</span>
                          <span className="font-bold text-neutral-900 text-xs">{language === 'RU' ? '10 июня' : 'June 10th'}</span>
                        </div>
                        <div className="border-l border-purple-200 pl-4">
                          <span className="text-neutral-400 block text-[8px] uppercase tracking-wider">{language === 'RU' ? 'ЛИМИТ УЧАСТНИКОВ' : 'REGISTRATION STATUS'}</span>
                          <span className="font-bold text-red-600 text-xs uppercase animate-pulse">{language === 'RU' ? 'осталось 9 мест' : '9 seats left'}</span>
                        </div>
                      </div>
                      <p className="whitespace-pre-line text-neutral-600 leading-relaxed text-[13px] font-light">
                        {language === 'RU'
                          ? 'Прямо сейчас индустрия визуального AI-контента переживает тектонический сдвиг: рынок пресытился шаблонной графикой, и крупные бренды готовы платить только за фотореализм высокого уровня. Пока большинство авторов теряют время на бесконечный перебор промптов, топ-специалисты забирают высокобюджетные контракты, создавая управляемые цифровые модели и фэшн-съемки, неотличимые от реальности. Этот курс — ваш готовый пошаговый пайплайн «от и до», включающий подробные уроки с видеоинструкциями по работе со светом, анатомии кадра, сложным текстурам тканей и созданию стабильного цифрового «ДНК» персонажей.\n\nВы научитесь мыслить как профессиональный фотограф и арт-директор, навсегда уйдете от пластикового «нейросетевого» эффекта и сформируете свой уникальный коммерческий почерк.\n\nКаждый день промедления — это упущенные заказы и новые конкуренты, поэтому самое время запрыгнуть в высшую лигу генеративного дизайна, пока ниша еще открыта. Переходите к обучению и начните диктовать свои правила на рынке визуальной индустрии!'
                          : 'A comprehensive curriculum engineered to produce studio-grade photorealistic concepts. Designed as a solid foundation for beginners and a source of advanced techniques for experienced professionals. We bridge foundational generative theory with advanced industry pipeline production for brands.'}
                      </p>
                    </section>
                    
                    <div className="space-y-3 pt-2 text-left">
                      <span className="text-[9px] font-mono text-neutral-900 font-bold tracking-[0.15em] block uppercase border-b border-neutral-200 pb-1.5">
                        {language === 'RU' ? 'ДОСТИЖЕНИЯ:' : 'ACHIEVEMENTS:'}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[10.5px] font-mono text-neutral-850">
                        <div className="flex items-center gap-2.5 p-3 border border-neutral-150 bg-neutral-50 hover:bg-neutral-100/50 transition-colors">
                          <span className="text-sm">👤</span>
                          <span className="font-bold">
                            {language === 'RU' ? 'Создание реалистичных AI-моделей' : 'Realistic AI Models Generation'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 border border-neutral-150 bg-neutral-50 hover:bg-neutral-100/50 transition-colors">
                          <span className="text-sm">🏔️</span>
                          <span className="font-bold">
                            {language === 'RU' ? 'Создание гиперреалистичных локаций' : 'Hyper-realistic Locations'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 border border-neutral-150 bg-neutral-50 hover:bg-neutral-100/50 transition-colors">
                          <span className="text-sm">📸</span>
                          <span className="font-bold">
                            {language === 'RU' ? 'Лайфхаки работы с предметной съемкой' : 'Product Photography Hacks'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 border border-neutral-150 bg-neutral-50 hover:bg-neutral-100/50 transition-colors">
                          <span className="text-sm">👁️</span>
                          <span className="font-bold">
                            {language === 'RU' ? 'Развитие насмотренности' : 'Creative Vision Development'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 border border-neutral-150 bg-neutral-50 hover:bg-neutral-100/50 transition-colors">
                          <span className="text-sm">💼</span>
                          <span className="font-bold">
                            {language === 'RU' ? 'Коммерческий уровень нейросъемок' : 'Commercial AI Photography'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 border border-neutral-150 bg-neutral-50 hover:bg-neutral-100/50 transition-colors">
                          <span className="text-sm">💬</span>
                          <span className="font-bold">
                            {language === 'RU' ? 'Качественная обратная связь' : 'Thorough Curator Feedback'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 border border-neutral-150 bg-neutral-50 hover:bg-neutral-100/50 transition-colors">
                          <span className="text-sm">📂</span>
                          <span className="font-bold">
                            {language === 'RU' ? 'Кейсы для портфолио' : 'Premium Portfolio Cases'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 border border-neutral-150 bg-neutral-50 hover:bg-neutral-100/50 transition-colors">
                          <span className="text-sm">📌</span>
                          <span className="font-bold">
                            {language === 'RU' ? 'Бонус - доступ к мини-курсу Pin & Profit' : 'Bonus: Pin & Profit Mini-Course'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 border border-neutral-150 bg-neutral-50 hover:bg-neutral-100/50 transition-colors col-span-1 sm:col-span-2">
                          <span className="text-sm">🔑</span>
                          <span className="font-bold text-left w-full">
                            {language === 'RU' ? 'Бонус - мини-гайд доступ к топовым нейросетям из СНГ' : 'Bonus: Top CIS AI Access Guide'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* NEUROMARKETING EXPLANATION */}
                {block.id === 'course_marketing' && (
                  <div className="space-y-6 font-sans">
                    <section className="space-y-3 text-left">
                      <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-900 font-bold border-b border-neutral-150 pb-2">
                        ✦ {language === 'RU' ? 'О МИНИ-КУРСЕ // «YOU\'RE NOT PERFECT!»' : 'ABOUT MINI-COURSE // "YOU\'RE NOT PERFECT!"'}
                      </h4>
                      <div className="flex flex-wrap gap-4 bg-purple-50/50 border border-purple-100 p-4 mb-2 font-mono text-[10.5px]">
                        <div>
                          <span className="text-neutral-400 block text-[8px] uppercase tracking-wider">{language === 'RU' ? 'РЕЖИМ ДОСТУПА' : 'ACCESS MODE'}</span>
                          <span className="font-bold text-neutral-900 text-xs">{language === 'RU' ? 'моментальный' : 'instant access'}</span>
                        </div>
                      </div>
                      <p className="whitespace-pre-line text-neutral-600 leading-relaxed text-[13px] font-light">
                        {language === 'RU'
                          ? 'Прямо сейчас индустрия визуального контента переживает кризис доверия: идеальная симметрия и «глянцевый пластик» больше не продают, а бренды стремительно теряют лояльность аудитории, которая мгновенно считывает в этом фальшивую ИИ-генерацию. Мини-курс «Ты не идеален» — это манифест нового реализма, сфокусированный исключительно на создании визуально харАктерных, живых моделей с уникальными «несовершенствами».\n\nВ детальных уроках вы научитесь генерировать индивидуальную текстуру кожи, естественную асимметрию лиц, микромимику и тот самый уникальный осмысленный взгляд, который заставляет поверить в реальность персонажа с первой секунды. Вы освоите пошаговый пайплайн управления харизмой цифровой модели, чтобы создавать коммерческие кадры с высокой эмоциональной связью.\n\nПока остальные авторы продолжают штамповать безликих кукол, вы займете дефицитную нишу и предложите рынку живой, честный и дорогой визуал. Получите доступ к курсу и начните создавать лица, которые вызывают доверие и врезаются в память!'
                          : 'I will teach you to create photorealistic AI models with lifelike faces indistinguishable from real photos, natural poses, and skin texture, without the plastic effect. The course provides a full cycle of generating models for any shoot, independent of backgrounds and locations.'}
                      </p>
                    </section>
                    
                    <div className="space-y-3 pt-2 text-left">
                      <span className="text-[9px] font-mono text-neutral-900 font-bold tracking-[0.15em] block uppercase border-b border-neutral-200 pb-1.5">
                        {language === 'RU' ? 'ДОСТИЖЕНИЯ:' : 'ACCOMPLISHMENTS:'}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[10.5px] font-mono text-neutral-850">
                        <div className="flex items-center gap-2.5 p-3 border border-neutral-150 bg-neutral-50 hover:bg-neutral-100/50 transition-colors">
                          <span className="text-sm">👤</span>
                          <span className="font-bold">
                            {language === 'RU' ? 'Не просто реалистичные текстуры кожи и волос, а эффект легкой ретуши без ощущения пластика' : 'Not just realistic skin and hair textures, but a light retouch effect without a plastic feel'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 border border-neutral-150 bg-neutral-50 hover:bg-neutral-100/50 transition-colors">
                          <span className="text-sm">👁️</span>
                          <span className="font-bold">
                            {language === 'RU' ? 'Работа с мимикой и эмоциями' : 'Facial & Emotional Micro-Tuning'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 border border-neutral-150 bg-neutral-50 hover:bg-neutral-100/50 transition-colors">
                          <span className="text-sm">🤸</span>
                          <span className="font-bold">
                            {language === 'RU' ? 'AI-модели с запоминающимися чертами внешности' : 'AI Models with Memorable Features'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 border border-neutral-150 bg-neutral-50 hover:bg-neutral-100/50 transition-colors">
                          <span className="text-sm">🏔️</span>
                          <span className="font-bold">
                            {language === 'RU' ? 'Связка нейросетей, которая позволит вам чувствовать творческий процесс' : 'A stack of neural networks that lets you feel the creative process'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 border border-neutral-150 bg-neutral-50 hover:bg-neutral-100/50 transition-colors">
                          <span className="text-sm">📂</span>
                          <span className="font-bold">
                            {language === 'RU' ? 'Кейсы для портфолио' : 'Clean Portfolio Cases'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 border border-neutral-150 bg-neutral-50 hover:bg-neutral-100/50 transition-colors">
                          <span className="text-sm">📌</span>
                          <span className="font-bold">
                            {language === 'RU' ? 'Бонус - доступ к мини-курсу Pin & Profit' : 'Bonus: Pin & Profit Mini-Course'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 border border-neutral-150 bg-neutral-50 hover:bg-neutral-100/50 transition-colors col-span-1 sm:col-span-2">
                          <span className="text-sm">🪄</span>
                          <span className="font-bold text-left w-full">
                            {language === 'RU' ? 'Не нужно быть профессиональным промт-инженером, чтобы создавать действительно глубокий фотореализм' : 'No need to be a professional prompt engineer to create deep photorealism'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* MENTORSHIP EXPLANATION */}
                {block.id === 'mentorship' && (
                  <div className="space-y-6 font-sans">
                    <section className="space-y-3 text-left">
                      <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-900 font-bold border-b border-neutral-150 pb-2">
                        ✦ {language === 'RU' ? 'ИНДИВИДУАЛЬНОЕ НАСТАВНИЧЕСТВО И ОБУЧЕНИЕ' : 'INDIVIDUAL MENTORSHIP & ACADEMY'}
                      </h4>
                      <p className="text-neutral-600 leading-relaxed text-[13px] font-light">
                        {language === 'RU'
                          ? 'Я беру ограниченное количество людей на индивидуальное наставничество — вы можете прийти с абсолютно любым уровнем знаний и навыков. Для каждого участника я создаю полностью кастомную программу обучения или повышения квалификации, адаптированную под ваши цели. В процессе работы мы фокусируемся на практике: я даю регулярные практические задания и провожу подробные индивидуальные разборы каждого этапа, доводя вас до уверенного коммерческого результата.'
                          : 'I accept only a limited number of mentees, welcoming any skill and background level. For each student, I draft a completely customized workflow program tailored to upgrade your skills. We focus heavily on actions: I provide practical context assignments and conduct comprehensive 1-on-1 direct reviews of every step, leading you straight to professional industry results.'}
                      </p>
                    </section>
                    
                    <div className="space-y-3 pt-2 text-left">
                      <span className="text-[9px] font-mono text-neutral-900 font-bold tracking-[0.15em] block uppercase border-b border-neutral-200 pb-1.5">
                        {language === 'RU' ? 'ДОСТИЖЕНИЯ:' : 'ACHIEVEMENTS:'}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[10.5px] font-mono text-neutral-850">
                        <div className="flex items-center gap-2.5 p-3 border border-neutral-150 bg-neutral-50 hover:bg-neutral-100/50 transition-colors">
                          <span className="text-sm">🔒</span>
                          <span className="font-bold">
                            {language === 'RU' ? 'Личный VIP-чат 24/7' : 'Direct VIP-Chat 24/7'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 border border-neutral-150 bg-neutral-50 hover:bg-neutral-100/50 transition-colors">
                          <span className="text-sm">🔑</span>
                          <span className="font-bold">
                            {language === 'RU' ? 'Секреты поиска клиентов' : 'Elite Client Hunting'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 border border-neutral-150 bg-neutral-50 hover:bg-neutral-100/50 transition-colors">
                          <span className="text-sm">💎</span>
                          <span className="font-bold">
                            {language === 'RU' ? 'Апгрейд соцсетей' : 'Social Media Upgrade'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 border border-neutral-150 bg-neutral-50 hover:bg-neutral-100/50 transition-colors">
                          <span className="text-sm">💼</span>
                          <span className="font-bold">
                            {language === 'RU' ? 'Создание топ-портфолио' : 'Top Portfolio Creation'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 border border-neutral-150 bg-neutral-50 hover:bg-neutral-100/50 transition-colors col-span-1 sm:col-span-2">
                          <span className="text-sm">📚</span>
                          <span className="font-bold">
                            {language === 'RU' ? 'Пожизненный доступ к секретным мини-курсам и гайдам' : 'Lifetime Access to Secret Courses'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 border border-neutral-150 bg-neutral-50 hover:bg-neutral-100/50 transition-colors col-span-1 sm:col-span-2">
                          <span className="text-sm">🎯</span>
                          <span className="font-bold">
                            {language === 'RU' ? 'Кастомное индивидуальное обучение' : 'Custom Individual Training'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PINTEREST MINI-COURSE EXPLANATION */}
                {block.id === 'contact_me' && (
                  <div className="space-y-6 font-sans">
                    <section className="space-y-3 text-left">
                      <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-900 font-bold border-b border-neutral-150 pb-2">
                        ✦ {language === 'RU' ? 'О МИНИ-КУРСЕ // «PIN & PROFIT»' : 'ABOUT MINI-COURSE // "PIN & PROFIT"'}
                      </h4>
                      <div className="flex flex-wrap gap-4 bg-purple-50/50 border border-purple-100 p-4 mb-2 font-mono text-[10.5px]">
                        <div>
                          <span className="text-neutral-400 block text-[8px] uppercase tracking-wider">{language === 'RU' ? 'РЕЖИМ ДОСТУПА' : 'ACCESS MODE'}</span>
                          <span className="font-bold text-neutral-900 text-xs">{language === 'RU' ? 'моментальный' : 'instant access'}</span>
                        </div>
                      </div>
                      <p className="text-neutral-600 leading-relaxed text-[13px] font-light">
                        {language === 'RU'
                          ? 'Системный курс, который превращает Pinterest в источник стабильных заявок на автопилоте! Вы получаете не банальные лайфхаки, а готовую схему, которую я прошла сама за два месяца с нуля до 1,5 млн охватов, и которую можно адаптировать под любую нишу. А самое главное, это работает, пока вы занимаетесь другими делами!'
                          : 'A systematic strategy that turns Pinterest into an automated pipeline for stable queries and high-quality traffic—scaling to 1.5M views in 2 months. You receive a complete automated framework, not just basic tips.'}
                      </p>
                      
                      <div className="text-neutral-600 leading-relaxed text-[13px] font-light mt-4 mb-2">
                        <span className="font-bold text-neutral-900 block mb-1">{language === 'RU' ? 'КОМУ ПОДОЙДЕТ КУРС?' : 'WHO IS THIS COURSE FOR?'}</span>
                        <ul className="space-y-0.5">
                          <li>{language === 'RU' ? '— Если вы новичок, который думает, что тут всё сложно' : '— If you are a beginner who thinks it is all too complicated'}</li>
                          <li>{language === 'RU' ? '— Если вы эксперт/фрилансер, который уже пробовал, но не увидел конверсии' : '— If you are an expert/freelancer who tried but saw no conversions'}</li>
                          <li>{language === 'RU' ? '— Если вы предприниматель, который хочет увеличить трафик без вложений' : '— If you are an entrepreneur looking to increase traffic without ad spend'}</li>
                        </ul>
                      </div>
                    </section>
                    
                    <div className="space-y-3 pt-2 text-left">
                      <span className="text-[9px] font-mono text-neutral-900 font-bold tracking-[0.15em] block uppercase border-b border-neutral-200 pb-1.5">
                        {language === 'RU' ? 'ДОСТИЖЕНИЯ:' : 'ACCOMPLISHMENTS:'}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[10.5px] font-mono text-neutral-850">
                        <div className="flex items-center gap-2.5 p-3 border border-neutral-150 bg-neutral-50 hover:bg-neutral-100/50 transition-colors">
                          <span className="text-sm">⚙️</span>
                          <span className="font-bold">
                            {language === 'RU' ? 'Системный автопилот заявок' : 'Systematic Lead Autopilot'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 border border-neutral-150 bg-neutral-50 hover:bg-neutral-100/50 transition-colors">
                          <span className="text-sm">📈</span>
                          <span className="font-bold">
                            {language === 'RU' ? 'Алгоритмы на 1.5 млн охвата' : '1.5M Monthly Views Framework'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 border border-neutral-150 bg-neutral-50 hover:bg-neutral-100/50 transition-colors">
                          <span className="text-sm">🎯</span>
                          <span className="font-bold">
                            {language === 'RU' ? 'Конвертируемый источник трафика' : 'Convertible Traffic Streams'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 border border-neutral-150 bg-neutral-50 hover:bg-neutral-100/50 transition-colors">
                          <span className="text-sm">📌</span>
                          <span className="font-bold">
                            {language === 'RU' ? 'Оптимизация и SEO пинов' : 'Visual Search SEO Blueprint'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 border border-neutral-150 bg-neutral-50 hover:bg-neutral-100/50 transition-colors">
                          <span className="text-sm">🖇️</span>
                          <span className="font-bold">
                            {language === 'RU' ? 'Связки и автоворонки продаж' : 'Automated Sales Pipelines'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 border border-neutral-150 bg-neutral-50 hover:bg-neutral-100/50 transition-colors">
                          <span className="text-sm">🔥</span>
                          <span className="font-bold">
                            {language === 'RU' ? 'Стабильный поток трафика и клиентов!' : 'Stable Flow of Traffic and Clients!'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 border border-neutral-150 bg-neutral-50 hover:bg-neutral-100/50 transition-colors col-span-1 sm:col-span-2">
                          <span className="text-sm">⚡</span>
                          <span className="font-bold">
                            {language === 'RU' ? 'Стратегия, которая работает без вашего постоянного участия!' : 'Strategy That Works Without Your Constant Involvement!'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* FUTURE CHANNELS EXPLANATIONS */}
                {block.id === 'future_agents' && (
                  <div className="space-y-5 font-sans">
                    <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-900 border-b border-neutral-150 pb-2">
                      ✦ {language === 'RU' ? 'СОЗДАНИЕ САЙТА-ВИЗИТКИ' : 'CARD SITE CREATOR'}
                    </h4>
                    <p className="text-neutral-600 leading-relaxed text-[13px] font-light">
                      {language === 'RU'
                        ? 'Откройте доступ к редактору сайта для создания собственной визитки без знаний кодинга и дополнительных подписок!'
                        : 'Unlock access to the website editor to build your own digital business card with zero coding and no recurring subscriptions!'}
                    </p>
                  </div>
                )}

                {block.id === 'future_video' && (
                  <div className="space-y-5 font-sans">
                    <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-900 border-b border-neutral-150 pb-2">
                      ✦ {language === 'RU' ? 'ОСНОВНОЙ КУРС' : 'MAIN COURSE // KINEMATIC AI'}
                    </h4>
                    <p className="text-neutral-600 leading-relaxed text-[13px] font-light">
                      {language === 'RU'
                        ? 'Научитесь создавать кинематографичные реалистичные AI-видео для социальных сетей, коммерческих и творческих проектов с нуля!'
                        : 'Learn to create cinematic realistic AI-videos for social media, commercial and creative projects from scratch!'}
                    </p>
                  </div>
                )}
                </>
                )}
              </div>
            )}

            {/* INTERACTIVE COMPONENT TAB */}
            {block.isActive && activeTab === 'interactive' && (
              <div className="space-y-6 animate-fade-in text-left">
                {block.customConfig?.tab2Content ? (
                  <div className="text-sm text-neutral-800 whitespace-pre-line leading-relaxed pb-4">
                    {block.customConfig.tab2Content}
                  </div>
                ) : (
                  <>
                
                {/* 1. ABOUT ME INTERACTIVE ELEMENT: SPIDER TRIGGER OR INFO */}
                {block.id === 'about_me' && (
                  <div className="space-y-4 font-mono">
                    <span className="text-[8px] uppercase tracking-widest text-neutral-500 font-bold block">
                      {language === 'RU' ? 'ИНТЕРАКТИВНОЕ ВОВЛЕЧЕНИЕ' : 'KINETIC GRAPHICS'}
                    </span>
                    <p className="text-[11px] text-neutral-600 leading-relaxed font-sans">
                      {language === 'RU'
                        ? 'Ирину вдохновляют неожиданные, смелые интерактивные интерфейсы. Если вы хотите поиграть с кинетическими элементами, нажмите кнопку ниже, чтобы выпустить маленьких цифровых паучков, разбегающихся по всей площади вашего экрана!'
                        : 'Irina is inspired by responsive software logic. If you are open to playful kinetic systems, activate the dispatch node below to release hyper-responsive canvas spiders.'}
                    </p>
                    <div className="pt-2">
                      <button 
                        onClick={() => {
                          const container = document.getElementById('dont-push-btn');
                          if (container) {
                            container.click();
                          } else {
                            alert(language === 'RU' ? 'Паучки успешно разбежались! Поищите их на белом фоне.' : 'Spiders successfully released! Seek them out on white regions.');
                          }
                        }}
                        className="px-5 py-3 border border-red-500 text-red-600 hover:bg-red-50 text-[10px] font-bold tracking-widest uppercase transition-colors rounded-none"
                      >
                        {language === 'RU' ? '🕷️ ВЫПУСТИТЬ ПАУЧКОВ!' : '🕷️ DISPATCH AGENT SPIDERS!'}
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. SERVICES INTERACTIVE CALCULATOR */}
                {block.id === 'services' && (
                  <div className="space-y-6 animate-fade-in font-sans">
                    <div className="border-b border-neutral-150 pb-3">
                      <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-900 font-bold">
                        ✦ {language === 'RU' ? 'ПРИНЦИП ФОРМИРОВАНИЯ СТОИМОСТИ' : 'PRICING POLICY METHOD'}
                      </h4>
                      <p className="text-neutral-500 text-[11px] font-light mt-1 font-mono uppercase tracking-wider">
                        {language === 'RU' 
                          ? 'каждый проект уникален и рассчитывается индивидуально' 
                          : 'every creative endeavor is unique and budgeted with precise tailor-made parameters'}
                      </p>
                    </div>

                    <p className="text-neutral-650 leading-relaxed text-[12px] font-light text-left">
                      {language === 'RU'
                        ? 'Стоимость моих услуг не фиксирована стандартными шаблонными рамками. Финальный прайс формируется прозрачно и поэтапно, исходя из трех ключевых факторов:'
                        : 'Fees are not constrained by sterile flat-rate tiers. Final estimates are calculated transparently across three structural axes:'}
                    </p>

                    <div className="space-y-4 text-left">
                      <div className="p-4 border border-neutral-200 bg-neutral-50 hover:bg-neutral-100/50 transition-colors rounded-none">
                        <span className="text-[9px] font-mono text-neutral-400 block uppercase tracking-wider mb-1">✦ 01 // {language === 'RU' ? 'СЛОЖНОСТЬ ЗАДАЧИ' : 'TASK COMPLEXITY'}</span>
                        <p className="text-[12px] text-neutral-800 font-medium">
                          {language === 'RU'
                            ? 'Глубина концептуальной проработки, необходимость сложных кастомных ИИ-пайплайнов, разработка уникальных стилистик (LoRA) и глубина ретуши.'
                            : 'Depth of structural concepts, custom diffusion training needs, unique style guides, and high-fidelity texture detailing.'}
                        </p>
                      </div>

                      <div className="p-4 border border-neutral-200 bg-neutral-50 hover:bg-neutral-100/50 transition-colors rounded-none">
                        <span className="text-[9px] font-mono text-neutral-400 block uppercase tracking-wider mb-1">✦ 02 // {language === 'RU' ? 'ФОРМА СОТРУДНИЧЕСТВА' : 'COOPERATION FORMAT'}</span>
                        <p className="text-[12px] text-neutral-800 font-medium">
                          {language === 'RU'
                            ? 'Проектная занятость (под конкретную задачу), долгосрочное абонентское сопровождение брендов ( retainer ) или интенсивные консультации.'
                            : 'Single-project delivery structures, persistent monthly retainers for active brands, or intensive 1-on-1 strategic consulting.'}
                        </p>
                      </div>

                      <div className="p-4 border border-neutral-200 bg-neutral-50 hover:bg-neutral-100/50 transition-colors rounded-none">
                        <span className="text-[9px] font-mono text-neutral-400 block uppercase tracking-wider mb-1">✦ 03 // {language === 'RU' ? 'ОБЪЕМ РАБОТЫ' : 'WORK SCOPE'}</span>
                        <p className="text-[12px] text-neutral-800 font-medium">
                          {language === 'RU'
                            ? 'Общее количество финальных изображений высокого разрешения, число задействованных медиа-форматов и хронометраж рекламной кампании.'
                            : 'Total number of high-res generation pipelines, target format adaptations, and scale of integrated marketing deployment.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. MIDJOURNEY INTERACTIVE PROMPT QUIZ */}
                {block.id === 'course_midjourney' && (
                  <div className="space-y-5 font-sans">
                    <div className="border-b border-neutral-150 pb-3">
                      <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-900 font-bold">
                        ✦ {language === 'RU' ? 'ПРОГРАММА И СОДЕРЖАНИЕ КУРСА' : 'COURSE CURRICULUM & MODULES'}
                      </h4>
                      <p className="text-neutral-500 text-[11px] font-light mt-1 font-mono uppercase tracking-wider">
                        {language === 'RU' 
                          ? 'пошаговая траектория освоения генеративных систем' 
                          : 'step-by-step masterclass sequence for advanced creators'}
                      </p>
                    </div>

                    <div className="space-y-4 text-left">
                      <div className="p-4 border border-neutral-200 bg-neutral-50 rounded-none animate-fade-in">
                        <span className="text-[9px] font-mono text-neutral-450 block uppercase tracking-wider mb-1">
                          {language === 'RU' ? 'МОДУЛЬ 1 // ДИНАМИКА РЫНКА' : 'MODULE 1 // MARKET DYNAMICS'}
                        </span>
                        <h5 className="text-[12px] text-neutral-900 font-bold font-mono uppercase tracking-tight mb-2">
                          {language === 'RU' ? 'ПОЧЕМУ ГЕНЕРАЦИЯ ВОСТРЕБОВАНА ИМЕННО СЕЙЧАС' : 'WHY AI GENERATION IS IN DEMAND RIGHT NOW'}
                        </h5>
                        <ul className="text-[11px] text-neutral-600 font-light space-y-1.5 list-disc pl-4.5">
                          <li>{language === 'RU' ? 'Смена парадигмы в digital: актуальный анализ рынка AI-контента. Почему спрос на коммерческое качество кратно превышает предложение.' : 'Paradigm shift in digital: up-to-date analysis of the AI content market. Why demand for commercial quality exceeds supply manifold.'}</li>
                          <li>{language === 'RU' ? 'Новая профессия: кто такой генеративный дизайнер, почему индустрия уже ищет этих специалистов и как занять эту нишу первыми.' : 'New profession: who is a generative designer, why the industry is already looking for them, and how to occupy this niche first.'}</li>
                        </ul>
                      </div>

                      <div className="p-4 border border-neutral-200 bg-neutral-50 rounded-none animate-fade-in">
                        <span className="text-[9px] font-mono text-neutral-450 block uppercase tracking-wider mb-1">
                          {language === 'RU' ? 'МОДУЛЬ 2 // ПСИХОЛОГИЯ ВИЗУАЛЬНОГО ВОСПРИЯТИЯ' : 'MODULE 2 // VISUAL PERCEPTION PSYCHOLOGY'}
                        </span>
                        <h5 className="text-[12px] text-neutral-900 font-bold font-mono uppercase tracking-tight mb-2">
                          {language === 'RU' ? 'КРИТЕРИИ ДОРОГОГО КАДРА' : 'THE MARKS OF AN EXPENSIVE SHOT'}
                        </h5>
                        <ul className="text-[11px] text-neutral-600 font-light space-y-1.5 list-disc pl-4.5">
                          <li>{language === 'RU' ? 'Анатомия доверия: как зритель за секунду считывает коммерческую ценность изображения и принимает решение «верю / не верю».' : 'Anatomy of trust: how a viewer instantly decodes the commercial value of an image and decides "to believe or not".'}</li>
                          <li>{language === 'RU' ? 'Запрос бизнеса: почему брендам нужны фотореалистичные цифровые модели, а не абстрактная «красивая графика».' : 'Business demand: why brands need photorealistic digital models rather than abstract "pretty graphics".'}</li>
                          <li>{language === 'RU' ? 'Ценообразование в AI-арте: ключевые маркеры, которые отличают премиальный генеративный кадр от стокового и дешевого.' : 'Pricing in AI art: key markers that distinguish a premium generative shot from stock or cheap imagery.'}</li>
                        </ul>
                      </div>

                      <div className="p-4 border border-neutral-200 bg-neutral-50 rounded-none animate-fade-in">
                        <span className="text-[9px] font-mono text-neutral-450 block uppercase tracking-wider mb-1">
                          {language === 'RU' ? 'МОДУЛЬ 3 // РАЗРАБОТКА КОНЦЕПТА' : 'MODULE 3 // CONCEPT DEVELOPMENT'}
                        </span>
                        <h5 className="text-[12px] text-neutral-900 font-bold font-mono uppercase tracking-tight mb-2">
                          {language === 'RU' ? 'СОЗДАНИЕ ПЕРСОНАЖА С КОММЕРЧЕСКИМ ПОТЕНЦИАЛОМ' : 'CHARACTER CREATION WITH COMMERCIAL POTENTIAL'}
                        </h5>
                        <ul className="text-[11px] text-neutral-600 font-light space-y-1.5 list-disc pl-4.5">
                          <li>{language === 'RU' ? 'Сквозной пайплайн: авторский метод связки AI-инструментов. Логика работы без усложнения процессов.' : 'End-to-end pipeline: signature method of linking AI tools. Operational logic without overcomplicating processes.'}</li>
                          <li>{language === 'RU' ? 'Управление типажом: как разработать характер и визуальную идентичность модели, которая выделится в ленте и запомнится аудитории.' : 'Persona management: how to develop the character and visual identity of a model that stands out and is remembered.'}</li>
                          <li>{language === 'RU' ? 'Практикум: создание базового референса (исходника), который станет фундаментом для всей последующей работы.' : 'Hands-on practice: creating a baseline reference (source) to serve as the foundation for all subsequent work.'}</li>
                        </ul>
                      </div>

                      <div className="p-4 border border-neutral-200 bg-neutral-50 rounded-none animate-fade-in">
                        <span className="text-[9px] font-mono text-neutral-450 block uppercase tracking-wider mb-1">
                          {language === 'RU' ? 'МОДУЛЬ 4 // ЦИФРОВАЯ ПРЕЕМСТВЕННОСТЬ' : 'MODULE 4 // DIGITAL CONTINUITY'}
                        </span>
                        <h5 className="text-[12px] text-neutral-900 font-bold font-mono uppercase tracking-tight mb-2">
                          {language === 'RU' ? 'СОХРАНЕНИЕ «ДНК» МОДЕЛИ' : 'PRESERVING THE MODEL\'S "DNA"'}
                        </h5>
                        <ul className="text-[11px] text-neutral-600 font-light space-y-1.5 list-disc pl-4.5">
                          <li>{language === 'RU' ? 'Специфика генеративных тестов: почему классические методы создания модельных снэпов деформируют AI-персонажей.' : 'Particulars of generative tests: why classic methods of model snapshots deform AI characters.'}</li>
                          <li>{language === 'RU' ? 'Стабильность генерации: как зафиксировать черты лица, пропорции и характер модели, чтобы они не искажались при смене ракурсов и планов.' : 'Generation stability: how to lock facial features, proportions, and character so they don\'t distort under camera angles.'}</li>
                        </ul>
                      </div>

                      <div className="p-4 border border-neutral-200 bg-neutral-50 rounded-none animate-fade-in">
                        <span className="text-[9px] font-mono text-neutral-450 block uppercase tracking-wider mb-1">
                          {language === 'RU' ? 'МОДУЛЬ 5 // ПРОФЕССИОНАЛЬНАЯ НАСМОТРЕННОСТЬ' : 'MODULE 5 // VISUAL DEVELOPMENT'}
                        </span>
                        <h5 className="text-[12px] text-neutral-900 font-bold font-mono uppercase tracking-tight mb-2">
                          {language === 'RU' ? 'ФОРМИРОВАНИЕ АВТОРСКОГО СТИЛЯ' : 'FORMING A SIGNATURE STYLE'}
                        </h5>
                        <ul className="text-[11px] text-neutral-600 font-light space-y-1.5 list-disc pl-4.5">
                          <li>{language === 'RU' ? 'Инструменты анализа: как превратить хаотичный поиск референсов в Пинтересте в системный рабочий процесс.' : 'Analysis tools: how to transform chaotic Pinterest searching into a systematic workflow.'}</li>
                          <li>{language === 'RU' ? 'Деконструкция визуала: на что обращать внимание при анализе чужих работ, чтобы создавать уникальный продукт, а не копировать тренды.' : 'Visual deconstruction: what to look for when analyzing peer works to produce something unique, not copy trends.'}</li>
                          <li>{language === 'RU' ? 'Айдентика автора: как выработать узнаваемый почерк и уйти от шаблонных «нейросетевых» генераций.' : 'Author identity: how to build a recognizable signature and escape boilerplate "neural" configurations.'}</li>
                        </ul>
                      </div>

                      <div className="p-4 border border-neutral-200 bg-neutral-50 rounded-none animate-fade-in">
                        <span className="text-[9px] font-mono text-neutral-450 block uppercase tracking-wider mb-1">
                          {language === 'RU' ? 'МОДУЛЬ 6 // СТИЛИЗАЦИЯ' : 'MODULE 6 // CUSTOM STYLING'}
                        </span>
                        <h5 className="text-[12px] text-neutral-900 font-bold font-mono uppercase tracking-tight mb-2">
                          {language === 'RU' ? 'РАБОТА С ФАКТУРОЙ И МАТЕРИАЛАМИ' : 'WORKING WITH TEXTURES & MATERIALS'}
                        </h5>
                        <ul className="text-[11px] text-neutral-600 font-light space-y-1.5 list-disc pl-4.5">
                          <li>{language === 'RU' ? 'Реализм в деталях: физика тканей, складок и текстур. Нюансы, которые отличают пластиковый «фейк» от высокобюджетного кадра.' : 'Realism in details: physics of fabrics, folds, and surface textures. Nuances separating plastic fake from high-budget shots.'}</li>
                        </ul>
                      </div>

                      <div className="p-4 border border-neutral-200 bg-neutral-50 rounded-none animate-fade-in">
                        <span className="text-[9px] font-mono text-neutral-450 block uppercase tracking-wider mb-1">
                          {language === 'RU' ? 'МОДУЛЬ 7 // ПРЕДМЕТНАЯ ГЕНЕРАЦИЯ' : 'MODULE 7 // PRODUCT GENERATION'}
                        </span>
                        <h5 className="text-[12px] text-neutral-900 font-bold font-mono uppercase tracking-tight mb-2">
                          {language === 'RU' ? 'КОММЕРЧЕСКАЯ ПРЕДМЕТНАЯ ГЕНЕРАЦИЯ (AI-НАТЮРМОРТ)' : 'COMMERCIAL PRODUCT STILL-LIFE ART'}
                        </h5>
                        <ul className="text-[11px] text-neutral-600 font-light space-y-1.5 list-disc pl-4.5">
                          <li>{language === 'RU' ? 'Мышление фотографа: законы предметной съемки в преломлении к генеративной графике. Как управлять композицией и объемом.' : 'Photographer\'s mindset: laws of product photography applied to generative graphics. How to control composition and volume.'}</li>
                          <li>{language === 'RU' ? 'Оптимизация пайплайна: разбор и предотвращение критических ошибок, которые выдают искусственность кадра.' : 'Pipeline optimization: breakdown and prevention of critical issues exposing the artificiality of a shot.'}</li>
                        </ul>
                      </div>

                      <div className="p-4 border border-neutral-200 bg-neutral-50 rounded-none animate-fade-in">
                        <span className="text-[9px] font-mono text-neutral-450 block uppercase tracking-wider mb-1">
                          {language === 'RU' ? 'МОДУЛЬ 8 // СВЕТОТЕНЕВОЙ РИСУНОК' : 'MODULE 8 // LIGHT & SHADOW DRAWING'}
                        </span>
                        <h5 className="text-[12px] text-neutral-900 font-bold font-mono uppercase tracking-tight mb-2">
                          {language === 'RU' ? 'ИНТЕГРАЦИЯ В ПРОСТРАНСТВО' : 'SPATIAL COMPOSITION INTEGRATION'}
                        </h5>
                        <ul className="text-[11px] text-neutral-600 font-light space-y-1.5 list-disc pl-4.5">
                          <li>{language === 'RU' ? 'Физика света: почему 90% AI-изображений выглядят неестественно и как это исправить.' : 'Physics of light: why 90% of AI images look unnatural and how to fix this.'}</li>
                          <li>{language === 'RU' ? 'Бесшовная интеграция: правила работы с рефлексами, бликами и тенями для идеального вписывания объекта в любое окружение.' : 'Seamless integration: rules of working with light reflections, glare, and shadows for perfect integration into any setting.'}</li>
                        </ul>
                      </div>

                      <div className="p-4 border border-neutral-200 bg-neutral-50 rounded-none animate-fade-in">
                        <span className="text-[9px] font-mono text-neutral-450 block uppercase tracking-wider mb-1">
                          {language === 'RU' ? 'МОДУЛЬ 9 // ФИНАЛЬНЫЙ ПРОДАКШН' : 'MODULE 9 // FINAL PRODUCTION'}
                        </span>
                        <h5 className="text-[12px] text-neutral-900 font-bold font-mono uppercase tracking-tight mb-2">
                          {language === 'RU' ? 'ПЕРЕДАЧА ПРОЕКТА КЛИЕНТУ' : 'CLIENT HANDOFF & COMPLETION'}
                        </h5>
                        <ul className="text-[11px] text-neutral-600 font-light space-y-1.5 list-disc pl-4.5">
                          <li>{language === 'RU' ? 'Экспресс-постобработка: алгоритм пятиминутной доработки кадра. Что действительно требует коррекции, а на что не стоит тратить время.' : 'Express post-processing: 5-minute image refinement algorithm. What truly needs correction and what is a waste of time.'}</li>
                          <li>{language === 'RU' ? 'Контроль качества: финальный чек-лист соответствия коммерческим стандартам перед отправкой работы заказчику.' : 'Quality assurance: final checklist of industry standards compliance before sending the asset to the client.'}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. MINI-COURSE CURRICULUM */}
                {block.id === 'course_marketing' && (
                  <div className="space-y-5 font-sans">
                    <div className="border-b border-neutral-150 pb-3 text-left">
                      <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-900 font-bold">
                        ✦ {language === 'RU' ? 'ПРОГРАММА И СОДЕРЖАНИЕ МИНИ-КУРСА' : 'MINI-COURSE CURRICULUM & MODULES'}
                      </h4>
                      <p className="text-neutral-500 text-[11px] font-light mt-1 font-mono uppercase tracking-wider">
                        {language === 'RU' 
                          ? 'пошаговое руководство по созданию реалистичных цифровых моделей' 
                          : 'step-by-step masterclass code for elite organic digital models'}
                      </p>
                    </div>

                    <div className="space-y-4 text-left">
                      <div className="p-4 border border-neutral-200 bg-neutral-50 rounded-none animate-fade-in">
                        <span className="text-[9px] font-mono text-neutral-450 block uppercase tracking-wider mb-1">
                          {language === 'RU' ? 'МОДУЛЬ 01' : 'MODULE 01'}
                        </span>
                        <h5 className="text-[12px] text-neutral-900 font-bold font-mono uppercase tracking-tight mb-2">
                          {language === 'RU' ? 'Эволюция AI-рынка: от пластикового глянца к живому кадру' : 'AI Market Evolution: From Plastic Gloss to Live Frame'}
                        </h5>
                        <p className="text-[11px] text-neutral-600 font-light leading-relaxed">
                          {language === 'RU' 
                            ? 'Новые стандарты индустрии: актуальный разбор визуальных трендов. Почему идеальные кукольные генерации больше не работают и как на смену им пришел запрос на честный, живой визуал.'
                            : 'New industry standards: current analysis of visual trends. Why perfect doll-like generations no longer work and how the demand for honest, live visuals has arrived.'}
                        </p>
                      </div>

                      <div className="p-4 border border-neutral-200 bg-neutral-50 rounded-none animate-fade-in">
                        <span className="text-[9px] font-mono text-neutral-450 block uppercase tracking-wider mb-1">
                          {language === 'RU' ? 'МОДУЛЬ 02' : 'MODULE 02'}
                        </span>
                        <h5 className="text-[12px] text-neutral-900 font-bold font-mono uppercase tracking-tight mb-2">
                          {language === 'RU' ? 'Психология визуального доверия и критерии реализма' : 'Psychology of Visual Trust & Realism Criteria'}
                        </h5>
                        <p className="text-[11px] text-neutral-600 font-light leading-relaxed mb-2">
                          {language === 'RU'
                            ? 'Анатомия кадра: как зритель на подсознательном уровне считывает «настоящее» изображение и почему брендам жизненно необходимы модели с уникальной харизмой для сохранения лояльности аудитории.'
                            : 'Frame anatomy: how the viewer subconsciously perceives a "real" image and why brands desperately need models with unique charisma to maintain audience loyalty.'}
                        </p>
                        <p className="text-[11px] text-neutral-600 font-light leading-relaxed">
                          {language === 'RU' 
                            ? 'Практический чек-лист: детальный разбор маркеров, которые мгновенно отличают любительскую «нейросетевую» картинку от дорогой коммерческой работы.'
                            : 'Practical checklist: detailed analysis of markers that instantly distinguish amateur "neural network" images from expensive commercial work.'}
                        </p>
                      </div>

                      <div className="p-4 border border-neutral-200 bg-neutral-50 rounded-none animate-fade-in">
                        <span className="text-[9px] font-mono text-neutral-450 block uppercase tracking-wider mb-1">
                          {language === 'RU' ? 'МОДУЛЬ 03' : 'MODULE 03'}
                        </span>
                        <h5 className="text-[12px] text-neutral-900 font-bold font-mono uppercase tracking-tight mb-2">
                          {language === 'RU' ? 'Технологический пайплайн: создание харАктерных исходников' : 'Technological Pipeline: Creating Character Sources'}
                        </h5>
                        <p className="text-[11px] text-neutral-600 font-light leading-relaxed mb-2">
                          {language === 'RU'
                            ? 'Оптимальная связка инструментов: пошаговый алгоритм работы с нейросетями, которые дают максимальный фотореализм без бесконечного перебора промптов.'
                            : 'Optimal tool stack: step-by-step algorithm for working with neural networks that provide maximum photorealism without endless prompt searching.'}
                        </p>
                        <p className="text-[11px] text-neutral-600 font-light leading-relaxed mb-2">
                          {language === 'RU' 
                            ? 'Виртуальный кастинг: как спроектировать яркую внешность, естественную асимметрию лица и уникальные «несовершенства».'
                            : 'Virtual casting: how to design striking looks, natural facial asymmetry and unique "imperfections".'}
                        </p>
                        <p className="text-[11px] text-neutral-600 font-light leading-relaxed">
                          {language === 'RU' 
                            ? 'Практика: создание базовых авторских исходников персонажей, которые врезаются в память.'
                            : 'Practice: creating basic author character sources that stick in the memory.'}
                        </p>
                      </div>

                      <div className="p-4 border border-neutral-200 bg-neutral-50 rounded-none animate-fade-in">
                        <span className="text-[9px] font-mono text-neutral-450 block uppercase tracking-wider mb-1">
                          {language === 'RU' ? 'МОДУЛЬ 04' : 'MODULE 04'}
                        </span>
                        <h5 className="text-[12px] text-neutral-900 font-bold font-mono uppercase tracking-tight mb-2">
                          {language === 'RU' ? 'Секреты редактуры и фиксация цифрового «ДНК»' : 'Editing Secrets & Digital DNA Fixation'}
                        </h5>
                        <p className="text-[11px] text-neutral-600 font-light leading-relaxed mb-2">
                          {language === 'RU'
                            ? 'Разрушение стереотипов: почему классические методы создания модельных снэпов деформируют и портят ИИ-персонажей.'
                            : 'Breaking stereotypes: why classical methods of creating model snaps deform and spoil AI characters.'}
                        </p>
                        <p className="text-[11px] text-neutral-600 font-light leading-relaxed mb-2">
                          {language === 'RU' 
                            ? 'Стратегия стабильности: чит-коды и приемы, позволяющие менять ракурсы, планы и элементы внешности модели, полностью сохраняя её лицо и узнаваемый характер.'
                            : 'Stability strategy: cheat codes and techniques that allow changing angles, shots and facial elements while fully preserving personality.'}
                        </p>
                        <p className="text-[11px] text-neutral-600 font-light leading-relaxed">
                          {language === 'RU' 
                            ? 'Практика: тонкая настройка образа и управление внешностью ИИ-модели в динамике.'
                            : 'Practice: fine-tuning the look and managing AI model appearance in dynamics.'}
                        </p>
                      </div>
                      
                      <div className="p-4 border border-neutral-200 bg-neutral-50 rounded-none animate-fade-in">
                        <span className="text-[9px] font-mono text-neutral-450 block uppercase tracking-wider mb-1">
                          {language === 'RU' ? 'МОДУЛЬ 05' : 'MODULE 05'}
                        </span>
                        <h5 className="text-[12px] text-neutral-900 font-bold font-mono uppercase tracking-tight mb-2">
                          {language === 'RU' ? 'Финальные итоги и выход на рынок' : 'Final Results & Market Entry'}
                        </h5>
                        <p className="text-[11px] text-neutral-600 font-light leading-relaxed">
                          {language === 'RU'
                            ? 'Закрепление результатов: сборка готового пайплайна и финальный чек-лист по упаковке ваших уникальных работ в сильное коммерческое портфолио, готовое к демонстрации заказчикам.'
                            : 'Consolidating results: assembling a ready-made pipeline and a final checklist for packaging your unique work into a strong commercial portfolio.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. MENTORSHIP INTERACTIVE TARGET SIMULATOR */}
                {block.id === 'mentorship' && (
                  <div className="space-y-4 font-mono">
                    <span className="text-[9px] uppercase tracking-widest text-neutral-500 block font-bold">
                      {language === 'RU' ? 'ТАРИФЫ НАСТАВНИЧЕСТВА ДЛЯ МЕДИАКОМПЛЕКТА' : 'MENTORSHIP TIERS & DEMANDS'}
                    </span>
                    <p className="text-[10px] text-neutral-600 leading-relaxed font-sans">
                      {language === 'RU'
                        ? 'Курс рассчитан на подготовку готового к рынку ИИ-специалиста. Выберите ваш исходный профессиональный уровень, чтобы узнать нагрузку:'
                        : 'The program is calibrated for career ready specialists. Please select your base experience to review hours:'}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                      <button 
                        type="button"
                        onClick={() => alert(
                          language === 'RU' 
                            ? 'Нагрузка: 4 часа в неделю. Темы: Midjourney v6.1, Photoshop AI, упаковка портфолио в Behance.' 
                            : 'Demands: 4 hours / week. Coverage: Midjourney 6.1, Photoshop AI, case packaging on Behance.'
                        )}
                        className="p-3 border border-neutral-200 bg-white hover:bg-neutral-50 text-left font-mono"
                      >
                        <span className="font-bold text-neutral-900 block">
                          {language === 'RU' ? 'ДИЗАЙНЕР / НОВИЧОК' : 'CREATIVE NEWBIE'}
                        </span>
                        <span className="text-[8.5px] text-neutral-400 mt-1 block">
                          {language === 'RU' ? 'Старт с базового синтаксиса и рендеринга объектов.' : 'Launch from syntactic terms and object weighting foundations.'}
                        </span>
                      </button>

                      <button 
                        type="button"
                        onClick={() => alert(
                          language === 'RU' 
                            ? 'Нагрузка: 8 часов в неделю. Темы: Автоматизация ComfyUI Nodes, создание кастомных моделей Lora, личные бренд-стратегии.' 
                            : 'Demands: 8 hours / week. Coverage: Advanced ComfyUI node flows, fine-tuning style LoRAs, organic brand positioning.'
                        )}
                        className="p-3 border border-neutral-200 bg-white hover:bg-neutral-50 text-left font-mono"
                      >
                        <span className="font-bold text-neutral-950 block">
                          {language === 'RU' ? 'КРЕАТИВНЫЙ ДИРЕКТОР / AI PRO' : 'CREATIVE LEAD / AI PRO'}
                        </span>
                        <span className="text-[8.5px] text-neutral-400 mt-1 block">
                          {language === 'RU' ? 'Кастомная оптимизация бизнес-пайплайнов.' : 'Enterprise pipeline designs and workflow automation.'}
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 6. PINTEREST MINI-COURSE CURRICULUM */}
                {block.id === 'contact_me' && (
                  <div className="space-y-5 font-sans">
                    <div className="border-b border-neutral-150 pb-3 text-left">
                      <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-900 font-bold">
                        ✦ {language === 'RU' ? 'ПРОГРАММА И СОДЕРЖАНИЕ МИНИ-КУРСА' : 'MINI-COURSE CURRICULUM & MODULES'}
                      </h4>
                      <p className="text-neutral-500 text-[11px] font-light mt-1 font-mono uppercase tracking-wider">
                        {language === 'RU' 
                          ? 'пошаговое руководство по превращению Pinterest в автопилот трафика' 
                          : 'step-by-step masterclass on automating Pinterest traffic loops'}
                      </p>
                    </div>

                    <div className="space-y-4 text-left">
                      <div className="p-4 border border-neutral-200 bg-neutral-50 rounded-none animate-fade-in">
                        <span className="text-[9px] font-mono text-neutral-450 block uppercase tracking-wider mb-1">
                          {language === 'RU' ? 'МОДУЛЬ 01' : 'MODULE 01'}
                        </span>
                        <h5 className="text-[12px] text-neutral-900 font-normal font-sans mb-0 leading-relaxed">
                          {language === 'RU' ? 'Я расскажу, почему Pinterest - это поиск с готовым спросом, а не лента. Вы начнёте получать первые 1000 показов не «когда-нибудь», а на старте.' : 'I will explain why Pinterest is a search engine with ready demand, not a feed. You will start getting your first 1,000 views right at the start, not "someday".'}
                        </h5>
                      </div>

                      <div className="p-4 border border-neutral-200 bg-neutral-50 rounded-none animate-fade-in">
                        <span className="text-[9px] font-mono text-neutral-450 block uppercase tracking-wider mb-1">
                          {language === 'RU' ? 'МОДУЛЬ 02' : 'MODULE 02'}
                        </span>
                        <h5 className="text-[12px] text-neutral-900 font-normal font-sans mb-0 leading-relaxed">
                          {language === 'RU' ? 'Мы вместе создадим аккаунт, который алгоритм будет продвигать по нужным запросам без вашего участия.' : 'We will build an account together that the algorithm will promote for relevant queries without your active involvement.'}
                        </h5>
                      </div>

                      <div className="p-4 border border-neutral-200 bg-neutral-50 rounded-none animate-fade-in">
                        <span className="text-[9px] font-mono text-neutral-450 block uppercase tracking-wider mb-1">
                          {language === 'RU' ? 'МОДУЛЬ 03' : 'MODULE 03'}
                        </span>
                        <h5 className="text-[12px] text-neutral-900 font-normal font-sans mb-0 leading-relaxed">
                          {language === 'RU' ? 'Я научу вас анализировать ЦА и создавать вирусные пины, которые люди не просто сохраняют, чтобы «не потерять», а которые приводят вам клиентов.' : 'I will teach you to analyze your target audience and create viral pins that people don’t just save to "not forget," but that actually bring you clients.'}
                        </h5>
                      </div>

                      <div className="p-4 border border-neutral-200 bg-neutral-50 rounded-none animate-fade-in">
                        <span className="text-[9px] font-mono text-neutral-450 block uppercase tracking-wider mb-1">
                          {language === 'RU' ? 'МОДУЛЬ 04' : 'MODULE 04'}
                        </span>
                        <h5 className="text-[12px] text-neutral-900 font-normal font-sans mb-0 leading-relaxed">
                          {language === 'RU' ? 'Вы узнаете, какие фразы-триггеры в описании заставляют Pinterest показывать ваш пин на первых позициях поиска, чтобы увеличить трафик.' : 'You will learn which trigger phrases in the description make Pinterest show your pin at the top of search results to increase traffic.'}
                        </h5>
                      </div>

                      <div className="p-4 border border-neutral-200 bg-neutral-50 rounded-none animate-fade-in">
                        <span className="text-[9px] font-mono text-neutral-450 block uppercase tracking-wider mb-1">
                          {language === 'RU' ? 'МОДУЛЬ 05' : 'MODULE 05'}
                        </span>
                        <h5 className="text-[12px] text-neutral-900 font-normal font-sans mb-0 leading-relaxed">
                          {language === 'RU' ? 'Вместе мы создадим первую рабочую доску и виральный пин, который начнёт приносить сохранения и переходы уже на следующей неделе.' : 'Together we will create your first working board and a viral pin that will start bringing saves and clicks as early as next week.'}
                        </h5>
                      </div>
                    </div>
                  </div>
                )}
                </>
                )}
              </div>
            )}

            {/* Spacer to fix bottom cutoff on some scaled screens / mobile browsers */}
            <div className="h-4 w-full shrink-0 md:h-8"></div>
          </div>

        </div>

      </div>

    </div>
  );
}
