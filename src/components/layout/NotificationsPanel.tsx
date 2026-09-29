"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  /** Owned by the Header so its unread badge stays in step with the panel. */
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export type Notification = {
  id: string;
  type: 'user' | 'money' | 'warning' | 'plant';
  title: string;
  description: string;
  time: string;
  isUnread: boolean;
  group: 'TODAY' | 'YESTERDAY';
};

export const NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'user',
    title: 'Lelise Gudeta KYC approved',
    description: 'The national registry database matched the biometric and land deed documentation successfully.',
    time: '2 hours ago',
    isUnread: true,
    group: 'TODAY'
  },
  {
    id: '2',
    type: 'money',
    title: 'Payment of ETB 4,500 released to Chaltu Dinkesa',
    description: 'Government agricultural subsidy for Teff production has been credited to the designated commercial account.',
    time: '4 hours ago',
    isUnread: true,
    group: 'TODAY'
  },
  {
    id: '3',
    type: 'warning',
    title: 'Overdue visit: Bako Tibe kebele',
    description: 'Development agent agenda requires field visit assessment for crop yield estimates on sector 4 plots.',
    time: 'Yesterday, 4:10 PM',
    isUnread: true,
    group: 'YESTERDAY'
  },
  {
    id: '4',
    type: 'plant',
    title: 'New crop record submitted — Teff, Gedo',
    description: 'Farmer Chaltu Dinkesa submitted baseline agricultural yield report.',
    time: 'Yesterday, 9:30 AM',
    isUnread: false,
    group: 'YESTERDAY'
  }
];

export function NotificationsPanel({ isOpen, onClose, notifications, onMarkRead, onMarkAllRead }: NotificationsPanelProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0); return () => clearTimeout(t);
  }, []);

  // Prevent scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const filteredNotifications = activeTab === 'unread' 
    ? notifications.filter(n => n.isUnread)
    : notifications;

  const unreadCount = notifications.filter(n => n.isUnread).length;

  const todayNotifications = filteredNotifications.filter(n => n.group === 'TODAY');
  const yesterdayNotifications = filteredNotifications.filter(n => n.group === 'YESTERDAY');

  const getIcon = (type: string) => {
    switch (type) {
      case 'user':
        return (
          <div className="w-9 h-9 rounded-full bg-white border border-brand-green/20 text-brand-green flex items-center justify-center shrink-0">
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      case 'money':
        return (
          <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case 'plant':
        return (
          <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
        );
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-ink/20 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-[400px] h-full bg-white shadow-[-10px_0_40px_rgba(0,0,0,0.1)] flex flex-col animate-in slide-in-from-right-full duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-line-soft">
          <h2 className="text-xl font-bold text-ink">Notifications</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 text-ink-soft transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between px-6 border-b border-line-soft select-none">
          <div className="flex items-center h-full">
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-5 py-3.5 text-[14px] font-semibold transition-colors border-b-2 h-full ${
                activeTab === 'all' 
                  ? 'text-brand-green bg-brand-green/5 border-brand-green' 
                  : 'text-muted border-transparent hover:text-ink'
              }`}
            >
              All
            </button>
            <button 
              onClick={() => setActiveTab('unread')}
              className={`px-5 py-3.5 text-[14px] font-semibold transition-colors border-b-2 flex items-center gap-2 h-full ${
                activeTab === 'unread' 
                  ? 'text-brand-green bg-brand-green/5 border-brand-green' 
                  : 'text-muted border-transparent hover:text-ink'
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className="flex items-center justify-center bg-brand-green text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] h-5">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
          <button
            type="button"
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
            className="text-[13px] font-bold text-brand-green hover:text-emerald-800 transition-colors disabled:cursor-not-allowed disabled:text-subtle"
          >
            Mark all read
          </button>
        </div>

        {/* Scrollable Notifications List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
          
          {todayNotifications.length > 0 && (
            <>
              {/* TODAY Group */}
              <div className="px-5 py-2.5 bg-surface border-b border-line-soft">
                <span className="text-[11px] font-bold text-muted tracking-wider uppercase">Today</span>
              </div>
              
              {todayNotifications.map(notification => (
                <div 
                  key={notification.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onMarkRead(notification.id)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onMarkRead(notification.id); } }}
                  aria-label={notification.isUnread ? `Mark "${notification.title}" as read` : notification.title}
                  className={`flex px-4 py-4 border-b border-line-soft cursor-pointer transition-colors ${
                    notification.isUnread ? 'bg-brand-green/5 hover:bg-brand-green/10' : 'bg-white hover:bg-zinc-50'
                  }`}
                >
                  <div className="pt-2 shrink-0 w-4 flex justify-center">
                    {notification.isUnread && <div className="w-1.5 h-1.5 rounded-full bg-brand-green" />}
                  </div>
                  <div className="ml-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className={`text-[14px] ${notification.isUnread ? 'font-bold' : 'font-semibold'} text-ink`}>
                      {notification.title}
                    </h4>
                    <p className="text-[13px] text-muted mt-1 leading-snug pr-4">
                      {notification.description}
                    </p>
                    <span className="text-[12px] text-muted mt-1.5 block">{notification.time}</span>
                  </div>
                </div>
              ))}
            </>
          )}

          {yesterdayNotifications.length > 0 && (
            <>
              {/* YESTERDAY Group */}
              <div className="px-5 py-2.5 bg-surface border-b border-line-soft">
                <span className="text-[11px] font-bold text-muted tracking-wider uppercase">Yesterday</span>
              </div>
              
              {yesterdayNotifications.map(notification => (
                <div 
                  key={notification.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onMarkRead(notification.id)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onMarkRead(notification.id); } }}
                  aria-label={notification.isUnread ? `Mark "${notification.title}" as read` : notification.title}
                  className={`flex px-4 py-4 border-b border-line-soft cursor-pointer transition-colors ${
                    notification.isUnread ? 'bg-brand-green/5 hover:bg-brand-green/10' : 'bg-white hover:bg-zinc-50'
                  }`}
                >
                  <div className="pt-2 shrink-0 w-4 flex justify-center">
                    {notification.isUnread && <div className="w-1.5 h-1.5 rounded-full bg-brand-green" />}
                  </div>
                  <div className="ml-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className={`text-[14px] ${notification.isUnread ? 'font-bold' : 'font-semibold'} text-ink`}>
                      {notification.title}
                    </h4>
                    <p className="text-[13px] text-muted mt-1 leading-snug pr-4">
                      {notification.description}
                    </p>
                    <span className="text-[12px] text-muted mt-1.5 block">{notification.time}</span>
                  </div>
                </div>
              ))}
            </>
          )}

          {filteredNotifications.length === 0 && (
            <div className="p-8 text-center text-muted">
              No notifications to display.
            </div>
          )}

        </div>
      </div>
    </div>,
    document.body
  );
}
