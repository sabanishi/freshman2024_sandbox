/**
 * ISBN-13をISBN-10に変換する
 */
const toIsbn10 = (isbn13: string): string | null => {
    if (!isbn13) return null;
    if (isbn13.length !== 13) return null;
    if (!isbn13.startsWith("978")) return null;
    const isbn10 = isbn13.substring(3, 12);
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(isbn10[i]) * (10 - i);
    }
    const checkDigit = (11 - sum % 11) % 11;
    return isbn10 + checkDigit;
}

export { toIsbn10 };