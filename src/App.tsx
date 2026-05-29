import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  ArrowUpRight, 
  Sparkles, 
  RefreshCw, 
  X, 
  Cpu, 
  Send, 
  Briefcase, 
  Award, 
  BookOpen, 
  MessageSquare, 
  Flame, 
  ChevronRight,
  Eye,
  Info
} from 'lucide-react';
import localforage from 'localforage';
import { BlockId, PortfolioBlock, DirectMessage } from './types';
import BlockDetailModal from './components/BlockDetailModal';
import Classroom from './components/Classroom';
import PaymentWidgetModal from './components/PaymentWidgetModal';
import LegalModal from './components/LegalModal';

// Interactive Spider Type definition for the engagement module
interface SpiderType {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  opacity: number;
  scale: number;
  legsState: number;
}

// Minimalist background with fine alignment lines and grids
export function parseCourseTitle(title: string) {
  const prefixes = [
    'ОСНОВНОЙ КУРС', 'Основной курс', 'CORE COURSE', 'MAIN COURSE',
    'МИНИ-КУРС', 'Мини-курс', 'MINI-COURSE'
  ];
  for (const p of prefixes) {
    if (title.toUpperCase().startsWith(p.toUpperCase())) {
      const rest = title.substring(p.length).trim();
      return { label: title.substring(0, p.length), main: rest };
    }
  }
  return { label: '', main: title };
}

