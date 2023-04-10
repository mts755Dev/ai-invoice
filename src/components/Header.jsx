import React from 'react'
import styles from '../styles/home.module.css';

function Header() {
  return (
    <div className={styles.topnav}>
    <div className={styles.navlogo}>
      <a href="/">Invoice Bot</a>
    </div>
  </div>
  )
}

export default Header
