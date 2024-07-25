import {Component, createSignal, onCleanup} from "solid-js";
import styles from "./BookRegister.module.css";
import Header from "./Header";
import Modal from "./Modal";
import {BrowserMultiFormatReader} from "@zxing/library";
import BookData from "./BookData";
import {registerBookData} from "./ToFbCommunicator";

const BookRegister: Component = () => {
    const [isCameraModalOpen, setCameraModalOpen] = createSignal(false);
    const [isbn, setIsbn] = createSignal("");
    const [title, setTitle] = createSignal("");
    const [author, setAuthor] = createSignal("");
    const [summary, setSummary] = createSignal("");
    const [cover, setCover] = createSignal<File | null>(null);
    const [coverPreview, setCoverPreview] = createSignal<string | null>(null);

    let videoRef: HTMLVideoElement | undefined;
    let canvasRef: HTMLCanvasElement | undefined;
    let reader: BrowserMultiFormatReader;

    const openCameraModal = async () => {
        setCameraModalOpen(true);
        await startCamera();
    };
    const closeCameraModal = () => {
        setCameraModalOpen(false);
        stopCamera();
    };

    const stopCamera = () => {
        if (videoRef && videoRef.srcObject) {
            (videoRef.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            videoRef.srcObject = null;
        }
        if (reader) {
            reader.reset();
        }
    };

    onCleanup(() => {
        stopCamera();
    });

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment",
                    width: {ideal: 1280},
                    height: {ideal: 720}
                }
            });
            if (videoRef) {
                videoRef.srcObject = stream;
                videoRef.play();
            }
            reader = new BrowserMultiFormatReader();
            reader.decodeFromVideoDevice(undefined, videoRef, (result, err) => {
                if (result) {
                    const scannedIsbn = isbn10(result.getText());
                    if(scannedIsbn!=null){
                        setIsbn(scannedIsbn);
                        fetchBookData(scannedIsbn);
                        closeCameraModal();
                    }
                }
            });
        } catch (err) {
            alert("カメラのアクセスが許可されていません。");
        }
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

    const isbn10 = (isbn13:string) => {
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

                <Modal isOpen={isCameraModalOpen()} onClose={closeCameraModal} title="カメラ">
                    <div>
                        <video ref={el => videoRef = el} width="100%" height="100%"
                               style={{maxWidth: "400px", maxHeight: "300px"}} autoplay playsInline></video>
                    </div>
                </Modal>
                {/* Canvas を隠して写真を描画する */}
                <canvas ref={el => canvasRef = el} style={{display: "none"}} width="400" height="300"></canvas>
            </div>
        </>
    );
};

export default BookRegister;
