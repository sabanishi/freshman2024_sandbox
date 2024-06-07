import { createSignal } from "solid-js";
import { A } from "@solidjs/router";
import "../styles/MainPage.css";
import Header from "./Header";

function MainPage() {
  const [searchTerm, setSearchTerm] = createSignal("");
  const [menuOpen, setMenuOpen] = createSignal(false);

  const handleSearch = () => {
    alert(`Searching for: ${searchTerm()}`);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen());
  };

  return (
    <>
      <Header />
      <main>
        <div class="search-bar">
          <input
            type="text"
            value={searchTerm()}
            onInput={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
            placeholder="Search..."
          />
          <button class="search-button" onClick={handleSearch}>🔍</button>
        </div>
        <div class="button-container">
          <A href="/lending" class="action-button">貸出</A>
          <A href="/return" class="action-button">返却</A>
        </div>
      </main>
    </>
  );
}

export default MainPage;