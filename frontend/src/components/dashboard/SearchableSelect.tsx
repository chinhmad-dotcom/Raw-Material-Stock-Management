import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';

interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchableSelect({ options, value, onChange, placeholder = 'Select...', className = '' }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div
        className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-300 dark:border-sky-500/50 text-sm text-slate-900 dark:text-slate-100 rounded-md px-2 py-0.5 cursor-pointer hover:border-sky-400 h-[28px]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate pr-4 leading-none flex-1">{value || placeholder}</span>
        <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" />
      </div>

      {isOpen && (
        <div className="absolute z-[100] w-[300px] mt-1 left-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-xl max-h-[300px] overflow-hidden flex flex-col">
          <div className="p-2 border-b border-slate-200 dark:border-slate-700 flex items-center bg-white shrink-0">
            <Search className="h-4 w-4 text-slate-500 mr-2" />
            <input
              type="text"
              className="w-full bg-transparent text-black placeholder:text-slate-400 text-sm outline-none"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          <div className="overflow-y-auto custom-scrollbar flex-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-sky-600/30 ${value === opt ? 'bg-sky-50 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 font-medium' : 'text-slate-800 dark:text-slate-200'}`}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                >
                  {opt}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-slate-500">Không tìm thấy</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
