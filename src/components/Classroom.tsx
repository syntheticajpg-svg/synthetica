import React, { useState, useEffect } from "react";
import { compressImage } from "../lib/imageCompression";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  Lock,
  User,
  Plus,
  Trash2,
  Settings,
  Play,
  CheckCircle2,
  HelpCircle,
  Send,
  FileText,
  BookOpen,
  Sparkles,
  LogOut,
  ListFilter,
  Check,
  AlertCircle,
  Gift,
  Inbox,
  PenTool,
  X,
} from "lucide-react";
import localforage from "localforage";
import { PortfolioBlock } from "../types";
import CourseBuilder from "./CourseBuilder";
import HomeBlockEditorModal from "./HomeBlockEditorModal";

function PaymentsCRMTable({ language }: { language: "RU" | "EN" }) {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/crm/payments')
      .then(res => res.json())
      .then(data => {
        setPayments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-xs font-mono text-neutral-500">Загрузка данных CRM...</div>;
  if (!payments.length) return <div className="text-xs font-mono text-neutral-500">Нет запросов на оплату.</div>;

  return (
    <div className="w-full overflow-x-auto border border-neutral-200">
      <table className="w-full text-left text-sm font-mono whitespace-nowrap">
        <thead className="bg-neutral-100 text-neutral-600 uppercase text-[10px] tracking-wider border-b border-neutral-200">
          <tr>
            <th className="px-4 py-3">Дата/Время</th>
            <th className="px-4 py-3">Товар</th>
            <th className="px-4 py-3">Сумма (₽)</th>
            <th className="px-4 py-3">Клиент</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Telegram</th>
            <th className="px-4 py-3">Метод</th>
            <th className="px-4 py-3">Доп.Инфо</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {payments.map((p, i) => (
            <tr key={p.id || i} className="hover:bg-neutral-50">
              <td className="px-4 py-3">{new Date(p.createdAt).toLocaleString(language === 'RU' ? 'ru-RU' : 'en-US', {dateStyle: 'short', timeStyle: 'short'})}</td>
              <td className="px-4 py-3 font-bold text-neutral-900">{p.itemName}</td>
              <td className="px-4 py-3 text-emerald-600 font-bold">{p.currentSum}</td>
              <td className="px-4 py-3">{p.name}</td>
              <td className="px-4 py-3">{p.email}</td>
              <td className="px-4 py-3">{p.tg || '-'}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded ${p.method === 'crypto' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                  {p.method}
                </span>
              </td>
              <td className="px-4 py-3 text-neutral-500 text-[10px]">
                {p.promo ? `Промо: ${p.promo}` : ''}
                {p.isCustomWidget ? ' (От ручной ссылки)' : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PaymentLinkGenerator({ language }: { language: "RU" | "EN" }) {
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [showTg, setShowTg] = useState(true);
  const [showEmailText, setShowEmailText] = useState(true);
  const [generatedLink, setGeneratedLink] = useState("");

  const handleGenerate = () => {
    if (!productName || !price) return;
    const url = new URL(window.location.origin);
    url.searchParams.set("pay_item", productName);
    url.searchParams.set("pay_price", price);
    url.searchParams.set("custom_widget", "true");
    url.searchParams.set("show_tg", showTg ? "true" : "false");
    url.searchParams.set("show_email_text", showEmailText ? "true" : "false");
    setGeneratedLink(url.toString());
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    alert(language === "RU" ? "Скопировано!" : "Copied!");
  };

  return (
    <div className="space-y-4 font-mono text-sm">
      <div>
        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1.5">
          {language === "RU"
            ? "Название товара / Услуги"
            : "Product / Service Name"}
        </label>
        <input
          type="text"
          className="w-full p-2 border border-neutral-300"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder={
            language === "RU"
              ? "Например: Персональная консультация"
              : "e.g. Personal Consultation"
          }
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1.5">
          {language === "RU" ? "Стоимость (₽)" : "Price (RUB)"}
        </label>
        <input
          type="number"
          className="w-full p-2 border border-neutral-300"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="5000"
        />
      </div>

      <div className="space-y-2 border border-neutral-200 p-3 bg-neutral-50">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showTg}
            onChange={(e) => setShowTg(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-xs font-medium">Показывать поле "Ник в Telegram"</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showEmailText}
            onChange={(e) => setShowEmailText(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-xs font-medium">Показывать фразу "Данные по обучению будут направлены..."</span>
        </label>
      </div>

      <button
        onClick={handleGenerate}
        className="w-full bg-neutral-900 text-white font-bold p-3 uppercase tracking-wider text-xs"
      >
        {language === "RU" ? "Сгенерировать ссылку" : "Generate Link"}
      </button>

      {generatedLink && (
        <div className="mt-6 border border-emerald-300 bg-emerald-50 p-4">
          <p className="text-[10px] text-emerald-800 font-bold uppercase mb-2">
            {language === "RU" ? "Ссылка для клиента:" : "Client Link:"}
          </p>
          <div className="bg-white p-2 border border-emerald-200 text-[10px] break-all select-all mb-3 text-emerald-900">
            {generatedLink}
          </div>
          <button
            onClick={copyToClipboard}
            className="w-full border border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors uppercase font-bold text-xs p-2"
          >
            {language === "RU" ? "Копировать" : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
}

function WelcomeFormAdmin({ language }: { language: "RU" | "EN" }) {
  const [conf, setConf] = useState(() => {
    try {
      const saved = localStorage.getItem("synthetica_welcome_offer");
      return saved
        ? JSON.parse(saved)
        : { active: false, option: "discount", customName: "" };
    } catch (e) {
      return { active: false, option: "discount", customName: "" };
    }
  });

  const [emails, setEmails] = useState<{ email: string; date: string }[]>(
    () => {
      try {
        const saved = localStorage.getItem("synthetica_welcome_emails");
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        return [];
      }
    },
  );

  const saveConf = (newConf: any) => {
    setConf(newConf);
    localStorage.setItem("synthetica_welcome_offer", JSON.stringify(newConf));
  };

  return (
    <section className="w-full flex-1 bg-white p-8 overflow-y-auto font-mono">
      <h2 className="text-xl font-mono font-black uppercase text-neutral-900 mb-6 border-b border-neutral-200 pb-4">
        {language === "RU"
          ? "Настройки лид-магнита (Pop-up)"
          : "Lead Magnet Settings"}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="border border-neutral-200 p-6 bg-neutral-50 shadow-sm space-y-5">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="hidden"
              checked={conf.active}
              onChange={(e) => saveConf({ ...conf, active: e.target.checked })}
            />
            <div
              className={`w-10 h-5 rounded-full p-1 transition-colors ${conf.active ? "bg-green-500" : "bg-neutral-300"}`}
            >
              <div
                className={`w-3.5 h-3.5 bg-white rounded-full transition-transform ${conf.active ? "translate-x-4" : ""}`}
              />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest">
              {language === "RU"
                ? "Включить сбор email (Pop-up)"
                : "Enable pop-up form"}
            </span>
          </label>

          <div className="pt-4 border-t border-neutral-200 space-y-4">
            <div>
              <span className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
                {language === "RU" ? "Тип предложения" : "Offer Type"}
              </span>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="radio"
                    checked={conf.option === "discount"}
                    onChange={() => saveConf({ ...conf, option: "discount" })}
                  />
                  Опция 1: Скидка 10% на любой курс
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="radio"
                    checked={conf.option === "guide"}
                    onChange={() => saveConf({ ...conf, option: "guide" })}
                  />
                  Опция 2: Бесплатный гайд (ручной ввод названия)
                </label>
              </div>
            </div>

            {conf.option === "guide" && (
              <div>
                <span className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
                  {language === "RU" ? "Название гайда" : "Guide Name"}
                </span>
                <input
                  type="text"
                  className="w-full text-xs p-2.5 border border-neutral-300"
                  placeholder={
                    language === "RU"
                      ? "Например: 10 нейросетей для дизайнера"
                      : "Enter guide name..."
                  }
                  value={conf.customName}
                  onChange={(e) =>
                    saveConf({ ...conf, customName: e.target.value })
                  }
                />
              </div>
            )}
          </div>
        </div>

        <div className="border border-neutral-200 bg-white">
          <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase">
              {language === "RU" ? "Собранные контакты" : "Collected Emails"}
            </h3>
            <span className="text-[9px] font-mono bg-neutral-900 text-white px-2 py-0.5">
              {emails.length} TOTAL
            </span>
          </div>
          <div className="p-0 max-h-96 overflow-y-auto">
            {emails.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-400 uppercase">
                {language === "RU" ? "Пусто" : "Empty"}
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <tbody>
                  {emails.map((m, i) => (
                    <tr
                      key={i}
                      className="border-b border-neutral-100 hover:bg-neutral-50/50"
                    >
                      <td className="p-3 pl-4 text-neutral-900 font-bold">
                        {m.email}
                      </td>
                      <td className="p-3 pr-4 text-right text-[10px] text-neutral-400">
                        {new Date(m.date).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

interface ClassroomProps {
  onClose: () => void;
  language: "RU" | "EN";
  setLanguage: (lang: "RU" | "EN") => void;
  blocks: PortfolioBlock[];
  customHomeBlocksConfig?: Record<string, any>;
  setCustomHomeBlocksConfig?: React.Dispatch<
    React.SetStateAction<Record<string, any>>
  >;
}

interface Student {
  id: string;
  email: string;
  password: string;
  fullName: string;
  allowedCourses: string[]; // block.id list
  allowedModules: Record<string, string[]>; // block.id -> string[] (list of module indexes like '01', '02', '03')
  notes?: string;
  isMentorshipMember?: boolean;
  allowedBonusCourses?: string[]; // course.id list
  allowedBonusModules?: Record<string, string[]>; // course.id -> module indexes list
  currentDeviceId?: string;
}

interface Lesson {
  title: string;
  duration: string;
  description: string;
  videoPlaceholderTheme: string; // colors for gradient
  materials: { title: string; type: string; link: string }[];
  isCustom?: boolean;
  customContent?: any;
}

interface CourseStructure {
  courseId: string;
  modules: {
    id: string; // '01', '02', '03'
    titleRu: string;
    titleEn: string;
    type?: "video" | "practice" | "test" | "text" | string;
    lessons: Lesson[];
  }[];
}

// Fixed lessons structure associated with each course
const COURSES_STRUCTURES: Record<string, CourseStructure> = {};

const DEFAULT_STUDENTS: Student[] = [
  {
    id: "s1",
    email: "student@synthetica.art",
    password: "student123",
    fullName: "Иван Кузнецов",
    allowedCourses: ["course_marketing"],
    allowedModules: {
      course_marketing: ["01", "02", "03"],
    },
    isMentorshipMember: true,
    allowedBonusCourses: ["contact_me"],
    allowedBonusModules: {
      contact_me: ["01", "02"], // Only modules 1 and 2 of Pinterest
    },
  },
  {
    id: "s2",
    email: "nina@synthetica.art",
    password: "123456",
    fullName: "Нина Тарасова",
    allowedCourses: ["course_midjourney", "future_agents"],
    allowedModules: {
      course_midjourney: ["01", "02", "03"],
      future_agents: ["01"], // Only Module 1 of Business card creator
    },
  },
];

export default function Classroom({
  onClose,
  language,
  setLanguage,
  blocks,
  customHomeBlocksConfig = {},
  setCustomHomeBlocksConfig,
}: ClassroomProps) {
  // Students DB in localStorage
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem("synthetica_classroom_students");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_STUDENTS;
      }
    }
    localStorage.setItem(
      "synthetica_classroom_students",
      JSON.stringify(DEFAULT_STUDENTS),
    );
    return DEFAULT_STUDENTS;
  });

  // Lesson completion checklist stored in localStorage
  const [completedLessons, setCompletedLessons] = useState<
    Record<string, boolean>
  >(() => {
    const saved = localStorage.getItem("synthetica_completed_lessons");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {};
      }
    }
    return {};
  });

  // Login inputs
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  // Authenticated state
  const [currentUser, setCurrentUser] = useState<
    | Student
    | { id: string; email: string; fullName: string; role: "admin" }
    | null
  >(() => {
    const cached = sessionStorage.getItem("synthetica_logged_user");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [adminImpersonatedStudentId, setAdminImpersonatedStudentId] = useState<
    string | null
  >(null);

  // Navigation inside logged in area
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(0);
  const [isSyllabusOpen, setIsSyllabusOpen] = useState<boolean>(false);
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(false);
  const [showCongratsModal, setShowCongratsModal] = useState<boolean>(false);

  // Admin active variables
  const [selectedAdminStudentId, setSelectedAdminStudentId] = useState<
    string | null
  >(null);
  const [adminNewName, setAdminNewName] = useState("");
  const [adminNewEmail, setAdminNewEmail] = useState("");
  const [adminNewPassword, setAdminNewPassword] = useState("");
  const [adminTab, setAdminTab] = useState<
    | "students"
    | "submissions"
    | "courses"
    | "homeBlocks"
    | "welcomeForm"
    | "payments"
  >("students");
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editingHomeBlockId, setEditingHomeBlockId] = useState<string | null>(
    null,
  );

  const [customCourseConfig, setCustomCourseConfig] = useState<
    Record<string, any>
  >({});
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [viewingTestSubmission, setViewingTestSubmission] = useState<any>(null);
  const [isLoadedLargeData, setIsLoadedLargeData] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const showError = (msg: string) => {
    setActionError(msg);
    setTimeout(() => setActionError(null), 4000);
  };

  const markSubmissionAsRead = (subId: string) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, read: true } : s)),
    );
  };

  useEffect(() => {
    async function loadData() {
      let serverData: any = null;
      try {
        // Fetch central classroom database from server
        const res = await fetch('/api/classroom/data');
        if (res.ok) {
          serverData = await res.json();
        }
      } catch (err) {
        console.error("Failed to load server classroom data, will fall back", err);
      }

      // Load local caching fallback values
      let localStudentsList: any[] = [];
      let localCompletedObj: Record<string, any> = {};
      let localSubmissionsList: any[] = [];
      let hasLocalData = false;

      const localStuds = localStorage.getItem("synthetica_classroom_students");
      if (localStuds) {
        try {
          localStudentsList = JSON.parse(localStuds);
          if (localStudentsList.length > 0) hasLocalData = true;
        } catch (e) {}
      }
      const localCompl = localStorage.getItem("synthetica_completed_lessons");
      if (localCompl) {
        try {
          localCompletedObj = JSON.parse(localCompl);
          if (Object.keys(localCompletedObj).length > 0) hasLocalData = true;
        } catch (e) {}
      }
      const localSubs = await localforage.getItem("synthetica_practical_submissions").catch(() => null) as any[];
      if (localSubs && Array.isArray(localSubs)) {
        localSubmissionsList = localSubs;
        if (localSubmissionsList.length > 0) hasLocalData = true;
      }

      let localTime = 0;
      try {
        localTime = Number(localStorage.getItem("synthetica_classroom_db_updated_at") || 0);
      } catch (e) {}

      const hasServerKeys = serverData && typeof serverData === 'object' && 
                            (Array.isArray(serverData.students) && serverData.students.length > 0);
      const serverTime = serverData ? Number(serverData.__metadata_updated_at || 0) : 0;

      if (hasServerKeys && (!hasLocalData || serverTime >= localTime)) {
        if (Array.isArray(serverData.students)) {
          setStudents(serverData.students);
        }
        if (serverData.completedLessons && typeof serverData.completedLessons === 'object') {
          setCompletedLessons(serverData.completedLessons);
        }
        if (Array.isArray(serverData.submissions)) {
          setSubmissions(serverData.submissions);
        }
        // Save to local storage
        localStorage.setItem("synthetica_classroom_students", JSON.stringify(serverData.students || []));
        localStorage.setItem("synthetica_completed_lessons", JSON.stringify(serverData.completedLessons || {}));
        localforage.setItem("synthetica_practical_submissions", serverData.submissions || []).catch(() => {});
        localStorage.setItem("synthetica_classroom_db_updated_at", String(serverTime));
      } else if (hasLocalData) {
        setStudents(localStudentsList);
        setCompletedLessons(localCompletedObj);
        setSubmissions(localSubmissionsList);
        // Sync our newer local backup to the server right away
        const payload = {
          students: localStudentsList,
          completedLessons: localCompletedObj,
          submissions: localSubmissionsList,
          __metadata_updated_at: localTime || Date.now()
        };
        fetch('/api/classroom/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(err => console.error('Failed to sync newer local db to backend', err));
      }

      let serverConfig: Record<string, any> = {};
      try {
        const res = await fetch("/api/config/courses");
        if (res.ok) {
          serverConfig = await res.json();
        }
      } catch (err) {
        console.error("Failed to fetch custom courses config from server:", err);
      }

      try {
        const localConfig = (await localforage.getItem(
          "synthetica_custom_courses_v1",
        )) as Record<string, any> || {};

        const hasServerKeys = serverConfig && typeof serverConfig === "object" && Object.keys(serverConfig).length > 0;
        const hasLocalKeys = localConfig && typeof localConfig === "object" && Object.keys(localConfig).length > 0;

        const serverTime = Number(serverConfig.__metadata_updated_at || 0);
        const localTime = Number(localConfig.__metadata_updated_at || 0);

        if (hasServerKeys && (!hasLocalKeys || serverTime >= localTime)) {
          setCustomCourseConfig(serverConfig);
          await localforage.setItem("synthetica_custom_courses_v1", serverConfig).catch(() => {});
        } else if (hasLocalKeys) {
          setCustomCourseConfig(localConfig);
          // Auto-backfill courses config to server
          fetch("/api/config/courses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(localConfig),
          }).catch((err) => console.error("Failed to backfill courses config to server:", err));
        }
      } catch (err) {
        console.error("Failed to load custom courses config from local storage", err);
      } finally {
        setIsLoadedLargeData(true);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (isLoadedLargeData) {
      localforage
        .setItem("synthetica_custom_courses_v1", customCourseConfig)
        .catch((err) =>
          console.error("Quota or save error for course config", err),
        );

      // Save to server config as well
      fetch("/api/config/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customCourseConfig),
      }).catch((err) => console.error("Failed to save custom courses config to server:", err));
    }
  }, [customCourseConfig, isLoadedLargeData]);

  // Synchronously save students, completed lessons, and submissions to both server database and local backup on changes
  useEffect(() => {
    if (isLoadedLargeData) {
      const now = Date.now();
      localStorage.setItem("synthetica_classroom_db_updated_at", String(now));

      // 1. Storage backups
      localStorage.setItem("synthetica_classroom_students", JSON.stringify(students));
      localStorage.setItem("synthetica_completed_lessons", JSON.stringify(completedLessons));
      localforage.setItem("synthetica_practical_submissions", submissions).catch(() => {});

      // 2. Sync to server DB
      const payload = {
        students,
        completedLessons,
        submissions,
        __metadata_updated_at: now
      };
      fetch('/api/classroom/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(err => console.error('Failed to sync database with backend', err));
    }
  }, [students, completedLessons, submissions, isLoadedLargeData]);

  // Floating helper states
  const [adminStatusMsg, setAdminStatusMsg] = useState("");

  // Student question inbox state
  const [studentQuestion, setStudentQuestion] = useState("");
  const [questionSent, setQuestionSent] = useState(false);

  const [practicalLink, setPracticalLink] = useState("");
  const [practicalComment, setPracticalComment] = useState("");
  const [practicalSent, setPracticalSent] = useState(false);
  const [testAnswers, setTestAnswers] = useState<Record<string, number>>({});
  const [testSent, setTestSent] = useState(false);
  const [testScore, setTestScore] = useState<{
    score: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    document
      .getElementById("classroom-main-root")
      ?.scrollTo({ top: 0, behavior: "instant" });
  }, [activeModuleId, activeLessonIndex]);

  // Check for multi-device concurrent login conflict
  useEffect(() => {
    if (!currentUser || "role" in currentUser || !isLoadedLargeData) return;

    const checkInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/classroom/data');
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.students)) {
            const serverStudent = data.students.find((s: any) => s.id === (currentUser as Student).id);
            if (serverStudent) {
              const localDeviceId = localStorage.getItem("synthetica_device_id");
              if (serverStudent.currentDeviceId && serverStudent.currentDeviceId !== localDeviceId) {
                // Device mismatch! Logout immediately and show explanation
                handleLogout();
                setLoginError(
                  language === "RU"
                    ? "Вход выполнен с другого устройства или другого браузера. Эта сессия была закрыта, чтобы защитить вашу учетную запись от совместного использования."
                    : "Logged in from another device or browser. This session has been terminated to protect your account from concurrent usage."
                );
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to check concurrent sessions:", err);
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(checkInterval);
  }, [currentUser, isLoadedLargeData, language]);

  // Save complete lessons
  const toggleLessonCompletion = (
    courseId: string,
    moduleId: string,
    lessonIdx: number,
  ) => {
    if (isImpersonating) {
      showError(
        language === "RU"
          ? "Админ: Знания не сохраняются в режиме просмотра"
          : "Admin: Preview mode does not save progress",
      );
      return;
    }
    const studentSuffix =
      currentUser && "id" in currentUser ? currentUser.id : "unknown";
    const key = `${courseId}_${moduleId}_${lessonIdx}_${studentSuffix}`;
    // If it's already completed, do nothing (student cannot uncheck)
    if (completedLessons[key]) return;

    const updated = {
      ...completedLessons,
      [key]: true,
    };
    setCompletedLessons(updated);
    localStorage.setItem(
      "synthetica_completed_lessons",
      JSON.stringify(updated),
    );
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const email = emailInput.trim().toLowerCase();
    const password = passwordInput.trim();

    if (!email || !password) {
      setLoginError(
        language === "RU"
          ? "Пожалуйста, заполните все доступные поля."
          : "Please fill in all available fields.",
      );
      return;
    }

    // 1. Check Admin
    if (email === "admin@synthetica.art" && password === "admin123") {
      const adminObj = {
        id: "admin",
        email: "admin@synthetica.art",
        fullName: "Ирина (Куратор)",
        role: "admin" as const,
      };
      setCurrentUser(adminObj);
      sessionStorage.setItem(
        "synthetica_logged_user",
        JSON.stringify(adminObj),
      );
      return;
    }

    // 2. Check Student list
    const found = students.find(
      (s) => s.email.toLowerCase() === email && s.password === password,
    );
    if (found) {
      // Generate unique device ID for this browser if not exists
      let browserDeviceId = localStorage.getItem("synthetica_device_id");
      if (!browserDeviceId) {
        browserDeviceId = typeof crypto !== "undefined" && crypto.randomUUID 
          ? crypto.randomUUID() 
          : Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem("synthetica_device_id", browserDeviceId);
      }
      
      const updatedStudent = { ...found, currentDeviceId: browserDeviceId };
      
      // Update students list which will trigger active saving state
      setStudents(prev => prev.map(s => s.id === found.id ? updatedStudent : s));
      
      setCurrentUser(updatedStudent);
      sessionStorage.setItem("synthetica_logged_user", JSON.stringify(updatedStudent));
    } else {
      setLoginError(
        language === "RU"
          ? "Пользователь не найден или пароль некорректен. Пожалуйста, проверьте правильность данных или успешную покупку курса."
          : "User not found or password incorrect. Please verify the credentials or confirm successful purchase of the course.",
      );
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem("synthetica_logged_user");
    setActiveCourseId(null);
    setActiveModuleId(null);
    setActiveLessonIndex(0);
    setLoginError(null);
  };

  // Add new student (Admin feature)
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !adminNewEmail.trim() ||
      !adminNewPassword.trim() ||
      !adminNewName.trim()
    ) {
      setAdminStatusMsg(
        language === "RU"
          ? "Заполните Имя, Email и Пароль!"
          : "Fill Name, Email and Password!",
      );
      return;
    }

    // Check duplicate email
    if (
      students.some(
        (s) => s.email.toLowerCase() === adminNewEmail.trim().toLowerCase(),
      )
    ) {
      setAdminStatusMsg(
        language === "RU"
          ? "Ученик с таким Email уже существует!"
          : "Student with this Email already exists!",
      );
      return;
    }

    const newStudent: Student = {
      id: "student_" + Date.now(),
      email: adminNewEmail.trim().toLowerCase(),
      password: adminNewPassword.trim(),
      fullName: adminNewName.trim(),
      allowedCourses: ["course_marketing"], // default course
      allowedModules: {
        course_marketing: ["01", "02", "03"],
      },
    };

    setStudents((prev) => [...prev, newStudent]);
    setSelectedAdminStudentId(newStudent.id);
    setAdminNewName("");
    setAdminNewEmail("");
    setAdminNewPassword("");
    setAdminStatusMsg(
      language === "RU"
        ? "Ученик успешно добавлен // SAVED"
        : "Student added successfully // SAVED",
    );
    setTimeout(() => setAdminStatusMsg(""), 4000);
  };

  // Delete student
  const handleDeleteStudent = (id: string) => {
    if (
      window.confirm(
        language === "RU"
          ? "Вы уверены, что хотите удалить ученика?"
          : "Are you sure you want to delete this student?",
      )
    ) {
      setStudents((prev) => prev.filter((s) => s.id !== id));
      if (selectedAdminStudentId === id) {
        setSelectedAdminStudentId(null);
      }
    }
  };

  // Toggle course access for selected student
  const toggleCourseAccess = (studentId: string, courseId: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;

        const allowedCourses = s.allowedCourses.includes(courseId)
          ? s.allowedCourses.filter((cid) => cid !== courseId)
          : [...s.allowedCourses, courseId];

        // Initialize module access if not exists
        const allowedModules = { ...s.allowedModules };
        if (!allowedModules[courseId]) {
          allowedModules[courseId] = ["01", "02", "03"]; // default access all
        }

        return {
          ...s,
          allowedCourses,
          allowedModules,
        };
      }),
    );
  };

  // Toggle module/section access for selected student
  const toggleModuleAccess = (
    studentId: string,
    courseId: string,
    moduleId: string,
  ) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;

        const allowedModules = { ...s.allowedModules };
        const currentMods = allowedModules[courseId] || [];

        const updatedMods = currentMods.includes(moduleId)
          ? currentMods.filter((m) => m !== moduleId)
          : [...currentMods, moduleId];

        allowedModules[courseId] = updatedMods;

        return {
          ...s,
          allowedModules,
        };
      }),
    );
  };

  // Toggle mentorship member track
  const toggleMentorshipMember = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        return {
          ...s,
          isMentorshipMember: !s.isMentorshipMember,
        };
      }),
    );
  };

  // Toggle bonus course access for selected student
  const toggleBonusCourseAccess = (studentId: string, courseId: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;

        const allowedBonusCourses = s.allowedBonusCourses || [];
        const updatedBonusCourses = allowedBonusCourses.includes(courseId)
          ? allowedBonusCourses.filter((cid) => cid !== courseId)
          : [...allowedBonusCourses, courseId];

        // Initialize module access if not exists
        const allowedBonusModules = { ...(s.allowedBonusModules || {}) };
        if (!allowedBonusModules[courseId]) {
          allowedBonusModules[courseId] = ["01", "02", "03"]; // default access all
        }

        return {
          ...s,
          allowedBonusCourses: updatedBonusCourses,
          allowedBonusModules,
        };
      }),
    );
  };

  // Toggle bonus module/section access for selected student
  const toggleBonusModuleAccess = (
    studentId: string,
    courseId: string,
    moduleId: string,
  ) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;

        const allowedBonusModules = { ...(s.allowedBonusModules || {}) };
        const currentMods = allowedBonusModules[courseId] || [];

        const updatedMods = currentMods.includes(moduleId)
          ? currentMods.filter((m) => m !== moduleId)
          : [...currentMods, moduleId];

        allowedBonusModules[courseId] = updatedMods;

        return {
          ...s,
          allowedBonusModules,
        };
      }),
    );
  };

  // Change student password online
  const updateStudentField = (
    studentId: string,
    field: "fullName" | "email" | "password",
    value: string,
  ) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        return {
          ...s,
          [field]: value,
        };
      }),
    );
  };

  const handleAskQuestion = (courseTitle: string) => {
    if (!studentQuestion.trim()) return;

    // Save to mailbox logs in localstorage
    const currentLogs = localStorage.getItem("site_mailbox_logs");
    let logs = [];
    try {
      logs = currentLogs ? JSON.parse(currentLogs) : [];
    } catch (e) {}

    const newMsg = {
      id: "classroom_q_" + Date.now(),
      name: currentUser?.fullName || "Студент",
      email: currentUser?.email || "N/A",
      topic: `Вопрос по курсу: ${courseTitle}`,
      message: studentQuestion.trim(),
      timestamp: new Date().toLocaleDateString("ru-RU") + " (Classroom)",
    };

    localStorage.setItem(
      "site_mailbox_logs",
      JSON.stringify([newMsg, ...logs]),
    );

    setQuestionSent(true);
    setStudentQuestion("");
    setTimeout(() => setQuestionSent(false), 5000);
  };

  const handleSubmitPractical = () => {
    if (!practicalLink.trim()) return;

    if (isImpersonating) {
      showError(
        language === "RU"
          ? "Админ: Режим просмотра. Практика не отправлена."
          : "Admin: Preview Mode. Submission disabled.",
      );
      setPracticalSent(true);
      return;
    }

    if (activeCourseId && activeModuleId) {
      toggleLessonCompletion(activeCourseId, activeModuleId, activeLessonIndex);
    }

    const moscowTime = new Date().toLocaleString("ru-RU", {
      timeZone: "Europe/Moscow",
    });
    const newSub = {
      id: "sub_" + Date.now(),
      studentId: loggedStudent?.id || "unknown",
      studentName: currentUser?.fullName || "Студент",
      studentEmail: currentUser?.email || "N/A",
      courseTitle: activeCourse?.title || "",
      moduleTitle: currentModule?.titleRu || "",
      link: practicalLink.trim(),
      comment: practicalComment.trim(),
      timestamp: moscowTime + " (MSK)",
    };

    setSubmissions([newSub, ...submissions]);
    setPracticalSent(true);
    setPracticalLink("");
    setPracticalComment("");
    // Remove the timeout so they stay on the success state
  };

  // Get active student config (admin can impersonate or select)
  const isUserAdmin =
    currentUser && "role" in currentUser && currentUser.role === "admin";
  const isImpersonating = isUserAdmin && adminImpersonatedStudentId !== null;
  const loggedStudent = isImpersonating
    ? students.find((s) => s.id === adminImpersonatedStudentId)
    : isUserAdmin
      ? null
      : currentUser
        ? students.find((s) => s.id === (currentUser as any).id) ||
          (currentUser as Student)
        : null;

  // Determine which UI mode to show
  const showAdminUI = isUserAdmin && !isImpersonating;

  // List of courses this logged student can see (only active ones they have access to)
  const studentVisibleCourses = blocks.filter((b) => {
    if (!b.isCourse) return false;
    if (showAdminUI) return true; // admin sees all
    if (!loggedStudent) return false;
    return loggedStudent.allowedCourses.includes(b.id);
  });

  // List of bonus courses this logged student can see
  const studentBonusCourses = blocks.filter((b) => {
    if (!b.isCourse) return false;
    if (showAdminUI) return false; // admin doesn't see inside card, admin manages in matrices
    if (!loggedStudent) return false;
    return (loggedStudent.allowedBonusCourses || []).includes(b.id);
  });

  const activeCourse = activeCourseId
    ? blocks.find((b) => b.id === activeCourseId)
    : null;
  let activeCourseStructure = activeCourseId
    ? COURSES_STRUCTURES[activeCourseId]
    : null;

  if (
    activeCourseId &&
    customCourseConfig[activeCourseId] &&
    customCourseConfig[activeCourseId].modules?.length > 0
  ) {
    const custom = customCourseConfig[activeCourseId];
    activeCourseStructure = {
      courseId: activeCourseId,
      modules: custom.modules.map((mod: any) => ({
        id: mod.id,
        titleRu: mod.titleRu,
        titleEn: mod.titleEn,
        lessons: [
          {
            title:
              mod.type === "practice"
                ? "Практическое задание / Practice"
                : "Урок / Lesson",
            duration: "Custom",
            description: mod.titleRu,
            videoPlaceholderTheme: "from-[#2c3e50] to-[#000000]",
            materials: [],
            isCustom: true,
            customContent: mod,
          },
        ],
      })),
    } as any;
  }

  // Filter modules student has access to
  const getVisibleModules = () => {
    if (!activeCourseStructure) return [];
    if (showAdminUI) return activeCourseStructure.modules; // admin sees all
    if (!loggedStudent) return [];

    // Check if we are playing this course as a bonus or individual
    const isBonusGroup = (loggedStudent.allowedBonusCourses || []).includes(
      activeCourseStructure.courseId,
    );
    const allowedMods = isBonusGroup
      ? loggedStudent.allowedBonusModules?.[activeCourseStructure.courseId] ||
        []
      : loggedStudent.allowedModules[activeCourseStructure.courseId] || [];

    return activeCourseStructure.modules.filter((m) =>
      allowedMods.includes(m.id),
    );
  };

  const visibleModules = getVisibleModules();
  const currentModule = activeModuleId
    ? visibleModules.find((m) => m.id === activeModuleId)
    : visibleModules[0];

  const currentLesson =
    currentModule && currentModule.lessons
      ? currentModule.lessons[activeLessonIndex]
      : null;

  const existingUserSubmission = currentLesson?.isCustom
    ? submissions.find(
        (s) =>
          s.studentId === currentUser?.id &&
          s.courseTitle === activeCourse?.title &&
          (s.moduleTitle === currentLesson.customContent?.titleRu ||
            s.moduleTitle === currentLesson.customContent?.titleEn),
      )
    : null;

  return (
    <>
      <div
        id="classroom-main-root"
        className={`fixed inset-0 bg-[#fafafa] text-neutral-900 z-[200] overflow-y-auto flex flex-col font-sans selection:bg-neutral-900 selection:text-white ${currentLesson?.customContent?.type === "practice" ? "" : "select-none"}`}
      >
        {/* 1. MINIMAL TOP NAV RAIL */}
        <header className="border-b border-neutral-150 bg-white sticky top-0 z-[101] px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (editingCourseId) {
                  setEditingCourseId(null);
                } else if (activeCourseId) {
                  setActiveCourseId(null);
                  setActiveModuleId(null);
                  setActiveLessonIndex(0);
                } else if (isImpersonating) {
                  setAdminImpersonatedStudentId(null);
                } else {
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 text-neutral-500 hover:text-neutral-900 transition-colors text-xs font-mono tracking-wider"
            >
              <ChevronLeft className="w-4 h-4" />
              {editingCourseId
                ? language === "RU"
                  ? "К ПАНЕЛИ АДМИНА"
                  : "BACK TO ADMIN"
                : activeCourseId
                  ? language === "RU"
                    ? "К СПИСКУ КУРСОВ"
                    : "TO COURSES"
                  : isImpersonating
                    ? language === "RU"
                      ? "К ПАНЕЛИ АДМИНА"
                      : "BACK TO ADMIN"
                    : language === "RU"
                      ? "ВЕРНУТЬСЯ НА САЙТ"
                      : "BACK TO SITE"}
            </button>

            <div className="h-4 w-[1px] bg-neutral-200" />

            <span className="text-[10px] font-mono tracking-[0.25em] text-neutral-400 font-extrabold uppercase hidden md:inline">
              {editingCourseId
                ? language === "RU"
                  ? "РЕДАКТОР КУРСА"
                  : "COURSE BUILDER"
                : activeCourseId
                  ? language === "RU"
                    ? `КУРС // ${activeCourse?.title}`
                    : `COURSE // ${activeCourse?.title}`
                  : "SYNTHETICA CLASSROOM"}
            </span>

            {isImpersonating && (
              <>
                <div className="h-4 w-[1px] bg-neutral-200" />
                <button
                  onClick={() => {
                    setAdminImpersonatedStudentId(null);
                    setActiveCourseId(null);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 bg-[#0284c7] hover:bg-[#0369a1] text-white transition-colors text-xs font-mono font-bold uppercase tracking-wider"
                >
                  <User className="w-3.5 h-3.5" />
                  {language === "RU" ? "РЕЖИМ АДМИНА" : "BACK TO ADMIN"}
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            {currentUser && (
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end hidden sm:block">
                  <span className="text-[10px] font-bold tracking-tight text-neutral-900 uppercase">
                    {currentUser.fullName}
                  </span>
                  <span className="text-[8px] font-mono text-neutral-400 font-medium">
                    {isUserAdmin ? "CURATOR" : currentUser.email}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-1 px-2.5 border border-red-250 bg-red-50 hover:bg-red-100 hover:text-red-700 transition duration-200 text-red-600 font-mono text-[9px] tracking-wider uppercase flex items-center gap-1.5"
                >
                  <LogOut className="w-3 h-3" />
                  <span>{language === "RU" ? "ВЫХОД" : "OUT"}</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* 2. AUTHENTICATION VIEW */}
        {!currentUser && (
          <main className="flex-grow flex items-center justify-center py-16 px-4 bg-neutral-50 relative">
            <div className="absolute top-10 left-1/2 -translate-x-1/2 text-center pointer-events-none select-none opacity-20">
              <span className="font-mono text-[120px] font-black tracking-tighter block text-neutral-300">
                STUDENT
              </span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md bg-white border border-neutral-200/80 p-8 shadow-2xl relative z-10 rounded-none"
            >
              <div className="text-center mb-8">
                <span className="text-[10px] tracking-[0.3em] font-mono text-neutral-400 uppercase font-black">
                  {language === "RU"
                    ? "УЧЕБНЫЙ КАБИНЕТ // SYNTHETICA"
                    : "SYNTHETICA INTERACTIVE ACADEMY"}
                </span>
                <h2 className="text-2xl font-mono tracking-tighter text-neutral-950 mt-2 font-bold uppercase">
                  {language === "RU"
                    ? "Вход в класс"
                    : "STUDENT CLASSROOM LOGIN"}
                </h2>
                <div className="h-0.5 w-12 bg-neutral-950 mx-auto mt-3" />
              </div>

              {loginError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-none text-xs leading-relaxed flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                  <div>
                    <p className="font-mono font-bold uppercase text-[9px] tracking-wider mb-1 text-red-800">
                      {language === "RU"
                        ? "ОШИБКА ДУБЛИРОВАНИЯ ИЛИ ДОСТУПА"
                        : "AUTH EXCEPTION ERROR"}
                    </p>
                    <span>{loginError}</span>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-mono tracking-wider text-neutral-500 uppercase font-bold mb-1.5">
                    EMAIL *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => {
                        setEmailInput(e.target.value);
                        setLoginError(null);
                      }}
                      placeholder="name@domain.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 text-sm focus:outline-none focus:border-neutral-950 focus:ring-0 rounded-none bg-neutral-50/50"
                    />
                  </div>
                  <p className="text-[7.5px] font-mono text-neutral-400 mt-1 uppercase">
                    {language === "RU"
                      ? "* введите email, указанный при покупке или выданный куратором"
                      : "* specify the exact email registered during course purchase"}
                  </p>
                </div>

                <div>
                  <label className="block text-[9px] font-mono tracking-wider text-neutral-500 uppercase font-bold mb-1.5">
                    {language === "RU" ? "ПАРОЛЬ *" : "PASSWORD *"}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        setLoginError(null);
                      }}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 text-sm focus:outline-none focus:border-neutral-950 focus:ring-0 rounded-none bg-neutral-50/50"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-neutral-950 text-white hover:bg-neutral-900 transition-colors duration-200 text-xs font-mono font-bold uppercase tracking-[0.2em]"
                  >
                    {language === "RU"
                      ? "ПОДДКЛЮЧИТЬСЯ // SIGN IN ↗"
                      : "AUTHORIZE IN CLASSROOM ↗"}
                  </button>
                </div>
              </form>

              <div className="mt-8 border-t border-neutral-150 pt-5 text-center flex flex-col gap-3">
                <a
                  href="https://t.me/syntheticajpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-mono font-black text-neutral-500 hover:text-neutral-950 transition-colors uppercase tracking-wider underline underline-offset-4 block"
                >
                  {language === "RU" ? "Свяжитесь со мной" : "Contact Me"}
                </a>
              </div>
            </motion.div>
          </main>
        )}

        {/* 3. CORE LOGGED IN CONTENT (either Admin or authorized view) */}
        {currentUser && (
          <div className="flex-grow flex flex-col md:flex-row">
            {/* ======================================================================= */}
            {/* ADMIN INTERACTIVE CONTROL PANEL (Irina can personally assign student rights) */}
            {/* ======================================================================= */}
            {showAdminUI ? (
              <main className="flex-grow flex flex-col bg-neutral-50 h-full">
                {/* Admin Tabs */}
                <div className="flex border-b border-neutral-200 bg-white">
                  <button
                    onClick={() => setAdminTab("students")}
                    className={`px-6 py-4 text-xs font-mono font-bold uppercase tracking-wider border-r border-neutral-200 ${adminTab === "students" ? "bg-indigo-50 text-indigo-700" : "text-neutral-500 hover:bg-neutral-50"}`}
                  >
                    {language === "RU" ? "Студенты" : "Students"}
                  </button>
                  <button
                    onClick={() => setAdminTab("courses")}
                    className={`px-6 py-4 text-xs font-mono font-bold uppercase tracking-wider border-r border-neutral-200 ${adminTab === "courses" ? "bg-indigo-50 text-indigo-700" : "text-neutral-500 hover:bg-neutral-50"}`}
                  >
                    {language === "RU"
                      ? "Управление курсами"
                      : "Course Builder"}
                  </button>
                  <button
                    onClick={() => setAdminTab("homeBlocks")}
                    className={`px-6 py-4 text-xs font-mono font-bold uppercase tracking-wider border-r border-neutral-200 ${adminTab === "homeBlocks" ? "bg-indigo-50 text-indigo-700" : "text-neutral-500 hover:bg-neutral-50"}`}
                  >
                    {language === "RU" ? "Главная страница" : "Home Page"}
                  </button>
                  <button
                    onClick={() => setAdminTab("submissions")}
                    className={`px-6 py-4 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border-r border-neutral-200 ${adminTab === "submissions" ? "bg-indigo-50 text-indigo-700" : "text-neutral-500 hover:bg-neutral-50"}`}
                  >
                    <Inbox className="w-4 h-4" />
                    {language === "RU" ? "Практические задания" : "Submissions"}
                    {submissions.filter((s: any) => !s.read).length > 0 && (
                      <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[8px]">
                        {submissions.filter((s: any) => !s.read).length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setAdminTab("welcomeForm")}
                    className={`px-6 py-4 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border-r border-neutral-200 ${adminTab === "welcomeForm" ? "bg-indigo-50 text-indigo-700" : "text-neutral-500 hover:bg-neutral-50"}`}
                  >
                    <Mail className="w-4 h-4" />
                    {language === "RU" ? "Сбор email" : "Emails"}
                  </button>
                  <button
                    onClick={() => setAdminTab("payments")}
                    className={`px-6 py-4 text-xs font-mono font-bold uppercase tracking-wider border-r border-neutral-200 ${adminTab === "payments" ? "bg-indigo-50 text-indigo-700" : "text-neutral-500 hover:bg-neutral-50"}`}
                  >
                    {language === "RU" ? "Оплата" : "Payments"}
                  </button>
                </div>

                <div className="flex-grow flex flex-col lg:flex-row h-full overflow-hidden">
                  {adminTab === "students" && (
                    <>
                      {/* Left Student manager list column */}
                      <section className="w-full lg:w-[450px] border-r border-neutral-200 bg-white p-6 flex flex-col overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="font-mono text-xs font-black tracking-wider text-neutral-900 uppercase">
                            {language === "RU"
                              ? "СПИСОК УЧЕНИКОВ И КЛАССОВ"
                              : "REGISTERED STUDENTS LIST"}
                          </h3>
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-neutral-100 text-neutral-600 font-bold uppercase">
                            {students.length}{" "}
                            {language === "RU" ? "учебн." : "stud."}
                          </span>
                        </div>

                        {/* Add new student mini form */}
                        <form
                          onSubmit={handleAddStudent}
                          className="mb-6 p-4 border border-indigo-100 bg-indigo-50/20 space-y-3"
                        >
                          <span className="text-[9px] font-mono font-bold tracking-widest text-[#5046e5] block uppercase">
                            +{" "}
                            {language === "RU"
                              ? "ЗАРЕГИСТРИРОВАТЬ НОВОГО УЧЕНИКА"
                              : "ADD NEW STUDENT TO REPOSITORY"}
                          </span>

                          {adminStatusMsg && (
                            <div className="p-2 border border-indigo-200 bg-white text-[9.5px] font-mono text-indigo-700">
                              {adminStatusMsg}
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input
                              type="text"
                              required
                              placeholder={
                                language === "RU"
                                  ? "Имя пользователя"
                                  : "Full student name"
                              }
                              value={adminNewName}
                              onChange={(e) => setAdminNewName(e.target.value)}
                              className="p-1 px-2 border border-neutral-200 text-xs text-neutral-800 bg-white focus:outline-none"
                            />
                            <input
                              type="email"
                              required
                              placeholder="email@synthetica.art"
                              value={adminNewEmail}
                              onChange={(e) => setAdminNewEmail(e.target.value)}
                              className="p-1 px-2 border border-neutral-200 text-xs text-neutral-800 bg-white focus:outline-none"
                            />
                            <input
                              type="text"
                              required
                              placeholder={
                                language === "RU" ? "Пароль" : "Password"
                              }
                              value={adminNewPassword}
                              onChange={(e) =>
                                setAdminNewPassword(e.target.value)
                              }
                              className="p-1 px-2 border border-neutral-200 text-xs text-neutral-800 bg-white focus:outline-none"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full py-1.5 bg-indigo-650 text-white font-mono text-[9px] hover:bg-[#cbdc19] hover:text-neutral-950 transition tracking-wider uppercase font-black"
                          >
                            {language === "RU"
                              ? "ДОБАВИТЬ УЧЕНИКА"
                              : "CREATE PORTAL ACCESS"}
                          </button>
                        </form>

                        {/* Students scroll view */}
                        <div className="space-y-2.5">
                          {students.map((s) => {
                            const isSelected = selectedAdminStudentId === s.id;
                            const countAllowed = s.allowedCourses.length;

                            return (
                              <div
                                key={s.id}
                                onClick={() => setSelectedAdminStudentId(s.id)}
                                className={`p-4 border text-left cursor-pointer transition ${
                                  isSelected
                                    ? "border-neutral-950 bg-neutral-950 text-white shadow-md"
                                    : "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50"
                                }`}
                              >
                                <div className="flex justify-between items-start gap-2">
                                  <div>
                                    <h4 className="font-mono text-xs font-black uppercase tracking-tight">
                                      {s.fullName}
                                    </h4>
                                    <p
                                      className={`text-[8.5px] font-mono ${isSelected ? "text-neutral-300" : "text-neutral-500"} mt-0.5`}
                                    >
                                      {s.email}
                                    </p>
                                  </div>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteStudent(s.id);
                                    }}
                                    className={`p-1 transition ${isSelected ? "text-red-400 hover:text-red-350" : "text-neutral-400 hover:text-red-650"}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="mt-3 pt-3 border-t border-neutral-150 flex flex-wrap gap-2 justify-between items-center text-[7.5px] font-mono uppercase tracking-wider">
                                  <span
                                    className={
                                      isSelected
                                        ? "text-neutral-400"
                                        : "text-neutral-500"
                                    }
                                  >
                                    {language === "RU" ? "КУРСЫ:" : "COURSES:"}{" "}
                                    <strong
                                      className={
                                        isSelected
                                          ? "text-white"
                                          : "text-neutral-900"
                                      }
                                    >
                                      {countAllowed}
                                    </strong>
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.5 rounded-none font-extrabold ${isSelected ? "bg-white/10 text-white" : "bg-neutral-100 text-neutral-800"}`}
                                  >
                                    {language === "RU"
                                      ? "УЧЕН. ЗАПИСЬ"
                                      : "LEDGER ACCOUNT"}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </section>

                      {/* Right Detail Access Mapping Config */}
                      <section className="flex-grow p-8 max-h-[calc(100vh-68px)] overflow-y-auto">
                        {selectedAdminStudentId ? (
                          (() => {
                            const s = students.find(
                              (x) => x.id === selectedAdminStudentId,
                            );
                            if (!s) return null;

                            return (
                              <div className="bg-white border border-neutral-200 p-8 space-y-8 shadow-sm">
                                <div className="border-b border-neutral-150 pb-5">
                                  <span className="text-[10px] tracking-widest font-mono text-neutral-400 block mb-1">
                                    {language === "RU"
                                      ? "ПЕРСОНАЛЬНЫЕ НАСТРОЙКИ ДОСТУПА"
                                      : "INDIVIDUAL PRIVILEGE MAPPING"}
                                  </span>
                                  <h3 className="text-xl font-mono text-neutral-950 font-black uppercase tracking-tight">
                                    {s.fullName}
                                  </h3>
                                  <p className="font-mono text-xs text-neutral-400 mt-1">
                                    {s.email}
                                  </p>
                                </div>

                                {/* Interactive Student detail modifications */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-neutral-150 pb-6">
                                  <div>
                                    <label className="block text-[8px] font-mono tracking-wider font-bold text-neutral-400 mb-1">
                                      ФИО УЧЕНИКА // DISPLAY NAME
                                    </label>
                                    <input
                                      type="text"
                                      value={s.fullName}
                                      onChange={(e) =>
                                        updateStudentField(
                                          s.id,
                                          "fullName",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full text-xs p-2 border border-neutral-200 font-mono text-neutral-800 bg-neutral-50"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[8px] font-mono tracking-wider font-bold text-neutral-400 mb-1">
                                      ПАРОЛЬ УЧЕНИКА // LOGIN KEY
                                    </label>
                                    <input
                                      type="text"
                                      value={s.password}
                                      onChange={(e) =>
                                        updateStudentField(
                                          s.id,
                                          "password",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full text-xs p-2 border border-neutral-200 font-mono text-neutral-800 bg-neutral-50"
                                    />
                                  </div>
                                </div>

                                {/* Mentorship Program Student Designation */}
                                <div className="p-4 border border-indigo-200 bg-indigo-50/15 flex items-start gap-4 justify-between flex-wrap sm:flex-nowrap mb-4 font-mono">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 bg-indigo-650 rounded-full inline-block" />
                                      <span className="font-mono text-xs font-black uppercase text-indigo-950 tracking-wide">
                                        {language === "RU"
                                          ? "ТАРИФ: ПРОГРАММА НАСТАВНИЧЕСТВА"
                                          : "TIER: MENTORSHIP PROGRAM PARTICIPANT"}
                                      </span>
                                    </div>
                                    <p className="text-[10.5px] leading-relaxed text-neutral-505 font-mono">
                                      {language === "RU"
                                        ? '✦ Включение этой опции разделяет личный кабинет ученика на два блока: "Индивидуальные курсы" (куда вы можете выбрать и добавить абсолютно любой курс и гибко отметить видимые модули/подпункты) и блок "Бонусные материалы" (куда вы также можете отправить абсолютно любой курс и индивидуальные модули).'
                                        : '✦ Activating this tier divides the dashboard: "Individual core courses" and "Bonus materials" – giving you dynamic course and module mapping in both!'}
                                    </p>
                                  </div>

                                  <div className="flex-shrink-0 flex items-center h-full pt-1">
                                    <input
                                      type="checkbox"
                                      id={`mentorship-status-${s.id}`}
                                      checked={!!s.isMentorshipMember}
                                      onChange={() =>
                                        toggleMentorshipMember(s.id)
                                      }
                                      className="w-5 h-5 text-indigo-650 border-indigo-300 focus:ring-0 rounded-none cursor-pointer"
                                    />
                                  </div>
                                </div>

                                {/* Course Access Matrix (Dynamic Individual + Dynamic Bonus) */}
                                <div className="space-y-8 mb-6">
                                  {/* SECTION 1: INDIVIDUAL COURSES CONTROL */}
                                  <div>
                                    <div className="flex items-center gap-2 mb-3 border-b border-neutral-150 pb-2">
                                      <BookOpen className="w-4 h-4 text-neutral-800" />
                                      <h4 className="font-mono text-[11px] font-black uppercase tracking-wider text-neutral-900">
                                        {language === "RU"
                                          ? "1. ИНДИВИДУАЛЬНЫЙ КУРС (ОСНОВНОЕ ОБУЧЕНИЕ)"
                                          : "1. INDIVIDUAL COURSE (CORE CURRICULUM)"}
                                      </h4>
                                    </div>

                                    <p className="text-[10px] text-neutral-500 leading-relaxed mb-4 font-mono">
                                      {language === "RU"
                                        ? "✦ Выберите абсолютно любой курс и гибко отметьте, какие именно учебные модули и подпункты будут отображаться в личном кабинете ученика как индивидуальные:"
                                        : "✦ Select any course and toggle exactly which syllabus modules/sub-items will render on the student dashboard as individual courses:"}
                                    </p>

                                    <div className="space-y-4">
                                      {blocks
                                        .filter((block) => block.isCourse)
                                        .map((block) => {
                                          const isAllowed =
                                            s.allowedCourses.includes(block.id);
                                          let structure =
                                            COURSES_STRUCTURES[block.id];
                                          if (
                                            customCourseConfig[block.id] &&
                                            customCourseConfig[block.id].modules
                                              ?.length > 0
                                          ) {
                                            structure = {
                                              courseId: block.id,
                                              modules: customCourseConfig[
                                                block.id
                                              ].modules.map((m: any) => ({
                                                id: m.id,
                                                titleRu: m.titleRu,
                                                titleEn: m.titleEn,
                                                lessons: [
                                                  {
                                                    title: "Custom",
                                                    duration: "0",
                                                    description: "",
                                                    videoPlaceholderTheme: "",
                                                    materials: [],
                                                  },
                                                ],
                                              })),
                                            } as any;
                                          }
                                          const studentIndivMods =
                                            s.allowedModules[block.id] || [];

                                          // Compute progress
                                          let totalCount = 0;
                                          let completedCount = 0;
                                          if (structure && isAllowed) {
                                            structure.modules.forEach((mod) => {
                                              if (
                                                studentIndivMods.includes(
                                                  mod.id,
                                                )
                                              ) {
                                                mod.lessons.forEach(
                                                  (_, lIndex) => {
                                                    totalCount++;
                                                    if (
                                                      completedLessons[
                                                        `${block.id}_${mod.id}_${lIndex}_${s.id}`
                                                      ]
                                                    ) {
                                                      completedCount++;
                                                    }
                                                  },
                                                );
                                              }
                                            });
                                          }
                                          const progressPercent =
                                            totalCount > 0
                                              ? Math.round(
                                                  (completedCount /
                                                    totalCount) *
                                                    100,
                                                )
                                              : 0;

                                          return (
                                            <div
                                              key={`indiv-${block.id}`}
                                              className={`border ${isAllowed ? "border-neutral-300 bg-white" : "border-neutral-200 bg-neutral-50/20 opacity-60"} p-4 transition-all duration-200`}
                                            >
                                              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                                                <div className="flex items-center gap-3">
                                                  <input
                                                    type="checkbox"
                                                    id={`access-course-indiv-${block.id}`}
                                                    checked={isAllowed}
                                                    onChange={() =>
                                                      toggleCourseAccess(
                                                        s.id,
                                                        block.id,
                                                      )
                                                    }
                                                    className="w-4.5 h-4.5 text-neutral-950 border-neutral-300 focus:ring-0 rounded-none cursor-pointer"
                                                  />
                                                  <div>
                                                    <label
                                                      htmlFor={`access-course-indiv-${block.id}`}
                                                      className="font-mono text-xs font-black uppercase tracking-tight text-neutral-900 cursor-pointer hover:underline"
                                                    >
                                                      {block.title}
                                                    </label>
                                                    <span className="text-[8px] font-mono bg-neutral-100 text-neutral-500 px-1.5 py-0.5 ml-2 font-black uppercase tracking-widest leading-none">
                                                      {block.id === "contact_me"
                                                        ? "PINTEREST"
                                                        : block.id
                                                            .replace(
                                                              "course_",
                                                              "",
                                                            )
                                                            .toUpperCase()}
                                                    </span>
                                                  </div>
                                                </div>

                                                <span
                                                  className={`text-[8px] font-mono font-bold uppercase tracking-wider ${isAllowed ? "text-green-600 bg-green-50 px-1.5 py-0.5" : "text-neutral-400 bg-neutral-100 px-1.5 py-0.5"}`}
                                                >
                                                  {isAllowed
                                                    ? language === "RU"
                                                      ? "ИНДИВИДУАЛЬНО ОТКРЫТ"
                                                      : "GRANTED"
                                                    : language === "RU"
                                                      ? "ЗАКРЫТ"
                                                      : "BLOCKED"}
                                                </span>
                                              </div>

                                              {isAllowed && structure && (
                                                <div className="mt-3 pl-7 border-t border-dashed border-neutral-200 pt-3 space-y-4">
                                                  {/* Course Progress */}
                                                  <div className="space-y-1">
                                                    <div className="flex justify-between items-center text-[7.5px] font-mono uppercase tracking-widest font-black">
                                                      <span className="text-neutral-500">
                                                        {language === "RU"
                                                          ? "ПРОГРЕСС ОСВОЕНИЯ КУРСА"
                                                          : "COURSE PROGRESS"}
                                                      </span>
                                                      <span className="text-neutral-900">
                                                        {progressPercent}%
                                                      </span>
                                                    </div>
                                                    <div className="w-full bg-neutral-200 h-1">
                                                      <div
                                                        className="bg-[#cbdc19] h-1 transition-all"
                                                        style={{
                                                          width: `${progressPercent}%`,
                                                        }}
                                                      />
                                                    </div>
                                                  </div>

                                                  <div className="space-y-2">
                                                    <span className="text-[7.5px] font-mono text-neutral-400 uppercase tracking-widest font-black block">
                                                      {language === "RU"
                                                        ? "НАСТРОЙКА МОДУЛЕЙ И ПОДПУНКТОВ:"
                                                        : "CONFIG MODULES & SYLLABI:"}
                                                    </span>

                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                      {structure.modules.map(
                                                        (mod) => {
                                                          const isModAllowed =
                                                            studentIndivMods.includes(
                                                              mod.id,
                                                            );

                                                          return (
                                                            <div
                                                              key={`indiv-${block.id}-${mod.id}`}
                                                              onClick={() =>
                                                                toggleModuleAccess(
                                                                  s.id,
                                                                  block.id,
                                                                  mod.id,
                                                                )
                                                              }
                                                              className={`p-2 border cursor-pointer select-none transition flex items-center justify-between gap-1.5 ${
                                                                isModAllowed
                                                                  ? "bg-neutral-950 text-white border-neutral-950 font-normal shadow-sm"
                                                                  : "bg-[#fafafa] text-neutral-400 border-neutral-200 hover:bg-neutral-100"
                                                              }`}
                                                            >
                                                              <div className="truncate text-left">
                                                                <span className="text-[7px] font-mono block opacity-60 leading-none mb-1">
                                                                  {language ===
                                                                  "RU"
                                                                    ? `МОДУЛЬ ${mod.id}`
                                                                    : `MODULE ${mod.id}`}
                                                                </span>
                                                                <span className="text-[9px] font-mono font-bold truncate block">
                                                                  {language ===
                                                                  "RU"
                                                                    ? mod.titleRu.replace(
                                                                        /МОДУЛЬ \d+\s*\/\/\s*/,
                                                                        "",
                                                                      )
                                                                    : mod.titleEn.replace(
                                                                        /MODULE \d+\s*\/\/\s*/,
                                                                        "",
                                                                      )}
                                                                </span>
                                                              </div>

                                                              <div className="flex-shrink-0">
                                                                {isModAllowed ? (
                                                                  <div className="bg-[#cbdc19] text-neutral-950 p-[1.5px] rounded-none">
                                                                    <Check className="w-3 h-3" />
                                                                  </div>
                                                                ) : (
                                                                  <div className="w-3.5 h-3.5 border border-neutral-300 rounded-none bg-white" />
                                                                )}
                                                              </div>
                                                            </div>
                                                          );
                                                        },
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                    </div>
                                  </div>

                                  {/* SECTION 2: BONUS MATERIALS & COURSES CONTROL */}
                                  <div>
                                    <div className="flex items-center gap-2 mb-3 border-b border-amber-200 pb-2">
                                      <Gift className="w-4 h-4 text-amber-600" />
                                      <h4 className="font-mono text-[11px] font-black uppercase tracking-wider text-amber-950">
                                        {language === "RU"
                                          ? "2. БОНУСНЫЙ КУРС И МАТЕРИАЛЫ"
                                          : "2. BONUS COURSE & REWARDS"}
                                      </h4>
                                    </div>

                                    <div className="space-y-4">
                                      {blocks
                                        .filter((block) => block.isCourse)
                                        .map((block) => {
                                          const allowedBonusCourses =
                                            s.allowedBonusCourses || [];
                                          const isAllowed =
                                            allowedBonusCourses.includes(
                                              block.id,
                                            );
                                          let structure =
                                            COURSES_STRUCTURES[block.id];
                                          if (
                                            customCourseConfig[block.id] &&
                                            customCourseConfig[block.id].modules
                                              ?.length > 0
                                          ) {
                                            structure = {
                                              courseId: block.id,
                                              modules: customCourseConfig[
                                                block.id
                                              ].modules.map((m: any) => ({
                                                id: m.id,
                                                titleRu: m.titleRu,
                                                titleEn: m.titleEn,
                                                lessons: [
                                                  {
                                                    title: "Custom",
                                                    duration: "0",
                                                    description: "",
                                                    videoPlaceholderTheme: "",
                                                    materials: [],
                                                  },
                                                ],
                                              })),
                                            } as any;
                                          }
                                          const allowedBonusModules =
                                            s.allowedBonusModules || {};
                                          const studentBonusMods =
                                            allowedBonusModules[block.id] || [];

                                          // Compute progress
                                          let totalCount = 0;
                                          let completedCount = 0;
                                          if (structure && isAllowed) {
                                            structure.modules.forEach((mod) => {
                                              if (
                                                studentBonusMods.includes(
                                                  mod.id,
                                                )
                                              ) {
                                                mod.lessons.forEach(
                                                  (_, lIndex) => {
                                                    totalCount++;
                                                    if (
                                                      completedLessons[
                                                        `${block.id}_${mod.id}_${lIndex}_${s.id}`
                                                      ]
                                                    ) {
                                                      completedCount++;
                                                    }
                                                  },
                                                );
                                              }
                                            });
                                          }
                                          const progressPercent =
                                            totalCount > 0
                                              ? Math.round(
                                                  (completedCount /
                                                    totalCount) *
                                                    100,
                                                )
                                              : 0;

                                          return (
                                            <div
                                              key={`bonus-${block.id}`}
                                              className={`border ${isAllowed ? "border-amber-300 bg-[#fdfdf7]/60" : "border-neutral-200 bg-neutral-50/30 opacity-60"} p-4 transition-all duration-200`}
                                            >
                                              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                                                <div className="flex items-center gap-3">
                                                  <input
                                                    type="checkbox"
                                                    id={`access-course-bonus-${block.id}`}
                                                    checked={isAllowed}
                                                    onChange={() =>
                                                      toggleBonusCourseAccess(
                                                        s.id,
                                                        block.id,
                                                      )
                                                    }
                                                    className="w-4.5 h-4.5 text-amber-600 border-amber-300 focus:ring-0 rounded-none cursor-pointer"
                                                  />
                                                  <div>
                                                    <label
                                                      htmlFor={`access-course-bonus-${block.id}`}
                                                      className="font-mono text-xs font-black uppercase tracking-tight text-neutral-900 cursor-pointer hover:underline"
                                                    >
                                                      {block.title}
                                                    </label>
                                                    <span className="text-[8px] font-mono bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 ml-2 font-black uppercase tracking-widest leading-none">
                                                      {block.id === "contact_me"
                                                        ? "PINTEREST"
                                                        : block.id
                                                            .replace(
                                                              "course_",
                                                              "",
                                                            )
                                                            .toUpperCase()}
                                                    </span>
                                                  </div>
                                                </div>

                                                <span
                                                  className={`text-[8px] font-mono font-bold uppercase tracking-wider ${isAllowed ? "text-amber-800 bg-amber-50 px-1.5 py-0.5" : "text-neutral-400 bg-neutral-100 px-1.5 py-0.5"}`}
                                                >
                                                  {isAllowed
                                                    ? language === "RU"
                                                      ? "ОТКРЫТ КАК БОНУС"
                                                      : "BONUS GRANTED"
                                                    : language === "RU"
                                                      ? "ЗАКРЫТ"
                                                      : "BLOCKED"}
                                                </span>
                                              </div>

                                              {isAllowed && structure && (
                                                <div className="mt-3 pl-7 border-t border-dashed border-amber-100 pt-3 space-y-4">
                                                  {/* Course Progress */}
                                                  <div className="space-y-1">
                                                    <div className="flex justify-between items-center text-[7.5px] font-mono uppercase tracking-widest font-black">
                                                      <span className="text-amber-700/70">
                                                        {language === "RU"
                                                          ? "ПРОГРЕСС ОСВОЕНИЯ КУРСА"
                                                          : "COURSE PROGRESS"}
                                                      </span>
                                                      <span className="text-amber-900">
                                                        {progressPercent}%
                                                      </span>
                                                    </div>
                                                    <div className="w-full bg-amber-100 h-1">
                                                      <div
                                                        className="bg-amber-500 h-1 transition-all"
                                                        style={{
                                                          width: `${progressPercent}%`,
                                                        }}
                                                      />
                                                    </div>
                                                  </div>

                                                  <div className="space-y-2">
                                                    <span className="text-[7.5px] font-mono text-amber-700 uppercase tracking-widest font-black block">
                                                      {language === "RU"
                                                        ? "НАСТРОЙКА БОНУСНЫХ МОДУЛЕЙ И ПОДПУНКТОВ:"
                                                        : "CONFIG BONUS MODULES & SYLLABI:"}
                                                    </span>

                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                      {structure.modules.map(
                                                        (mod) => {
                                                          const isModAllowed =
                                                            studentBonusMods.includes(
                                                              mod.id,
                                                            );

                                                          return (
                                                            <div
                                                              key={`bonus-${block.id}-${mod.id}`}
                                                              onClick={() =>
                                                                toggleBonusModuleAccess(
                                                                  s.id,
                                                                  block.id,
                                                                  mod.id,
                                                                )
                                                              }
                                                              className={`p-2 border cursor-pointer select-none transition flex items-center justify-between gap-1.5 ${
                                                                isModAllowed
                                                                  ? "bg-amber-900 text-white border-amber-900 font-normal shadow-sm"
                                                                  : "bg-white text-neutral-400 border-neutral-200 hover:bg-neutral-50"
                                                              }`}
                                                            >
                                                              <div className="truncate text-left">
                                                                <span className="text-[7px] font-mono block opacity-60 leading-none mb-1">
                                                                  {language ===
                                                                  "RU"
                                                                    ? `МОДУЛЬ ${mod.id}`
                                                                    : `MODULE ${mod.id}`}
                                                                </span>
                                                                <span className="text-[9px] font-mono font-bold truncate block">
                                                                  {language ===
                                                                  "RU"
                                                                    ? mod.titleRu.replace(
                                                                        /МОДУЛЬ \d+\s*\/\/\s*/,
                                                                        "",
                                                                      )
                                                                    : mod.titleEn.replace(
                                                                        /MODULE \d+\s*\/\/\s*/,
                                                                        "",
                                                                      )}
                                                                </span>
                                                              </div>

                                                              <div className="flex-shrink-0">
                                                                {isModAllowed ? (
                                                                  <div className="bg-[#cbdc19] text-neutral-950 p-[1.5px] rounded-none">
                                                                    <Check className="w-3 h-3" />
                                                                  </div>
                                                                ) : (
                                                                  <div className="w-3.5 h-3.5 border border-neutral-200 rounded-none bg-white" />
                                                                )}
                                                              </div>
                                                            </div>
                                                          );
                                                        },
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                    </div>
                                  </div>
                                </div>

                                {/* Impersonate actions */}
                                <div className="border-t border-neutral-150 pt-5 flex justify-end">
                                  <button
                                    onClick={() => {
                                      // To preview user experience immediately
                                      setAdminImpersonatedStudentId(s.id);
                                      setActiveCourseId(null);
                                    }}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-[10px] tracking-widest font-black uppercase transition-all whitespace-nowrap"
                                  >
                                    👁️{" "}
                                    {language === "RU"
                                      ? "ПРЕВЬЮ КАБИНЕТА УЧЕНИКА"
                                      : "IMPERSONATE LESSONS PLAYER"}
                                  </button>
                                </div>
                              </div>
                            );
                          })()
                        ) : (
                          <div className="h-96 w-full flex flex-col justify-center items-center border border-dashed border-neutral-300 bg-white p-8 font-mono text-center">
                            <User className="w-10 h-10 text-neutral-300 mb-3" />
                            <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-1">
                              {language === "RU"
                                ? "ВЫБЕРИТЕ УЧЕНИКА ДЛЯ НАСТРОЙКИ"
                                : "SELECT STUDENT TO MANAGE CLIENT"}
                            </h3>
                            <p className="text-[10px] text-neutral-400 max-w-sm">
                              {language === "RU"
                                ? "Здесь вы можете гибко настраивать доступы к конкретным обучающим курсам и модулям для каждого зарегистрированного ящика."
                                : "Choose a student card from the left side panel list to allocate access permissions to their specific portfolio blocks & modules."}
                            </p>
                          </div>
                        )}
                      </section>
                    </>
                  )}

                  {adminTab === "courses" && (
                    <section className="w-full flex-1 bg-white p-8 overflow-y-auto">
                      <div className="flex justify-between items-center border-b border-neutral-200 pb-4 mb-6">
                        <h2 className="text-xl font-mono font-black uppercase text-neutral-900">
                          {language === "RU"
                            ? "Редактор контента курсов"
                            : "Course Builder"}
                        </h2>
                        <button
                          onClick={() => {
                            const newId = `course_${Date.now()}`;
                            if (setCustomHomeBlocksConfig) {
                              setCustomHomeBlocksConfig((prev) => ({
                                ...prev,
                                [newId]: {
                                  id: newId,
                                  isCourse: true,
                                  title:
                                    language === "RU"
                                      ? "НОВЫЙ КУРС"
                                      : "NEW COURSE",
                                  subtitle:
                                    language === "RU"
                                      ? "Описание курса"
                                      : "Course description",
                                  image:
                                    "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=800&auto=format&fit=crop",
                                  colorTheme: "#9a8cf2",
                                  badge: "NEW COURSE",
                                },
                                __extra_courses__: [
                                  ...((prev.__extra_courses__ as string[]) ||
                                    []),
                                  newId,
                                ],
                              }));
                            }
                            setEditingCourseId(newId);
                          }}
                          className="bg-neutral-900 text-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
                        >
                          +{" "}
                          {language === "RU" ? "СОЗДАТЬ КУРС" : "CREATE COURSE"}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {blocks
                          .filter((b) => b.isCourse)
                          .map((block) => (
                            <div
                              key={block.id}
                              className="border border-neutral-200 bg-neutral-50 overflow-hidden flex flex-col"
                            >
                              <div className="aspect-[5/3] overflow-hidden">
                                <img
                                  src={
                                    customCourseConfig[block.id]?.coverImage ||
                                    block.image ||
                                    undefined
                                  }
                                  alt={block.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="p-4 flex flex-col flex-1">
                                <h3 className="font-mono text-xs font-black uppercase text-neutral-900 mb-2">
                                  {block.title}
                                </h3>
                                <p className="text-[10px] text-neutral-500 line-clamp-2 mb-4 flex-1">
                                  {block.subtitle}
                                </p>
                                <div className="flex flex-col gap-2 mt-auto">
                                  <button
                                    onClick={() => setEditingCourseId(block.id)}
                                    className="w-full bg-[#0284c7] hover:bg-[#0369a1] text-white text-[10px] font-mono font-bold uppercase tracking-wider py-2 flex justify-center items-center gap-2"
                                  >
                                    <PenTool className="w-3 h-3" />
                                    {language === "RU"
                                      ? "РЕДАКТИРОВАТЬ МОДУЛИ"
                                      : "EDIT MODULES"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </section>
                  )}

                  {adminTab === "homeBlocks" && (
                    <section className="w-full flex-1 bg-white p-8 overflow-y-auto">
                      <h2 className="text-xl font-mono font-black uppercase text-neutral-900 mb-6 border-b border-neutral-200 pb-4">
                        {language === "RU"
                          ? "Главная страница: Карточки"
                          : "Home Page Cards"}
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {blocks.map((block) => (
                          <div
                            key={block.id}
                            className="border border-neutral-200 bg-neutral-50 overflow-hidden flex flex-col"
                          >
                            <div className="aspect-[5/3] overflow-hidden">
                              <img
                                src={block.image || undefined}
                                alt={block.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-4 flex flex-col flex-1">
                              <h3 className="font-mono text-xs font-black uppercase text-neutral-900 mb-2">
                                {block.title}
                              </h3>
                              <p className="text-[10px] text-neutral-500 line-clamp-2 mb-4 flex-1">
                                {block.subtitle}
                              </p>
                              <div className="flex flex-col gap-2 mt-auto">
                                <button
                                  onClick={() =>
                                    setEditingHomeBlockId(block.id)
                                  }
                                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white text-[10px] font-mono font-bold uppercase tracking-wider py-2 flex justify-center items-center gap-2"
                                >
                                  <PenTool className="w-3 h-3" />
                                  {language === "RU"
                                    ? "РЕДАКТИРОВАТЬ КАРТОЧКУ"
                                    : "EDIT HOME CARD"}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {adminTab === "submissions" && (
                    <section className="w-full flex-1 bg-white p-8 overflow-y-auto">
                      <h2 className="text-xl font-mono font-black uppercase text-neutral-900 mb-6 border-b border-neutral-200 pb-4">
                        {language === "RU"
                          ? "Входящие задания от студентов"
                          : "Student Submissions Inbox"}
                      </h2>
                      {submissions.length === 0 ? (
                        <div className="text-center py-20 text-neutral-400 font-mono text-xs uppercase tracking-wider">
                          {language === "RU"
                            ? "НЕТ НОВЫХ ЗАДАНИЙ"
                            : "NO NEW SUBMISSIONS"}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {submissions.map((sub, idx) => (
                            <div
                              key={sub.id || idx}
                              className="border border-neutral-200 p-6 bg-neutral-50 flex flex-col gap-4"
                            >
                              <div className="flex justify-between items-start border-b border-neutral-200 pb-4">
                                <div className="flex items-center gap-3">
                                  {!sub.read && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0 mt-1" />
                                  )}
                                  <div>
                                    <h3 className="font-mono text-sm font-black uppercase text-neutral-900">
                                      {sub.studentName}
                                    </h3>
                                    <p className="text-[10px] font-mono text-neutral-500 mt-1">
                                      <span className="uppercase text-neutral-400 mr-2">
                                        {language === "RU"
                                          ? "Email:"
                                          : "Email:"}
                                      </span>{" "}
                                      {sub.studentEmail}
                                    </p>
                                    <p className="text-[10px] font-mono text-neutral-500 uppercase mt-1">
                                      {language === "RU"
                                        ? "Курс: "
                                        : "Course: "}
                                      {sub.courseTitle} <br />
                                      {language === "RU"
                                        ? "Модуль: "
                                        : "Module: "}
                                      {sub.moduleTitle}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <span
                                    className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 font-bold ${sub.type === "test" ? "text-emerald-700 bg-emerald-100" : "text-blue-700 bg-blue-100"}`}
                                  >
                                    {sub.type === "test"
                                      ? language === "RU"
                                        ? "ТЕСТ"
                                        : "TEST"
                                      : language === "RU"
                                        ? "ПРАКТИКА"
                                        : "PRACTICE"}
                                  </span>
                                  <span className="text-[9px] font-mono text-neutral-400">
                                    {sub.timestamp}
                                  </span>
                                </div>
                              </div>

                              {sub.type === "test" ? (
                                <div className="p-4 bg-white border border-neutral-200 text-center space-y-4">
                                  <div className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider">
                                    {language === "RU"
                                      ? "РЕЗУЛЬТАТ ТЕСТА"
                                      : "TEST RESULT"}
                                  </div>
                                  <div className="text-3xl font-black font-mono text-neutral-900">
                                    {sub.testScore} / {sub.testTotal}
                                  </div>
                                  <div>
                                    <button
                                      onClick={() => {
                                        markSubmissionAsRead(sub.id);
                                        setViewingTestSubmission(sub);
                                      }}
                                      className="inline-block bg-neutral-900 text-white px-6 py-2.5 text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-neutral-800"
                                    >
                                      {language === "RU"
                                        ? "ОТКРЫТЬ ОТВЕТЫ УЧЕНИКА ↗"
                                        : "VIEW ANSWERS ↗"}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  {sub.comment && sub.comment.trim() && (
                                    <p className="text-xs text-neutral-700 leading-relaxed mb-4 p-4 bg-white border border-neutral-200 italic">
                                      "{sub.comment}"
                                    </p>
                                  )}
                                  <a
                                    href={sub.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => markSubmissionAsRead(sub.id)}
                                    className="inline-block bg-neutral-900 text-white px-6 py-2.5 text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-neutral-800"
                                  >
                                    {language === "RU"
                                      ? "ОТКРЫТЬ ССЫЛКУ УЧЕНИКА ↗"
                                      : "OPEN LINK ↗"}
                                  </a>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  )}

                  {adminTab === "welcomeForm" && (
                    <WelcomeFormAdmin language={language} />
                  )}

                  {adminTab === "payments" && (
                    <section className="w-full flex-1 bg-white p-8 overflow-y-auto">
                      <h2 className="text-xl font-mono font-black uppercase text-neutral-900 mb-6 border-b border-neutral-200 pb-4">
                        {language === "RU"
                          ? "Запросы на оплату товара (CRM)"
                          : "Payment Requests (CRM)"}
                      </h2>
                      <PaymentsCRMTable language={language} />

                      <h2 className="text-xl font-mono font-black uppercase text-neutral-900 mt-12 mb-6 border-b border-neutral-200 pb-4">
                        {language === "RU"
                          ? "Ручная генерация ссылок на оплату"
                          : "Manual Payment Links"}
                      </h2>

                      <div className="max-w-xl border border-neutral-200 p-6 bg-neutral-50 shadow-sm relative">
                        <PaymentLinkGenerator language={language} />
                      </div>
                    </section>
                  )}
                </div>

                {editingCourseId && (
                  <CourseBuilder
                    course={blocks.find((b) => b.id === editingCourseId)!}
                    onClose={() => setEditingCourseId(null)}
                    customConfig={customCourseConfig[editingCourseId] || {}}
                    onSaveConfig={(config) => {
                      setCustomCourseConfig((prev) => ({
                        ...prev,
                        [editingCourseId]: config,
                        __metadata_updated_at: Date.now(),
                      }));
                    }}
                    language={language}
                  />
                )}

                <HomeBlockEditorModal
                  isOpen={!!editingHomeBlockId}
                  onClose={() => setEditingHomeBlockId(null)}
                  block={blocks.find((x) => x.id === editingHomeBlockId) || null}
                  customHomeBlocksConfig={customHomeBlocksConfig || {}}
                  onSave={(updatedConfig) => {
                    if (setCustomHomeBlocksConfig && editingHomeBlockId) {
                      setCustomHomeBlocksConfig((prev) => ({
                        ...prev,
                        [editingHomeBlockId]: updatedConfig,
                      }));
                    }
                    setEditingHomeBlockId(null);
                  }}
                  language={language}
                />
              </main>
            ) : (
              /* ======================================================================= */
              /* STUDENT INTERACTIVE DASHBOARD & LESSONS WORKSPACE */
              /* ======================================================================= */
              <main className="flex-grow flex flex-col bg-[#fafafa]">
                {!activeCourseId ? (
                  /* Courses Selection Screen for single student */
                  <section className="max-w-6xl mx-auto w-full p-8 md:p-14 space-y-10">
                    <div className="border-b border-neutral-200 pb-6 flex justify-between items-center flex-wrap gap-4">
                      <div>
                        <span className="text-[10.5px] font-mono tracking-[0.25em] text-[#0284c7] font-bold uppercase">
                          {language === "RU"
                            ? "ЛИЧНЫЙ КАБИНЕТ СТУДЕНТА // SYNTHETICA"
                            : "STUDENT CLASSROOM PLATFORM"}
                        </span>
                        <h2 className="text-3xl font-mono text-neutral-900 tracking-tighter mt-1 font-black uppercase">
                          {language === "RU"
                            ? "Мои Классы & Обучение"
                            : "My Active Authorized Syllabi"}
                        </h2>
                      </div>

                      <div className="px-4 py-2 border border-neutral-200 bg-white font-mono text-xs text-neutral-500 rounded-none flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                        <span>
                          {language === "RU"
                            ? `Ваш доступ: ${studentVisibleCourses.length} курсов`
                            : `Privileges: ${studentVisibleCourses.length} active courses`}
                        </span>
                      </div>
                    </div>

                    {studentVisibleCourses.length === 0 ? (
                      <div className="text-center py-20 border border-dashed border-neutral-200 bg-white p-8 font-mono">
                        <BookOpen className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                        <h3 className="text-base font-bold text-neutral-600 uppercase tracking-widest mb-2">
                          {language === "RU"
                            ? "ВАМ ЕЩЕ НЕ ПРЕДОСТАВИЛИ ДОСТУП"
                            : "ACCESS NOT YET PROVIDED"}
                        </h3>
                        <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                          {language === "RU"
                            ? "Доступ предоставляется в течение 12 часов после оплаты. Рабочее время куратора курса с 11:00 до 18:00 по московскому времени."
                            : "Access is granted within 12 hours after payment. Curator working hours are from 11:00 to 18:00 Moscow time."}
                        </p>

                        {/* No state for contactTriggered - direct link used instead */}
                        <div className="mt-8">
                          <a
                            href="https://t.me/syntheticajpg"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-6 py-2.5 bg-neutral-950 text-white font-mono text-[9px] uppercase tracking-widest font-black"
                          >
                            {language === "RU"
                              ? "СВЯЗАТЬСЯ С ИРИНОЙ // SUPPORT"
                              : "COORDINATE REGISTRATION"}
                          </a>
                        </div>
                      </div>
                    ) : (
                      /* ======== ENHANCED MENTORSHIP VIEW CONTAINS TWO POWERFUL BLOCKS ======== */
                      <div className="space-y-12 text-left">
                        {/* Premium Mentorship Indicator Badge banner */}
                        {loggedStudent?.isMentorshipMember ? (
                          <div className="bg-gradient-to-r from-neutral-900 to-indigo-950 text-white p-6 md:p-8 border-l-4 border-[#cbdc19] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg rounded-none">
                            <div>
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                                <span className="text-[9px] font-mono tracking-[0.25em] text-[#cbdc19] font-black uppercase">
                                  {language === "RU"
                                    ? "ПРИВАТНЫЙ ТАРИФ // ИНДИВИДУАЛЬНОЕ НАСТАВНИЧЕСТВО"
                                    : "ACADEMY PRIVATE MEMBER // INDIVIDUAL MENTORSHIP"}
                                </span>
                              </div>
                              <h3 className="text-xl md:text-2xl font-mono uppercase font-black text-white m-0">
                                {language === "RU"
                                  ? `Кураторский план: ${loggedStudent.fullName}`
                                  : `Curator Workspace for: ${loggedStudent.fullName}`}
                              </h3>
                              <p className="text-xs text-neutral-300 font-light mt-1.5 max-w-2xl">
                                {language === "RU"
                                  ? "Вам открыт доступ по специальной программе сопровождения до коммерческого результата. Ниже представлены индивидуальные курсы, а также все бонусные материалы вашего тарифа."
                                  : "You are registered under our professional 1-on-1 mentorship track. Below are customized adaptive syllabus pieces opened for you by Irina."}
                              </p>
                            </div>
                            <div className="flex-shrink-0 flex items-center gap-2 bg-white/10 px-4 py-2 border border-white/20 font-mono text-xs font-bold text-white uppercase">
                              <Sparkles className="w-4 h-4 text-[#cbdc19] animate-pulse" />
                              <span>
                                {language === "RU" ? "VIP ТАРИФ" : "VIP STATUS"}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-[#171717] text-white p-6 md:p-8 border-l-4 border-neutral-400 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md rounded-none">
                            <div>
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full inline-block" />
                                <span className="text-[9px] font-mono tracking-[0.25em] text-neutral-300 font-black uppercase">
                                  {language === "RU"
                                    ? "ИНДИВИДУАЛЬНОЕ ОБУЧЕНИЕ // БАЗОВЫЙ ТАРИФ"
                                    : "INDIVIDUAL TRAINING MODULES"}
                                </span>
                              </div>
                              <h3 className="text-xl md:text-2xl font-mono uppercase font-black text-white m-0">
                                {language === "RU"
                                  ? `Учебный кабинет: ${loggedStudent?.fullName}`
                                  : `Study Plan for: ${loggedStudent?.fullName}`}
                              </h3>
                              <p className="text-xs text-neutral-400 font-light mt-1.5 max-w-2xl">
                                {language === "RU"
                                  ? "Ниже представлены ваши основные курсы, а также все бонусные материалы вашего тарифа, открываемые куратором индивидуально."
                                  : "Below are your customized educational assets and administrative bonus elements, unlocked by curator."}
                              </p>
                            </div>
                            <div className="flex-shrink-0 flex items-center gap-2 bg-white/5 px-4 py-2 border border-white/10 font-mono text-xs font-bold text-neutral-300 uppercase">
                              <Sparkles className="w-4 h-4 text-neutral-400" />
                              <span>
                                {language === "RU"
                                  ? "СТАНДАРТ ТАРИФ"
                                  : "STANDARD STATUS"}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* The Grid / Layout for the 2 blocks:
                          - Card/Block A: "Индивидуальные курсы"
                          - Card/Block B: "Бонусы и Гайды"
                      */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                          {/* ==============================================
                            BLOCK 1: ИНДИВИДУАЛЬНЫЕ КУРСЫ
                            ============================================== */}
                          <div className="bg-white border border-neutral-200 p-6 space-y-6">
                            <div className="border-b border-neutral-150 pb-4 flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="p-1 px-2.5 font-mono text-xs font-black text-white bg-neutral-900 leading-none">
                                  01
                                </div>
                                <div>
                                  <h3 className="font-mono text-xs font-black uppercase text-neutral-900 tracking-wider">
                                    {language === "RU"
                                      ? "ИНДИВИДУАЛЬНЫЕ КУРСЫ"
                                      : "INDIVIDUAL CURRICULUM"}
                                  </h3>
                                  <p className="text-[10px] text-neutral-400 font-mono uppercase mt-0.5">
                                    {language === "RU"
                                      ? "Материалы и модули, открытые куратором вручную"
                                      : "Syllabi sections authorized by your educator"}
                                  </p>
                                </div>
                              </div>
                              <span className="text-[9px] font-mono px-2 py-0.5 bg-neutral-100 text-neutral-600 font-bold uppercase">
                                {studentVisibleCourses.length}{" "}
                                {language === "RU" ? "блоков" : "opened"}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {studentVisibleCourses.map((block) => {
                                const studentMods =
                                  loggedStudent?.allowedModules[block.id] || [];

                                let structure = COURSES_STRUCTURES[block.id];
                                if (
                                  customCourseConfig[block.id] &&
                                  customCourseConfig[block.id].modules?.length >
                                    0
                                ) {
                                  structure = {
                                    courseId: block.id,
                                    modules:
                                      customCourseConfig[block.id].modules,
                                  };
                                }
                                const actualMods =
                                  structure?.modules?.filter((m) =>
                                    studentMods.includes(m.id),
                                  ) || [];
                                const allowedModsCount = actualMods.length;

                                return (
                                  <div
                                    key={block.id}
                                    onClick={() => {
                                      let firstValidModIdx = 0;
                                      for (
                                        let i = 0;
                                        i < actualMods.length;
                                        i++
                                      ) {
                                        const mod = actualMods[i];
                                        const isCompleted =
                                          mod.type === "practice" ||
                                          mod.type === "test"
                                            ? !!completedLessons[
                                                `${block.id}_${mod.id}_0_${currentUser?.id || ""}`
                                              ]
                                            : mod.lessons &&
                                              mod.lessons.every(
                                                (_, idx) =>
                                                  completedLessons[
                                                    `${block.id}_${mod.id}_${idx}_${currentUser?.id || ""}`
                                                  ],
                                              );
                                        const isLocked =
                                          (mod.type === "practice" ||
                                            mod.type === "test") &&
                                          isCompleted;
                                        if (!isLocked) {
                                          firstValidModIdx = i;
                                          break;
                                        }
                                      }

                                      setActiveCourseId(block.id);
                                      setActiveModuleId(
                                        actualMods.length > 0
                                          ? actualMods[firstValidModIdx].id
                                          : null,
                                      );
                                      setActiveLessonIndex(0);
                                    }}
                                    className="border border-neutral-200 bg-neutral-50/30 hover:bg-neutral-50 p-3 sm:p-4 cursor-pointer hover:border-neutral-850 transition flex flex-col justify-between group"
                                  >
                                    <div>
                                      <div className="aspect-[5/3] overflow-hidden relative mb-3">
                                        <img
                                          src={
                                            customCourseConfig[block.id]
                                              ?.coverImage ||
                                            block.image ||
                                            undefined
                                          }
                                          alt={block.title}
                                          className="w-full h-full object-cover duration-300 filter saturate-90"
                                        />
                                        <div className="absolute inset-0 bg-black/5" />
                                      </div>
                                      <h4 className="font-mono text-[10px] sm:text-xs font-black uppercase text-neutral-900 group-hover:text-[#5046e5] duration-200 line-clamp-2 sm:line-clamp-1">
                                        {block.title}
                                      </h4>
                                      <p className="text-[9px] sm:text-[11px] text-neutral-400 font-light mt-1 w-full truncate">
                                        {block.subtitle}
                                      </p>
                                    </div>

                                    <div className="mt-3 sm:mt-4 pt-3 border-t border-neutral-150 flex items-center justify-between text-[7px] sm:text-[8px] font-mono uppercase tracking-wider text-neutral-400">
                                      <span className="font-bold text-neutral-800 hidden sm:inline">
                                        {language === "RU"
                                          ? `Модулей: ${allowedModsCount}`
                                          : `Modules: ${allowedModsCount}`}
                                      </span>
                                      <span className="font-bold text-neutral-800 sm:hidden">
                                        {language === "RU"
                                          ? `${allowedModsCount} МОД.`
                                          : `${allowedModsCount} MOD.`}
                                      </span>
                                      <span className="text-[#0284c7] font-black group-hover:underline font-mono">
                                        {language === "RU"
                                          ? "ОТКРЫТЬ ↗"
                                          : "STUDY ↗"}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* ==============================================
                            BLOCK 2: БОНУСНЫЕ КУРСЫ И МАТЕРИАЛЫ
                            ============================================== */}
                          <div className="bg-white border border-neutral-200 p-6 space-y-6">
                            <div className="border-b border-neutral-150 pb-4 flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="p-1 px-2.5 font-mono text-xs font-black text-neutral-950 bg-[#cbdc19] leading-none">
                                  02
                                </div>
                                <div>
                                  <h3 className="font-mono text-xs font-black uppercase text-neutral-900 tracking-wider">
                                    {language === "RU"
                                      ? "БОНУСНЫЕ МАТЕРИАЛЫ"
                                      : "REWARD BONUSES"}
                                  </h3>
                                  <p className="text-[10px] text-neutral-400 font-mono uppercase mt-0.5">
                                    {language === "RU"
                                      ? "Подарки и закрытые материалы"
                                      : "Curated premium rewards & exclusive assets"}
                                  </p>
                                </div>
                              </div>
                              <span className="text-[8px] font-mono px-2 py-0.5 bg-[#cbdc19]/15 text-[#5e690c] font-black uppercase tracking-wider">
                                VIP BONUS
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {studentBonusCourses.length === 0 ? (
                                <div className="col-span-2 text-center py-10 border border-dashed border-neutral-200 bg-neutral-50/50 p-6 font-mono text-xs">
                                  <BookOpen className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                                  <span className="text-neutral-500 uppercase tracking-widest block font-bold">
                                    {language === "RU"
                                      ? "НЕТ ДОСТУПНЫХ БОНУСОВ"
                                      : "NO BONUS COURSE DISPATCHED"}
                                  </span>
                                  <span className="text-[10px] text-neutral-400 block mt-1 uppercase">
                                    {language === "RU"
                                      ? "Куратор еще не назначил бонусные курсы"
                                      : "Curator has not assigned bonus courses"}
                                  </span>
                                </div>
                              ) : (
                                studentBonusCourses.map((block) => {
                                  const allowedBonusModules =
                                    loggedStudent?.allowedBonusModules || {};
                                  const bonusMods =
                                    allowedBonusModules[block.id] || [];

                                  let structure = COURSES_STRUCTURES[block.id];
                                  if (
                                    customCourseConfig[block.id] &&
                                    customCourseConfig[block.id].modules
                                      ?.length > 0
                                  ) {
                                    structure = {
                                      courseId: block.id,
                                      modules:
                                        customCourseConfig[block.id].modules,
                                    };
                                  }
                                  const actualMods =
                                    structure?.modules?.filter((m) =>
                                      bonusMods.includes(m.id),
                                    ) || [];
                                  const allowedModsCount = actualMods.length;

                                  return (
                                    <div
                                      key={`student-bonus-${block.id}`}
                                      className="border border-neutral-200 bg-[#fafdf6]/40 hover:bg-[#fafdf6]/90 p-3 sm:p-4 transition-all duration-250 flex flex-col justify-between group relative overflow-hidden cursor-pointer"
                                      onClick={() => {
                                        let firstValidModIdx = 0;
                                        for (
                                          let i = 0;
                                          i < actualMods.length;
                                          i++
                                        ) {
                                          const mod = actualMods[i];
                                          const isCompleted =
                                            mod.type === "practice" ||
                                            mod.type === "test"
                                              ? !!completedLessons[
                                                  `${block.id}_${mod.id}_0_${currentUser?.id || ""}`
                                                ]
                                              : mod.lessons &&
                                                mod.lessons.every(
                                                  (_, idx) =>
                                                    completedLessons[
                                                      `${block.id}_${mod.id}_${idx}_${currentUser?.id || ""}`
                                                    ],
                                                );
                                          const isLocked =
                                            (mod.type === "practice" ||
                                              mod.type === "test") &&
                                            isCompleted;
                                          if (!isLocked) {
                                            firstValidModIdx = i;
                                            break;
                                          }
                                        }

                                        setActiveCourseId(block.id);
                                        setActiveModuleId(
                                          actualMods.length > 0
                                            ? actualMods[firstValidModIdx].id
                                            : null,
                                        );
                                        setActiveLessonIndex(0);
                                      }}
                                    >
                                      <div className="absolute top-0 right-0 p-1 px-1.5 sm:px-2 text-[6.5px] sm:text-[7.5px] font-mono tracking-wider font-extrabold text-amber-850 bg-amber-50/80 border-b border-l border-amber-100 uppercase z-10 w-fit">
                                        {language === "RU" ? "БОНУС" : "BONUS"}
                                      </div>
                                      <div className="space-y-3">
                                        <div className="aspect-[5/3] overflow-hidden relative">
                                          <img
                                            src={
                                              customCourseConfig[block.id]
                                                ?.coverImage ||
                                              block.image ||
                                              undefined
                                            }
                                            alt={block.title}
                                            className="w-full h-full object-cover duration-300 filter saturate-90"
                                            referrerPolicy="no-referrer"
                                          />
                                          <div className="absolute inset-0 bg-black/5" />
                                        </div>
                                        <h4 className="font-mono text-[10px] sm:text-xs font-black uppercase text-neutral-900 mt-2 line-clamp-2 sm:line-clamp-1">
                                          {block.title}
                                        </h4>
                                        <p className="text-[9px] sm:text-[11px] text-neutral-400 font-light w-full truncate leading-snug">
                                          {block.subtitle}
                                        </p>
                                      </div>

                                      <div className="mt-3 sm:mt-4 pt-3 border-t border-neutral-150 flex items-center justify-between text-[7px] sm:text-[8px] font-mono uppercase tracking-wider text-neutral-400">
                                        <span className="font-bold text-neutral-700 hidden sm:inline">
                                          {language === "RU"
                                            ? `Модулей: ${allowedModsCount}`
                                            : `Modules: ${allowedModsCount}`}
                                        </span>
                                        <span className="font-bold text-neutral-700 sm:hidden">
                                          {language === "RU"
                                            ? `${allowedModsCount} МОД.`
                                            : `${allowedModsCount} MOD.`}
                                        </span>
                                        <span className="text-amber-800 font-black group-hover:underline cursor-pointer">
                                          {language === "RU"
                                            ? "ИЗУЧАТЬ ⚡"
                                            : "STUDY ⚡"}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </section>
                ) : (
                  /* Dynamic Interactive Syllabus Player view */
                  <section className="flex-grow flex flex-col max-h-[calc(100vh-68px)] overflow-hidden relative">
                    {isSyllabusOpen && (
                      <div className="absolute inset-0 z-50 flex justify-end">
                        <div
                          className="absolute inset-0 bg-neutral-900/20 backdrop-blur-sm"
                          onClick={() => setIsSyllabusOpen(false)}
                        />
                        <aside className="w-full sm:w-[400px] border-l border-neutral-200 bg-white flex flex-col h-full shadow-2xl relative z-10 animate-fade-in custom-scrollbar">
                          <div className="p-6 border-b border-neutral-150 sticky top-0 bg-white z-10 flex justify-between items-center">
                            <div>
                              <h3 className="font-mono text-xs font-black uppercase text-neutral-900 tracking-wider">
                                {language === "RU"
                                  ? "ОГЛАВЛЕНИЕ КУРСА"
                                  : "COURSE SYLLABUS"}
                              </h3>
                              <p className="text-[10px] text-neutral-500 font-mono mt-1 w-full truncate font-light flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5" />
                                {activeCourse?.title}
                              </p>
                            </div>
                            <button
                              onClick={() => setIsSyllabusOpen(false)}
                              className="p-2 hover:bg-neutral-100 rounded"
                            >
                              <X className="w-5 h-5 text-neutral-500" />
                            </button>
                          </div>

                          <div className="divide-y divide-neutral-100 flex-grow font-sans overflow-y-auto">
                            {visibleModules.map((mod, modIdx) => {
                              const isActiveMod = activeModuleId === mod.id;

                              // Check if this module is fully completed
                              const allLessonsCompleted =
                                mod.lessons &&
                                mod.lessons.every(
                                  (_, lIdx) =>
                                    completedLessons[
                                      `${activeCourseId}_${mod.id}_${lIdx}_${currentUser?.id || ""}`
                                    ],
                                );
                              const isCompleted =
                                mod.type === "practice" || mod.type === "test"
                                  ? !!completedLessons[
                                      `${activeCourseId}_${mod.id}_0_${currentUser?.id || ""}`
                                    ]
                                  : allLessonsCompleted;

                              // Check if student can navigate here (must be completed or active or next available if previous was completed)
                              // Basically they can only click on completed ones or the currently active one (which should be the last available uncompleted one or one they returned to)
                              // Wait, let's keep it simple: allow clicking completed ones, and the current activeModuleId.
                              // However, we need to find the "furthest" module they have reached.
                              // We can just allow if (isCompleted) or (isActiveMod) or (they reached it).
                              // Actually, just evaluating clicking based on previous module completion.
                              const prevMod =
                                modIdx > 0 ? visibleModules[modIdx - 1] : null;
                              const prevModCompleted =
                                !prevMod ||
                                (prevMod.lessons &&
                                  prevMod.lessons.every(
                                    (_, lIdx) =>
                                      completedLessons[
                                        `${activeCourseId}_${prevMod.id}_${lIdx}_${currentUser?.id || ""}`
                                      ],
                                  ));

                              const isPracticeOrTest =
                                mod.type === "practice" || mod.type === "test";
                              const canClick =
                                isCompleted || isActiveMod || prevModCompleted;

                              return (
                                <div
                                  key={mod.id}
                                  className={`flex flex-col ${!canClick ? "opacity-50" : ""}`}
                                >
                                  <button
                                    disabled={!canClick}
                                    onClick={() => {
                                      setActiveModuleId(mod.id);
                                      setActiveLessonIndex(0);
                                      setIsSyllabusOpen(false);
                                    }}
                                    className={`w-full text-left p-4 pr-6 flex items-start gap-3 transition-colors ${
                                      isActiveMod
                                        ? "bg-neutral-50"
                                        : canClick
                                          ? "bg-white hover:bg-neutral-50/50"
                                          : "bg-neutral-50/50 cursor-not-allowed"
                                    }`}
                                  >
                                    <div className="mt-1">
                                      {isCompleted ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                      ) : (
                                        <div
                                          className={`font-mono text-[10px] font-bold ${isActiveMod ? "text-[#0284c7]" : "text-neutral-400"}`}
                                        >
                                          {(modIdx + 1)
                                            .toString()
                                            .padStart(2, "0")}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-grow">
                                      <div
                                        className={`font-mono text-xs font-black uppercase leading-tight ${isActiveMod ? "text-neutral-900" : "text-neutral-600"}`}
                                      >
                                        {language === "RU"
                                          ? mod.titleRu
                                          : mod.titleEn}
                                      </div>
                                      <div className="text-[10px] text-neutral-400 mt-1 uppercase tracking-wider font-mono">
                                        {mod.type === "test"
                                          ? "ТЕСТ"
                                          : mod.type === "practice"
                                            ? "ПРАКТИКА"
                                            : "МОДУЛЬ"}
                                      </div>
                                    </div>
                                  </button>
                                </div>
                              );
                            })}
                            {visibleModules.length === 0 && (
                              <div className="p-6 text-center text-[10px] font-mono text-neutral-400">
                                {language === "RU"
                                  ? "Модули не найдены"
                                  : "No modules accessible"}
                              </div>
                            )}
                          </div>
                        </aside>
                      </div>
                    )}

                    {/* Main screen lessons interactive player space */}
                    <main className="flex-grow p-6 md:p-10 max-h-[calc(100vh-68px)] overflow-y-auto space-y-8 w-full bg-[#fafafa]">
                      {currentLesson ? (
                        (() => {
                          const currentModIndex = visibleModules.findIndex(
                            (m) => m.id === activeModuleId,
                          );
                          let nextMod = null;
                          for (
                            let i = currentModIndex + 1;
                            i < visibleModules.length;
                            i++
                          ) {
                            const potentialNext = visibleModules[i];
                            const isCompleted =
                              potentialNext.type === "practice" ||
                              potentialNext.type === "test"
                                ? !!completedLessons[
                                    `${activeCourseId}_${potentialNext.id}_0_${currentUser?.id || ""}`
                                  ]
                                : potentialNext.lessons &&
                                  potentialNext.lessons.every(
                                    (_, idx) =>
                                      completedLessons[
                                        `${activeCourseId}_${potentialNext.id}_${idx}_${currentUser?.id || ""}`
                                      ],
                                  );
                            const isLocked =
                              (potentialNext.type === "practice" ||
                                potentialNext.type === "test") &&
                              isCompleted;
                            if (!isLocked) {
                              nextMod = potentialNext;
                              break;
                            }
                          }
                          const hasNextModule = !!nextMod;
                          const nextIsPractice =
                            hasNextModule &&
                            (nextMod?.lessons?.[0]?.customContent?.type ===
                              "practice" ||
                              nextMod?.lessons?.[0]?.title
                                ?.toLowerCase()
                                .includes("practice") ||
                              nextMod?.titleRu
                                ?.toLowerCase()
                                .includes("практик") ||
                              nextMod?.titleEn
                                ?.toLowerCase()
                                .includes("practice"));
                          const showAskCurator = currentLesson.isCustom
                            ? !!currentLesson.customContent.askCuratorEnabled
                            : true;
                          const isPracticeOrTest =
                            currentLesson.isCustom &&
                            (currentLesson.customContent.type === "practice" ||
                              currentLesson.customContent.type === "test");

                          // Count progress
                          let finishedMods = 0;
                          visibleModules.forEach((m) => {
                            const allLessDone =
                              m.lessons &&
                              m.lessons.every(
                                (_, i) =>
                                  completedLessons[
                                    `${activeCourseId}_${m.id}_${i}_${currentUser?.id || ""}`
                                  ],
                              );
                            if (allLessDone) finishedMods++;
                          });

                          return (
                            <div className="max-w-4xl mx-auto space-y-8">
                              <div className="flex flex-col gap-4 border-b border-neutral-150 pb-6">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#0284c7] font-black">
                                    {language === "RU"
                                      ? "ТЕКУЩИЙ УРОК"
                                      : "CURRENT LESSON"}
                                  </span>
                                  <div className="flex items-center gap-4">
                                    <div className="hidden sm:flex flex-col gap-1.5 items-end">
                                      <div className="text-[9px] font-mono font-bold text-neutral-400">
                                        {language === "RU"
                                          ? "ПРОГРЕСС КУРСА"
                                          : "COURSE PROGRESS"}{" "}
                                        (
                                        {Math.round(
                                          (finishedMods /
                                            Math.max(
                                              1,
                                              visibleModules.length,
                                            )) *
                                            100,
                                        )}
                                        %)
                                      </div>
                                      <div className="w-32 h-1 bg-neutral-200 overflow-hidden">
                                        <div
                                          className="h-full bg-emerald-500 transition-all duration-500"
                                          style={{
                                            width: `${(finishedMods / Math.max(1, visibleModules.length)) * 100}%`,
                                          }}
                                        />
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => setIsSyllabusOpen(true)}
                                      className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-[10px] font-mono font-bold uppercase hover:bg-neutral-800 transition-colors shadow-sm"
                                    >
                                      <BookOpen className="w-3.5 h-3.5" />
                                      {language === "RU"
                                        ? "ОГЛАВЛЕНИЕ КУРСА"
                                        : "SYLLABUS"}
                                      <span className="ml-2 px-1.5 bg-white/20">
                                        {finishedMods}/{visibleModules.length}
                                      </span>
                                    </button>
                                  </div>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-mono tracking-tighter text-neutral-900 font-extrabold uppercase">
                                  {currentLesson.isCustom
                                    ? language === "RU"
                                      ? currentLesson.customContent?.titleRu
                                      : currentLesson.customContent?.titleEn
                                    : currentLesson.title}
                                </h2>
                              </div>

                              {currentLesson.isCustom ? (
                                <div className="w-full bg-white border border-neutral-200 shadow-md">
                                  {currentLesson.customContent.mediaType ===
                                    "video" &&
                                  !currentLesson.customContent.mediaData?.startsWith(
                                    "data:image/",
                                  ) ? (
                                    currentLesson.customContent.mediaData ? (
                                      <video
                                        src={
                                          currentLesson.customContent
                                            .mediaData || undefined
                                        }
                                        controls
                                        className="w-full aspect-video bg-black"
                                      />
                                    ) : (
                                      <div className="aspect-video w-full bg-neutral-900 flex items-center justify-center text-white">
                                        {language === "RU"
                                          ? "ВИДЕО НЕ ЗАГРУЖЕНО"
                                          : "NO VIDEO UPLOADED"}
                                      </div>
                                    )
                                  ) : currentLesson.customContent.mediaData ? (
                                    <img
                                      src={
                                        currentLesson.customContent.mediaData ||
                                        undefined
                                      }
                                      alt="Custom Module Content"
                                      className="w-full h-auto object-contain bg-white min-h-[300px]"
                                    />
                                  ) : (
                                    <div className="aspect-video w-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                                      {language === "RU"
                                        ? "КОНТЕНТ НЕ ЗАГРУЖЕН"
                                        : "NO CONTENT UPLOADED"}
                                    </div>
                                  )}

                                  {currentLesson.customContent.type ===
                                    "practice" && (
                                    <div className="p-8 border-t border-neutral-200 bg-neutral-50/50 space-y-6">
                                      <div className="p-4 bg-indigo-50 border-l-4 border-indigo-500 text-indigo-900 text-xs font-mono leading-relaxed">
                                        {language === "RU"
                                          ? "Загрузите результат вашей работы ссылкой на диск с возможностью скачивания. Заранее удостоверьтесь, что доступ к просмотру и скачиванию предоставлен."
                                          : "Upload the result of your work as a link to a drive with downloading enabled. Please ensure viewing and downloading access is granted."}
                                      </div>

                                      {existingUserSubmission ||
                                      practicalSent ? (
                                        <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-800 text-center font-mono space-y-2">
                                          <div className="font-bold text-sm uppercase">
                                            {language === "RU"
                                              ? "Практическое задание отправлено!"
                                              : "Assignment submitted!"}
                                          </div>
                                          <div className="text-xs">
                                            {language === "RU"
                                              ? "Куратор ответит на него в течение 24 часа - ответ придет на почту (не забудьте проверить спам), а пока вы можете перейти к изучению следующего модуля."
                                              : "Curator will review and reply within 24 hours to your email. You can now proceed to the next module."}
                                          </div>
                                          {existingUserSubmission?.link && (
                                            <a
                                              href={existingUserSubmission.link}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="block mt-4 text-xs font-bold underline hover:text-emerald-900"
                                            >
                                              {language === "RU"
                                                ? "Просмотреть вашу отправленную ссылку"
                                                : "View your submitted link"}
                                            </a>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="space-y-4">
                                          <div>
                                            <label className="block text-[9px] font-mono font-bold uppercase text-neutral-500 mb-2">
                                              {language === "RU"
                                                ? "Ссылка на материалы"
                                                : "Link to materials"}
                                            </label>
                                            <input
                                              type="url"
                                              value={practicalLink}
                                              onChange={(e) =>
                                                setPracticalLink(e.target.value)
                                              }
                                              className="w-full p-3 border border-neutral-300 focus:outline-none focus:border-neutral-900 font-mono text-xs bg-white"
                                              placeholder="https://drive.google.com/..."
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-[9px] font-mono font-bold uppercase text-neutral-500 mb-2">
                                              {language === "RU"
                                                ? "Комментарий (необязательно)"
                                                : "Comment"}
                                            </label>
                                            <textarea
                                              value={practicalComment}
                                              onChange={(e) =>
                                                setPracticalComment(
                                                  e.target.value,
                                                )
                                              }
                                              rows={3}
                                              className="w-full p-3 border border-neutral-300 focus:outline-none focus:border-neutral-900 font-mono text-xs bg-white"
                                            />
                                          </div>
                                          <button
                                            onClick={handleSubmitPractical}
                                            disabled={!practicalLink.trim()}
                                            className="w-full bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-50 text-white font-mono font-bold uppercase tracking-widest text-xs py-4 flex items-center justify-center gap-2"
                                          >
                                            <Send className="w-4 h-4" />
                                            {language === "RU"
                                              ? "ОТПРАВИТЬ"
                                              : "SUBMIT ASSIGNMENT"}
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {currentLesson.customContent.type ===
                                    "test" && (
                                    <div className="p-8 border-t border-neutral-200 bg-neutral-50/50 space-y-8">
                                      <div className="text-xs font-mono text-neutral-500 uppercase tracking-widest font-black">
                                        {language === "RU"
                                          ? "ТЕСТ И ПРОВЕРКА ЗНАНИЙ"
                                          : "TEST AND KNOWLEDGE CHECK"}
                                      </div>
                                      {existingUserSubmission || testSent ? (
                                        <div className="space-y-6">
                                          <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-800 text-center font-mono space-y-3">
                                            <div className="font-bold text-sm uppercase">
                                              {language === "RU"
                                                ? "Тест завершен!"
                                                : "Test completed!"}
                                            </div>
                                            <div className="text-xl font-bold">
                                              {existingUserSubmission
                                                ? existingUserSubmission.testScore
                                                : testScore?.score}{" "}
                                              /{" "}
                                              {existingUserSubmission
                                                ? existingUserSubmission.testTotal
                                                : testScore?.total}
                                            </div>
                                            <div className="text-xs">
                                              {language === "RU"
                                                ? "Ваш результат сохранен. Ниже вы можете ознакомиться с правильными ответами."
                                                : "Your result is saved. Below you can see the correct answers."}
                                            </div>
                                          </div>
                                          <div className="space-y-4">
                                            {(
                                              (existingUserSubmission
                                                ? existingUserSubmission.testQuestions
                                                : currentLesson.customContent
                                                    ?.testQuestions) || []
                                            ).map((q: any, i: number) => {
                                              const studentAnswerIdx =
                                                existingUserSubmission
                                                  ? existingUserSubmission
                                                      .testAnswers?.[q.id]
                                                  : testAnswers[q.id];
                                              const isCorrect =
                                                studentAnswerIdx ===
                                                q.correctOptionIndex;
                                              return (
                                                <div
                                                  key={q.id || i}
                                                  className="p-5 bg-white border border-neutral-200"
                                                >
                                                  <div className="flex gap-3 mb-4 items-start">
                                                    <div
                                                      className={`p-1.5 rounded-full mt-0.5 shrink-0 ${isCorrect ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}
                                                    >
                                                      {isCorrect ? (
                                                        <CheckCircle2 className="w-4 h-4" />
                                                      ) : (
                                                        <X className="w-4 h-4" />
                                                      )}
                                                    </div>
                                                    <div>
                                                      <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-bold mb-1">
                                                        {language === "RU"
                                                          ? "ВОПРОС"
                                                          : "QUESTION"}{" "}
                                                        {i + 1}
                                                      </div>
                                                      <h4 className="text-sm font-bold text-neutral-900 leading-snug">
                                                        {q.question || q.text}
                                                      </h4>
                                                    </div>
                                                  </div>
                                                  <div className="space-y-2 pl-9 font-mono text-xs">
                                                    {q.options.map(
                                                      (
                                                        opt: string,
                                                        optIdx: number,
                                                      ) => {
                                                        const isStudentChoice =
                                                          studentAnswerIdx ===
                                                          optIdx;
                                                        const isActuallyCorrect =
                                                          q.correctOptionIndex ===
                                                          optIdx;

                                                        let bgClass =
                                                          "bg-neutral-50 border border-neutral-200 text-neutral-500 opacity-50";
                                                        if (isActuallyCorrect)
                                                          bgClass =
                                                            "bg-emerald-50 border-emerald-500 text-emerald-800 font-bold border-[1.5px]";
                                                        else if (
                                                          isStudentChoice &&
                                                          !isActuallyCorrect
                                                        )
                                                          bgClass =
                                                            "bg-red-50 border-red-500 text-red-800 font-bold border-[1.5px]";

                                                        return (
                                                          <div
                                                            key={optIdx}
                                                            className={`p-3 flex items-center justify-between ${bgClass}`}
                                                          >
                                                            <span>{opt}</span>
                                                            <div className="flex gap-2 shrink-0">
                                                              {isStudentChoice && (
                                                                <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 bg-neutral-900 text-white font-bold hidden sm:inline-block">
                                                                  {language ===
                                                                  "RU"
                                                                    ? "ВАШ ОТВЕТ"
                                                                    : "YOUR ANSWER"}
                                                                </span>
                                                              )}
                                                              {isActuallyCorrect && (
                                                                <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 bg-emerald-500 text-white font-bold hidden sm:inline-flex items-center gap-1">
                                                                  <CheckCircle2 className="w-3 h-3" />
                                                                  {language ===
                                                                  "RU"
                                                                    ? "ПРАВИЛЬНЫЙ ОТВЕТ"
                                                                    : "TRUE ANSWER"}
                                                                </span>
                                                              )}
                                                            </div>
                                                          </div>
                                                        );
                                                      },
                                                    )}
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="space-y-8">
                                          {(
                                            currentLesson.customContent
                                              .testQuestions || []
                                          ).map((q: any, i: number) => (
                                            <div
                                              key={q.id}
                                              className="space-y-4"
                                            >
                                              <div className="font-bold text-sm bg-white p-4 border border-neutral-200">
                                                <span className="text-neutral-400 mr-2">
                                                  {i + 1}.
                                                </span>
                                                {q.question}
                                              </div>
                                              <div className="space-y-2 pl-2">
                                                {q.options.map(
                                                  (
                                                    opt: string,
                                                    optIdx: number,
                                                  ) => (
                                                    <label
                                                      key={optIdx}
                                                      className={`flex items-center gap-3 p-3 border cursor-pointer hover:bg-white transition-colors ${testAnswers[q.id] === optIdx ? "border-[#0284c7] bg-blue-50/50" : "border-neutral-200 bg-neutral-50/20"}`}
                                                    >
                                                      <input
                                                        type="radio"
                                                        name={`q_${q.id}`}
                                                        checked={
                                                          testAnswers[q.id] ===
                                                          optIdx
                                                        }
                                                        onChange={() =>
                                                          setTestAnswers({
                                                            ...testAnswers,
                                                            [q.id]: optIdx,
                                                          })
                                                        }
                                                        className="w-4 h-4 accent-[#0284c7]"
                                                      />
                                                      <span className="text-sm text-neutral-800">
                                                        {opt}
                                                      </span>
                                                    </label>
                                                  ),
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                          <button
                                            onClick={() => {
                                              // Calculate score
                                              const questions =
                                                currentLesson.customContent
                                                  .testQuestions || [];
                                              let score = 0;
                                              questions.forEach((q: any) => {
                                                if (
                                                  testAnswers[q.id] ===
                                                  q.correctOptionIndex
                                                ) {
                                                  score++;
                                                }
                                              });
                                              if (isImpersonating) {
                                                showError(
                                                  language === "RU"
                                                    ? "Админ: Режим просмотра. Тест не сохранен."
                                                    : "Admin: Preview Mode. Test not saved.",
                                                );
                                                setTestScore({
                                                  score,
                                                  total: questions.length,
                                                });
                                                setTestSent(true);
                                                return;
                                              }

                                              setTestScore({
                                                score,
                                                total: questions.length,
                                              });
                                              setTestSent(true);

                                              if (
                                                activeCourseId &&
                                                activeModuleId
                                              ) {
                                                toggleLessonCompletion(
                                                  activeCourseId,
                                                  activeModuleId,
                                                  activeLessonIndex,
                                                );
                                              }

                                              const moscowTime =
                                                new Date().toLocaleString(
                                                  "ru-RU",
                                                  { timeZone: "Europe/Moscow" },
                                                );
                                              const newSubmission: any = {
                                                id: "sub_" + Date.now(),
                                                studentId: currentUser?.id,
                                                studentName:
                                                  currentUser?.fullName,
                                                studentEmail:
                                                  currentUser?.email || "N/A",
                                                courseTitle:
                                                  activeCourse?.title || "",
                                                moduleTitle:
                                                  language === "RU"
                                                    ? currentLesson
                                                        .customContent.titleRu
                                                    : currentLesson
                                                        .customContent.titleEn,
                                                testScore: score,
                                                testTotal: questions.length,
                                                type: "test",
                                                timestamp:
                                                  moscowTime + " (MSK)",
                                                testAnswers: testAnswers,
                                                testQuestions: questions,
                                              };
                                              setSubmissions((prev) => [
                                                ...prev,
                                                newSubmission,
                                              ]);
                                            }}
                                            disabled={
                                              Object.keys(testAnswers)
                                                .length !==
                                              (currentLesson.customContent
                                                .testQuestions?.length || 0)
                                            }
                                            className="w-full bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-50 text-white font-mono font-bold uppercase tracking-widest text-xs py-4 flex items-center justify-center gap-2 mt-4 transition-colors"
                                          >
                                            <Send className="w-4 h-4" />
                                            {language === "RU"
                                              ? "ОТПРАВИТЬ ОТВЕТЫ"
                                              : "SUBMIT TEST"}
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div
                                  className={`aspect-video w-full bg-gradient-to-tr ${currentLesson.videoPlaceholderTheme} p-8 flex flex-col justify-between relative shadow-xl`}
                                >
                                  <div className="absolute inset-0 bg-[#000000]/15 pointer-events-none" />

                                  <div className="flex justify-between items-start relative z-10 text-white font-mono uppercase text-[9px] tracking-widest font-black">
                                    <span>
                                      ONLINE STREAM // SECURED DECODER 🔐
                                    </span>
                                    <span>{currentLesson.duration}</span>
                                  </div>

                                  <div className="flex flex-col items-center justify-center relative z-10 space-y-4 my-10">
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      className="w-16 h-16 rounded-full bg-white text-neutral-950 flex items-center justify-center shadow-2xl hover:bg-[#cbdc19] active:bg-[#cbdc19] duration-300"
                                    >
                                      <Play className="w-6 h-6 fill-current text-neutral-900 pl-1" />
                                    </motion.button>

                                    <span className="text-white font-mono text-[10px] uppercase font-bold tracking-[0.2em] bg-neutral-950/45 px-3 py-1 text-center">
                                      {language === "RU"
                                        ? "ЗАПУСТИТЬ ОБУЧАЮЩЕЕ ВИДЕО"
                                        : "START INSTRUCTIONAL STREAM"}
                                    </span>
                                  </div>

                                  <div className="flex justify-between items-end relative z-10 text-white font-mono text-[8px] uppercase tracking-wider opacity-95">
                                    <span>SYNTHETICA INTERACTIVE CO-PILOT</span>
                                    <span>STUDENT: {currentUser.fullName}</span>
                                  </div>
                                </div>
                              )}

                              {/* Title, checkbox completeness and description */}
                              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-neutral-150 pb-6">
                                <div className="space-y-1.5 cursor-default mt-2">
                                  {currentLesson.isCustom ? (
                                    <h2 className="text-2xl font-mono tracking-tighter text-neutral-900 font-extrabold uppercase">
                                      {language === "RU"
                                        ? currentLesson.customContent?.titleRu
                                        : currentLesson.customContent?.titleEn}
                                    </h2>
                                  ) : (
                                    <>
                                      <span className="text-[9px] font-mono uppercase tracking-widest text-[#0284c7] font-black">
                                        {language === "RU"
                                          ? "СЕКЦИЯ КУРСА // АКТИВНЫЙ УРОК"
                                          : "CURRENT LECTURE SYLLABUS"}
                                      </span>
                                      <h2 className="text-2xl font-mono tracking-tighter text-neutral-900 font-extrabold uppercase">
                                        {currentLesson.title}
                                      </h2>
                                      <p className="text-xs text-neutral-500 max-w-2xl font-light">
                                        {currentLesson.description}
                                      </p>
                                    </>
                                  )}
                                </div>

                                <div className="flex flex-wrap items-center gap-4">
                                  <button
                                    onClick={() => {
                                      if (isPracticeOrTest) {
                                        if (
                                          completedLessons[
                                            `${activeCourseId}_${activeModuleId}_${activeLessonIndex}_${currentUser.id}`
                                          ]
                                        ) {
                                          // Can't un-pass
                                          return;
                                        } else {
                                          showError(
                                            language === "RU"
                                              ? "Пожалуйста, заполните и отправьте задание перед тем, как отметить модуль пройденным."
                                              : "Please fill and submit the assignment before marking it as passed.",
                                          );
                                          return;
                                        }
                                      }
                                      toggleLessonCompletion(
                                        activeCourseId,
                                        activeModuleId || "01",
                                        activeLessonIndex,
                                      );
                                    }}
                                    className={`px-4.5 py-2.5 flex items-center gap-2 font-mono text-xs font-black uppercase tracking-wider border transition-all ${
                                      completedLessons[
                                        `${activeCourseId}_${activeModuleId}_${activeLessonIndex}_${currentUser.id}`
                                      ]
                                        ? "bg-green-550 border-green-500 bg-green-500 text-white shadow-md"
                                        : "bg-neutral-900 border-neutral-900 hover:bg-neutral-800 text-white shadow-sm"
                                    } ${isPracticeOrTest && !completedLessons[`${activeCourseId}_${activeModuleId}_${activeLessonIndex}_${currentUser.id}`] ? "opacity-50 hover:bg-neutral-900" : ""}`}
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>
                                      {completedLessons[
                                        `${activeCourseId}_${activeModuleId}_${activeLessonIndex}_${currentUser.id}`
                                      ]
                                        ? language === "RU"
                                          ? isPracticeOrTest
                                            ? "ПРОЙДЕНО"
                                            : "ИЗУЧЕНО"
                                          : isPracticeOrTest
                                            ? "PASSED"
                                            : "COMPLETED"
                                        : language === "RU"
                                          ? isPracticeOrTest
                                            ? "ОТМЕТИТЬ КАК ПРОЙДЕННЫЙ"
                                            : "ОТМЕТИТЬ КАК ИЗУЧЕННЫЙ"
                                          : isPracticeOrTest
                                            ? "MARK AS PASSED"
                                            : "MARK COMPLETED"}
                                    </span>
                                  </button>

                                  {hasNextModule ? (
                                    <button
                                      onClick={() => {
                                        if (
                                          !completedLessons[
                                            `${activeCourseId}_${activeModuleId}_${activeLessonIndex}_${currentUser.id}`
                                          ]
                                        ) {
                                          showError(
                                            language === "RU"
                                              ? "Вы не можете перейти к следующему модулю, пока не завершите текущий! Пожалуйста, отправьте результаты."
                                              : "You cannot move to the next module until you complete this one. Please submit results.",
                                          );
                                          return;
                                        }
                                        setActiveModuleId(nextMod.id);
                                        setActiveLessonIndex(0);
                                      }}
                                      className={`px-4.5 py-2.5 flex items-center gap-2 font-mono text-xs font-black uppercase tracking-wider border transition-all ${
                                        completedLessons[
                                          `${activeCourseId}_${activeModuleId}_${activeLessonIndex}_${currentUser.id}`
                                        ]
                                          ? "bg-white border-neutral-900 text-neutral-900 hover:bg-neutral-50 hover:shadow-sm cursor-pointer"
                                          : "bg-neutral-100 border-neutral-200 text-neutral-400 opacity-50"
                                      }`}
                                    >
                                      <span>
                                        {language === "RU"
                                          ? "СЛЕДУЮЩИЙ МОДУЛЬ ↗"
                                          : "NEXT MODULE ↗"}
                                      </span>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        if (
                                          !completedLessons[
                                            `${activeCourseId}_${activeModuleId}_${activeLessonIndex}_${currentUser.id}`
                                          ]
                                        ) {
                                          showError(
                                            language === "RU"
                                              ? "Вы не можете завершить курс, пока не выполните текущий модуль!"
                                              : "You cannot finish the course until you complete this module!",
                                          );
                                          return;
                                        }
                                        setShowCongratsModal(true);
                                      }}
                                      className={`px-4.5 py-2.5 flex items-center gap-2 font-mono text-xs font-black uppercase tracking-wider border transition-all ${
                                        completedLessons[
                                          `${activeCourseId}_${activeModuleId}_${activeLessonIndex}_${currentUser.id}`
                                        ]
                                          ? "bg-amber-100 border-amber-400 text-amber-900 hover:bg-amber-200 hover:shadow-sm cursor-pointer"
                                          : "bg-neutral-100 border-neutral-200 text-neutral-400 opacity-50"
                                      }`}
                                    >
                                      <span>
                                        {language === "RU"
                                          ? "ЗАВЕРШИТЬ КУРС 🏆"
                                          : "FINISH COURSE 🏆"}
                                      </span>
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Materials download and ask teacher section */}
                              <div
                                className={`grid grid-cols-1 ${showAskCurator && !currentLesson.isCustom ? "md:grid-cols-2" : ""} gap-8`}
                              >
                                {/* Left Column: Download materials */}
                                {!currentLesson.isCustom && (
                                  <div className="space-y-4">
                                    <span className="text-[10px] font-mono tracking-wider text-neutral-400 font-black uppercase flex items-center gap-1.5">
                                      <FileText className="w-4 h-4 text-neutral-400" />
                                      {language === "RU"
                                        ? "ДОПОЛНИТЕЛЬНЫЕ МАТЕРИАЛЫ И ПРЕСЕТЫ"
                                        : "USEFUL COMPANION MATERIALS"}
                                    </span>

                                    {currentLesson.materials.length === 0 ? (
                                      <p className="text-xs text-neutral-400 font-mono italic">
                                        {language === "RU"
                                          ? "Для этого урока отсутствуют скачиваемые пресеты."
                                          : "No supplementary assets defined for this study unit."}
                                      </p>
                                    ) : (
                                      <div className="border border-neutral-200 bg-white p-4 divide-y divide-neutral-100">
                                        {currentLesson.materials.map(
                                          (mat, mIdx) => (
                                            <div
                                              key={mIdx}
                                              className="py-2.5 flex justify-between items-center text-xs font-mono"
                                            >
                                              <div className="flex items-center gap-2">
                                                <span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-600 font-black text-[7.5px] tracking-wide rounded-none">
                                                  {mat.type}
                                                </span>
                                                <span className="text-neutral-700 font-medium">
                                                  {mat.title}
                                                </span>
                                              </div>

                                              <button
                                                onClick={() =>
                                                  alert(
                                                    language === "RU"
                                                      ? "Файл скачивается напрямую из облака..."
                                                      : "Supplementary study asset downloads initiated from cloud vault...",
                                                  )
                                                }
                                                className="text-[9.5px] tracking-wider text-[#0284c7] hover:underline font-bold"
                                              >
                                                {language === "RU"
                                                  ? "СКАЧАТЬ"
                                                  : "DOWNLOAD"}
                                              </button>
                                            </div>
                                          ),
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Right Column: Dynamic smart help question inbox */}
                                {showAskCurator && (
                                  <div className="space-y-4">
                                    <span className="text-[10px] font-mono tracking-wider text-neutral-400 font-black uppercase flex items-center gap-1.5">
                                      <HelpCircle className="w-4 h-4 text-neutral-400" />
                                      {language === "RU"
                                        ? "ЗАДАТЬ ВОПРОС КУРАТОРУ"
                                        : "SECURE LECTURE CO-PILOT HELP"}
                                    </span>

                                    <div className="border border-neutral-200 bg-white p-5 space-y-3.5 shadow-sm rounded-none">
                                      <p className="text-[10.5px] leading-relaxed text-neutral-500 font-mono italic">
                                        {language === "RU"
                                          ? "Появились трудности? Напишите куратору в этом окне."
                                          : "Stuck with material? Request counsel directly below."}
                                      </p>

                                      {questionSent ? (
                                        <motion.div
                                          initial={{ opacity: 0, scale: 0.98 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs text-left"
                                        >
                                          <strong>
                                            {language === "RU"
                                              ? "✓ ВОПРОС ОТПРАВЛЕН"
                                              : "✓ DISPATCH CONFIRMED"}
                                          </strong>
                                          <p className="text-[10px] text-emerald-600 font-light mt-0.5">
                                            {language === "RU"
                                              ? "Ирина ответит вам в течение суток на кураторскую почту."
                                              : "Feedback dispatch verified directly. Reply is routed."}
                                          </p>
                                        </motion.div>
                                      ) : (
                                        <div className="space-y-2.5">
                                          <textarea
                                            rows={3}
                                            placeholder={
                                              language === "RU"
                                                ? "Опишите вашу проблему максимально детально..."
                                                : "State your technical query..."
                                            }
                                            value={studentQuestion}
                                            onChange={(e) =>
                                              setStudentQuestion(e.target.value)
                                            }
                                            className="w-full text-xs p-3 border border-neutral-200 focus:outline-none focus:border-neutral-900 rounded-none bg-neutral-50"
                                          />
                                          <button
                                            onClick={() =>
                                              handleAskQuestion(
                                                activeCourse?.title || "",
                                              )
                                            }
                                            disabled={!studentQuestion.trim()}
                                            className="w-full py-2 bg-neutral-900 hover:bg-neutral-850 disabled:opacity-30 disabled:hover:bg-neutral-900 text-white font-mono text-[9px] tracking-widest font-black uppercase flex items-center justify-center gap-1.5"
                                          >
                                            <Send className="w-3.5 h-3.5" />
                                            <span>
                                              {language === "RU"
                                                ? "ОТПРАВИТЬ ВОПРОС"
                                                : "DISPATCH QUESTION"}
                                            </span>
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()
                      ) : visibleModules.length === 0 ? (
                        <div className="h-96 w-full flex flex-col justify-center items-center border border-dashed border-neutral-300 bg-white p-8 font-mono text-center">
                          <BookOpen className="w-10 h-10 text-neutral-300 mb-3" />
                          <h4 className="text-sm font-bold text-neutral-500 uppercase tracking-widest">
                            {language === "RU"
                              ? "РАЗДЕЛ ЗАКРЫТ ИЛИ ЗАБЛОКИРОВАН"
                              : "SECTION LOCKED BY CURATOR"}
                          </h4>
                          <p className="text-[10px] text-neutral-400 max-w-sm mt-1.5 leading-relaxed">
                            {language === "RU"
                              ? "Вы не имеете достаточных прав для изучения этого конкретного раздела. Пожалуйста, обратитесь к Ирине для расширения полномочий."
                              : "This segment is blocked. Coordinate billing or access rights with administrative curator Irina."}
                          </p>
                        </div>
                      ) : (
                        <div className="h-96 w-full flex flex-col justify-center items-center font-mono text-center">
                          <BookOpen className="w-10 h-10 text-neutral-300 mb-3" />
                          <p className="text-[10px] text-neutral-400 max-w-sm mt-1.5 leading-relaxed">
                            {language === "RU"
                              ? "Пожалуйста, выберите модуль из списка содержимого."
                              : "Please select a module from the contents list."}
                          </p>
                        </div>
                      )}
                    </main>
                  </section>
                )}
              </main>
            )}
          </div>
        )}

        {/* Congratulations Modal */}
        {showCongratsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
              onClick={() => setShowCongratsModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-white w-full max-w-lg shadow-2xl overflow-hidden"
            >
              <div className="p-1.5 bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500" />
              <div className="p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-amber-100 rounded-full mx-auto flex items-center justify-center text-amber-500 mb-2">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                    <path d="M4 22h16"></path>
                    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                  </svg>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-tighter uppercase text-neutral-900">
                  {language === "RU" ? "ПОЗДРАВЛЯЕМ!" : "CONGRATULATIONS!"}
                </h2>

                <p className="text-sm font-sans text-neutral-600 leading-relaxed max-w-sm mx-auto">
                  {language === "RU"
                    ? "Вы успешно завершили изучение курса. Вы можете вернуться к повторению материалов в любое время."
                    : "You have successfully completed this course. You can return to study the materials at any time."}
                </p>

                <div className="pt-4 flex justify-center">
                  <button
                    onClick={() => setShowCongratsModal(false)}
                    className="bg-neutral-900 hover:bg-neutral-800 text-white font-mono font-bold tracking-widest uppercase px-8 py-3 text-xs w-full transition-colors"
                  >
                    {language === "RU"
                      ? "ОТЛИЧНО, ВЕРНУТЬСЯ НАЗАД"
                      : "GREAT, CLOSE"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Test Submission Details Modal (Admin) */}
        {viewingTestSubmission && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
              onClick={() => setViewingTestSubmission(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative bg-[#fafafa] w-full max-w-3xl max-h-[90vh] shadow-2xl flex flex-col font-sans border-t-4 border-emerald-500 overflow-hidden"
            >
              <div className="p-6 md:p-8 flex flex-col justify-between h-full space-y-8 overflow-y-auto w-full">
                <div>
                  <h3 className="font-mono text-xl font-black uppercase text-neutral-900 tracking-tighter">
                    {language === "RU" ? "РЕЗУЛЬТАТЫ ТЕСТА" : "TEST RESULTS"}
                  </h3>
                  <p className="text-xs font-mono text-neutral-500 mt-2">
                    <span className="font-bold text-neutral-800 uppercase mr-2">
                      {language === "RU" ? "УЧЕНИК:" : "STUDENT:"}
                    </span>
                    {viewingTestSubmission.studentName} (
                    {viewingTestSubmission.studentEmail})
                  </p>
                  <div className="flex gap-4 mt-6 p-4 bg-emerald-50 border border-emerald-200 sm:w-auto self-start">
                    <div className="text-4xl font-mono font-black text-emerald-600">
                      {viewingTestSubmission.testScore} /{" "}
                      {viewingTestSubmission.testTotal}
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800">
                        {language === "RU"
                          ? "ПРАВИЛЬНЫХ ОТВЕТОВ"
                          : "CORRECT ANSWERS"}
                      </span>
                      <span className="text-xs text-emerald-600 font-mono">
                        {Math.round(
                          (viewingTestSubmission.testScore /
                            Math.max(1, viewingTestSubmission.testTotal)) *
                            100,
                        )}
                        %
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 flex-1 pt-2">
                  {(viewingTestSubmission.testQuestions || []).map(
                    (q: any, i: number) => {
                      const studentAnswerIdx = viewingTestSubmission.testAnswers
                        ? viewingTestSubmission.testAnswers[q.id]
                        : undefined;
                      const isCorrect =
                        studentAnswerIdx === q.correctOptionIndex;
                      return (
                        <div
                          key={q.id || i}
                          className="p-5 bg-white border border-neutral-200"
                        >
                          <div className="flex gap-3 mb-4 items-start">
                            <div
                              className={`p-1.5 rounded-full mt-0.5 shrink-0 ${isCorrect ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}
                            >
                              {isCorrect ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-bold mb-1">
                                {language === "RU" ? "ВОПРОС" : "QUESTION"}{" "}
                                {i + 1}
                              </div>
                              <h4 className="text-sm font-bold text-neutral-900 leading-snug">
                                {q.question || q.text}
                              </h4>
                            </div>
                          </div>

                          <div className="space-y-2 pl-9 font-mono text-xs">
                            {q.options.map((opt: string, optIdx: number) => {
                              const isStudentChoice =
                                studentAnswerIdx === optIdx;
                              const isActuallyCorrect =
                                q.correctOptionIndex === optIdx;

                              let bgClass =
                                "bg-neutral-50 border border-neutral-200 text-neutral-500";
                              if (isActuallyCorrect)
                                bgClass =
                                  "bg-emerald-50 border-emerald-500 text-emerald-800 font-bold border-[1.5px]";
                              else if (isStudentChoice && !isActuallyCorrect)
                                bgClass =
                                  "bg-red-50 border-red-500 text-red-800 font-bold border-[1.5px]";

                              return (
                                <div
                                  key={optIdx}
                                  className={`p-3 flex items-center justify-between ${bgClass}`}
                                >
                                  <span>{opt}</span>
                                  <div className="flex gap-2 shrink-0">
                                    {isStudentChoice && (
                                      <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 bg-neutral-900 text-white font-bold hidden sm:inline-block">
                                        {language === "RU"
                                          ? "ОТВЕТ УЧЕНИКА"
                                          : "STUDENT ANSWER"}
                                      </span>
                                    )}
                                    {isActuallyCorrect && (
                                      <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 bg-emerald-500 text-white font-bold hidden sm:inline-flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        {language === "RU"
                                          ? "ПРАВИЛЬНЫЙ ОТВЕТ"
                                          : "TRUE ANSWER"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>

                <div className="pt-4 border-t border-neutral-200 flex justify-end shrink-0">
                  <button
                    onClick={() => setViewingTestSubmission(null)}
                    className="bg-neutral-900 hover:bg-neutral-800 text-white font-mono font-bold tracking-widest uppercase px-8 py-3 text-xs transition-colors"
                  >
                    {language === "RU" ? "ЗАКРЫТЬ" : "CLOSE"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Floating Action Error Toast */}
        {actionError && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-4 font-mono text-xs sm:text-sm tracking-wider shadow-2xl z-[500] flex items-center gap-4 min-w-[300px] border-l-4 border-red-900"
          >
            <span className="font-bold uppercase flex-1">{actionError}</span>
            <button
              onClick={() => setActionError(null)}
              className="opacity-70 hover:opacity-100 px-2 py-1 bg-red-800 rounded"
            >
              ✕
            </button>
          </motion.div>
        )}
      </div>
    </>
  );
}
