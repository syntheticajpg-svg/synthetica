import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { X, Plus, Check } from "lucide-react";
import { PortfolioBlock } from "../types";
import { compressImage } from "../lib/imageCompression";

interface HomeBlockEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  block: PortfolioBlock | null;
  customHomeBlocksConfig: Record<string, any>;
  onSave: (updatedConfig: any) => void;
  language: "RU" | "EN";
}

export default function HomeBlockEditorModal({
  isOpen,
  onClose,
  block,
  customHomeBlocksConfig,
  onSave,
  language,
}: HomeBlockEditorModalProps) {
  const [localConf, setLocalConf] = useState<Record<string, any>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingAuthor, setIsUploadingAuthor] = useState(false);

  useEffect(() => {
    if (block) {
      setLocalConf(customHomeBlocksConfig?.[block.id] || {});
    }
  }, [block, customHomeBlocksConfig]);

  if (!isOpen || !block) return null;

  const b = block;
  const conf = localConf;

  let defaultT1 = "";
  let defaultT2 = "";
  if (b.id === "about_me") {
    defaultT1 =
      language === "RU"
        ? "✦ ОБ АВТОРЕ // ФИЛОСОФИЯ\n«Я вижу нейросети не просто как сухой утилитарный инструмент копирования, а как уникальный холст для раскрытия творческого спектра...»\n\n✦ ПРОФЕССИОНАЛЬНЫЙ ОПЫТ\n3 ГОДА: COO ювелирного бренда\n4 ГОДА: Бренд-айдентика и визуальный синтез\n..."
        : '✦ ABOUT AUTHOR // PHILOSOPHY\n"I view neural networks not merely as structural tools for imitation..."';
  } else if (b.id === "services") {
    defaultT1 =
      language === "RU"
        ? "01 Базовый фундамент. Разработка базовой айдентики бренда...\n\n02 Полная система. Сквозная разработка бренд-стратегии..."
        : "01 Foundation. Core identity package...";
    defaultT2 =
      language === "RU"
        ? "КАЛЬКУЛЯТОР СТОИМОСТИ (Или опишите цены текстом)"
        : "PRICING CALCULATOR (Or describe pricing in text)";
  } else if (b.id === "course_midjourney") {
    defaultT1 =
      language === "RU"
        ? "О КУРСЕ // «FAKE IT. SHAKE IT!»\nКомплексный образовательный трек, направленный на создание коммерческого и творческого контента фотореалистичного качества. Программа идеально подойдет как новичкам для уверенного старта, так и опытным специалистам для углубления своих профессиональных навыков...\n\nДОСТИЖЕНИЯ:\n- Создание реалистичных AI-моделей\n- Создание гиперреалистичных локаций..."
        : "ABOUT THE COURSE\nA comprehensive curriculum...";
    defaultT2 =
      language === "RU"
        ? "ПРОГРАММА И СОДЕРЖАНИЕ\nМОДУЛЬ 01 // ВВЕДЕНИЕ\nМОДУЛЬ 02 // ОСНОВЫ...\n"
        : "SYLLABUS\nMODULE 01...";
  }

  const handleSave = () => {
    onSave(localConf);
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white max-w-4xl w-full max-h-[90vh] flex flex-col relative shadow-2xl border border-neutral-300 overflow-hidden"
      >
        <header className="border-b border-neutral-200 bg-neutral-50 px-6 py-4 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-sm font-mono font-black text-neutral-900 uppercase">
              {language === "RU" ? "РЕДАКТОР КАРТОЧКИ: " : "CARD EDITOR: "} {b.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors border border-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 font-mono w-full scrollbar-thin scrollbar-thumb-neutral-300">
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">
                {language === "RU" ? "Значок / Бейдж (вверху слева)" : "Badge Label"}
              </label>
              <input
                type="text"
                className="w-full text-xs p-3 border border-neutral-300 focus:outline-none focus:border-neutral-900"
                value={conf.badge ?? b.badge ?? ""}
                onChange={(e) =>
                  setLocalConf((prev) => ({
                    ...prev,
                    badge: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">
                {language === "RU" ? "Название блока (Title)" : "Block Title"}
              </label>
              <input
                type="text"
                className="w-full text-xs p-3 border border-neutral-300 focus:outline-none focus:border-neutral-900"
                value={conf.title ?? b.title}
                onChange={(e) =>
                  setLocalConf((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">
                {language === "RU" ? "Описание блока (Subtitle)" : "Block Subtitle"}
              </label>
              <textarea
                rows={3}
                className="w-full text-xs p-3 border border-neutral-300 focus:outline-none focus:border-neutral-900"
                value={conf.subtitle ?? b.subtitle}
                onChange={(e) =>
                  setLocalConf((prev) => ({
                    ...prev,
                    subtitle: e.target.value,
                  }))
                }
              />
            </div>
            <div className="pt-4 border-t border-neutral-100">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">
                {language === "RU" ? "Обложка (URL или Загрузка)" : "Cover Media (URL or Upload)"}
              </label>
              <div className="flex gap-4 items-start">
                <div className="shrink-0 w-24 h-24 border border-neutral-300 bg-neutral-900 overflow-hidden relative group">
                  {((conf.image !== undefined ? conf.image : b.image) && (conf.image !== "")) ? (
                    (conf.image !== undefined && conf.image !== "" ? conf.image : b.image).toLowerCase().match(/\.(mp4|webm|mov)$/) ? (
                      <video
                        src={conf.image !== undefined && conf.image !== "" ? conf.image : b.image}
                        key={conf.image !== undefined && conf.image !== "" ? conf.image : b.image}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <img
                        src={conf.image !== undefined && conf.image !== "" ? conf.image : b.image}
                        key={conf.image !== undefined && conf.image !== "" ? conf.image : b.image}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        alt="Preview"
                        referrerPolicy="no-referrer"
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[8px] text-white/50 bg-neutral-900 p-2 text-center uppercase font-bold">
                      {language === "RU" ? "НЕТ ФОТО" : "NO PHOTO"}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={language === "RU" ? "https://..." : "https://..."}
                      className="w-full text-xs p-3 border border-neutral-300 focus:outline-none focus:border-neutral-900 bg-white"
                      value={conf.image !== undefined ? conf.image : b.image}
                      onChange={(e) =>
                        setLocalConf((prev) => ({
                          ...prev,
                          image: e.target.value,
                        }))
                      }
                    />
                    {(conf.image !== undefined) && (
                      <button 
                         onClick={() => setLocalConf(prev => { 
                           const n = {...prev}; 
                           delete n.image; 
                           return n; 
                         })}
                         className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-neutral-400 hover:text-red-500 uppercase font-mono px-2 py-1 bg-neutral-50 border border-neutral-200"
                      >
                         {language === "RU" ? "ВОССТАНОВИТЬ" : "REVERT"}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp, video/mp4, video/webm, video/quicktime"
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      disabled={isUploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        setIsUploading(true);
                        try {
                          // Compress image if it's an image
                          let fileToUpload: File | Blob = file;
                          if (file.type.startsWith('image/')) {
                            fileToUpload = await compressImage(file);
                          }

                          const formData = new FormData();
                          formData.append("image", fileToUpload);

                          const res = await fetch("/api/upload", {
                            method: "POST",
                            body: formData,
                          });

                          if (!res.ok) throw new Error("Upload failed");
                          const data = await res.json();
                          
                          setLocalConf((prev) => ({
                            ...prev,
                            image: data.url,
                          }));
                          setIsUploading(false);
                        } catch (err) {
                          console.error("Upload failed", err);
                          alert(language === "RU" ? "Ошибка загрузки" : "Upload failed");
                          setIsUploading(false);
                        }
                        e.target.value = "";
                      }}
                    />
                    <button className="h-full px-4 bg-neutral-900 text-white text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-2 whitespace-nowrap min-h-[42px] disabled:opacity-50">
                      <Plus className="w-3 h-3" />
                      {isUploading
                        ? language === "RU"
                          ? "ЗАГРУЗКА..."
                          : "UPLOADING..."
                        : language === "RU"
                          ? "МЕДИА ФАЙЛ"
                          : "MEDIA FILE"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[9px] text-neutral-400 mt-2 font-mono uppercase">
              {language === "RU"
                ? "PNG, JPG, WEBP или MP4/MOV видео (до 100MB)"
                : "PNG, JPG, WEBP or MP4/MOV video (up to 100MB)"}
            </p>
            <p className="text-[9px] text-neutral-400 mt-1">
              {language === "RU"
                ? "Для видео используйте ссылку, оканчивающуюся на .mp4"
                : "For video, use a URL ending in .mp4"}
            </p>

            {b.id === "about_me" && (
              <div className="mt-6 pt-4 border-t border-neutral-150">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">
                  {language === "RU"
                    ? "Фото внутри модального окна (Автор)"
                    : "Inner Modal Photo (Author)"}
                </label>
                <div className="flex gap-2">
                  <div className="shrink-0 w-12 h-12 border border-neutral-300 bg-neutral-900 overflow-hidden relative">
                    {((conf.authorImage !== undefined && conf.authorImage !== "") ? conf.authorImage : (conf.authorImage === "" ? null : undefined)) && (
                      <img
                        src={conf.authorImage !== undefined && conf.authorImage !== "" ? conf.authorImage : ""}
                        key={conf.authorImage !== undefined && conf.authorImage !== "" ? conf.authorImage : ""}
                        className="w-full h-full object-cover"
                        alt="Preview"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                  <div className="flex-1 relative flex items-center">
                    <input
                      type="text"
                      className="w-full text-xs p-3 border border-neutral-300 bg-white"
                      value={conf.authorImage !== undefined ? conf.authorImage : ""}
                      placeholder={language === "RU" ? "URL или загрузите файл" : "URL or upload file"}
                      onChange={(e) =>
                        setLocalConf((prev) => ({
                          ...prev,
                          authorImage: e.target.value,
                        }))
                      }
                    />
                    {conf.authorImage !== undefined && (
                      <button 
                         onClick={() => setLocalConf(prev => { 
                           const n = {...prev}; 
                           delete n.authorImage; 
                           return n; 
                         })}
                         className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-neutral-400 hover:text-red-500 uppercase font-mono px-2 py-1 bg-neutral-50 border border-neutral-200"
                      >
                         {language === "RU" ? "СБРОСИТЬ" : "REVERT"}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      disabled={isUploadingAuthor}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        setIsUploadingAuthor(true);
                        try {
                          // Compress image if it's an image
                          let fileToUpload: File | Blob = file;
                          if (file.type.startsWith('image/')) {
                            fileToUpload = await compressImage(file);
                          }

                          const formData = new FormData();
                          formData.append("image", fileToUpload);

                          const res = await fetch("/api/upload", {
                            method: "POST",
                            body: formData,
                          });

                          if (!res.ok) throw new Error("Upload failed");
                          const data = await res.json();

                          setLocalConf((prev) => ({
                            ...prev,
                            authorImage: data.url,
                          }));
                          setIsUploadingAuthor(false);
                        } catch (err) {
                          console.error("Upload failed", err);
                          alert(language === "RU" ? "Ошибка загрузки" : "Upload failed");
                          setIsUploadingAuthor(false);
                        }
                        e.target.value = "";
                      }}
                    />
                    <button className="h-full px-4 bg-indigo-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-2 whitespace-nowrap min-h-[42px] disabled:opacity-50">
                      <Plus className="w-3 h-3" />
                      {isUploadingAuthor
                        ? language === "RU"
                          ? "ЗАГРУЗКА..."
                          : "UPLOADING..."
                        : language === "RU"
                          ? "ФАЙЛ АВТОРА"
                          : "AUTHOR FILE"}
                    </button>
                  </div>
                </div>
                <p className="text-[9px] text-neutral-400 mt-2 font-mono uppercase">
                  {language === "RU" ? "Для фото Ирины внутри блока" : "For Irina's photo inside the block"}
                </p>
              </div>
            )}

            <div>
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={conf.videoAutoplay !== false}
                  onChange={(e) =>
                    setLocalConf((prev) => ({
                      ...prev,
                      videoAutoplay: e.target.checked,
                    }))
                  }
                />
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                  {language === "RU"
                    ? "Если видео: всегда автовоспроизведение (иначе только при наведении)"
                    : "If video: always autopilot (otherwise hover only)"}
                </span>
              </label>
            </div>

            {b.isCourse && (
              <div className="pt-6 border-t border-neutral-200">
                <label className="text-[10px] font-bold text-[#0284c7] uppercase tracking-wider block mb-1.5">
                  {language === "RU"
                    ? "Внутреннее содержимое: Стоимость (При наличии)"
                    : "Inner Content: Price (If applicable)"}
                </label>
                <input
                  type="text"
                  className="w-full text-xs p-3 border border-neutral-300"
                  placeholder={language === "RU" ? "Например: $150 USD или Бесплатно" : "e.g. $150 USD or Free"}
                  value={conf.customPrice ?? ""}
                  onChange={(e) =>
                    setLocalConf((prev) => ({
                      ...prev,
                      customPrice: e.target.value,
                    }))
                  }
                />
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold text-[#0284c7] uppercase tracking-wider block mb-1.5">
                {language === "RU"
                  ? "Внутреннее содержимое: Общий текст (опционально)"
                  : "Inner text content (optional)"}
              </label>
              <textarea
                rows={4}
                className="w-full text-xs p-3 border border-neutral-300"
                placeholder={
                  language === "RU"
                    ? "Введите текст, который заменит стандартное описание внутри модального окна. Поддерживает переносы строк."
                    : "Enter text to replace default modal description. Supports newlines."
                }
                value={conf.customModalText ?? ""}
                onChange={(e) =>
                  setLocalConf((prev) => ({
                    ...prev,
                    customModalText: e.target.value,
                  }))
                }
              />
            </div>

            <div className="pt-6 border-t border-neutral-200">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-[10px] font-bold text-neutral-900 uppercase tracking-wider">
                  {language === "RU" ? "ЗАМЕНА ВНУТРЕННИХ ВКЛАДОК (ОПЦИОНАЛЬНО)" : "CUSTOM TABS OVERRIDE"}
                </h4>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">
                    {language === "RU" ? "Название Вкладки 1" : "Tab 1 Name"}
                  </label>
                  <input
                    type="text"
                    className="w-full text-xs p-3 border border-neutral-300"
                    placeholder={language === "RU" ? "О Компании" : "About"}
                    value={conf.tab1Name ?? ""}
                    onChange={(e) =>
                      setLocalConf((prev) => ({
                        ...prev,
                        tab1Name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">
                    {language === "RU" ? "Содержимое Вкладки 1 (Текст)" : "Tab 1 Content"}
                  </label>
                  <textarea
                    rows={6}
                    className="w-full text-xs p-3 border border-neutral-300"
                    placeholder={language === "RU" ? "Содержимое первой вкладки..." : "Content for first tab..."}
                    value={conf.tab1Content !== undefined ? conf.tab1Content : defaultT1}
                    onChange={(e) =>
                      setLocalConf((prev) => ({
                        ...prev,
                        tab1Content: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="pt-4 border-t border-dashed border-neutral-200">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">
                    {language === "RU" ? "Название Вкладки 2" : "Tab 2 Name"}
                  </label>
                  <input
                    type="text"
                    className="w-full text-xs p-3 border border-neutral-300"
                    placeholder={language === "RU" ? "Услуги" : "Services"}
                    value={conf.tab2Name ?? ""}
                    onChange={(e) =>
                      setLocalConf((prev) => ({
                        ...prev,
                        tab2Name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">
                    {language === "RU" ? "Содержимое Вкладки 2 (Текст)" : "Tab 2 Content"}
                  </label>
                  <textarea
                    rows={6}
                    className="w-full text-xs p-3 border border-neutral-300"
                    placeholder={language === "RU" ? "Содержимое второй вкладки..." : "Content for second tab..."}
                    value={conf.tab2Content !== undefined ? conf.tab2Content : defaultT2}
                    onChange={(e) =>
                      setLocalConf((prev) => ({
                        ...prev,
                        tab2Content: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="shrink-0 border-t border-neutral-200 bg-neutral-50 px-6 py-4 flex justify-end gap-3 font-mono">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 uppercase tracking-wider font-bold transition-all"
          >
            {language === "RU" ? "Отмена" : "Cancel"}
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs bg-neutral-900 border border-neutral-900 text-white hover:bg-neutral-800 uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            {language === "RU" ? "Сохранить" : "Save"}
          </button>
        </footer>
      </motion.div>
    </div>
  );
}
