import React, { useState, useRef } from 'react';
import { compressImage } from '../lib/imageCompression';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Image as ImageIcon, Video, FileEdit, Trash2, Plus, Save, ChevronLeft, X, CheckCircle2 } from 'lucide-react';
import { PortfolioBlock, CustomModule } from '../types';

interface CourseBuilderConfig {
  coverImage?: string;
  modules?: CustomModule[];
}

interface CourseBuilderProps {
  course: PortfolioBlock;
  onClose: () => void;
  customConfig: CourseBuilderConfig;
  onSaveConfig: (config: CourseBuilderConfig) => void;
  language: 'RU' | 'EN';
}

export default function CourseBuilder({ course, onClose, customConfig, onSaveConfig, language }: CourseBuilderProps) {
  const defaultCover = course.image;
  const [coverImage, setCoverImage] = useState<string>(customConfig?.coverImage || "");
  const [modules, setModules] = useState<CustomModule[]>(customConfig?.modules || []);
  const [isUploading, setIsUploading] = useState(false);

  // Sync with prop changes (e.g. when opening the builder)
  React.useEffect(() => {
    setCoverImage(customConfig?.coverImage || "");
    setModules(customConfig?.modules || []);
  }, [customConfig]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Compress image before upload
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
      
      setter(data.url);
      setIsUploading(false);
    } catch (err) {
      console.error('Upload failed', err);
      alert(language === 'RU' ? 'Ошибка загрузки' : 'Upload failed');
      setIsUploading(false);
    }
    
    // reset input
    e.target.value = '';
  };

  const handleSave = () => {
    onSaveConfig({ coverImage, modules });
  };

  const updateCover = (val: string) => {
    setCoverImage(val);
  };

  const addModule = (type: 'theory' | 'practice' | 'test') => {
    let titleRu = 'НОВЫЙ МОДУЛЬ';
    let titleEn = 'NEW MODULE';
    if (type === 'practice') {
      titleRu = 'ПРАКТИЧЕСКОЕ ЗАДАНИЕ';
      titleEn = 'PRACTICAL ASSIGNMENT';
    } else if (type === 'test') {
      titleRu = 'ТЕСТ';
      titleEn = 'TEST';
    }
    
    const newModules: CustomModule[] = [...modules, {
      id: 'mod_' + Date.now(),
      titleRu,
      titleEn,
      type: type as any,
      mediaType: type === 'test' ? 'text' : (type === 'practice' ? 'svg' : 'video'),
      mediaData: '',
      askCuratorEnabled: false,
      lessons: [],
      testQuestions: type === 'test' ? [{ id: 'q_' + Date.now(), question: '', options: ['', ''], correctOptionIndex: 0 }] : undefined
    }];
    setModules(newModules);
  };

  const updateModule = (index: number, field: string, value: unknown) => {
    const newModules = [...modules];
    newModules[index] = { ...newModules[index], [field]: value };
    setModules(newModules);
  };

  const removeModule = (index: number) => {
    const newModules = [...modules];
    newModules.splice(index, 1);
    setModules(newModules);
  };

  const handleSaveAndClose = () => {
    handleSave();
    onClose();
  };

  return (
          
      <div className="fixed inset-0 z-[250] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={handleSaveAndClose} 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white max-w-5xl w-full max-h-[95vh] flex flex-col relative shadow-2xl border border-neutral-300 overflow-hidden font-sans"
      >
        <header className="border-b border-neutral-200 bg-neutral-50 p-5 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={handleSaveAndClose} className="text-neutral-500 hover:text-neutral-900 transition-colors flex items-center gap-2 text-xs font-mono uppercase font-bold tracking-wider">
              <ChevronLeft className="w-4 h-4" />
              {language === 'RU' ? 'К ПАНЕЛИ АДМИНА' : 'BACK TO ADMIN'}
            </button>
            <div className="w-[1px] h-4 bg-neutral-300" />
            <h2 className="text-sm font-mono font-black uppercase text-neutral-900">
              {language === 'RU' ? `Редактор курса: ${course.title}` : `Course Builder: ${course.title}`}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleSaveAndClose} className="flex items-center gap-2 bg-[#0284c7] text-white px-5 py-2.5 hover:bg-[#0369a1] text-xs font-mono uppercase font-bold tracking-wider transition-all shadow-md active:scale-95">
              <Save className="w-4 h-4" />
              {language === 'RU' ? 'СОХРАНИТЬ' : 'SAVE'}
            </button>
            <button 
              onClick={handleSaveAndClose}
              className="p-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-500 transition-colors border border-neutral-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-neutral-50/50 scrollbar-thin scrollbar-thumb-neutral-300">
          <div className="max-w-4xl mx-auto space-y-8">
            
            <div className="bg-white border border-neutral-200 p-8 shadow-sm">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider mb-6 border-b border-neutral-100 pb-3 text-neutral-500">
                {language === 'RU' ? '1. ОБЛОЖКА КУРСА ВНУТРИ КЛАССА' : '1. COURSE COVER INSIDE CLASSROOM'}
              </h3>
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-8">
                  <div className="w-full sm:w-72 aspect-[5/3] bg-neutral-100 relative overflow-hidden border border-neutral-200">
                    {coverImage ? (
                      <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                    ) : defaultCover ? (
                      <img src={defaultCover} alt="Cover" className="w-full h-full object-cover opacity-50" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400 font-mono uppercase font-bold">
                         {language === 'RU' ? 'НЕТ ОБЛОЖКИ' : 'NO COVER'}
                      </div>
                    )}
                    {(coverImage === "" && defaultCover) && (
                      <div className="absolute top-2 left-2 bg-neutral-900/80 text-white text-[8px] px-1.5 py-0.5 font-mono uppercase">
                        {language === 'RU' ? 'ОРИГИНАЛ' : 'ORIGINAL'}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/5 pointer-events-none" />
                  </div>
                  <div className="flex flex-col gap-3 w-full sm:w-auto">
                    <label className="cursor-pointer bg-neutral-950 text-white px-6 py-3 text-xs font-mono uppercase font-bold tracking-wider flex items-center justify-center gap-2 hover:bg-neutral-800 transition shadow-sm active:scale-95">
                      <Camera className="w-4 h-4" />
                      {isUploading ? (language === 'RU' ? 'ЗАГРУЗКА...' : 'UPLOADING...') : (language === 'RU' ? 'ЗАГРУЗИТЬ ФАЙЛ' : 'UPLOAD FILE')}
                      <input type="file" accept="image/*" className="hidden" disabled={isUploading} onChange={(e) => handleImageUpload(e, updateCover)} />
                    </label>
                    {coverImage && (
                      <button onClick={() => updateCover('')} className="bg-red-50 text-red-600 px-4 py-2 text-[10px] font-mono uppercase font-bold border border-red-200 hover:bg-red-100 transition shadow-sm active:scale-95 flex items-center justify-center gap-2">
                        <Trash2 className="w-3.5 h-3.5" />
                        {language === 'RU' ? 'СБРОСИТЬ' : 'RESET COVER'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="w-full">
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest font-mono mb-1.5">
                    {language === 'RU' ? 'ИЛИ ПРЯМАЯ ССЫЛКА НА ОБЛОЖКУ (РЕКОМЕНДУЕТСЯ)' : 'OR DIRECT LINK TO COVER (RECOMMENDED)'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="https://images.postimages.org/... / https://..."
                      className="w-full text-xs p-3.5 border border-neutral-300 focus:outline-none focus:border-neutral-900 bg-white"
                      value={coverImage}
                      onChange={(e) => updateCover(e.target.value)}
                    />
                  </div>
                  <p className="text-[10px] font-mono text-neutral-400 mt-1.5 leading-relaxed">
                    {language === 'RU' 
                      ? '💡 РЕКОМЕНДАЦИЯ: Чтобы обложка не исчезала после обновлений или перезапусков сервера, загрузите картинку на бесплатный фотохостинг (например, Postimages.org, ImgBB.com) и вставьте прямую ссылку сюда.' 
                      : '💡 RECOMMENDED: To prevent cover erasure on server restarts, upload your image to a free image hosting service (such as Postimages.org, ImgBB.com) and paste the direct link here.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 p-8 shadow-sm">
              <div className="flex justify-between items-center mb-8 border-b border-neutral-100 pb-3">
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-500">
                  {language === 'RU' ? '2. МОДУЛИ И ПРАКТИКА' : '2. MODULES & PRACTICE'}
                </h3>
                <div className="flex gap-2">
                  <button onClick={() => addModule('theory')} className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-emerald-100 transition-colors active:scale-95">
                    <Plus className="w-3.5 h-3.5" />
                    {language === 'RU' ? 'МОДУЛЬ' : 'MODULE'}
                  </button>
                  <button onClick={() => addModule('practice')} className="flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-200 px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-purple-100 transition-colors active:scale-95">
                    <FileEdit className="w-3.5 h-3.5" />
                    {language === 'RU' ? 'ПРАКТИКА' : 'PRACTICE'}
                  </button>
                  <button onClick={() => addModule('test')} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-blue-100 transition-colors active:scale-95">
                    <Plus className="w-3.5 h-3.5" />
                    {language === 'RU' ? 'ТЕСТ' : 'TEST'}
                  </button>
                </div>
              </div>

              <div className="space-y-8">
                {modules.length === 0 && (
                  <div className="text-center py-16 text-neutral-400 font-mono text-xs uppercase tracking-wider border-2 border-dashed border-neutral-100">
                    {language === 'RU' ? 'НЕТ МОДУЛЕЙ' : 'NO MODULES ADDED'}
                  </div>
                )}
                {modules.map((mod, index) => (
                  <div key={mod.id} className="border border-neutral-200 bg-neutral-50/50 p-6 relative group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1 mr-4">
                        <label className="block text-[9px] font-mono text-neutral-500 uppercase tracking-widest mb-1.5 font-bold">
                          {language === 'RU' ? 'НАЗВАНИЕ МОДУЛЯ' : 'MODULE TITLE'}
                        </label>
                        <input 
                          type="text" 
                          value={language === 'RU' ? mod.titleRu : mod.titleEn}
                          onChange={(e) => updateModule(index, language === 'RU' ? 'titleRu' : 'titleEn', e.target.value)}
                          className="w-full px-4 py-3 border border-neutral-300 font-bold focus:outline-none focus:border-neutral-900 bg-white shadow-sm transition-all"
                          placeholder="Module title"
                        />
                      </div>
                      <button onClick={() => removeModule(index)} className="text-neutral-400 hover:text-red-500 transition-colors p-2 mt-4">
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>

                    {mod.type === 'test' ? (
                      <div className="mb-6 space-y-4">
                        <label className="block text-[9px] font-mono text-neutral-500 uppercase tracking-widest mb-2.5 font-bold">
                          {language === 'RU' ? 'ВОПРОСЫ ТЕСТА' : 'TEST QUESTIONS'}
                        </label>
                        {(mod.testQuestions || []).map((q, qIndex) => (
                          <div key={q.id} className="p-4 border border-neutral-200 bg-white shadow-sm relative">
                            <button
                              onClick={() => {
                                const qs = [...(mod.testQuestions || [])];
                                qs.splice(qIndex, 1);
                                updateModule(index, 'testQuestions', qs);
                              }}
                              className="absolute top-2 right-2 text-neutral-400 hover:text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <input
                              type="text"
                              value={q.question}
                              onChange={(e) => {
                                const qs = [...(mod.testQuestions || [])];
                                qs[qIndex].question = e.target.value;
                                updateModule(index, 'testQuestions', qs);
                              }}
                              placeholder={language === 'RU' ? 'Введите вопрос...' : 'Enter question...'}
                              className="w-full px-3 py-2 border border-neutral-300 font-medium text-sm mb-3 focus:outline-none focus:border-neutral-900"
                            />
                            <div className="space-y-2 pl-4 border-l-2 border-blue-100">
                              {q.options.map((opt, optIdx) => (
                                <div key={optIdx} className="flex gap-2 items-center">
                                  <input 
                                    type="radio"
                                    name={`correct_${mod.id}_${q.id}`}
                                    checked={q.correctOptionIndex === optIdx}
                                    onChange={() => {
                                      const qs = [...(mod.testQuestions || [])];
                                      qs[qIndex].correctOptionIndex = optIdx;
                                      updateModule(index, 'testQuestions', qs);
                                    }}
                                    className="accent-blue-600"
                                  />
                                  <input 
                                    type="text"
                                    value={opt}
                                    onChange={(e) => {
                                      const qs = [...(mod.testQuestions || [])];
                                      qs[qIndex].options[optIdx] = e.target.value;
                                      updateModule(index, 'testQuestions', qs);
                                    }}
                                    placeholder={language === 'RU' ? `Вариант ${optIdx + 1}` : `Option ${optIdx + 1}`}
                                    className="flex-1 px-3 py-1 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-900"
                                  />
                                  <button
                                    onClick={() => {
                                      const qs = [...(mod.testQuestions || [])];
                                      qs[qIndex].options.splice(optIdx, 1);
                                      if (qs[qIndex].correctOptionIndex >= qs[qIndex].options.length) {
                                        qs[qIndex].correctOptionIndex = Math.max(0, qs[qIndex].options.length - 1);
                                      }
                                      updateModule(index, 'testQuestions', qs);
                                    }}
                                    className="text-neutral-400 hover:text-red-500"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={() => {
                                  const qs = [...(mod.testQuestions || [])];
                                  qs[qIndex].options.push('');
                                  updateModule(index, 'testQuestions', qs);
                                }}
                                className="text-xs text-blue-600 font-medium mt-2 hover:underline flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                {language === 'RU' ? 'Добавить вариант' : 'Add option'}
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const qs = [...(mod.testQuestions || [])];
                            qs.push({ id: 'q_' + Date.now(), question: '', options: ['', ''], correctOptionIndex: 0 });
                            updateModule(index, 'testQuestions', qs);
                          }}
                          className="bg-blue-50 text-blue-700 px-4 py-2 text-xs font-medium hover:bg-blue-100 flex items-center gap-2"
                        >
                          <Plus className="w-3.5 h-3.5" /> 
                          {language === 'RU' ? 'ДОБАВИТЬ ВОПРОС' : 'ADD QUESTION'}
                        </button>
                      </div>
                    ) : (
                      <div className="mb-6 space-y-4">
                        <label className="block text-[9px] font-mono text-neutral-500 uppercase tracking-widest font-bold">
                           {language === 'RU' ? 'КОНТЕНТ (ИЗОБРАЖЕНИЕ ИЛИ ВИДЕО)' : 'CONTENT (IMAGE OR VIDEO)'}
                        </label>
                        
                        <div className="flex flex-wrap gap-4 items-center">
                          <select 
                            value={mod.mediaType}
                            onChange={(e) => updateModule(index, 'mediaType', e.target.value)}
                            className="border border-neutral-300 px-4 py-3 text-xs font-mono focus:outline-none focus:border-neutral-900 bg-white"
                          >
                            <option value="svg">SVG / Image</option>
                            <option value="video">Video (MP4)</option>
                          </select>
                          
                          <label className="cursor-pointer bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50 px-6 py-3 text-xs font-mono uppercase font-bold tracking-wider flex items-center gap-2 shadow-sm transition-all active:scale-95">
                            {mod.mediaType === 'svg' ? <ImageIcon className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                            {language === 'RU' ? 'ВЫБРАТЬ И ЗАГРУЗИТЬ ФАЙЛ' : 'CHOOSE & UPLOAD FILE'}
                            <input 
                              type="file" 
                              accept={mod.mediaType === 'svg' ? "image/svg+xml,image/*" : "video/mp4,video/*"} 
                              className="hidden" 
                              onChange={(e) => handleImageUpload(e, (val) => updateModule(index, 'mediaData', val))} 
                            />
                          </label>
                        </div>

                        <div className="w-full">
                          <label className="block text-[9px] font-mono text-neutral-500 uppercase tracking-widest font-bold mb-1.5">
                            {language === 'RU' ? 'ИЛИ ПРЯМАЯ ССЫЛКА НА КОНТЕНТ (РЕКОМЕНДУЕТСЯ)' : 'OR DIRECT LINK TO CONTENT (RECOMMENDED)'}
                          </label>
                          <input
                            type="text"
                            placeholder="https://..."
                            className="w-full text-xs p-3.5 border border-neutral-300 focus:outline-none focus:border-neutral-900 bg-white"
                            value={mod.mediaData}
                            onChange={(e) => updateModule(index, 'mediaData', e.target.value)}
                          />
                          <p className="text-[10px] font-mono text-neutral-400 mt-1.5 leading-relaxed">
                            {language === 'RU'
                              ? '💡 РЕКОМЕНДАЦИЯ: Во избежание удаления медиафайлов при перезапусках сервера, выгружайте их на стабильные ресурсы (хостинги картинок вроде Postimages, или для больших видео YouTube/Dropbox/Vimeo) и указывайте прямую ссылку.'
                              : '💡 RECOMMENDED: To keep media secure and avoid server restart deletions, host them on external resources (image hosting like Postimages, or YouTube/Dropbox/Vimeo for video files) and paste the link.'}
                          </p>
                        </div>
                        
                        {mod.mediaData && (
                          <div className="mt-4 p-4 bg-emerald-50 border border-dashed border-emerald-300 text-emerald-800 text-[10px] font-mono font-bold text-center uppercase tracking-wider flex items-center justify-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>
                              {language === 'RU' 
                                ? `ВЫСТАВЛЕН КОНТЕНТ: ${mod.mediaData.startsWith('http') ? 'ПО ПРЯМОЙ ССЫЛКЕ' : 'ЛОКАЛЬНЫЙ ФАЙЛ'}` 
                                : `CONTENT ACTIVE: ${mod.mediaData.startsWith('http') ? 'BY DIRECT LINK' : 'LOCAL FILE'}`}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 mt-6 pt-6 border-t border-dashed border-neutral-200">
                      <input 
                        type="checkbox" 
                        id={`ask-curator-mod-${mod.id}`}
                        checked={!!mod.askCuratorEnabled}
                        onChange={(e) => updateModule(index, 'askCuratorEnabled', e.target.checked)}
                        className="w-4 h-4 cursor-pointer border-neutral-300 rounded text-neutral-900 focus:ring-0"
                      />
                      <label htmlFor={`ask-curator-mod-${mod.id}`} className="text-[10px] font-mono font-bold cursor-pointer text-neutral-600 uppercase tracking-tight">
                        {language === 'RU' ? 'Возможность задать вопрос куратору' : 'Enable Ask Curator Form'}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
      );
}
