import React from "react";
import { motion } from "framer-motion";

interface PageWrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ title, description, children }) => (
  <>
    <div className="flex min-h-screen bg-[#f8f6f2] font-sans">
      {/* Left side – premium branding */}
      <div className="hidden lg:flex w-1/2 bg-[#0B1F3A] flex-col justify-center items-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#f4a92a] rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#0f6e56] rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-[#1a5fa8] rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center text-white px-12"
        >
          <h1 className="text-5xl font-bold mb-6 tracking-tight">{title}</h1>
          {description && <p className="text-xl text-gray-300 max-w-md mx-auto leading-relaxed">{description}</p>}
        </motion.div>
      </div>

      {/* Right side – page content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>
      </div>
    </div>
  </>
);

export default PageWrapper;
