import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`btn btn-sm d-flex align-items-center justify-content-center p-2 rounded-circle border-0 ${className}`}
      style={{
        backgroundColor: 'var(--bg-subtle)',
        color: isDark ? 'var(--color-secondary)' : 'var(--color-primary)',
        width: '38px',
        height: '38px',
        transition: 'all 0.25s ease',
      }}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      aria-label="Toggle Theme"
    >
      {isDark ? <Sun size={19} /> : <Moon size={19} />}
    </button>
  );
};

export default ThemeToggle;
