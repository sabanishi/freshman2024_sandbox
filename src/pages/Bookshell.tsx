import {createSignal,　onMount} from "solid-js";
import Header from "./Header";
import styles from "./Bookshell.module.css";
import {fetchBookData, fetchRentalData, registerRentalData, updateRentalData} from "./ToFbCommunicator";
import {v4 as uuidv4} from 'uuid';
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

    const [isReturnModalOpen, setReturnModalOpen] = createSignal(false);
    const [selectedReturnBookID, setSelectedReturnBookID] = createSignal<string | null>(null);

    const booksPerPage = 10;

    onMount(() => resetRendering());

    const resetRendering = (async () => {
        try {
            setLoading(true);
            const fetchedBooks = await fetchBookData(searchTerm());
            const fetchedRentals = await fetchRentalData();
            setBooks(fetchedBooks);
            setRentals(fetchedRentals);
            setTotalPages(Math.ceil(fetchedBooks.length / booksPerPage)); // Assuming 10 books per page
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
            lend_time: new Date(),
            return_time: new Date()
        };
        await registerRentalData(rental);
        setRentals([...rentals(), rental]);
        closeLendModal();
    };

    const openReturnModal = async (id: string) => {
        setReturnModalOpen(true);
        setSelectedReturnBookID(id);
    };
    const closeReturnModal = () => {
        setReturnModalOpen(false);
        setSelectedReturnBookID(null);
    };

    const handleReturn = async () => {
        const rental = rentals().find(r => r.book_id === selectedReturnBookID());
        if (!rental) return;
        await updateRentalData(rental, true)
        setRentals([...rentals().filter(r => r.id !== rental.id)]);
        closeReturnModal();
    };

    return (
        <>
            <Header/>
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
                        <button class="search-button" onClick={resetRendering}>🔍</button>
                    </div>
                </div>
                {loading() && <p>Loading...</p>}
                {error() && <p>Error: {error()}</p>}
                {!loading() && !error() && (
                    <ul class={styles.bookList}>
                        {books().slice((currentPage() - 1) * booksPerPage, currentPage() * booksPerPage).map(book => (
                            <li key={book.id}>
                                <div class={styles.bookCover}>
                                    <img src={book.path_to_image} alt={book.title}/>
                                </div>
                                <div class={styles.bookInfo}>
                                    <h3>{book.title}</h3>
                                    <p>貸出 {isBookAvailable(book.id) ? '○' : '✕'}</p>
                                    <details>
                                        <summary>詳細</summary>
                                        <p>{getBookDetails(book)}</p>
                                    </details>
                                    {isBookAvailable(book.id) ?
                                        <button onClick={() => openLendModal(book.id)}>貸出</button> :
                                        <button onClick={() => openReturnModal(book.id)}>返却</button>
                                    }
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
                <Modal isOpen={isReturnModalOpen()} onClose={closeReturnModal} title="この本を返却しますか？">
                    <div>
                        <button onClick={handleReturn}>返却</button>
                        <button onClick={closeReturnModal}>キャンセル</button>
                    </div>
                </Modal>
                <div class={styles.pagination}>
                    <button onClick={() => {
                        setCurrentPage(p => Math.max(1, p - 1));
                        resetRendering();
                    }} disabled={currentPage() === 1}>&lt;</button>
                    <span>{currentPage()} / {totalPages()}</span>
                    <button onClick={() => {
                        setCurrentPage(p => Math.min(totalPages(), p + 1));
                        resetRendering();
                    }} disabled={currentPage() === totalPages()}>&gt;</button>
                </div>
            </main>
        </>
    );
}

export default Bookshell;