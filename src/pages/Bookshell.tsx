import { createSignal, onMount } from "solid-js";
import Header from "./Header";
import {deleteBookData, fetchBookData, fetchRentalData, registerRentalData, updateRentalData} from "./ToFbCommunicator";
import { v4 as uuidv4 } from 'uuid';
import BookData from "./BookData";
import RentalData from "./RentalData";
import Modal from "./Modal";
import ToggleButton from "./ToggleButton";
import { Card, HStack, InputForm, VStack } from "./CommonTool";
import BookEditPanel from "./BookEditPanel";

const BookImage = (props: { width?: string, height?: string, src: string, alt: string }) => {
  return (
    <div
      style={{
        "min-width": '100px',
        width: props.width || '100px',
        height: props.height || '150px',
        display: "flex",
        "border-radius": '4px 0 0 4px',
        "align-items": "center",
        "justify-content": "center",
        overflow: "hidden" /* はみ出た画像を隠す */
      }}>
      <img
        width="100%"
        height="100%"
        src={props.src}
        alt={props.alt}
        style={{
          "object-fit": "cover"  /* 画像のアスペクト比を保持しつつ、領域を埋める */
        }}
      />
    </div>
  );
}

function Bookshell() {
  const [books, setBooks] = createSignal<BookData[]>([]);
  const [shownBooks, setShownBooks] = createSignal<BookData[]>([]);
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

  const [isFiltered, setIsFiltered] = createSignal(false);
  const [isEditModalOpen, setEditModalOpen] = createSignal(false);

  const booksPerPage = 10;

  onMount(() => resetRendering());

  const resetRendering = (async () => {
    try {
      setTotalPages(0);
      setLoading(true);
      const fetchedBooks = await fetchBookData(searchTerm());
      const fetchedRentals = await fetchRentalData();
      setBooks(fetchedBooks);
      setRentals(fetchedRentals);
      updateShownBooks();
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  });

  const updateShownBooks = () => {
    const shownBooks = isFiltered() ? books().filter(b => !isBookAvailable(b.id)) : books();
    setTotalPages(Math.ceil(shownBooks.length / booksPerPage));
    setShownBooks(shownBooks);
  }

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
    updateShownBooks();
  };

  const handleReturn = async () => {
    const rental = rentals().find(r => r.book_id === selectedReturnBookID());
    if (!rental) return;
    await updateRentalData(rental, true)
    setRentals([...rentals().filter(r => r.id !== rental.id)]);
    closeReturnModal();
  };

  const filterBooks = (books: BookData[]) => {
    if (!isFiltered()) return books;
    return books.filter(b => !isBookAvailable(b.id));
  }

  const deleteBook =(book:BookData) =>{
    const result = (confirm("本当に削除しますか？"));
    if(result){
        console.log(book);
        deleteBookData(book).then(()=>{
          resetRendering();
        });
    }
  }

  const [editBookData, setEditBookData] = createSignal<BookData | null>(null);
  const editBook = (bookData: BookData) =>{
    console.log(bookData);
    setEditBookData(bookData);
    setEditModalOpen(true);
  }

  const closeEditBook = ()=>{
    setEditModalOpen(false);
  }

  const IconButton = (props: { onClick: (e: MouseEvent) => void, src: string, alt: string }) => {
    return (
      <button 
        onClick={props.onClick}
        style={{
          "width": "32px", 
          "height": "32px", 
          "padding": "0px",
          "border": "lightgray solid 1px",
          "border-radius": "2px",
          "justify-content": "center"
      }}>
        <img src={props.src} style={{"width": "80%", "height": "auto"}} alt={props.alt}></img>
      </button>
    );
  }

  const TextButton = (props: { onClick: (e: MouseEvent) => void, text: string }) => {
    return (
      <button 
        onClick={props.onClick}
        style={{
          "padding": "5px",
          "border": "lightgray solid 1px",
          "border-radius": "4px",
          "white-space": "nowrap"
      }}>
        {props.text}
      </button>
    );
  }


  return (
    <>
      <Header />
      <VStack gap="1rem" width="auto" alignItems="center">
        <h2>本棚</h2>
        <HStack>
          <div>貸出中のみを表示</div>
          <ToggleButton initialState={isFiltered()} onChange={(isOn) => {
            setIsFiltered(isOn);
            setCurrentPage(1);
            updateShownBooks();
          }} />
        </HStack>
        <InputForm
          onSubmit={(query) => {
            setSearchTerm(query)
            setCurrentPage(1);
            resetRendering();
          }}
          placeholder="Search..."
          buttonText="検索"
          buttonColor="#45a049"
          buttonTextColor="white"
          maxwidth="500px"
          width="calc(100% - 20px)"
          height="40px"
          gap="0px"
          clearOnSubmit={false}
        />
        {loading() && <p>Loading...</p>}
        {error() && <p>Error: {error()}</p>}
        {!loading() && !error() && (
          <VStack gap="1rem" padding="1rem" width="95%" maxwidth="800px" alignItems="center">
            {shownBooks().slice((currentPage() - 1) * booksPerPage, currentPage() * booksPerPage).map(book => (
              <Card padding="4px" borderRadius="4px" width="100%">
                <HStack gap="10px">
                  <BookImage width="100px" height="150px" src={book.path_to_image} alt={book.title} />
                  <HStack width="100%" justify="center">
                    <VStack justify="flex-start" width="100%" maxwidth="500px">
                      <h3>{book.title}</h3>
                      <HStack gap="20px" width="100%">
                        <VStack gap="4px">
                          <div style={{"white-space": "nowrap"}}>{isBookAvailable(book.id) ? "貸出可" : "貸出中"}</div>
                          {isBookAvailable(book.id) ?
                            <TextButton onClick={() => openLendModal(book.id)} text="貸出" /> :
                            <TextButton onClick={() => openReturnModal(book.id)} text="返却" />
                          }
                        </VStack>
                        <details>
                          <summary>詳細</summary>
                          <div>{book.authors.join(", ")}</div>
                          <div 
                            style={{"font-size": "0.8rem"}}
                            innerHTML={book.description.replace(/\n/g, "<br />")}
                          ></div>
                        </details>
                      </HStack>
                    </VStack>
                  </HStack>
                  <VStack justify="flex-start" gap="10px">
                    <IconButton
                      onClick={e=>deleteBook(book)}
                      src="/trash.png"
                      alt="削除"
                    />
                    <IconButton
                      onClick={e=>editBook(book)}
                      src="/pencil.png"
                      alt="編集"
                    />
                  </VStack>
                </HStack>
              </Card>
            ))}
          </VStack>
        )}
        <Modal isOpen={isLendModalOpen()} onClose={closeLendModal} title="この本を借りますか？">
          <VStack gap="1rem" alignItems="center">
            <HStack gap="1rem">
              <div>貸出人</div>
              <input
                type="text"
                placeholder="東工 太郎"
                value={name()}
                onInput={(e) => setName(e.currentTarget.value)}
              />
            </HStack>
            <HStack gap="1rem">
              <TextButton onClick={handleLend} text="貸出" />
              <TextButton onClick={closeLendModal} text="キャンセル" />
            </HStack>
          </VStack>
        </Modal>
        <Modal isOpen={isReturnModalOpen()} onClose={closeReturnModal} title="この本を返却しますか？">
          <HStack gap="1rem" alignItems="center" justify="center" width="100%">
            <TextButton onClick={handleReturn} text="返却" />
            <TextButton onClick={closeReturnModal} text="キャンセル" />
          </HStack>
        </Modal>
        <HStack gap="10px" justify="center">
          <button onClick={() => {
            setCurrentPage(p => Math.max(1, p - 1));
            updateShownBooks();
          }} disabled={currentPage() === 1}>&lt;</button>
          <span>{currentPage()} / {totalPages()}</span>
          <button onClick={() => {
            setCurrentPage(p => Math.min(totalPages(), p + 1));
            updateShownBooks();
          }} disabled={currentPage() === totalPages()}>&gt;</button>
        </HStack>
        <div style={{ height: "20px" }}></div>
      </VStack>

      <BookEditPanel oldData={editBookData()} isOpen={isEditModalOpen()} onClose={closeEditBook}></BookEditPanel>
    </>
  );
}

export default Bookshell;