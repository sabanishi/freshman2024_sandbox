import {Component, createSignal, onCleanup} from "solid-js";
import styles from "./BookRegister.module.css";
import Header from "./Header";
import BookData from "./BookData";
import {registerBookData} from "./ToFbCommunicator";
import Camera from "./Camera";
import {toIsbn10} from "../utils/IsbnUtils";

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
        //項目が1つでも欠けていたら登録しない
        if (isbn() == "" || title() == "" || author() == "" || summary() == "" || coverPreview() == null) {
            alert("未入力の項目があります");
            return;
        }

        const book: BookData = {
            id: isbn(),
            title: title(),
            authors: author().split(","),
            description: summary(),
            path_to_image: coverPreview()!
        }

        //Firebaseに登録
        registerBookData(book).then(() => {
            alert("登録しました");
        });
    };

    /**
     * Google Books APIを使って書籍情報を取得する
     * @param isbn13
     * @returns {Promise<boolean>} 取得に成功したかどうか
     */
    const fetchBookData = async (isbn13: string):Promise<boolean> => {
        try {
            const isbn10 = toIsbn10(isbn13);
            if (!isbn10) {
                alert("ISBNが不正です");
                return false;
            }
            setIsbn(isbn10);

            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn13}`);
            if (!response.ok) throw new Error(`HTTP error. Status: ${response.status}`);
            const data = await response.json();
            console.log(data);
            if (data.items==null || data.items.length==0 || data.items[0] == null || data.items[0]["volumeInfo"] == null) {
                alert("書籍情報が見つかりませんでした");
                return false;
            }

            const bookInfo = data.items[0]["volumeInfo"];

            const title: string = bookInfo["title"]
            const authors: string[] = bookInfo["authors"];
            const description: string = "ほげほげ";
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
        fetchBookData(isbn13);
        closeCameraModal();
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
                        <label for="summary">概要</label>
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

