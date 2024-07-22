import RentalData from './RentalData';
import BookData from './BookData';

const registerBookData = async (bookData: BookData) => {
    
}

const registerRentalData = async (rentalData: RentalData) => {
        
}

const fetchData = async (): Promise<[BookData[], RentalData[]]> => {
    return [[
        {
            id: '1',
            title: 'ホゲホゲのホゲホゲ',
            authors: ['ぽげ山ぽげ夫'],
            description: 'ぽげぽげぽげぽげぽげぽげぽげぽげぽげぽげぽげぽげぽげぽげぽげ',
            path_to_image: 'https://picsum.photos/210/297',
        },
        {
            id: '2',
            title: 'フガフガのフガフガ',
            authors: ['フガ沢フガ美'],
            description: 'フガフガフガフガフガフガフガフガフガフガフガフガフガフガフガ',
            path_to_image: 'https://picsum.photos/210/297',
        },
    ], [
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

export { registerBookData, registerRentalData, fetchData };