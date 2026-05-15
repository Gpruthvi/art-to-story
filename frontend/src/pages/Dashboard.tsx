import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { CheckCircle2, Clock, Loader2 } from 'lucide-react';

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const res = await axios.get(`http://localhost:5001/api/orders/${orderId}`);
      return res.data;
    },
    enabled: !!orderId,
    refetchInterval: (data) => (data?.state?.data?.status === 'COMPLETED' ? false : 5000),
  });

  return (
    <div className="bg-slate-50 min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-32 pb-20 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">My Adventures</h2>
        
        {!orderId && (
          <div className="p-12 bg-white rounded-3xl text-center border border-slate-100">
            <p className="text-slate-500">You haven't created any stories yet.</p>
          </div>
        )}

        {isLoading && orderId && (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        )}

        {order && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Adventure Order</h3>
                <p className="text-slate-500 text-sm">ID: {order.id}</p>
              </div>
              <div className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 ${
                order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
              }`}>
                {order.status === 'COMPLETED' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4 animate-pulse" />}
                {order.status}
              </div>
            </div>

            {order.status === 'COMPLETED' && order.storyBook ? (
              <div className="space-y-12">
                <h4 className="text-3xl font-serif font-bold text-center text-slate-900">{order.storyBook.title}</h4>
                <div className="grid gap-12">
                  {order.storyBook.content.map((page: any, i: number) => (
                    <div key={i} className="flex flex-col md:flex-row gap-8 items-center bg-slate-50 p-6 rounded-2xl">
                      <img src={page.imageUrl} alt={`Page ${i+1}`} className="w-full md:w-1/2 rounded-xl shadow-lg" />
                      <div className="md:w-1/2">
                        <span className="text-primary-600 font-bold text-sm uppercase tracking-widest mb-2 block">Page {i+1}</span>
                        <p className="text-xl text-slate-800 leading-relaxed font-serif">{page.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <p className="text-xl text-slate-600">The AI is currently illustrating your story. This takes about 2-3 minutes...</p>
                <div className="mt-8 flex justify-center">
                  <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-600 animate-progress" style={{ width: '60%' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
