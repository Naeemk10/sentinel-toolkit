import styles from './Nav.module.css'

const AnimatedLogo = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" className={styles.logoSvg}>
    <defs>
      <filter id="logoGlow">
        <feGaussianBlur stdDeviation="1.5" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <polygon points="18,3 32,10.5 32,25.5 18,33 4,25.5 4,10.5"
      fill="rgba(74,144,217,.1)" stroke="#4a90d9" strokeWidth="1.5" filter="url(#logoGlow)"/>
    <polygon points="18,7 28,12.5 28,23.5 18,29 8,23.5 8,12.5"
      fill="none" stroke="rgba(74,144,217,.22)" strokeWidth="0.8"/>
    <text x="7" y="22" fontFamily="monospace" fontWeight="700" fontSize="13"
      fill="#4a90d9" filter="url(#logoGlow)" className={styles.logoText}>&gt;_</text>
  </svg>
)

export default function Nav({ onShortcuts }) {
  return (
    <nav className={styles.nav}>
      <div className={styles.brand}>
        <AnimatedLogo />
        <div className={styles.brandText}>
          <span className={styles.brandName}>SOC Swiss Knife</span>
          <span className={styles.brandSub}>ANALYST UTILITY HUB</span>
        </div>
      </div>

      <div className={styles.links}>
        <a href="https://ioc-sentinel.pages.dev" className={styles.link}>IOC Scanner</a>
        <a href="/swiss-knife/" className={styles.linkActive}>Swiss Knife</a>
        <span className={styles.linkDim}>APT Profiler</span>
        <span className={styles.linkDim}>Morning Brief</span>
      </div>

      <div className={styles.right}>
        <button className={styles.kbtn} onClick={onShortcuts} title="Keyboard shortcuts (?)">?</button>
        <div className={styles.privacy}>
          <span className={styles.pdot}/>
          100% local — no data sent
        </div>
      </div>
    </nav>
  )
}
