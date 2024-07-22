import {Component, createSignal, onCleanup} from "solid-js";
import Header from "./Header";
import Modal from "./Modal";
import {BrowserMultiFormatReader} from "@zxing/library";
import BookData from "./BookData";
import { registerBookData } from "./ToFbCommunicator";

const Register: Component = () => {
    const [isModalOpen, setModalOpen] = createSignal(false);
    const [isCameraModalOpen, setCameraModalOpen] = createSignal(false);
    const [photo, setPhoto] = createSignal<string | null>(null);
    const [isbn, setIsbn] = createSignal<string | null>(null);
    let videoRef: HTMLVideoElement | undefined;
    let canvasRef: HTMLCanvasElement | undefined;
    let reader: BrowserMultiFormatReader;

    const openModal = () => setModalOpen(true);
    const closeModal = () => {
        setModalOpen(false);
        stopCamera();
    };

    const openCameraModal = async () => {
        setCameraModalOpen(true);
        await startCamera();
    };
    const closeCameraModal = () => {
        setCameraModalOpen(false);
        stopCamera();
    };

    const handleCapture = (event: Event) => {
        const target = event.target as HTMLInputElement;
        const files = target.files;
        if (files && files.length > 0) {
            const file = files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                setPhoto(e.target?.result as string);
                openModal();
            };
            reader.readAsDataURL(file);
        }
    };

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
                    setIsbn(result.getText());
                    closeCameraModal();
                    openModal();
                }
            });
        } catch (err) {
            alert("カメラのアクセスが許可されていません。");
        }
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

    const isbn10 = () => {
        const isbn13 = isbn();
        if (!isbn13) return null;
        if (isbn13.length !== 13) return null;
        if (!isbn13.startsWith("978")) return null;
        const isbn10 = isbn13.substring(3, 12);
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(isbn10[i]) * (10 - i);
        }
        const checkDigit = (11 - sum % 11) % 11;


        getBookData(isbn10+checkDigit).then(book=>{
            console.log(book);
            //firebaseにアップロードする
            registerBookData(book);
        });
        return isbn10 + checkDigit;
    }


    const getBookData = async (isbn: string): Promise<BookData> => {
        const url:string  = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;

        try{
            const response = await fetch(url);
            if(!response.ok){
                throw new Error(`HTTP error. Status:${response.status}`);
            }

            const data = await response.json();
            console.log(data.items)

            const title :string= data.items[0]["volumeInfo"]["title"]
            const authors:string[] = data.items[0]["volumeInfo"]["authors"];
            const description:string = "ほげほげ";
            const imageSrc = "https://images-na.ssl-images-amazon.com/images/P/"+isbn+".09.LZZZZZZZ.jpg";
            return {
                id: isbn,
                title: title,
                authors: authors,
                description: description,
                path_to_image: imageSrc
            };

        }catch(error){
        }
        return {
            id:"",
            title:"",
            authors:[],
            description:"",
            path_to_image:""
        };
    }

    return (
        <>
            <Header/>
            <div>
                <h1>登録ページ</h1>
                <p>これは登録ページです。</p>
                {/* 隠されたファイル入力をカメラの起動に使用 */}
                <input
                    type="file"
                    accept="image/*"
                    style={{display: "none"}}
                    id="fileInput"
                    onChange={handleCapture}
                />
                {/* 登録ボタンをクリックしてカメラモーダルをトリガー */}
                <button onClick={openCameraModal}>登録</button>
                <Modal isOpen={isCameraModalOpen()} onClose={closeCameraModal} title="カメラ">
                    <div>
                        <video ref={el => videoRef = el} width="100%" height="100%"
                               style={{maxWidth: "400px", maxHeight: "300px"}} autoplay playsInline></video>
                    </div>
                </Modal>
                <Modal isOpen={isModalOpen()} onClose={closeModal} title="登録モーダル">
                    {/* 取得したISBNを表示 */}
                    {isbn() ? (
                        //isbnからタイトルを取得
                        <img src={`https://images-na.ssl-images-amazon.com/images/P/${isbn10()}.01.MZZZZZZZ.jpg`}
                             alt="Cover" class="responsive-image" width={400} height={300}/>
                    ) : photo() ? (
                        <img src={photo()!} alt="Captured" class="responsive-image" width={400} height={300}/>
                    ) : (
                        <img src="https://picsum.photos/400/300" alt="placeholder" class="responsive-image" width={400}
                             height={300}/>
                    )}
                    <button onClick={closeModal}>閉じる</button>
                </Modal>
                {/* Canvas を隠して写真を描画する */}
                <canvas ref={el => canvasRef = el} style={{display: "none"}} width="400" height="300"></canvas>
            </div>
        </>
    );
};

export default Register;
