import { useTranslation } from 'react-i18next';
import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../auth/store/authStore';
import { Upload, CheckCircle } from 'lucide-react';

export function ProfileTab() {
  const { t } = useTranslation();


  const { user } = useAuthStore();
  const [signature, setSignature] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.id) {
      const stored = localStorage.getItem('userSignature_' + user.id);
      if (stored) setSignature(stored);
    }
  }, [user]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result as string;
      setSignature(b64);
      if (user?.id) {
        localStorage.setItem('userSignature_' + user.id, b64);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">{t('tabs.profile.title', 'Hồ sơ cá nhân')}</h2>
      
      <div className="max-w-md space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('tabs.profile.displayName', 'Tên hiển thị')}</label>
          <input type="text" readOnly value={user?.name || ''} className="w-full rounded-lg bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 px-3 py-2 border" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('tabs.profile.role', 'Vai trò')}</label>
          <input type="text" readOnly value={user?.role || ''} className="w-full rounded-lg bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 px-3 py-2 border uppercase" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('tabs.profile.signature', 'Chữ ký điện tử')}</label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Chữ ký này sẽ được tự động điền vào các file báo cáo PDF (ví dụ: Kế hoạch mở quạt). Dùng nền trong suốt (PNG) để có kết quả tốt nhất.</p>
          
          <div className="flex flex-col gap-4">
            {signature ? (
              <div className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50">
                <img src={signature} alt="Signature" className="max-h-24 object-contain mb-2" />
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />{t('tabs.profile.sigSaved', 'Đã lưu chữ ký')}</div>
              </div>
            ) : (
              <div className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 text-slate-500">{t('tabs.profile.noSig', 'Chưa có chữ ký')}</div>
            )}
            
            <input 
              type="file" 
              accept="image/png, image/jpeg"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 w-full py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Upload className="w-4 h-4" /> {signature ? 'Tải lên chữ ký khác' : 'Tải lên chữ ký'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