function MinimalistBlueprintGrid({ showGrid, creativeGridMode }: { showGrid: boolean; creativeGridMode: number }) {
  if (!showGrid) return null;
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-white">
      {/* Light blueprint grid background */}
      <div className="absolute inset-0 opacity-[0.035]" style={{
        backgroundImage: `
          linear-gradient(to right, #121214 1px, transparent 1px),
          linear-gradient(to bottom, #121214 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      }} />
      
      {/* Structural layout crosshairs for aesthetic technical feel */}
      <div className="absolute top-1/4 left-10 w-4 h-4 border-t border-l border-neutral-300 pointer-events-none" />
      <div className="absolute top-1/4 right-10 w-4 h-4 border-t border-r border-neutral-300 pointer-events-none" />
      <div className="absolute bottom-1/4 left-10 w-4 h-4 border-b border-l border-neutral-300 pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-4 h-4 border-b border-r border-neutral-300 pointer-events-none" />
      
      {/* Fine dotted axis lines */}
      <div className="absolute top-1/2 left-0 right-0 h-[0.5px] border-t border-dashed border-neutral-200 pointer-events-none" />
      <div className="absolute left-1/2 top-0 bottom-0 w-[0.5px] border-l border-dashed border-neutral-200 pointer-events-none" />

      {/* Modern scanline indicator if ASCII/Radar is active */}
      {creativeGridMode === 1 && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#cbdc19]/30 shadow-[0_0_12px_#cbdc19] animate-pulse pointer-events-none" style={{
          animationDuration: '2.5s',
          animationIterationCount: 'infinite'
        }} />
      )}

      {creativeGridMode === 2 && (
        <div className="absolute top-8 right-8 font-mono text-[7px] text-neutral-400 select-none leading-tight opacity-50 z-10 hidden sm:block">
          [ SYS_ENGINE_STATE: MONITORING_GRID ]<br />
          LOC_PING: {Math.random().toFixed(4)}s<br />
          GRID_X_COORDS: 40px
        </div>
      )}
    </div>
  );
}

function TelegramWidget({ language }: { language: 'RU' | 'EN' }) {
  const [isMinimized, setIsMinimized] = useState(false);

  if (isMinimized) {
    return (
      <div 
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-[120] flex items-center bg-white border border-neutral-250/80 p-1.5 shadow-xl select-none font-mono text-[8px] md:text-[9px] rounded-none cursor-pointer hover:bg-neutral-50 transition-colors uppercase font-bold tracking-wider animate-fade-in"
        title="Open Telegram Subscribe"
      >
        <div className="px-2 py-0.5 text-[#0088cc] flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
          </svg>
          {language === 'RU' ? 'ТГ' : 'TG'}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[120] flex items-center gap-1.5 bg-white border border-neutral-250/80 p-1.5 shadow-xl select-none font-mono text-[8px] md:text-[9px] rounded-none animate-fade-in">
      <div className="px-2 py-0.5 text-neutral-500 uppercase border-r border-neutral-200 font-bold pr-2.5 flex items-center gap-2">
        <span className="text-[#0088cc]">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
          </svg>
        </span>
        <span className="hidden sm:inline-block">
          {language === 'RU' ? 'ПОДПИШИСЬ НА ТЕЛЕГРАМ!' : 'SUBSCRIBE TO TELEGRAM!'}
        </span>
      </div>
      
      <a 
        href="https://t.me/+GUarzetMn1g2OGEy" 
        target="_blank" 
        rel="noopener noreferrer"
        className="px-2.5 py-0.5 bg-[#0088cc] text-white hover:bg-[#0077b3] transition-colors uppercase font-bold tracking-wider"
      >
        {language === 'RU' ? 'ПОДПИСАТЬСЯ' : 'SUBSCRIBE'}
      </a>

      <button 
        onClick={() => setIsMinimized(true)}
        className="px-1.5 py-0.5 ml-0.5 text-neutral-400 hover:text-neutral-900 transition-colors"
        title="Minimize"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function App() {
  // Main language state (RU = Russian, EN = English)
  const [language, setLanguage] = useState<'RU' | 'EN'>('RU');

  const [legalModal, setLegalModal] = useState<{isOpen: boolean, type: 'offer' | 'privacy' | 'consent'}>({
    isOpen: false,
    type: 'offer'
  });

  const [showDocs, setShowDocs] = useState(false);

  const [paymentModalData, setPaymentModalData] = useState<{isOpen: boolean, itemName?: string, price?: number, isCustomWidget?: boolean, showTg?: boolean, showEmailText?: boolean}>({ isOpen: false });

  const [customHomeBlocksConfig, setCustomHomeBlocksConfig] = useState<Record<string, unknown>>(() => {
    try {
      const saved = localStorage.getItem('__SYNTHETICA_HOME_BLOCKS_CONFIG__');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing home config from localStorage:', e);
    }
    // @ts-ignore
    return (window as unknown as { __HOME_BLOCKS_CONFIG__?: Record<string, unknown> }).__HOME_BLOCKS_CONFIG__ || {};
  });
  const [isLoadedConfig, setIsLoadedConfig] = useState(() => {
    try {
      if (localStorage.getItem('__SYNTHETICA_HOME_BLOCKS_CONFIG__')) return true;
    } catch (e) {}
    // @ts-ignore
    return !!(window as unknown as { __HOME_BLOCKS_CONFIG__?: Record<string, unknown> }).__HOME_BLOCKS_CONFIG__;
  });

  // Fetch persistent config on mount and backfill server if the server config is empty
  useEffect(() => {
    fetch('/api/config/home-blocks')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object' && !data.error) {
          const hasServerKeys = Object.keys(data).length > 0;

          // Check if local storage has valid data
          let localSaved: Record<string, any> = {};
          try {
            const saved = localStorage.getItem('__SYNTHETICA_HOME_BLOCKS_CONFIG__');
            if (saved) localSaved = JSON.parse(saved);
          } catch (e) {}
          const hasLocalKeys = localSaved && typeof localSaved === 'object' && Object.keys(localSaved).length > 0;

          const serverTime = Number(data.__metadata_updated_at || 0);
          const localTime = Number(localSaved.__metadata_updated_at || 0);

          if (hasServerKeys && (!hasLocalKeys || serverTime >= localTime)) {
            setCustomHomeBlocksConfig(data);
            try {
              localStorage.setItem('__SYNTHETICA_HOME_BLOCKS_CONFIG__', JSON.stringify(data));
            } catch (e) {}
          } else if (hasLocalKeys) {
            // Local config is newer or server returned empty config - use local copy and sync it back to server!
            setCustomHomeBlocksConfig(localSaved);
            fetch('/api/config/home-blocks', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(localSaved)
            }).catch(err => console.error('Failed to auto-backfill home config to server:', err));
          }
        }
        setIsLoadedConfig(true);
      })
      .catch(err => {
        console.error('Failed to load home-blocks config', err);
        setIsLoadedConfig(false);
      });
  }, []);

  const handleUpdateHomeBlocksConfig = (newConfig: Record<string, unknown> | ((prev: Record<string, unknown>) => Record<string, unknown>)) => {
    setCustomHomeBlocksConfig(prev => {
      const parsedConfig = typeof newConfig === 'function' ? newConfig(prev) : newConfig;
      const updated = {
        ...parsedConfig,
        __metadata_updated_at: Date.now()
      };
      
      try {
        localStorage.setItem('__SYNTHETICA_HOME_BLOCKS_CONFIG__', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save home blocks config to localStorage:', e);
      }
      
      // Save directly to server
      fetch('/api/config/home-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      }).catch(err => console.error('Failed to save home-blocks config', err));
      
      return updated;
    });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payItem = params.get('pay_item');
    const payPrice = params.get('pay_price');
    const isCustom = params.get('custom_widget') === 'true';
    const showTg = params.get('show_tg') !== 'false';
    const showEmailText = params.get('show_email_text') !== 'false';
    
    if (payItem && payPrice) {
      setPaymentModalData({
        isOpen: true,
        itemName: payItem,
        price: Number(payPrice),
        isCustomWidget: isCustom,
        showTg: showTg,
        showEmailText: showEmailText
      });
      // Optionally remove params from URL without reload
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Main 8 blocks (4 columns, 2 rows)
  const defaultBlocks: PortfolioBlock[] = [
    {
      id: 'about_me',
      title: language === 'RU' ? 'ИРИНА SYNTHETICA' : 'IRINA SYNTHETICA',
      subtitle: language === 'RU' ? 'ИИ-Художник, генеративный бренд-стратег, ментор и исследователь' : 'AI Artist, generative brand strategist, mentor & researcher',
      image: '/default_blocks/image_1.jpg',
      isActive: true,
      colorTheme: '#f9f6f0', // elegant warm alabaster sand
      badge: language === 'RU' ? 'SYNTHETICA brand // IDENTITY' : 'SYNTHETICA brand // IDENTITY'
    },
    {
      id: 'services',
      title: language === 'RU' ? 'УСЛУГИ / BRANDING' : 'SERVICES / BRANDING',
      subtitle: language === 'RU' ? 'Создание нейро-айдентики, разработка генеративных систем и запуск рекламных ИИ-кампаний' : 'Neuro-identity design, generative systems development and AI ad campaign production',
      image: '/default_blocks/image_2.jpg',
      isActive: true,
      colorTheme: '#e1523d', // high-contrast hot terracotta orange
      badge: language === 'RU' ? 'SYNTHETICA services // AI LAB' : 'SYNTHETICA services // AI LAB'
    },
    {
      id: 'course_midjourney',
      title: language === 'RU' ? 'ОСНОВНОЙ КУРС Fake it. Shake it!' : 'CORE COURSE Fake it. Shake it!',
      subtitle: language === 'RU' ? 'Создание гиперреалистичного контента от и до с помощью нейросетей для брендов и творческих проектов.' : 'Creation of hyper-realistic content from scratch using AI for brands and creative projects.',
      image: '/default_blocks/image_3.jpg',
      isActive: true,
      colorTheme: '#9a8cf2', // sophisticated lavender
      badge: language === 'RU' ? 'SYNTHETICA education // ACADEMY' : 'SYNTHETICA education // ACADEMY',
      isCourse: true
    },
    {
      id: 'course_marketing',
      title: language === 'RU' ? 'МИНИ-КУРС You\'re not perfect!' : 'MINI-COURSE You\'re not perfect!',
      subtitle: language === 'RU' ? 'Я научу вас создавать реалистичных AI-моделей, которые помогут вам выйти на платежеспособный рынок. Курс, который будет полезен как для новичка, так и для опытного дизайнера.' : 'I will teach you how to create realistic AI models that will help you enter the paying market. A course that will be extremely useful for both beginners and experienced designers.',
      image: '/default_blocks/image_4.jpg',
      isActive: true,
      colorTheme: '#cbdc19', // striking light neon-lime
      badge: language === 'RU' ? 'SYNTHETICA education // MINI-COURSE' : 'SYNTHETICA education // MINI-COURSE',
      isCourse: true
    },
    {
      id: 'mentorship',
      title: language === 'RU' ? 'НАСТАВНИЧЕСТВО' : '1-ON-1 MENTORSHIP',
      subtitle: language === 'RU' ? 'Индивидуальное сопровождение от первых шагов до первого премиум портфолио' : 'Individual mentorship from very first steps to your first premium portfolio',
      image: '/default_blocks/image_5.jpg',
      isActive: true,
      colorTheme: '#f5cb35', // radiant sunshine amber yellow
      badge: language === 'RU' ? 'SYNTHETICA mentorship // INDIVIDUAL' : 'SYNTHETICA mentorship // INDIVIDUAL',
      isCourse: true
    },
    {
      id: 'contact_me',
      title: language === 'RU' ? 'МИНИ-КУРС Pin & Profit' : 'MINI-COURSE Pin & Profit',
      subtitle: language === 'RU' ? 'Вы знаете, что клиенты ищут, но не находят вас! Я научу вас на личном опыте как получить до 1,5 млн охватов всего за два месяца и стабильные заказы!' : 'You know that clients are looking, but can not find you! I will teach you from personal experience how to get up to 1.5 million impressions in just two months and stable orders!',
      image: '/default_blocks/image_6.jpg',
      isActive: true,
      colorTheme: '#151515', // exquisite dark charcoal
      badge: language === 'RU' ? 'SYNTHETICA education // PINTEREST' : 'SYNTHETICA education // PINTEREST',
      isCourse: true
    },
    {
      id: 'future_agents',
      title: language === 'RU' ? 'Создание сайта-визитки' : 'CARD SITE CREATOR',
      subtitle: language === 'RU' ? 'Откройте доступ к редактору сайта для создания собственной визитки без знаний кодинга и дополнительных подписок!' : 'Unlock access to the website editor to build your own digital business card with zero coding and no recurring subscriptions!',
      image: '/default_blocks/image_7.jpg',
      isActive: false, // upcoming product is locked/inactive
      colorTheme: '#1a1a1a', // neutral dark
      badge: language === 'RU' ? 'SYNTHETICA web // NO-CODE' : 'SYNTHETICA web // NO-CODE',
      isCourse: true
    },
    {
      id: 'future_video',
      title: language === 'RU' ? 'Основной курс Кинематика AI' : 'MAIN COURSE Kinematic AI',
      subtitle: language === 'RU' ? 'Научитесь создавать кинематографичные реалистичные AI-видео для социальных сетей, коммерческих и творческих проектов с нуля!' : 'Learn to create cinematic realistic AI-videos for social media, commercial and creative projects from scratch!',
      image: '/default_blocks/image_8.jpg',
      isActive: false, // upcoming product is locked/inactive
      colorTheme: '#2a2a2a', // neutral dark
      badge: language === 'RU' ? 'SYNTHETICA cinema // EDUCATION' : 'SYNTHETICA cinema // EDUCATION',
      isCourse: true
    }
  ];

  const extraCourseIds = (customHomeBlocksConfig['__extra_courses__'] as string[]) || [];
  const extraBlocks: PortfolioBlock[] = extraCourseIds.map(id => {
    const custom = customHomeBlocksConfig[id] as any || {};
    return {
      id,
      title: custom.title || 'NEW COURSE',
      subtitle: custom.subtitle || '',
      image: custom.image || '',
      isActive: true,
      colorTheme: custom.colorTheme || '#9a8cf2',
      badge: custom.badge || '',
      isCourse: true,
      customConfig: custom
    };
  });

  const blocks: PortfolioBlock[] = [
    ...defaultBlocks.map(b => {
      const custom = customHomeBlocksConfig[b.id] as any || {};
      return { 
        ...b, 
        title: (custom.title !== undefined && custom.title !== "") ? custom.title : b.title, 
        subtitle: (custom.subtitle !== undefined && custom.subtitle !== "") ? custom.subtitle : b.subtitle, 
        image: (custom.image !== undefined && custom.image !== "") ? custom.image : b.image, 
        badge: (custom.badge !== undefined && custom.badge !== "") ? custom.badge : b.badge, 
        customConfig: custom 
      };
    }),
    ...extraBlocks
  ];

  const [selectedBlock, setSelectedBlock] = useState<PortfolioBlock | null>(null);
  const [classroomActive, setClassroomActive] = useState(false);
  const [loggedMessages, setLoggedMessages] = useState<DirectMessage[]>(() => {
    const saved = localStorage.getItem('site_mailbox_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [spiders, setSpiders] = useState<SpiderType[]>([]);
  const spiderIdCounter = useRef(0);
  const [onlineCount] = useState(() => Math.floor(Math.random() * 6) + 2);

  // Welcome Popup Logic
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [welcomeData, setWelcomeData] = useState({ email: '' });
  const [welcomeConfig, setWelcomeConfig] = useState(() => {
    const saved = localStorage.getItem('synthetica_welcome_offer');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (!welcomeConfig?.active || classroomActive) return;
    
    // Only popup once per session/visit globally
    const seen = localStorage.getItem('synthetica_welcome_seen');
    if (seen === 'true') return;

    const timer = setTimeout(() => {
      // Re-check config in case it was modified
      let currentConf = null;
      try {
        currentConf = JSON.parse(localStorage.getItem('synthetica_welcome_offer') || 'null');
      } catch (e) {}
      
      if (currentConf?.active) {
        setShowWelcomePopup(true);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [welcomeConfig, classroomActive]);

  const handleWelcomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!welcomeData.email) return;
    
    let savedEmails = [];
    try {
      savedEmails = JSON.parse(localStorage.getItem('synthetica_welcome_emails') || '[]');
    } catch (e) {}

    savedEmails.push({ email: welcomeData.email, date: new Date().toISOString() });
    localStorage.setItem('synthetica_welcome_emails', JSON.stringify(savedEmails));
    localStorage.setItem('synthetica_welcome_seen', 'true');
    setShowWelcomePopup(false);
  };

  const handleCloseWelcome = () => {
    localStorage.setItem('synthetica_welcome_seen', 'true');
    setShowWelcomePopup(false);
  };

  // Synchronize selectedBlock state with browser URL search parameters for robust deep linking
  useEffect(() => {
    if (isLoadedConfig && blocks.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const urlBlockId = params.get('block') || params.get('course') || params.get('id') || window.location.hash.replace('#', '');
      if (urlBlockId) {
        const found = blocks.find(b => b.id.toLowerCase() === urlBlockId.toLowerCase());
        if (found) {
          setSelectedBlock(found);
        }
      }
    }
  }, [isLoadedConfig, blocks.length]);

  useEffect(() => {
    if (!isLoadedConfig) return;
    const params = new URLSearchParams(window.location.search);
    const currentBlockId = params.get('block');

    if (selectedBlock) {
      if (currentBlockId !== selectedBlock.id) {
        params.set('block', selectedBlock.id);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({ blockId: selectedBlock.id }, '', newUrl);
      }
    } else {
      if (currentBlockId) {
        params.delete('block');
        params.delete('course');
        params.delete('id');
        const searchStr = params.toString();
        const newUrl = searchStr ? `${window.location.pathname}?${searchStr}` : window.location.pathname;
        window.history.pushState({}, '', newUrl);
      }
    }
  }, [selectedBlock, isLoadedConfig]);

  // Handle browser back button relative to the deep-linked blocks
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const urlBlockId = params.get('block');
      if (urlBlockId) {
        const found = blocks.find(b => b.id.toLowerCase() === urlBlockId.toLowerCase());
        setSelectedBlock(found || null);
      } else {
        setSelectedBlock(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [blocks]);

  // KINETIC MOUSE AND TRAILING CUSTOM CURSOR SYSTEM
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [trailPos, setTrailPos] = useState({ x: 0, y: 0 });
  const [cursorHovered, setCursorHovered] = useState<'block' | 'button' | null>(null);
  const [cursorText, setCursorText] = useState<string>('');

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const hoverBlock = target.closest('[data-hover-block]');
      const hoverButton = target.closest('button, a, input, textarea, select');
      
      if (hoverBlock) {
        setCursorHovered('block');
        setCursorText(hoverBlock.getAttribute('data-hover-title') || 'ПОДРОБНЕЕ');
      } else if (hoverButton) {
        setCursorHovered('button');
        setCursorText('');
      } else {
        setCursorHovered(null);
        setCursorText('');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  useEffect(() => {
    let animId: number;
    const updateTrail = () => {
      setTrailPos(prev => {
        const dx = mousePos.x - prev.x;
        const dy = mousePos.y - prev.y;
        return {
          x: prev.x + dx * 0.16,
          y: prev.y + dy * 0.16
        };
      });
      animId = requestAnimationFrame(updateTrail);
    };
    animId = requestAnimationFrame(updateTrail);
    return () => cancelAnimationFrame(animId);
  }, [mousePos]);

  // High performance update ticker loop for crawling spiders
  useEffect(() => {
    if (spiders.length === 0) return;
    let animId: number;

    const tick = () => {
      setSpiders(prev => {
        if (prev.length === 0) return [];
        return prev
          .map(s => {
            const angleJitter = (Math.random() - 0.5) * 0.45;
            const newAngle = s.angle + angleJitter;
            const dx = Math.cos(newAngle) * s.speed;
            const dy = Math.sin(newAngle) * s.speed;
            
            return {
              ...s,
              x: s.x + dx,
              y: s.y + dy,
              angle: newAngle,
              legsState: (s.legsState + 1) % 4,
              opacity: s.opacity - 0.005,
              speed: s.speed * 0.985
            };
          })
          .filter(s => s.opacity > 0);
      });
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [spiders.length]);

  // Spawns 18 stylized minimalist spiders running randomly on click coordinates
  const triggerSpiders = (clientX: number, clientY: number) => {
    const freshSpiders: SpiderType[] = [];
    for (let i = 0; i < 18; i++) {
      const angle = (i * (360 / 18) * Math.PI) / 180 + (Math.random() - 0.5) * 0.2;
      freshSpiders.push({
        id: spiderIdCounter.current++,
        x: clientX,
        y: clientY,
        angle: angle,
        speed: 3.5 + Math.random() * 4,
        opacity: 1.0,
        scale: 0.6 + Math.random() * 0.5,
        legsState: Math.floor(Math.random() * 4)
      });
    }
    setSpiders(prev => [...prev, ...freshSpiders]);
  };

  const handleGlobalClickSpawn = (e: React.MouseEvent<HTMLButtonElement>) => {
    triggerSpiders(e.clientX, e.clientY);
  };

  const handleAddDirectMessage = (msg: DirectMessage) => {
    setLoggedMessages(prev => [msg, ...prev]);
  };

  useEffect(() => {
    localStorage.setItem('site_mailbox_logs', JSON.stringify(loggedMessages));
  }, [loggedMessages]);

  const handleChatWithTwin = async (
    text: string, 
    callback: (reply: string, err?: string) => void
  ) => {
    setIsAiLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: text,
          history: [
            { role: 'user', content: 'Привет' },
            { role: 'assistant', content: 'Приветствую, я ИИ-двойник Ирины Синтетики. Отвечу на любой ваш вопрос о курсах по нейросетям, услугах бренда и наставничества.' }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      callback(data.text || 'Связь установлена. Чем могу помочь?');
    } catch (error: unknown) {
      console.error('API Error:', error instanceof Error ? error.message : error);
      callback('', 'Канал ИИ-двойника временно перегружен. Пожалуйста, отправьте сообщение через форму или Telegram.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // State tracker for interactive Swiss hero graphic coordinates
  const [heroMouse, setHeroMouse] = useState({ x: 200, y: 150 });

  // Designer Deck interactive settings
  const [showGrid, setShowGrid] = useState(true);
  const [creativeGridMode, setCreativeGridMode] = useState<number>(0); // 0 = standard, 1 = radar pulse, 2 = binary logs

  return (
    <div 
      id="website-root" 
      className="min-h-screen bg-white text-neutral-900 flex flex-col justify-between selection:bg-neutral-900 selection:text-white relative font-sans overflow-x-hidden"
    >
      
      {/* Structural technical grid backdrop */}
      <MinimalistBlueprintGrid showGrid={showGrid} creativeGridMode={creativeGridMode} />

      {/* RENDER ACTIVE SPIDER ESCORT SYSTEM */}
      <div id="spider-swarm-layer" className="fixed inset-0 pointer-events-none z-[130]">
        {spiders.map(spider => {
          const legPhase = spider.legsState * 10;
          return (
            <div 
              key={spider.id}
              className="absolute select-none pointer-events-none"
              style={{
                left: spider.x,
                top: spider.y,
                transform: `translate(-50%, -50%) rotate(${spider.angle * (180 / Math.PI) + 90}deg) scale(${spider.scale})`,
                opacity: spider.opacity
              }}
            >
              {/* Center insect body dot */}
              <div className="w-2.5 h-3 bg-neutral-900 rounded-full relative shadow-sm border border-neutral-800">
                {/* Micro head */}
                <div className="w-1.5 h-1.5 bg-neutral-950 rounded-full absolute -top-1 left-0.5" />
                
                {/* Leg Left 1 */}
                <div className="absolute top-0 right-full w-3.5 h-[0.5px] bg-neutral-900 origin-right transition-transform" style={{ transform: `rotate(${-35 + legPhase}deg)` }} />
                {/* Leg Left 2 */}
                <div className="absolute top-1 right-full w-4 h-[0.5px] bg-neutral-900 origin-right transition-transform" style={{ transform: `rotate(${-5 - legPhase}deg)` }} />
                {/* Leg Left 3 */}
                <div className="absolute top-2 right-full w-3.5 h-[0.5px] bg-neutral-900 origin-right transition-transform" style={{ transform: `rotate(${25 + legPhase}deg)` }} />
                
                {/* Leg Right 1 */}
                <div className="absolute top-0 left-full w-3.5 h-[0.5px] bg-neutral-900 origin-left transition-transform" style={{ transform: `rotate(${35 - legPhase}deg)` }} />
                {/* Leg Right 2 */}
                <div className="absolute top-1 left-full w-4 h-[0.5px] bg-neutral-900 origin-left transition-transform" style={{ transform: `rotate(${5 + legPhase}deg)` }} />
                {/* Leg Right 3 */}
                <div className="absolute top-2 left-full w-3.5 h-[0.5px] bg-neutral-900 origin-left transition-transform" style={{ transform: `rotate(${-25 - legPhase}deg)` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. RUNNING NEWS TICKER WITH ALICE & CHESHIRE CAT QUOTE AT THE VERY TOP */}
      <div 
        id="alice-quote-ticker"
        className="w-full bg-neutral-950 border-b border-neutral-900 py-3.5 overflow-hidden select-none relative z-30"
      >
        <div className="flex w-max relative whitespace-nowrap">
          <div className="animate-marquee flex items-center gap-14 whitespace-nowrap text-[10px] md:text-[11px] font-mono tracking-[0.18em] text-[#cbdc19] uppercase font-bold">
            <span>
              {language === 'RU' 
                ? '— СКАЖИТЕ, ПОЖАЛУЙСТА, КУДА МНЕ ОТСЮДА ИДТИ? — СПРОСИЛА АЛИСА 👧🏼. — ЭТО ВО МНОГОМ ЗАВИСИТ ОТ ТОГО, КУДА ТЫ ХОЧЕШЬ ПРИЙТИ, — ОТВЕТИЛ КОТ 🐱.'
                : '— WOULD YOU TELL ME, PLEASE, WHICH WAY I OUGHT TO GO FROM HERE? — ASKED ALICE 👧🏼. — THAT DEPENDS A GOOD DEAL ON WHERE YOU WANT TO GET TO, — SAID THE CAT 🐱.'}
            </span>
            <span className="text-white/35">✦</span>
            <span>
              {language === 'RU' 
                ? '— СКАЖИТЕ, ПОЖАЛУЙСТА, КУДА МНЕ ОТСЮДА ИДТИ? — СПРОСИЛА АЛИСА 👧🏼. — ЭТО ВО МНОГОМ ЗАВИСИТ ОТ ТОГО, КУДА ТЫ ХОЧЕШЬ ПРИЙТИ, — ОТВЕТИЛ КОТ 🐱.'
                : '— WOULD YOU TELL ME, PLEASE, WHICH WAY I OUGHT TO GO FROM HERE? — ASKED ALICE 👧🏼. — THAT DEPENDS A GOOD DEAL ON WHERE YOU WANT TO GET TO, — SAID THE CAT 🐱.'}
            </span>
            <span className="text-white/35">✦</span>
          </div>

          {/* Repeat */}
          <div className="animate-marquee flex items-center gap-14 whitespace-nowrap text-[10px] md:text-[11px] font-mono tracking-[0.18em] text-[#cbdc19] uppercase font-bold" aria-hidden="true">
            <span>
              {language === 'RU' 
                ? '— СКАЖИТЕ, ПОЖАЛУЙСТА, КУДА МНЕ ОТСЮДА ИДТИ? — СПРОСИЛА АЛИСА 👧🏼. — ЭТО ВО МНОГОМ ЗАВИСИТ ОТ ТОГО, КУДА ТЫ ХОЧЕШЬ ПРИЙТИ, — ОТВЕТИЛ КОТ 🐱.'
                : '— WOULD YOU TELL ME, PLEASE, WHICH WAY I OUGHT TO GO FROM HERE? — ASKED ALICE 👧🏼. — THAT DEPENDS A GOOD DEAL ON WHERE YOU WANT TO GET TO, — SAID THE CAT 🐱.'}
            </span>
            <span className="text-white/35">✦</span>
            <span>
              {language === 'RU' 
                ? '— СКАЖИТЕ, ПОЖАЛУЙСТА, КУДА МНЕ ОТСЮДА ИДТИ? — СПРОСИЛА АЛИСА 👧🏼. — ЭТО ВО МНОГОМ ЗАВИСИТ ОТ ТОГО, КУДА ТЫ ХОЧЕШЬ ПРИЙТИ, — ОТВЕТИЛ КОТ 🐱.'
                : '— WOULD YOU TELL ME, PLEASE, WHICH WAY I OUGHT TO GO FROM HERE? — ASKED ALICE 👧🏼. — THAT DEPENDS A GOOD DEAL ON WHERE YOU WANT TO GET TO, — SAID THE CAT 🐱.'}
            </span>
            <span className="text-white/35">✦</span>
          </div>
        </div>
      </div>

      {/* 1. HIGH-CONTRAST WHITE DEEP-LINKED COMPUTER ADMISSION BANNER */}
      <div 
        id="admission-june-banner"
        className="w-full bg-white border-b border-neutral-200 py-6 px-6 md:px-14 flex flex-col md:flex-row justify-between items-center gap-5 relative z-20 select-none transition-all duration-300"
      >
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
          <div className="flex flex-col items-center sm:items-start gap-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#0284c7] rounded-none animate-ping absolute" />
              <span className="w-2 h-2 bg-[#0284c7] rounded-none relative" />
              <span className="text-[10px] font-mono font-black tracking-[0.2em] text-[#0369a1] bg-[#0369a1]/10 px-2 py-0.5 rounded-none uppercase">
                [ ACADEMY_ALERT // {new Date().getFullYear()} ]
              </span>
            </div>
            
            <button 
              onClick={() => setClassroomActive(true)}
              className="text-[9px] font-mono font-black uppercase tracking-[0.15em] text-[#0284c7] hover:text-white bg-[#0284c7]/5 hover:bg-[#0284c7] border border-[#0284c7]/20 hover:border-[#0284c7] px-2.5 py-1 transition-all duration-300 flex items-center gap-1.5 rounded-none cursor-pointer"
            >
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-pulse" />
              {language === 'RU' ? 'Войти в класс' : 'ENTER CLASSROOM 🔑'}
            </button>
          </div>
          <div className="hidden sm:block h-10 w-[1px] bg-sky-200" />
          <div className="flex flex-col gap-1.5 items-center sm:items-start text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap justify-center sm:justify-start">
              <span className="text-sm sm:text-base font-mono tracking-wide text-red-600 bg-red-500/10 px-2 py-0.5 rounded-none font-extrabold uppercase">
                {language === 'RU' ? '[ НАБОР НА ИЮНЬ ОТКРЫТ! ]' : '[ JUNE ENROLLMENT OPEN! ]'}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[9px] font-mono text-red-600 bg-red-500/10 px-1.5 py-0.5 rounded-none font-bold tracking-tight">
                {language === 'RU' ? 'ОСТАЛОСЬ: 9 МЕСТ' : 'ONLY 9 SLOTS LEFT'}
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-mono tracking-wide text-neutral-600 font-bold uppercase block mt-1">
              {language === 'RU' ? 'ПОЛНЫЙ КУРС И НАСТАВНИЧЕСТВО' : 'COMPLETE COURSE & 1-ON-1 MENTORSHIP'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-5 font-mono text-[9px] uppercase tracking-wider text-sky-700/85">
          <span className="hidden lg:inline">
            {language === 'RU'
              ? '[ Создание реалистичного контента с помощью нейросетей от и до ]'
              : '[ Creating realistic content with AI generators from A to Z ]'}
          </span>
          <button 
            onClick={() => {
              const courseMJ = blocks.find(b => b.id === 'course_midjourney');
              if (courseMJ) setSelectedBlock(courseMJ);
            }}
            id="apply-admission-banner-btn"
            className="group relative px-6 py-2.5 bg-neutral-950 text-white hover:bg-neutral-900 duration-300 text-[10.5px] font-mono tracking-[0.16em] font-black uppercase rounded-none border-2 border-neutral-950 shadow-[4px_4px_0px_#cbdc19] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            {language === 'RU' ? 'ХОЧУ НА КУРС // APPLY ↗' : 'JOIN COURSE // APPLY ↗'}
          </button>
        </div>
      </div>

      {/* RESPONSIVE SEAMLESS PORTFOLIO GRID with colored backgrounds */}
      <main className="flex-grow w-full p-0 relative z-10 flex flex-col justify-center bg-white">
        <div className="w-full relative">
          <div 
            id="portfolio-grid-swiss" 
            className="grid grid-cols-2 md:grid-cols-4 gap-0 w-full relative"
          >
            {blocks.map((block, index) => {
              const blockColor = block.colorTheme || '#ffffff';
              const isLocked = !block.isActive;

              return (
                <div 
                  key={block.id}
                  onClick={() => setSelectedBlock(block)}
                  data-hover-block="true"
                  data-hover-title={isLocked ? 'ЗАКРЫТО' : 'ОТКРЫТЬ'}
                  onMouseEnter={(e) => {
                     const vid = e.currentTarget.querySelector('video');
                     if (vid && block.customConfig?.videoAutoplay === false) { vid.play().catch(()=>{}); }
                  }}
                  onMouseLeave={(e) => {
                     const vid = e.currentTarget.querySelector('video');
                     if (vid && block.customConfig?.videoAutoplay === false) { vid.pause(); vid.currentTime = 0; }
                  }}
                  className="relative group overflow-hidden p-5 flex flex-col justify-between aspect-[3/4] w-full bg-neutral-900 rounded-none transition-all duration-350 hover:z-20 hover:scale-[1.01] hover:shadow-2xl select-none font-sans border-b border-r border-neutral-200"
                >
                  {/* Background cover image or video - strictly edge-to-edge without frames, borders, or margin padding */}
                  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    {block.image && block.image.toLowerCase().match(/\.(mp4|webm|mov)$/i) ? (
                      <video 
                        src={block.image || undefined}
                        className={`w-full h-full object-cover transition-transform duration-[1200ms] ease-out ${
                          isLocked 
                            ? 'opacity-100 contrast-[1.0] brightness-[1.1]' 
                            : 'saturate-100 contrast-[1.05] group-hover:scale-105'
                        }`}
                        loop
                        muted
                        playsInline
                        autoPlay={block.customConfig?.videoAutoplay !== false}
                        onMouseEnter={(e) => {
                          if (block.customConfig?.videoAutoplay === false) e.currentTarget.play();
                        }}
                        onMouseLeave={(e) => {
                          if (block.customConfig?.videoAutoplay === false) {
                            e.currentTarget.pause();
                            e.currentTarget.currentTime = 0;
                          }
                        }}
                      />
                    ) : block.image ? (
                      <img 
                        src={block.image || undefined} 
                        alt={block.title} 
                        className={`w-full h-full object-cover transition-transform duration-[1200ms] ease-out ${
                          isLocked 
                            ? 'opacity-100 contrast-[1.0] brightness-[1.1]' 
                            : 'saturate-100 contrast-[1.05] group-hover:scale-105'
                        }`}
                        referrerPolicy="no-referrer"
                      />
                    ) : null}
                    
                    {/* Consistent overlay screens to secure text readability on edge-to-edge images */}
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/45 to-neutral-950/30 group-hover:from-neutral-950/75 group-hover:via-neutral-950/35 transition-all duration-300 pointer-events-none" />
                    
                    {/* Visual theme tint projection */}
                    <div 
                      className="absolute inset-0 opacity-10 group-hover:opacity-25 transition-opacity duration-500 pointer-events-none" 
                      style={{ backgroundColor: blockColor, mixBlendMode: 'color' }}
                    />
                    
                    {/* Schematic coordinates grids to mirror Swiss precision drawing re-rendered directly on block core */}
                    <div className="absolute inset-0 z-10 opacity-30 group-hover:opacity-60 transition-all duration-300 pointer-events-none">
                      {/* Sub-line tracers */}
                      <div className="absolute left-[20%] top-0 bottom-0 w-[0.5px] border-l border-white/10" />
                      <div className="absolute left-0 right-0 top-[78%] h-[0.5px] border-t border-white/10" />
                      
                      {/* Tech indicator numbers */}
                      <span className="absolute left-[22%] top-[79%] text-[6.5px] font-mono text-white/40 select-none uppercase tracking-widest">
                        REF_ID: 0x{index * 131 + 42} // MTX:A
                      </span>
                    </div>

                    {isLocked && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950/20 z-20 gap-2.5">
                        <Lock className="w-5 h-5 text-red-500 animate-pulse" />
                        <span className="text-[8px] font-mono uppercase tracking-[0.25em] text-white font-bold bg-neutral-900/90 border border-neutral-700/60 px-2 py-0.5 select-none shadow">
                          СКОРО
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Top header with complex computer typography & coordinates */}
                  <div className="flex justify-between items-start z-20 relative text-white w-full">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-mono font-black tracking-widest text-[#cbdc19] uppercase leading-none">
                        SEC_CORE_0{index + 1}
                      </span>
                      <span className="text-[7px] font-mono text-neutral-350 uppercase tracking-wider mt-1.5 font-bold">
                        {block.badge || 'SYNTHETICA SYSTEM'}
                      </span>
                    </div>
                    
                    {isLocked ? (
                      <span className="text-[7.5px] font-mono uppercase bg-neutral-800 border border-neutral-750 text-neutral-400 px-1.5 py-0.5 leading-none">
                        locked
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5 font-mono text-[7px] tracking-wider text-[#cbdc19] bg-[#cbdc19]/10 px-1.5 py-0.5 border border-[#cbdc19]/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#cbdc19] inline-block animate-ping" />
                        <span>ACTIVE</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom descriptive container with interesting cybernetics typography */}
                  <div className="relative z-20 flex flex-col items-start text-left w-full mt-auto">
                    
                    <div className="flex items-center justify-between w-full border-t border-white/10 pt-2.5">
                      <h3 className="font-mono font-black text-xs md:text-sm tracking-wide uppercase text-white leading-none">
                        {(() => {
                          const { label, main } = parseCourseTitle(block.title);
                          if (label && main) {
                            return (
                              <span className="flex flex-col gap-1">
                                <span className="text-[8px] md:text-[9px] text-white/50 tracking-[0.2em]">{label}</span>
                                <span>{main}</span>
                              </span>
                            );
                          }
                          return block.title;
                        })()}
                      </h3>
                      {!isLocked && (
                        <div className="text-white opacity-70 group-hover:opacity-100 group-hover:text-[#cbdc19] transition-all duration-300 transform -translate-x-1 group-hover:translate-x-0">
                          <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                        </div>
                      )}
                    </div>

                    <p className="font-sans text-[10px] leading-snug font-light mt-1.5 block text-neutral-300/90 line-clamp-2">
                      {block.subtitle}
                    </p>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* FLOATING INTERACTIVE OPTIONS BAR (Aids in premium designer tech depth without cluttering layout) */}
      <div className="fixed bottom-6 left-6 z-[120] hidden sm:flex items-center gap-1.5 bg-white border border-neutral-250/80 p-1.5 shadow-xl select-none font-mono text-[8px] md:text-[9px] rounded-none">
        <div className="px-2 py-0.5 text-neutral-500 uppercase border-r border-neutral-200 font-bold pr-2.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          {language === 'RU' ? `сейчас на сайте: ${onlineCount}` : `online now: ${onlineCount}`}
        </div>
        
        <a 
          href="https://t.me/syntheticajpg"
          target="_blank"
          rel="noopener noreferrer"
          className="px-2.5 py-0.5 bg-neutral-950 text-white hover:bg-neutral-800 border border-neutral-950 transition-colors uppercase font-bold tracking-wider"
        >
          {language === 'RU' ? 'СВЯЗАТЬСЯ СО МНОЙ' : 'CONTACT ME'}
        </a>
      </div>

      {/* 3. LIGHT DETAILED FOOTER (High-contrast elegant cream/off-white tone with stark black detailing) */}
      <footer 
        id="inverse-plate-footer"
        className="w-full bg-[#fcfbfa] text-neutral-900 py-16 px-6 md:px-14 flex flex-col md:flex-row justify-between items-center gap-8 relative z-20 border-t border-neutral-200 rounded-none select-none text-center md:text-left"
      >
        <div className="text-center md:text-left font-mono">
          <span className="text-[#e1523d] block uppercase text-[10px] tracking-[0.2em] font-black">
            studio AI-creative
          </span>
          <span className="text-lg font-black block mt-1 tracking-wider text-neutral-950">SYNTHETICA.JPG</span>
          <p className="text-neutral-500 text-xs block mt-2 leading-relaxed tracking-wide max-w-xl font-light">
            {language === 'RU' 
              ? 'ИИ-брендинг • Нейромаркетинг • ИИ-агенты • Нейрокинематограф • Наставничество • Курсы'
              : 'AI Branding • Neuromarketing • AI Agents • Neural Cinema • Individual Mentorship • Core Courses'}
          </p>

          {/* Legal Documents - Left Aligned Footnote Style */}
          <div className="mt-8 flex flex-col items-center md:items-start">
            <button 
              onClick={() => setShowDocs(!showDocs)}
              className="text-[9px] font-mono font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="text-[10px]">{showDocs ? '[-]' : '[+]'}</span> 
              {language === 'RU' ? 'Документы' : 'Documents'}
            </button>
            
            {showDocs && (
              <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 animate-fade-in font-mono text-[8px] uppercase tracking-wider font-bold text-neutral-400">
                <button 
                  onClick={() => setLegalModal({ isOpen: true, type: 'offer' })}
                  className="hover:text-neutral-950 hover:underline transition-colors"
                >
                  {language === 'RU' ? 'Публичная оферта' : 'Public Offer'}
                </button>
                <button 
                  onClick={() => setLegalModal({ isOpen: true, type: 'privacy' })}
                  className="hover:text-neutral-950 hover:underline transition-colors"
                >
                  {language === 'RU' ? 'Политика конфиденциальности' : 'Privacy Policy'}
                </button>
                <button 
                  onClick={() => setLegalModal({ isOpen: true, type: 'consent' })}
                  className="hover:text-neutral-950 hover:underline transition-colors"
                >
                  {language === 'RU' ? 'Обработка персональных данных' : 'Personal Data Processing'}
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* LIGHT ALIGNED SPIDER GAME TRIGGER SYSTEM WITH RESPONSIVE CENTERED BUTTON */}
        <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-6">
          <button
            onClick={handleGlobalClickSpawn}
            id="dont-push-btn"
            className="group px-6 py-3 border border-red-500 hover:bg-red-500 hover:text-white text-red-500 text-[10px] font-mono tracking-[0.25em] uppercase hover:tracking-[0.3em] transition-all duration-300 rounded-none shadow-none font-bold bg-transparent mx-auto md:mx-0"
          >
            {language === 'RU' ? '[ НЕ НАЖИМАТЬ! ]' : '[ DO NOT PRESS! ]'}
          </button>
        </div>
      </footer>

      {/* COMPACT DETAILED POPUP MODAL */}
      {selectedBlock && (
        <BlockDetailModal 
          block={blocks.find(b => b.id === selectedBlock.id) || selectedBlock}
          onClose={() => setSelectedBlock(null)}
          onSubmitContact={handleAddDirectMessage}
          onChatWithAi={handleChatWithTwin}
          isAiLoading={isAiLoading}
          language={language}
          onOpenPaymentWidget={(name, price) => setPaymentModalData({isOpen: true, itemName: name, price})}
        />
      )}

      <PaymentWidgetModal 
        isOpen={paymentModalData.isOpen}
        onClose={() => setPaymentModalData({ isOpen: false })}
        defaultItemName={paymentModalData.itemName}
        defaultPrice={paymentModalData.price}
        language={language}
        isCustomWidget={paymentModalData.isCustomWidget}
        showTg={paymentModalData.showTg !== false}
        showEmailText={paymentModalData.showEmailText !== false}
      />

      <LegalModal 
        isOpen={legalModal.isOpen}
        type={legalModal.type}
        onClose={() => setLegalModal(p => ({ ...p, isOpen: false }))}
        language={language}
      />

      {classroomActive && (
        <Classroom 
          onClose={() => setClassroomActive(false)}
          language={language}
          setLanguage={setLanguage}
          blocks={blocks}
          customHomeBlocksConfig={customHomeBlocksConfig}
          setCustomHomeBlocksConfig={handleUpdateHomeBlocksConfig}
        />
      )}

      {showWelcomePopup && welcomeConfig && (
        <div className="fixed inset-0 z-[500] bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full border border-neutral-200 shadow-2xl relative flex flex-col font-mono overflow-hidden animate-fade-in">
            <button 
              onClick={handleCloseWelcome}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-900 transition-colors z-10 bg-neutral-100 hover:bg-neutral-200"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="bg-neutral-950 p-6 text-center border-b border-neutral-200 shrink-0">
              <span className="text-[10px] font-mono tracking-widest text-neutral-400 font-bold uppercase">
                {language === 'RU' ? 'СПЕЦИАЛЬНОЕ ПРЕДЛОЖЕНИЕ' : 'SPECIAL OFFER FOR YOU'}
              </span>
            </div>
            <div className="p-8 pb-10 flex-col flex items-center text-center">
              <h3 className="text-xl font-sans font-black uppercase text-neutral-900 mb-4 tracking-wider leading-tight">
                {welcomeConfig.option === 'discount' 
                  ? (language === 'RU' ? 'Получите скидку 10% на любой курс!' : 'Get 10% off any course!')
                  : (language === 'RU' ? `Получите бесплатный гайд: ${welcomeConfig.customName || 'Секреты нейросетей'}` : `Get a free guide: ${welcomeConfig.customName || 'Generative Secrets'}`)
                }
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mb-8 font-sans leading-relaxed">
                {welcomeConfig.option === 'discount'
                  ? (language === 'RU' ? 'Укажите свой email, чтобы получить промокод на скидку 10%. (Не распространяется в случае, если на курс уже действует скидка).' : 'Enter your email to receive a 10% discount promo code. (Does not apply if the course is already discounted).')
                  : (language === 'RU' ? 'Укажите свой email и мы моментально отправим бесплатные материалы!' : 'Enter your email and we will instantly send you the free materials!')
                }
              </p>
              <form onSubmit={handleWelcomeSubmit} className="w-full flex flex-col gap-3">
                <input 
                  type="email" 
                  required
                  placeholder={language === 'RU' ? 'Ваш email адрес' : 'Your email address'}
                  className="w-full p-4 border border-neutral-300 text-sm focus:outline-none focus:border-neutral-900 bg-neutral-50"
                  value={welcomeData.email}
                  onChange={(e) => setWelcomeData({ email: e.target.value })}
                />
                <button type="submit" className="w-full bg-[#cbdc19] text-neutral-950 p-4 text-xs font-mono font-black uppercase tracking-wider hover:bg-[#b0c010] transition-colors">
                  {welcomeConfig.option === 'discount'
                    ? (language === 'RU' ? 'ПОЛУЧИТЬ ПУШ-СКИДКУ' : 'CLAIM MY DISCOUNT')
                    : (language === 'RU' ? 'СКАЧАТЬ ГАЙД БЕСПЛАТНО' : 'DOWNLOAD FREE GUIDE')}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MINIMALISTIC TELEGRAM SUBSCRIBE WIDGET */}
      <TelegramWidget language={language} />

    </div>
  );
}
