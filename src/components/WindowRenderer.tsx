import React from 'react'
import { useWindowStore } from '../stores/windowStore'

export function WindowRenderer({ currentUser }: { currentUser: any }) {
  const windows = useWindowStore(s => s.windows)
  const closeWindow = useWindowStore(s => s.closeWindow)

  return (
    <>
      {windows.map(w => w.open && (
        <div key={w.id} style={{
          position:'fixed', left: w.x ?? 100, top: w.y ?? 80, width: w.width ?? 480, height: w.height ?? 360,
          background: 'rgba(255,255,255,0.98)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', borderRadius: 8, overflow:'hidden', zIndex: 999
        }}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:8, background:'#f7f7f9', borderBottom:'1px solid #eee'}}>
            <div>{w.title}</div>
            <div>
              <button onClick={()=>closeWindow(w.id)}>✕</button>
            </div>
          </div>
          <div style={{padding:6, height: 'calc(100% - 40px)'}}>
            {/* render dynamic component */}
            {typeof w.component === 'function'
              ? React.createElement(w.component as any, { currentUser })
              : w.component
            }
          </div>
        </div>
      ))}
    </>
  )
}
