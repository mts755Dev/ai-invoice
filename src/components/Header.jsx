import React from 'react'
import styles from '../styles/home.module.css';
import logo from '../assets/bot.png';
function Header() {
  return (
    <div className={styles.topnav}>
      <img src={logo} alt="Logo" style={{ height: "30px"}} />
    <div className={styles.navlogo}>
      <a href="/">Invoice Bot</a>
    </div>
  </div>
  )
}

export default Header
