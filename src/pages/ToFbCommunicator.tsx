import RentalData from './RentalData';
import BookData from './BookData';
import {db} from '../firebaseConfig';
import {collection, doc, getDocs, setDoc} from "firebase/firestore";

const registerBookData = async (bookData: BookData) => {

}

const registerRentalData = async (rentalData: RentalData) => {

}

const fetchData = async (): Promise<[BookData[], RentalData[]]> => {
    const books: BookData[] = []
    const rentals: RentalData[] = []

    const querySnapshot = await getDocs(collection(db, "book"));
    querySnapshot.forEach((doc) => {
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

    return [books, [
        {
            id: '1',
            book_id: '1',
            borrower: 'ぽげ夫',
            is_returned: false,
        },
        {
            id: '2',
            book_id: '2',
            borrower: 'フガ美',
            is_returned: true,
        },
    ]];
}

export {registerBookData, registerRentalData, fetchData};