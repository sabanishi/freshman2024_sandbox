import RentalData from './RentalData';
import BookData from './BookData';
import { my_ref } from '../FirebaseConfig';
import { set, get, child,query,orderByChild,equalTo } from "firebase/database";

const toBookDict = (data: BookData): { [key: string]: any } => {
    return {
        id: data.id,
        title: data.title,
        authors: data.authors,
        description: data.description,
        path_to_image: data.path_to_image
    };
}

const toRentalDict = (data: RentalData): { [key: string]: any } => {
    return {
        id: data.id,
        book_id: data.book_id,
        borrower: data.borrower,
        is_returned: data.is_returned,
        lend_time: data.lend_time.toString(),
        return_time: data.return_time.toString()
    };
}

const fetchBookData = async (searchTerm:string): Promise<BookData[]> => {
    const books: BookData[] = [];

    const bookSnapshot = await get(child(my_ref(""), 'book'));
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
    const rentalQuery = query(child(my_ref(""), 'rental'),orderByChild('is_returned'),equalTo(false));
    const rentalSnapshot = await get(rentalQuery);
    if (rentalSnapshot.exists()) {
        const data = rentalSnapshot.val();
        for (const id in data) {
            const rentalData: RentalData = {
                id: id,
                book_id: data[id].book_id,
                borrower: data[id].borrower,
                is_returned: data[id].is_returned,
                lend_time: new Date(data[id].lend_time),
                return_time: new Date(data[id].return_time)
            };
            rentals.push(rentalData);
        }
    }

    return rentals;
}

const registerBookData = async (bookData: BookData) => {
    const rawData = toBookDict(bookData);
    console.log(rawData);
    // データベースに登録
    await set(my_ref(`book/${bookData.id}`), rawData);
    console.log("登録完了");
}

const registerRentalData = async (rentalData: RentalData) => {
    const path = `rental/${rentalData.id}`;
    await set(my_ref(path), toRentalDict(rentalData));
}

const updateRentalData = async (data:RentalData,isReturned: boolean) => {
    data.is_returned = isReturned;
    await set(my_ref(`rental/${data.id}`), toRentalDict(data));
}

export { registerBookData, registerRentalData,updateRentalData, fetchBookData, fetchRentalData };
