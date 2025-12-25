
import React, { useState, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import * as XLSX from 'xlsx';
import { Upload, Download, Settings, X, Clipboard, Copy, Check, Sparkles, Eye, EyeOff, Trophy } from 'lucide-react';
import { Participant, WhitelistItem, Winner } from '../types';

interface AdminDashboardProps {
  whitelist: WhitelistItem[];
  winners: Winner[];
  showQR: boolean;
  setShowQR: (v: boolean) => void;
  onImport: (list: Participant[]) => void;
  onLoadDemo: () => void;
  onDraw: () => void;
  onResetWinners: () => void;
  onReset: () => void;
  isDrawing: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  whitelist, winners, showQR, setShowQR, onImport, onLoadDemo, onDraw, onResetWinners, onReset, isDrawing 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<'import' | 'lucky'>('import');
  const [pasteText, setPasteText] = useState('');
  const [copied, setCopied] = useState(false);
  
  const currentUrl = useMemo(() => {
    const base = window.location.origin + window.location.pathname;
    const cleanBase = base.endsWith('/') ? base : base + '/';
    return `${cleanBase}#/checkin`;
  }, []);

  const checkedInCount = useMemo(() => whitelist.filter(w => w.hasCheckedIn).length, [whitelist]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json<any>(worksheet);
        const parsed = data.map(item => ({
          name: String(item.姓名 || item.name || '').trim(),
          phone: item.手机 || item.电话 || item.phone ? String(item.手机 || item.电话 || item.phone).trim() : undefined
        })).filter(p => p.name);
        if (parsed.length > 0) onImport(parsed);
        else alert('文件无效');
      } catch (err) { alert('解析失败'); }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-6 right-6 z-50 p-3 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md border border-white/10 transition-all text-white/70 hover:text-white cursor-pointer shadow-lg"
      >
        <Settings size={22} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 w-full max-w-4xl rounded-3xl flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <div className="flex gap-4">
                <button 
                  onClick={() => setTab('import')}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${tab === 'import' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'}`}
                >
                  名单管理
                </button>
                <button 
                  onClick={() => setTab('lucky')}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${tab === 'lucky' ? 'bg-amber-600 text-white' : 'text-gray-500 hover:text-white'}`}
                >
                  幸运抽奖
                </button>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white p-2">
                <X size={28} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {tab === 'import' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <button onClick={() => { onLoadDemo(); setIsOpen(false); }} className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all">
                      <Sparkles size={20} className="text-yellow-400" /> 加载演示数据
                    </button>
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">导入名单</h3>
                      <div className="relative group border-2 border-dashed border-white/10 rounded-2xl p-6 hover:border-blue-500/50 transition-all">
                        <input type="file" accept=".xlsx, .xls, .csv, .txt" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        <div className="text-center text-gray-400 text-sm">点击或拖拽上传 Excel (含“姓名”)</div>
                      </div>
                      <textarea value={pasteText} onChange={(e) => setPasteText(e.target.value)} placeholder="姓名 手机(可选)" className="w-full h-32 bg-black/30 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500" />
                      <button onClick={() => { 
                        const lines = pasteText.split('\n').filter(l => l.trim());
                        const parsed = lines.map(line => {
                          const pts = line.split(/[\s,，\t]+/).filter(p => p.trim());
                          return { name: pts[0], phone: pts[1] };
                        }).filter(p => p.name);
                        if(parsed.length) onImport(parsed);
                        setPasteText('');
                      }} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">导入粘贴内容</button>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-400 uppercase">当前签到进度</p>
                        <p className="text-3xl font-black text-white">{checkedInCount} / {whitelist.length}</p>
                      </div>
                      <button onClick={() => setShowQR(!showQR)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${showQR ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {showQR ? <Eye size={16} /> : <EyeOff size={16} />}
                        {showQR ? '二维码已显示' : '二维码已隐藏'}
                      </button>
                    </div>
                    <button onClick={onReset} className="w-full py-3 border border-red-500/30 text-red-500/60 hover:bg-red-500/10 rounded-xl text-sm transition-all">彻底清空数据</button>
                    <div className="p-6 bg-white rounded-2xl flex flex-col items-center">
                      <p className="text-slate-900 text-sm font-bold mb-3">签到入口二维码</p>
                      <QRCodeSVG value={currentUrl} size={140} />
                      <button onClick={handleCopyLink} className="mt-4 text-[10px] text-slate-500 flex items-center gap-2">
                        {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />} 复制链接
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full gap-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-white/5 rounded-3xl p-8 border border-white/10 flex flex-col items-center justify-center text-center space-y-6">
                      <Trophy size={64} className="text-amber-500 animate-pulse" />
                      <div>
                        <h3 className="text-2xl font-bold text-white">幸运大抽奖</h3>
                        <p className="text-gray-400 mt-2">点击下方按钮，从已签到的 {checkedInCount} 人中抽取一名幸运儿</p>
                      </div>
                      <button 
                        disabled={isDrawing || checkedInCount === 0}
                        onClick={onDraw}
                        className={`px-12 py-5 rounded-2xl text-xl font-black transition-all shadow-2xl ${isDrawing || checkedInCount === 0 ? 'bg-gray-700 cursor-not-allowed text-gray-500' : 'bg-gradient-to-r from-amber-600 to-orange-500 hover:scale-105 active:scale-95 text-white'}`}
                      >
                        {isDrawing ? '正在抽取...' : '开始抽取'}
                      </button>
                    </div>
                    <div className="bg-black/40 rounded-3xl p-6 border border-white/5 flex flex-col">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest">中奖名单 ({winners.length})</h4>
                        <button onClick={onResetWinners} className="text-[10px] text-red-400 hover:text-red-300">清空</button>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                        {winners.map((w, i) => (
                          <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5 flex justify-between items-center animate-fade-in">
                            <span className="text-white font-bold">{w.name}</span>
                            <span className="text-xs text-amber-500/70"># {winners.length - i}</span>
                          </div>
                        ))}
                        {winners.length === 0 && <p className="text-center text-gray-700 py-10 text-sm italic">暂无中奖记录</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showQR && !isOpen && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center animate-fade-in-up">
          <div className="relative p-1.5 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl shadow-[0_0_50px_rgba(59,130,246,0.6)]">
            <div className="p-4 bg-white rounded-[1.25rem]">
              <QRCodeSVG value={currentUrl} size={160} />
            </div>
            <div className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden">
               <div className="w-full h-[2px] bg-blue-400/50 absolute top-0 animate-scan shadow-[0_0_15px_rgba(96,165,250,1)]"></div>
            </div>
          </div>
          <div className="mt-6 px-10 py-3 bg-black/60 backdrop-blur-2xl border border-white/20 rounded-full flex items-center gap-4 shadow-2xl">
            <p className="text-white text-base font-bold tracking-[0.2em]">请使用微信扫码签到</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in-up { from { opacity: 0; transform: translate(-50%, 40px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @keyframes scan { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        @keyframes fade-in { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
        .animate-fade-in-up { animation: fade-in-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-scan { animation: scan 3s linear infinite; }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </>
  );
};

export default AdminDashboard;
