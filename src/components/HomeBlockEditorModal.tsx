import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { X, Plus, Check } from "lucide-react";
import { PortfolioBlock } from "../types";

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
    if (block && isOpen) {
      // Инициализируем локальное состояние текущим конфигом или пустым объектом
      const currentConfig = customHomeBlocksConfig?.[block.id] || {};
      setLocalConf({
        ...currentConfig,
        // Гарантируем, что если в конфиге нет значения, мы берем его из самого блока как дефолт
        image: currentConfig.image !== undefined ? currentConfig.image : (block.image || ""),
        title: currentConfig.title !== undefined ? currentConfig.title : (block.title || ""),
        subtitle: currentConfig.subtitle !== undefined ? currentConfig.subtitle : (block.subtitle || ""),
        badge: currentConfig.badge !== undefined ? currentConfig.badge : (block.badge || ""),
      });
    }
  }, [block, customHomeBlocksConfig, isOpen]);

  if (!isOpen || !block) return null;

  const handleSave = () => {
    onSave(localConf);
  };

  const handleFileUpload = async (file: File, field: string, setUploading: (v: boolean) => void) => {
    if (!file) return;
    setUploading(true);
    try {
      // Compress image before sending as Base64 to keep Firestore payload small
      let fileToUpload = file;
      if (file.type.startsWith('image/')) {
        try {
          const { compressImage } = await import("../lib/imageCompression");
          fileToUpload = await compressImage(file, 0.4); // Target ~400KB
        } catch (e) {
          console.warn("Compression failed, uploading original", e);
        }
      }

      const formData = new FormData();
      formData.append("image", fileToUpload);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Upload failed");
      }
      
      const data = await res.json();
      if (data.url) {
        setLocalConf((prev) => ({
          ...prev,
          [field]: data.url,
        }));
      }
    } catch (err: any) {
      console.error("Upload failed:", err);
      alert((language === "RU" ? "Ошибка загрузки: " : "Upload failed: ") + err.message);
    } finally {
      setUploading(false);
    }
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
          <h2 className="text-sm font-mono font-black text-neutral-900 uppercase">
            {language === "RU" ? "РЕДАКТОР КАРТОЧКИ: " : "CARD EDITOR: "} {block.title}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 font-mono w-full">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Badge */}
            <div>
              <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">
                {language === "RU" ? "Значок / Бейдж" : "Badge Label"}
              </label>
              <input
                type="text"
                className="w-full text-xs p-3 border border-neutral-300 focus:border-neutral-900 outline-none"
                value={localConf.badge || ""}
                onChange={(e) => setLocalConf(prev => ({ ...prev, badge: e.target.value }))}
              />
            </div>

            {/* Title */}
            <div>
              <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">
                {language === "RU" ? "Название" : "Title"}
              </label>
              <input
                type="text"
                className="w-full text-xs p-3 border border-neutral-300 focus:border-neutral-900 outline-none"
                value={localConf.title || ""}
                onChange={(e) => setLocalConf(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">
                {language === "RU" ? "Описание" : "Subtitle"}
              </label>
              <textarea
                rows={3}
                className="w-full text-xs p-3 border border-neutral-300 focus:border-neutral-900 outline-none"
                value={localConf.subtitle || ""}
                onChange={(e) => setLocalConf(prev => ({ ...prev, subtitle: e.target.value }))}
              />
            </div>

            {/* Main Image */}
            <div className="pt-4 border-t border-neutral-100">
              <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-2">
                {language === "RU" ? "Обложка (URL или файл)" : "Cover Media (URL or File)"}
              </label>
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-neutral-100 border border-neutral-300 relative overflow-hidden shrink-0">
                  {localConf.image && (
                    localConf.image.match(/\.(mp4|webm|mov)/i) ? (
                      <video src={localConf.image} className="w-full h-full object-cover" autoPlay muted loop />
                    ) : (
                      <img src={localConf.image} className="w-full h-full object-cover" alt="Preview" />
                    )
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    className="w-full text-xs p-3 border border-neutral-300 outline-none"
                    placeholder="https://..."
                    value={localConf.image || ""}
                    onChange={(e) => setLocalConf(prev => ({ ...prev, image: e.target.value }))}
                  />
                  <div className="relative">
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      accept="image/*,video/*"
                      disabled={isUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, "image", setIsUploading);
                        e.target.value = "";
                      }}
                    />
                    <button className="w-full py-2 bg-neutral-900 text-white text-[10px] uppercase font-bold disabled:opacity-50">
                      {isUploading ? (language === "RU" ? "ЗАГРУЗКА..." : "UPLOADING...") : (language === "RU" ? "ВЫБРАТЬ ФАЙЛ" : "SELECT FILE")}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Author Image (only for about_me) */}
            {block.id === "about_me" && (
              <div className="pt-4 border-t border-neutral-100">
                <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-2">
                  {language === "RU" ? "Фото автора" : "Author Photo"}
                </label>
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-neutral-100 border border-neutral-300 relative overflow-hidden shrink-0">
                    {localConf.authorImage && (
                      <img src={localConf.authorImage} className="w-full h-full object-cover" alt="Author" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      className="w-full text-xs p-3 border border-neutral-300 outline-none"
                      placeholder="https://..."
                      value={localConf.authorImage || ""}
                      onChange={(e) => setLocalConf(prev => ({ ...prev, authorImage: e.target.value }))}
                    />
                    <div className="relative">
                      <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        accept="image/*"
                        disabled={isUploadingAuthor}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, "authorImage", setIsUploadingAuthor);
                          e.target.value = "";
                        }}
                      />
                      <button className="w-full py-2 bg-neutral-800 text-white text-[10px] uppercase font-bold disabled:opacity-50">
                        {isUploadingAuthor ? (language === "RU" ? "ЗАГРУЗКА..." : "UPLOADING...") : (language === "RU" ? "ВЫБРАТЬ ФОТО" : "SELECT PHOTO")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className="p-6 border-t border-neutral-200 bg-neutral-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 border border-neutral-300 text-[10px] font-bold uppercase">
            {language === "RU" ? "ОТМЕНА" : "CANCEL"}
          </button>
          <button
            onClick={handleSave}
            className="px-8 py-2 bg-neutral-900 text-white text-[10px] font-bold uppercase flex items-center gap-2"
          >
            <Check className="w-3 h-3" />
            {language === "RU" ? "СОХРАНИТЬ" : "SAVE"}
          </button>
        </footer>
      </motion.div>
    </div>
  );
}
