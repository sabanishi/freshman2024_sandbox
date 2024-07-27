import RentalData from './RentalData';
import BookData from './BookData';
import { db } from '../firebaseConfig';
import { ref, set, get, child } from "firebase/database";

const registerBookData = async (bookData: BookData) => {
    const rawData = toBookDict(bookData);
    console.log(rawData);
    // データベースに登録
    await set(ref(db, `book/${bookData.id}`), rawData);
    console.log("登録完了");
}

const toBookDict = (data: BookData): { [key: string]: any } => {
    return {
        id: data.id,
        title: data.title,
        authors: data.authors,
        description: data.description,
        path_to_image: data.path_to_image
    };
}

const registerRentalData = async (rentalData: RentalData) => {
    const path = `rental/${rentalData.id}`;
    await set(ref(db, path), toRentalDict(rentalData));
}

const toRentalDict = (data: RentalData): { [key: string]: any } => {
    return {
        id: data.id,
        book_id: data.book_id,
        borrower: data.borrower,
        is_returned: data.is_returned
    };
}

const fetchBookData = async (searchTerm:string): Promise<BookData[]> => {
    const books: BookData[] = [];

    const dbRef = ref(db);
    const bookSnapshot = await get(child(dbRef, 'book'));
    if (bookSnapshot.exists()) {
        const data = bookSnapshot.val();
        for (const id in data) {
            // 検索条件に合致しない場合はスキップ
            if(searchTerm != ""){
                if(data[id].title.indexOf(searchTerm) == -1 && data[id].authors.indexOf(searchTerm) == -1
                && data[id].description.indexOf(searchTerm)== -1) continue;
            }

            const bookData: BookData = {
                id: id,
                title: data[id].title,
                authors: data[id].authors,
                description: data[id].description,
                path_to_image: data[id].path_to_image
            };
            books.push(bookData);
        }
    }

    return books;
}

const fetchRentalData = async (): Promise<RentalData[]> => {
    const rentals: RentalData[] = [];
    const dbRef = ref(db);
    const rentalSnapshot = await get(child(dbRef, 'rental'));
    if (rentalSnapshot.exists()) {
        const data = rentalSnapshot.val();
        for (const id in data) {
            const rentalData: RentalData = {
                id: id,
                book_id: data[id].book_id,
                borrower: data[id].borrower,
                is_returned: data[id].is_returned
            };
            rentals.push(rentalData);
        }
    }

    return rentals;
}

export { registerBookData, registerRentalData, fetchBookData, fetchRentalData };
