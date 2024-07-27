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
        <A href="/">ホーム・本棚</A>
        <A href="/register">登録</A>
      </nav>
    </header>
  );
}

export default Header;
