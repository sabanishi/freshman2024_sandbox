import { Component, createSignal, createEffect } from "solid-js";
import Header from "./Header";
import styles from "./Bookshell.module.css";
import { fetchData, registerRentalData } from "./ToFbCommunicator";
import { v4 as uuidv4 } from 'uuid';
import BookData from "./BookData";
import RentalData from "./RentalData";
import Modal from "./Modal";

function Bookshell() {
  const [books, setBooks] = createSignal<BookData[]>([]);
  const [rentals, setRentals] = createSignal<RentalData[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  const [currentPage, setCurrentPage] = createSignal(1);
  const [totalPages, setTotalPages] = createSignal(1);

  const [searchTerm, setSearchTerm] = createSignal("");

  const [isLendModalOpen, setLendModalOpen] = createSignal(false);
  const [name, setName] = createSignal("");
  const [selectedBookID, setSelectedBookID] = createSignal<string | null>(null);

  createEffect(async () => {
    try {
      setLoading(true);
      const [fetchedBooks, fetchedRentals] = await fetchData();
      setBooks(fetchedBooks);
      setRentals(fetchedRentals);
      setTotalPages(Math.ceil(fetchedBooks.length / 10)); // Assuming 10 books per page
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  });

  const handleSearch = () => {
    alert(`Searching for: ${searchTerm()}`);
  };

  const isBookAvailable = (bookId: string) => {
    const rental = rentals().find(r => r.book_id === bookId);
    return !rental || rental.is_returned;
  };

  const getBookDetails = (book: BookData) => {
    return `Authors: ${book.authors.join(", ")}\nDescription: ${book.description}`;
  };

  const openLendModal = async (id: string) => {
    setLendModalOpen(true);
    setSelectedBookID(id);
  };
  const closeLendModal = () => {
    setLendModalOpen(false);
    setSelectedBookID(null);
  };

  const handleLend = async () => {
    if (!selectedBookID()) return;
    const rentalID = uuidv4();
    const rental: RentalData = {
      id: rentalID,
      book_id: selectedBookID()!,
      borrower: name(),
      is_returned: false,
    };
    await registerRentalData(rental);
    closeLendModal();
  };

  return (
    <>
      <Header />
      <main>
        <h2>本棚</h2>
        <div class="search-container">
          <div class="search-bar">
            <input
              type="text"
              value={searchTerm()}
              onInput={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
              placeholder="Search..."
            />
            <button class="search-button" onClick={handleSearch}>🔍</button>
          </div>
        </div>
        {loading() && <p>Loading...</p>}
        {error() && <p>Error: {error()}</p>}
        {!loading() && !error() && (
          <ul class={styles.bookList}>
            {books().slice((currentPage() - 1) * 10, currentPage() * 10).map(book => (
              <li key={book.id}>
                <div class={styles.bookCover}>
                  <img src={book.path_to_image} alt={book.title} />
                </div>
                <div class={styles.bookInfo}>
                  <h3>{book.title}</h3>
                  <p>貸出 {isBookAvailable(book.id) ? '○' : '✕'}</p>
                  <details>
                    <summary>詳細</summary>
                    <p>{getBookDetails(book)}</p>
                  </details>
                  <button onClick={() => openLendModal(book.id)} disabled={!isBookAvailable(book.id)}>貸出</button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Modal isOpen={isLendModalOpen()} onClose={closeLendModal} title="この本を借りますか？">
        <div>
          <div>
            貸出人
            <input
              type="text"
              placeholder="東工 太郎"
              value={name()}
              onInput={(e) => setName(e.currentTarget.value)}
            />
          </div>
          <div>
            <button onClick={handleLend}>貸出</button>
            <button onClick={closeLendModal}>キャンセル</button>
          </div>
        </div>
        </Modal>
        <div class={styles.pagination}>
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage() === 1}>&lt;</button>
          <span>{currentPage()} / {totalPages()}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages(), p + 1))} disabled={currentPage() === totalPages()}>&gt;</button>
        </div>
      </main>
    </>
  );
}

export default Bookshell;