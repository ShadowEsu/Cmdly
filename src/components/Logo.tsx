import React from 'react';
import { motion } from 'motion/react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'lg', showTagline = false }) => {
  const sizes = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
    xl: 'text-8xl'
  };

  const taglineSizes = {
    sm: 'text-[7px]',
    md: 'text-[10px]',
    lg: 'text-[11px]',
    xl: 'text-[13px]'
  };

  const isCentered = !className.includes('text-left');

  return (
    <div className={`flex flex-col flex-1 items-center justify-center p-6 ${className}`}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="inline-block"
      >
        <h1
          className={`font-sans ${sizes[size]} font-extrabold tracking-tight mb-2`}
          style={{ color: '#7c3aed' }}
        >
          regrade
        </h1>
        {showTagline && <div className={`h-0.5 w-12 rounded-full mx-auto mb-3`} style={{ background: 'linear-gradient(90deg, #7c3aed, #0d9488)' }} />}
      </motion.div>
      {showTagline && (
        <p
          className={`text-on-surface-variant font-sans font-medium opacity-70 ${taglineSizes[size]} text-center`}
        >
          Your grade appeal assistant
        </p>
      )}
    </div>
  );
};

export default Logo;
