import React, { useState } from 'react';

const CONSENTS = [
    {
        id: "gps",
        icon: "📍",
        title: "GPS Location",
        text: "To verify you are in the affected zone during a claim",
        required: true
    },
    {
        id: "upi",
        icon: "💸", 
        title: "UPI Account",
        text: "To send automatic payouts directly to you",
        required: true
    },
    {
        id: "activity",
        icon: "📊",
        title: "Delivery Activity",
        text: "To confirm you were actively working before the disruption",
        required: true
    }
];

export default function ConsentScreen({ onConsent }) {
    const [checked, setChecked] = useState({ gps: false, upi: false, activity: false });
    
    const allChecked = checked.gps && checked.upi && checked.activity;

    const toggle = (id) => {
        setChecked(prev => ({...prev, [id]: !prev[id]}));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontFamily: 'Bricolage Grotesque', fontSize: 22, margin: '0 0 10px' }}>Data Consent</h2>
            {CONSENTS.map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, border: '1px solid #E4E4E7', borderRadius: 12, background: 'white' }}>
                    <input 
                        type="checkbox" 
                        checked={checked[c.id]} 
                        onChange={() => toggle(c.id)} 
                        style={{ width: 20, height: 20, accentColor: '#D97757' }}
                    />
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 18 }}>{c.icon}</span>
                            <span style={{ fontWeight: 600, fontSize: 15 }}>{c.title}</span>
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B6B6B' }}>{c.text}</p>
                    </div>
                </div>
            ))}
            <div style={{ textAlign: 'center', marginTop: 10 }}>
                <span style={{ fontSize: 11, background: '#ECFDF3', color: '#065F46', padding: '4px 8px', borderRadius: 12, fontWeight: 600 }}>
                    🛡️ DPDP Act 2023 Compliant
                </span>
            </div>
            <button 
                disabled={!allChecked} 
                onClick={() => onConsent(checked)}
                style={{ 
                    marginTop: 10, padding: 14, borderRadius: 12, border: 'none',
                    background: allChecked ? '#D97757' : '#E4E4E7',
                    color: allChecked ? 'white' : '#9B9B9B',
                    fontWeight: 600, fontSize: 15, cursor: allChecked ? 'pointer' : 'not-allowed'
                }}
            >
                I Agree & Continue
            </button>
        </div>
    );
}
