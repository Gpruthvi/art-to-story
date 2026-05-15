import Navbar from '../components/Navbar';
import Hero from '../components/Hero';

const Home = () => {
  return (
    <div className="bg-white">
      <Navbar />
      <Hero />
      
      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 border-t border-slate-100">
        <div className="grid md:grid-cols-3 gap-12 text-center">
          <div>
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary-600 font-bold text-2xl">1</div>
            <h3 className="text-xl font-bold mb-4 text-slate-900">Upload Art</h3>
            <p className="text-slate-600">Upload your child's drawings or photos. Our AI learns their unique features.</p>
          </div>
          <div>
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary-600 font-bold text-2xl">2</div>
            <h3 className="text-xl font-bold mb-4 text-slate-900">Choose Adventure</h3>
            <p className="text-slate-600">Select from magical themes. The AI generates a 10-page custom story script.</p>
          </div>
          <div>
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary-600 font-bold text-2xl">3</div>
            <h3 className="text-xl font-bold mb-4 text-slate-900">Get Your Book</h3>
            <p className="text-slate-600">Download a digital PDF or order a premium hardcover book delivered to your door.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
