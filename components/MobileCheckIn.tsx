
import React, { useState } from 'react';
import { User, Phone, CheckCircle2 } from 'lucide-react';

interface MobileCheckInProps {
  onCheckIn: (name: string, phone?: string) => { success: boolean; message: string };
}

const MobileCheckIn: React.FC<MobileCheckInProps> = ({ onCheckIn }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setStatus({ type: 'error', message: '请填写姓名' });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = onCheckIn(name.trim(), phone.trim() || undefined);
      if (res.success) {
        setStatus({ type: 'success', message: res.message });
      } else {
        setStatus({ type: 'error', message: res.message });
      }
      setIsLoading(false);
    }, 600);
  };

  if (status.type === 'success') {
    return (
      <div className="min-h-screen bg-[#0a0a2e] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce shadow-[0_0_40px_rgba(34,197,94,0.4)]">
          <CheckCircle2 size={48} className="text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">签到成功</h2>
        <p className="text-gray-400 mb-8">{status.message}</p>
        <p className="text-blue-400 font-medium text-lg">您的名字已出现在大屏幕粒子云中！</p>
        <button 
          onClick={() => setStatus({ type: 'idle', message: '' })}
          className="mt-12 text-sm text-gray-500 hover:text-white border border-gray-700 px-6 py-2 rounded-full"
        >
          返回重新录入
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center p-6">
      <div className="w-full max-w-md mt-12 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            会议签到入口
          </h1>
          <p className="mt-2 text-gray-400">请输入您的姓名完成身份核验</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-lg shadow-2xl">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1 flex justify-between">
              <span>真实姓名</span>
              <span className="text-red-500 text-xs">* 必填</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入您的姓名"
                autoComplete="name"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1 flex justify-between">
              <span>手机号码</span>
              <span className="text-gray-500 text-xs">选填</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input 
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="请输入您的手机号"
                autoComplete="tel"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>

          {status.type === 'error' && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center animate-pulse">
              {status.message}
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold text-white transition-all transform active:scale-95 shadow-lg flex justify-center items-center ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                核验中...
              </span>
            ) : '提交签到'}
          </button>
        </form>

        <div className="text-center text-gray-600 text-xs py-4">
          Powered by DreamyCheckin © 2024
        </div>
      </div>
    </div>
  );
};

export default MobileCheckIn;
