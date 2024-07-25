import RentalData from './RentalData';
import BookData from './BookData';
import {db} from '../firebaseConfig';
import {collection, doc, getDocs, setDoc} from "firebase/firestore";

const registerBookData = async (bookData: BookData) => {
    const path = bookData.id;
    await setDoc(doc(db, "book",path), toBookDict(bookData));
}

const toBookDict = (data:BookData): { [key: string]: any } =>{
    return {
        id:data.id,
        title:data.title,
        authors:data.authors,
        description:data.description,
        path_to_image: data.path_to_image
    };
}

const registerRentalData = async (rentalData: RentalData) => {
    const path = rentalData.id;
    await setDoc(doc(db, "rental",path), toRentalDict(rentalData));
}

const toRentalDict = (data:RentalData): { [key: string]: any } =>{
    return {
        id:data.id,
        book_id:data.book_id,
        borrower:data.borrower,
        is_returned:data.is_returned
    };
}

const fetchData = async (): Promise<[BookData[], RentalData[]]> => {
    const books: BookData[] = []
    const rentals: RentalData[] = []

    const bookSnapshot = await getDocs(collection(db, "book"));
    bookSnapshot.forEach((doc) => {
        const data = doc.data();
        //BookDataに変換
        const bookData: BookData = {
            id: doc.id,
            title: data.title,
            authors: data.authors,
            description: data.description,
            path_to_image: data.path_to_image
        }
        books.push(bookData);
    });

    const rentalSnapshot = await getDocs(collection(db, "rental"));
    rentalSnapshot.forEach((doc) => {
        const data = doc.data();
        //RentalDataに変換
        const rentalData: RentalData = {
            id: doc.id,
            book_id: data.book_id,
            borrower: data.borrower,
            is_returned: data.is_returned
        }
        rentals.push(rentalData);
    });

    return [books, rentals];
}

export {registerBookData, registerRentalData, fetchData};