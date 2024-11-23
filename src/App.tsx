import { useState } from 'react';
import ScanDevices from './pages/ScanDevices';
import Index from './pages/Index';

const App = () => {
  const [currentPage, setCurrentPage] = useState<'scan' | 'monitor'>('scan');

  return (
    <div className="container mx-auto px-4 py-8">
      {currentPage === 'scan' ? (
        <ScanDevices onConnect={() => setCurrentPage('monitor')} />
      ) : (
        <Index onBack={() => setCurrentPage('scan')} />
      )}
    </div>
  );
};

export default App;