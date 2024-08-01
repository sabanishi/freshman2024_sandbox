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

const toIsbn13 = (isbn10: string): string | null => {
    if(!isbn10) return null;
    if(isbn10.length !== 10) return null;
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