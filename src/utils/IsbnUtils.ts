/**
 * ISBN-13をISBN-10に変換する
 */
const toIsbn10 = (isbn13: string): string | null => {
    // Validate input
    if (isbn13.length !== 13 || !isbn13.startsWith('978') && !isbn13.startsWith('979')) {
        throw new Error('Invalid ISBN-13 format');
    }

    // Remove the '978' or '979' prefix and the last digit (check digit)
    const isbn10Base = isbn13.substring(3, 12);

    // Calculate the ISBN-10 check digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += (i + 1) * parseInt(isbn10Base[i]);
    }
    let checkDigit = sum % 11;
    let checkDigitStr = (checkDigit === 10) ? 'X' : checkDigit.toString();

    // Return the ISBN-10
    return isbn10Base + checkDigitStr;
}

const toIsbn13 = (isbn10: string): string | null => {
    if (!isbn10) return null;
    if (isbn10.length !== 10) return null;
    //先頭に`978`を足して、末尾の1桁を除く
    const src = `978${isbn10.slice(0, 9)}`;

    //先頭の桁から順に数を掛けて合計する
    const sum = src.split('').map(s => parseInt(s))
        .reduce((p, c, i) => p + ((i % 2 === 0) ? c : c * 3));

    //合計を10で割った余りを10から引く（※引き算の結果が10の時は0とする）
    const rem = 10 - sum % 10;
    const checkdigit = rem === 10 ? 0 : rem;

    return `${src}${checkdigit}`;
}

export { toIsbn10, toIsbn13 };