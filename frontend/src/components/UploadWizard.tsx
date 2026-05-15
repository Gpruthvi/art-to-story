import { useState } from 'react';
import { Upload, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadWizardProps {
  onComplete: (files: File[]) => void;
}

const UploadWizard = ({ onComplete }: UploadWizardProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [step, setStep] = useState(1);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles].slice(0, 5));
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-2xl mx-auto w-full">
      <div className="flex justify-between mb-8">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
              step >= s ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-400'
            }`}>
              {s}
            </div>
            <span className={`font-medium ${step >= s ? 'text-slate-900' : 'text-slate-400'}`}>
              {s === 1 ? 'Upload Art/Photos' : 'Select Theme'}
            </span>
            {s === 1 && <div className="w-12 h-px bg-slate-200 mx-2" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Upload your assets</h3>
            <p className="text-slate-600 mb-6">Upload 3-5 drawings or photos of the child. These will be used to train the AI character.</p>
            
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center hover:border-primary-400 transition cursor-pointer relative">
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-900 font-semibold">Click to upload or drag and drop</p>
              <p className="text-slate-500 text-sm">PNG, JPG up to 10MB</p>
            </div>

            <div className="mt-6 space-y-3">
              {files.map((file, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-slate-700 font-medium truncate max-w-[200px]">{file.name}</span>
                  </div>
                  <button onClick={() => removeFile(i)} className="p-1 hover:bg-slate-200 rounded-full transition text-slate-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              disabled={files.length < 3}
              onClick={() => setStep(2)}
              className="w-full mt-8 py-4 bg-primary-600 text-white rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition shadow-lg shadow-primary-200"
            >
              Continue to Themes
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Pick a story theme</h3>
            <p className="text-slate-600 mb-6">Which adventure should our hero embark on?</p>
            
            <div className="grid grid-cols-2 gap-4">
              {['Space Explorer', 'Jungle Adventure', 'Deep Sea Mystery', 'Dinosaur Land'].map((theme) => (
                <button
                  key={theme}
                  onClick={() => onComplete(files)}
                  className="p-6 border border-slate-200 rounded-2xl text-left hover:border-primary-600 hover:bg-primary-50 transition group"
                >
                  <div className="w-10 h-10 bg-slate-100 rounded-xl mb-4 group-hover:bg-primary-100 transition" />
                  <span className="font-bold text-slate-900">{theme}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadWizard;
