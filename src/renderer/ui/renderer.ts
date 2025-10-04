import "@fontsource-variable/open-sans"
import '@fontsource/material-symbols-outlined/index.css'
import './pages/app-root'
import log from 'loglevel'

const onDOMContentLoaded = async (): Promise<void> => {
  window.removeEventListener('DOMContentLoaded', onDOMContentLoaded, false)

  log.setDefaultLevel(log.levels.TRACE)
  
  return
}

window.addEventListener('DOMContentLoaded', onDOMContentLoaded)
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  onDOMContentLoaded()
}
