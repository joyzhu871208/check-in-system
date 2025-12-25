
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import Visualizer3D from './components/Visualizer3D';
import MobileCheckIn from './components/MobileCheckIn';
import LuckyDrawOverlay from './components/LuckyDrawOverlay';
import { Participant, CheckInRecord, WhitelistItem, Winner } from './types';

const AppContent: React.FC = () => {
  const [whitelist, setWhitelist] = useState<WhitelistItem[]>(() => {
    const saved = localStorage.getItem('checkin_whitelist');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>(() => {
    const saved = localStorage.getItem('checkin_records');
    return saved ? JSON.parse(saved) : [];
  });

  const [winners, setWinners] = useState<Winner[]>(() => {
    const saved = localStorage.getItem('checkin_winners');
    return saved ? JSON.parse(saved) : [];
  });

  const [showQR, setShowQR] = useState(true);
  const [isLuckyDrawing, setIsLuckyDrawing] = useState(false);

  useEffect(() => {
    localStorage.setItem('checkin_whitelist', JSON.stringify(whitelist));
  }, [whitelist]);

  useEffect(() => {
    localStorage.setItem('checkin_records', JSON.stringify(checkIns));
  }, [checkIns]);

  useEffect(() => {
    localStorage.setItem('checkin_winners', JSON.stringify(winners));
  }, [winners]);

  const handleImport = (newParticipants: Participant[]) => {
    const items: WhitelistItem[] = newParticipants.map(p => ({
      ...p,
      hasCheckedIn: false
    }));
    setWhitelist(items);
    setCheckIns([]);
    setWinners([]);
    alert(`成功导入 ${items.length} 位学员`);
  };

  const handleLoadDemo = () => {
    const demoNames = ['张伟', '王芳', '李娜', '陆飞', '周杰伦', '艾伦', '张小明', '王大锤', '陈静', '刘德华', '周星驰', '林青霞', '苏格拉底', '柏拉图', '爱因斯坦'];
    const demoWhitelist: WhitelistItem[] = demoNames.map(name => ({
      name,
      hasCheckedIn: true,
      checkInTime: new Date().toLocaleString()
    }));
    const demoRecords: CheckInRecord[] = demoNames.map(name => ({
      name,
      timestamp: new Date().toLocaleString()
    }));
    
    setWhitelist(demoWhitelist);
    setCheckIns(demoRecords);
    setWinners([]);
  };

  const handleCheckIn = useCallback((name: string, phone?: string) => {
    let index = whitelist.findIndex(
      item => item.name === name && (!phone || item.phone === phone) && !item.hasCheckedIn
    );

    if (index === -1) {
      const alreadyIn = whitelist.some(item => item.name === name && item.hasCheckedIn);
      if (alreadyIn) return { success: true, message: '您已经签到过了' };
      return { success: false, message: '不在名单内，请核对姓名' };
    }

    const timestamp = new Date().toLocaleString();
    const newWhitelist = [...whitelist];
    newWhitelist[index] = { ...newWhitelist[index], hasCheckedIn: true, checkInTime: timestamp };
    setWhitelist(newWhitelist);

    const newRecord: CheckInRecord = { name, phone, timestamp };
    setCheckIns(prev => [...prev, newRecord]);

    return { success: true, message: '签到成功！' };
  }, [whitelist]);

  const handleDrawWinner = () => {
    // 排除已中奖的人
    const available = checkIns.filter(c => !winners.some(w => w.name === c.name));
    if (available.length === 0) {
      alert('没有更多符合抽奖条件的签到人员了');
      return;
    }

    setIsLuckyDrawing(true);
    // 模拟抽奖过程动画时长
    setTimeout(() => {
      const winner = available[Math.floor(Math.random() * available.length)];
      setWinners(prev => [winner, ...prev]);
      setIsLuckyDrawing(false);
    }, 3000);
  };

  const handleResetWinners = () => {
    if(confirm('确定要清空所有中奖记录吗？')) {
      setWinners([]);
    }
  };

  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={
          <div className="relative h-screen w-full overflow-hidden">
            <Visualizer3D checkIns={checkIns} mode={isLuckyDrawing ? 'drawing' : 'normal'} />
            
            <LuckyDrawOverlay 
              isDrawing={isLuckyDrawing} 
              lastWinner={winners[0]} 
              participants={checkIns} 
            />

            <AdminDashboard 
              whitelist={whitelist} 
              winners={winners}
              showQR={showQR}
              setShowQR={setShowQR}
              onImport={handleImport}
              onLoadDemo={handleLoadDemo}
              onDraw={handleDrawWinner}
              onResetWinners={handleResetWinners}
              isDrawing={isLuckyDrawing}
              onReset={() => {
                if(confirm('确定要重置所有数据吗？')) {
                  setWhitelist([]);
                  setCheckIns([]);
                  setWinners([]);
                }
              }}
            />
          </div>
        } />
        <Route path="/checkin" element={
          <MobileCheckIn onCheckIn={handleCheckIn} />
        } />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;
