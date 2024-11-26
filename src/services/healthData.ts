export const fetchHealthData = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/health-data');
    if (!response.ok) {
      throw new Error('Lỗi kết nối với cảm biến');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    if (window.location.pathname === '/') {
      toast('Lỗi kết nối với cảm biến', {
        duration: 3000,
      });
    }
    throw error;
  }
};
