const fetchBookInfo = async (isbn13:string) :Promise<[string,string[]] | null> =>{
    const googleApiResult = await fetchWithGoogleApi(isbn13);
    if (googleApiResult) return googleApiResult;
    
    const openBdApiResult = await fetchOpenBdApi(isbn13);
    if (openBdApiResult) return openBdApiResult;
    return null;
}

const fetchWithGoogleApi = async (isbn13:string) :Promise<[string,string[]]| null> =>
{
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn13}`);
    if (!response.ok) return null;

    try{
        const data = await response.json();
        if (data == null || data.items==null || data.items.length==0 || data.items[0] == null || data.items[0]["volumeInfo"] == null) {
            return null;
        }

        const bookInfo = data.items[0]["volumeInfo"];
        const mainTitle: string = bookInfo["title"]
        const subtitle: string = bookInfo["subtitle"];
        const title = subtitle ? mainTitle + ": " + subtitle : mainTitle;
        const authors: string[] = bookInfo["authors"];

        return [title,authors];
    }catch(e){
        console.error(e);
        return null;
    }
}

const fetchOpenBdApi = async (isbn13:string) :Promise<[string,string[]] | null>=>{
    const response = await fetch(`https://api.openbd.jp/v1/get?isbn=${isbn13}`);
    if (!response.ok) return null;

    try{
        const data = await response.json();
        if(data==null){
            return null;
        }

        const bookInfo = data[0].summary;
        const title = bookInfo["title"];
        //「,」で区切る
        const rawAuthors = data[0].onix["DescriptiveDetail"]["Contributor"];

        const authors = rawAuthors.map((x:any)=>{
            // カンマで分割
            const rawData = x["PersonName"]["content"];
            let parts = rawData.split(',');
            // 最後の部分が年齢に関するデータである場合、それを削除
            console.log(parts[parts.length - 1]);
            if (parts[parts.length - 1].trim().match(/^\d{4}-(\d{4})?$/)) {
                console.log(parts[parts.length - 1]);
                parts.pop();
            }
            // 残りの部分を結合してフォーマット
            return parts.map((part:string) => part.trim()).join(' ');
        });

        return [title,authors];
    }catch(e){
        console.error(e);
        return null;
    }
}

export {fetchBookInfo};