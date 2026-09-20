import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle2, XCircle, Inbox } from 'lucide-react';

const iconMap = { success: CheckCircle2, error: XCircle, info: Inbox };
const colorMap = {
    success: 'var(--teal)',
    error: 'var(--danger)',
    info: 'var(--amber)',
};

function NotificationBell({ notifications, onMarkRead, navigateTo }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const navigate = useNavigate();

    const unreadCount = notifications.filter((n) => !n.read).length;

    // Bahar click karne pe dropdown band ho jaye
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = (n) => {
        onMarkRead(n.id);
        setOpen(false);
        if (navigateTo) navigate(navigateTo);
    };

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    position: 'relative',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                }}
                aria-label="Notifications"
            >
                <Bell size={16} color="#fff" strokeWidth={2} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: '-4px', right: '-4px',
                        minWidth: '16px', height: '16px', padding: '0 4px',
                        backgroundColor: '#EF4444', color: '#fff',
                        fontSize: '9px', fontWeight: 800, borderRadius: '99px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1.5px solid var(--navy)',
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div style={{
                    position: 'absolute', top: '42px', right: 0, zIndex: 200,
                    width: '320px', maxHeight: '400px', overflowY: 'auto',
                    backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: '12px', boxShadow: '0 12px 32px rgba(22,36,71,0.2)',
                }}>
                    <div style={{
                        padding: '12px 16px', borderBottom: '1px solid var(--border)',
                        fontSize: '13px', fontWeight: 800, color: 'var(--ink)',
                    }}>
                        Notifications
                    </div>

                    {notifications.length === 0 ? (
                        <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: '12.5px', color: 'var(--muted)' }}>
                            No notifications yet
                        </div>
                    ) : (
                        notifications.map((n) => {
                            const Icon = iconMap[n.type] || Inbox;
                            const color = colorMap[n.type] || 'var(--muted)';
                            return (
                                <div
                                    key={n.id}
                                    onClick={() => handleNotificationClick(n)}
                                    style={{
                                        padding: '12px 16px',
                                        borderBottom: '1px solid var(--border)',
                                        backgroundColor: n.read ? 'transparent' : 'var(--bg)',
                                        cursor: 'pointer',
                                        display: 'flex', gap: '10px', alignItems: 'flex-start',
                                        transition: 'background-color 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--teal-light)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = n.read ? 'transparent' : 'var(--bg)')}
                                >
                                    <div style={{
                                        width: '28px', height: '28px', borderRadius: '8px',
                                        backgroundColor: color + '20', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        <Icon size={14} color={color} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)' }}>{n.title}</div>
                                        <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px', lineHeight: 1.4 }}>{n.message}</div>
                                    </div>
                                    {!n.read && (
                                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--teal)', flexShrink: 0, marginTop: '4px' }} />
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}

export default NotificationBell;