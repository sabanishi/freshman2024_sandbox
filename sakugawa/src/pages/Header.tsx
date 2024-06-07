import { createSignal } from "solid-js";
import { A } from "@solidjs/router";
import "../styles/Header.css";

function Header() {
  const [menuOpen, setMenuOpen] = createSignal(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen());
  };

  return (
    <header>
      <div class="logo">ろご</div>
      <div class="menu" onClick={toggleMenu}>☰</div>
      <nav class={menuOpen() ? "show" : ""}>
        <A href="/">ホーム・検索</A>
        <A href="/lending">貸出</A>
        <A href="/return">返却</A>
        <A href="/login">ログイン</A>
      </nav>
    </header>
  );
}

export default Header;
