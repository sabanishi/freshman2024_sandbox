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
        console.log({ isbn: isbn(), title: title(), author: author(), summary: summary(), cover: cover() });
        //項目が1つでも欠けていたら登録しない
        if(isbn()=="" || title()=="" || author()=="" || summary()=="" || coverPreview()==null){
            alert("未入力の項目があります");
            return;
        }

        const book : BookData = {
            id: isbn(),
            title: title(),
            authors: author().split(","),
            description: summary(),
            path_to_image: coverPreview()!
        }

        //Firebaseに登録
        registerBookData(book).then(()=>{
            alert("登録しました");
        });
    };

    const fetchBookData = async (isbn: string) => {
        try {
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
            if (!response.ok) throw new Error(`HTTP error. Status: ${response.status}`);

            console.log("Fetched book data");
            const data = await response.json();
            console.log(data.items)

            const title :string= data.items[0]["volumeInfo"]["title"]
            const authors:string[] = data.items[0]["volumeInfo"]["authors"];
            const description:string = "ほげほげ";
            const imageSrc = "https://images-na.ssl-images-amazon.com/images/P/"+isbn+".09.LZZZZZZZ.jpg";
            setTitle(title);
            setAuthor(authors.join(", "));
            setSummary(description);
            setCoverPreview(imageSrc);
        } catch (error) {
            console.error("Failed to fetch book data:", error);
        }
    };

    const detectIsbn = (isbn13 : string) =>{
        //ISBN-10に変換
        const isbn10 = toIsbn10(isbn13);
        if(isbn10 == null) return;
        setIsbn(isbn10);
        fetchBookData(isbn10);
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
                        <input
                            type="text"
                            id="isbn"
                            value={isbn()}
                            onInput={(e) => setIsbn(e.currentTarget.value)}
                        />
                        <button class={styles.cameraButton}　onClick={openCameraModal}>📷</button>
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
                        <input type="file" id="cover" accept="image/*" onChange={handleCoverUpload} />
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
