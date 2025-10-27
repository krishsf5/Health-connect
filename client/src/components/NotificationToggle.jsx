import React from 'react';

export default function NotificationToggle({ checked, onChange, label, icon = 'bell' }) {
  const getIcon = () => {
    switch (icon) {
      case 'mail':
        return 'mail';
      case 'smartphone':
        return 'smartphone';
      case 'bell':
        return 'bell';
      case 'eye':
        return 'eye';
      case 'circle':
        return 'circle';
      default:
        return 'bell';
    }
  };

  return (
    <label className="notification-toggle">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <div className={`notification-toggle-track ${checked ? 'active' : ''}`}>
        <div className={`notification-toggle-thumb ${checked ? 'active' : ''}`}>
          <i
            data-lucide={getIcon()}
            className="notification-toggle-icon w-2.5 h-2.5"
          ></i>
        </div>
      </div>
      {label && (
        <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
        </span>
      )}
    </label>
  );
}
