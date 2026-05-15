import { useState } from 'react';
import Navbar from '../components/Navbar';
import UploadWizard from '../components/UploadWizard';
import axios from 'axios';

const CreateStory = () => {
  const [loading, setLoading] = useState(false);
  const [orderInfo, setOrderInfo] = useState<any>(null);

  const handleUploadComplete = async (files: File[]) => {
    setLoading(true);
    try {
      // 1. Init Order
      const initRes = await axios.post('http://localhost:5001/api/orders/init', {
        email: 'user@example.com', // In a real app, get from auth
        name: 'Guest User',
        theme: 'Space Explorer',
        amount: 299, // 299 INR
      });

      const { orderId } = initRes.data;

      // 2. Upload Files
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      formData.append('orderId', orderId);

      await axios.post('http://localhost:5001/api/orders/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setOrderInfo(initRes.data);
      alert('Order initiated! Now proceed to payment (simulated).');
      
      // 3. Simulate Payment Success for this demo
      await axios.post('http://localhost:5001/api/orders/payment-success', {
        orderId,
        razorpayOrderId: initRes.data.razorpayOrderId,
        razorpayPaymentId: 'pay_test_123',
        razorpaySignature: 'sig_test_123', // In real app, this is verified
      });

      window.location.href = `/dashboard?orderId=${orderId}`;
    } catch (error) {
      console.error(error);
      alert('Failed to initiate order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-32 pb-20 sm:px-6 lg:px-8 flex flex-col items-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">Let's build your story</h2>
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-600 font-medium">Processing your magic...</p>
          </div>
        ) : (
          <UploadWizard onComplete={handleUploadComplete} />
        )}
      </div>
    </div>
  );
};

export default CreateStory;
