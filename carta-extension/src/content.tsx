import { createRoot } from 'react-dom/client'
import Panel from './panel/Panel'
import panelCss from './panel/panel.css';

function injectCARTA() {
  if (document.getElementById('carta-host')) return

  // Shadow host — elemen tipis di body TradingView, tidak punya dimensi
  const host = document.createElement('div')
  host.id = 'carta-host'
  host.style.cssText = 'position:fixed;top:0;right:0;width:0;height:0;z-index:9999'
  document.body.appendChild(host)

  // Shadow DOM — CSS CARTA terisolasi dari CSS TradingView
  const shadow = host.attachShadow({ mode: 'open' })

  // Inject CSS ke shadow root
  const style = document.createElement('style')
  style.textContent = panelCss as string;
  shadow.appendChild(style)

  // Mount point untuk React
  const mountPoint = document.createElement('div')
  shadow.appendChild(mountPoint)

  createRoot(mountPoint).render(<Panel />)
}

// document_idle sudah berjalan setelah load event — jangan pakai listener
// Delay tetap diperlukan agar TradingView selesai render chart-nya
setTimeout(injectCARTA, 1500)
