interface RentalData {
    id: string;
    book_id: string;
    borrower: string;
    is_returned: boolean;
    //貸し出し時刻
    lend_time: Date;
    //返却時刻
    return_time: Date;
}

export default RentalData;