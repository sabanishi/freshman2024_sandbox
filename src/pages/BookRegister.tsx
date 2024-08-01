import {Component, createSignal, onCleanup} from "solid-js";
import styles from "./BookRegister.module.css";
import Header from "./Header";
import BookData from "./BookData";
import {registerBookData,isContainsBookData} from "./ToFbCommunicator";
import Camera from "./Camera";
import {toIsbn10, toIsbn13} from "../utils/IsbnUtils";
import {v4 as uuidv4} from 'uuid';
// isbnjs
import * as ISBN from "isbnjs";

const BookRegister: Component = () => {
    const [isCameraModalOpen, setCameraModalOpen] = createSignal(false);
    const [isbn, setIsbn] = createSignal("");
    const [title, setTitle] = createSignal("");
    const [author, setAuthor] = createSignal("");
    const [summary, setSummary] = createSignal("");
    const [cover, setCover] = createSignal<File | null>(null);
    const [coverPreview, setCoverPreview] = createSignal<string | null>(null);
    let fileInputRef: HTMLInputElement | undefined;

    const openCameraModal = () => {
        setCameraModalOpen(true);
    };
    const closeCameraModal = () => {
        setCameraModalOpen(false);
    };

    const handleCoverUpload = (event: Event) => {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            setCover(input.files[0]);
            const reader = new FileReader();
            reader.onload = (e) => {
                setCoverPreview(e.target?.result as string);
            };
            reader.readAsDataURL(input.files[0]);
        }
    };

    const handleSubmit = (event: Event) => {
        event.preventDefault();
        // 送信処理を追加する
        console.log({isbn: isbn(), title: title(), author: author(), summary: summary(), cover: cover()});

        let alertMessage = "";
        //項目が1つでも欠けていたら登録しない
        if (title() == "") {
            alertMessage += "タイトルを入力してください\n";
        }
        if(author()==""){
            alertMessage += "著者を入力してください\n";
        }
        if(summary()==""){
            alertMessage += "概要を入力してください\n";
        }
        if(coverPreview()==null){
            alertMessage += "表紙を登録してください\n";
        }

        if(alertMessage != ""){
            alert(alertMessage);
            return;
        }

        const id = uuidv4();
        const book: BookData = {
            id: id,
            isbn13: isbn(),
            title: title(),
            authors: author().split(","),
            description: summary(),
            path_to_image: coverPreview()!
        }

        //データベース中に同じ名前の本が存在するかを調べる
        isContainsBookData(book).then(isContains =>{
            if(isContains){
                let result = confirm("同じ名前の本が既に登録されていますが、登録しますか？");
                console.log(result);
                if(result) {
                    registerBookData(book);
                    alert("登録に成功しました")
                }
            }else{
                //存在しない場合はそのまま登録する
                registerBookData(book);
                alert("登録に成功しました")
            }
        });
    };

    const fetchDescription = async (isbn13: string): Promise<string> => {
        const placeholder = "ホゲホゲ";
        let description = placeholder;

        const isbn10 = ISBN.parse(isbn13).asIsbn10(false);
        const amazonPageSrc = "https://www.amazon.co.jp/dp/" + isbn10;
        console.log(amazonPageSrc);
        const url = 'https://corsproxy.io/?' + encodeURIComponent(amazonPageSrc);
        console.log(url);
        const amazonPageResponse = await fetch(url);
        const amazonPageText = await amazonPageResponse.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(amazonPageText, "text/html");

                                                    //  ".celwidget > .a-expander-collapsed-height .a-expander-content :first-child"
        const descriptionElement = doc.querySelector(".celwidget .celwidget > .a-expander-collapsed-height .a-expander-content");
        console.log(descriptionElement);
        if (descriptionElement) {
            const htmlContent = descriptionElement.innerHTML;
            const textContent = htmlContent.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
            console.log(textContent);
            description = textContent;
        } else {
            console.log("Description element not found.");
        }
        console.log(descriptionElement?.children);
        return description;
    }

    /**
     * Google Books APIを使って書籍情報を取得する
     * @param isbn13
     * @returns {Promise<boolean>} 取得に成功したかどうか
     */
    const fetchBookData = async (isbn10: string,isbn13:string):Promise<boolean> => {
        try {
            const isbn10 = toIsbn10(isbn13);

            const description: string = await fetchDescription(isbn13);

            if (!isbn10) {
                alert("ISBNが不正です");
                return false;
            }
            setIsbn(isbn13);

            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn13}`);
            if (!response.ok) throw new Error(`HTTP error. Status: ${response.status}`);
            const data = await response.json();
            console.log(data);
            if (data.items==null || data.items.length==0 || data.items[0] == null || data.items[0]["volumeInfo"] == null) {
                alert("書籍情報が見つかりませんでした");
                return false;
            }

            const bookInfo = data.items[0]["volumeInfo"];

            const mainTitle: string = bookInfo["title"]
            const subtitle: string = bookInfo["subtitle"];
            const title = subtitle ? mainTitle + ": " + subtitle : mainTitle;
            const authors: string[] = bookInfo["authors"];
            
            const imageSrc = "https://images-na.ssl-images-amazon.com/images/P/" + isbn10 + ".09.LZZZZZZZ.jpg";

            //alert文を作成
            let alertMessage = "";
            if (title == null) {
                alertMessage += "タイトルの情報がありません\n";
            }

            if (authors == null) {
                alertMessage += "著者の情報がありません\n";
            }

            if (description == null) {
                alertMessage += "概要の情報がありません\n";
            }

            if (imageSrc == null) {
                alertMessage += "表紙の情報がありません\n";
            }

            setTitle(title);
            if (authors != null) {
                setAuthor(authors.join(", "));
            }else{
                setAuthor("")
            }
            setSummary(description);
            setCoverPreview(imageSrc);
            //ファイル選択をリセットする
            fileInputRef!.value = "";

            if (alertMessage != "") {
                alert(alertMessage);
            }
        } catch (error) {
            console.error("Failed to fetch book data:", error);
        }

        return true;
    };

    const detectIsbn = (isbn13: string) => {
        //ISBN-10に変換
        const isbn10 = toIsbn10(isbn13);
        if (!isbn10) {
            return;
        }
        fetchBookData(isbn10,isbn13);
        closeCameraModal();
    }

    const updateIsbnEvent = () =>{
        //ISBNが10桁または13桁でない場合は何もしない
        if(isbn().length != 10 && isbn().length != 13){
            return;
        }

        //13桁の場合はISBN-10に変換し、10桁の場合は13桁に変換する
        let isbn10;
        let isbn13;
        if(isbn().length == 13){
            isbn10 = toIsbn10(isbn());
            isbn13 = isbn();
        }else{
            isbn10 = isbn();
            isbn13 = toIsbn13(isbn());
        }

        if(isbn10 == null && isbn13 == null) {
            return;
        }

        fetchBookData(isbn10!,isbn13!);
    }

    return (
        <>
            <Header/>
            <div class={styles.container}>
                <h2>新規登録</h2>
                <div class={styles.form}>
                    <div class={styles.field}>
                        <label for="isbn">ISBN</label>
                        <div class={styles.inputGroup}>
                            <input
                                type="text"
                                id="isbn"
                                value={isbn()}
                                onInput={(e) => setIsbn(e.currentTarget.value)}
                                onFocusOut={(e)=>{updateIsbnEvent()}}
                            />
                            <button class={styles.cameraButton} onClick={openCameraModal}>📷</button>
                        </div>
                    </div>
                    <div class={styles.field}>
                        <label for="title">タイトル</label>
                        <input
                            type="text"
                            id="title"
                            value={title()}
                            onInput={(e) => setTitle(e.currentTarget.value)}
                        />
                    </div>
                    <div class={styles.field}>
                        <label for="author">著者</label>
                        <input
                            type="text"
                            id="author"
                            value={author()}
                            onInput={(e) => setAuthor(e.currentTarget.value)}
                        />
                    </div>
                    <div class={styles.field}>
                        <label for="summary">概要 (Amazon商品ページより引用)</label>
                        <textarea
                            id="summary"
                            value={summary()}
                            onInput={(e) => setSummary(e.currentTarget.value)}
                        ></textarea>
                    </div>
                    <div class={styles.field}>
                        <label for="cover">表紙</label>
                        <input type="file" id="cover" accept="image/*" onChange={handleCoverUpload} ref={fileInputRef}/>
                    </div>
                    {coverPreview() && (
                        <img src={coverPreview()!} alt="Cover Preview" class={styles.coverPreview}/>
                    )}
                    <button type="submit" class={styles.submitButton} onClick={handleSubmit}>登録</button>
                </div>

                <Camera isOpen={isCameraModalOpen()} onClose={closeCameraModal} onDetectIsbn={detectIsbn}></Camera>
            </div>
        </>
    );
};

export default BookRegister;

