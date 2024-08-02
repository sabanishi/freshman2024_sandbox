import {Component, createSignal, onCleanup} from "solid-js";
import styles from "./BookRegister.module.css";
import Header from "./Header";
import BookData from "./BookData";
import {registerBookData, isContainsBookData} from "./ToFbCommunicator";
import Camera from "./Camera";
import {toIsbn10, toIsbn13} from "../utils/IsbnUtils";
import {v4 as uuidv4} from 'uuid';
import {HStack, VStack} from "./CommonTool";
import {fetchBookInfo} from "../utils/FetchBookUtils";
import NowLoadingImage from "./NowLoadingImage";

const BookRegister: Component = () => {
    const [isCameraModalOpen, setCameraModalOpen] = createSignal(false);
    const [isbn, setIsbn] = createSignal("");
    const [title, setTitle] = createSignal("");
    const [author, setAuthor] = createSignal("");
    const [summary, setSummary] = createSignal("");
    const [cover, setCover] = createSignal<File | null>(null);
    const [coverPreview, setCoverPreview] = createSignal<string | null>(null);
    const [amazonPageSrc, setAmazonPageSrc] = createSignal<string | null>(null);
    const [isFetchingBookInfo, setIsFetchingBookInfo] = createSignal(false);
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

    const askForNextRegistration = () => {
        const choice = confirm('登録できました！\n別の本のカメラ読み取りを続行しますか？');
        if (choice) {
            openCameraModal();
        }
    }

    const handleSubmit = (event: Event) => {
        event.preventDefault();

        //項目が1つでも欠けていたら登録しない
        let alertMessage = "";
        if (title() == "") {
            alertMessage += "タイトルを入力してください\n";
        }
        if (author() == "") {
            alertMessage += "著者を入力してください\n";
        }
        if (summary() == "") {
            alertMessage += "概要を入力してください\n";
        }
        if (coverPreview() == null) {
            alertMessage += "表紙を登録してください\n";
        }

        if (alertMessage != "") {
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
        isContainsBookData(book).then(isContains => {
            if (isContains) {
                let result = confirm("同じ名前の本が既に登録されていますが、登録しますか？");
                if (result) {
                    registerBookData(book);
                    askForNextRegistration();
                }
            } else {
                //存在しない場合はそのまま登録する
                registerBookData(book);
                askForNextRegistration();
            }
        });
    };

    /**
     * セレクタを使ってAmazonの商品ページから書籍の概要を取得する
     * @param selector
     * @param document
     * @returns {string} 概要
     */
    const fetchDescriptionFromSelector = (document: Document, selector: string): string => {
        const descriptionElement = document.querySelector(selector);
        console.log(descriptionElement);
        if (!descriptionElement) {
            return "";
        }
        const htmlContent = descriptionElement.innerHTML;
        const textContent = htmlContent.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
        return textContent;
    }

    const fetchDescription = async (isbn13: string): Promise<string> => {
        const placeholder = "ホゲホゲ";

        const isbn10 = toIsbn10(isbn13);
        const amazonPageSrc = "https://www.amazon.co.jp/dp/" + isbn10;
        setAmazonPageSrc(amazonPageSrc);
        const url = 'https://corsproxy.io/?' + encodeURIComponent(amazonPageSrc);
        const amazonPageResponse = await fetch(url);
        const amazonPageText = await amazonPageResponse.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(amazonPageText, "text/html");

        //  ".celwidget > .a-expander-collapsed-height .a-expander-content :first-child"
        let decs1 = fetchDescriptionFromSelector(doc, ".celwidget .celwidget > .a-expander-collapsed-height .a-expander-content");
        if (decs1 != "") {
            return decs1;
        }
        
        // .a-expander-collapsed-height .a-expander-content .celwidget > p
        let decs2 = fetchDescriptionFromSelector(doc, ".a-expander-collapsed-height .a-expander-content .celwidget > p");
        if (decs2 != "") {
            return decs2;
        }
        
        // .a-section .a-tab-content .a-expander-collapsed-height .celwidget
        let decs3 = fetchDescriptionFromSelector(doc, ".a-section .a-tab-content .a-expander-collapsed-height .celwidget");
        if (decs3 != "") {
            return decs3;
        }

        // #dp-container > .celwidget > .a-section:has(.a-section)
        let decs4 = fetchDescriptionFromSelector(doc, "#dp-container > .celwidget > .a-section > .a-section");
        if (decs4 != "") {
            return decs4;
        }

        return placeholder;
    }

    /**
     * Google Books APIを使って書籍情報を取得する
     * @param isbn13
     * @returns {Promise<boolean>} 取得に成功したかどうか
     */
    const fetchBookData = async (isbn10: string, isbn13: string): Promise<boolean> => {
        setIsFetchingBookInfo(true);
        const result = await fetchBookDataCore(isbn10, isbn13);
        setIsFetchingBookInfo(false);
        return result;
    }

    const fetchBookDataCore = async (isbn10: string, isbn13: string): Promise<boolean> => {
        try {
            const isbn10 = toIsbn10(isbn13);

            const description: string = await fetchDescription(isbn13);

            if (!isbn10) {
                alert("ISBNが不正です");
                return false;
            }
            setIsbn(isbn13);

            const bookInfo = await fetchBookInfo(isbn13);
            if (bookInfo == null) {
                alert("書籍情報が見つかりませんでした");
                return false;
            }

            const title = bookInfo[0];
            const authors = bookInfo[1];

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
            } else {
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

        fetchBookData(isbn10, isbn13);
        closeCameraModal();
    }

    const updateIsbnEvent = () => {
        //ISBNが10桁または13桁でない場合は何もしない
        if (isbn().length != 10 && isbn().length != 13) {
            return;
        }

        //13桁の場合はISBN-10に変換し、10桁の場合は13桁に変換する
        let isbn10;
        let isbn13;
        if (isbn().length == 13) {
            isbn10 = toIsbn10(isbn());
            isbn13 = isbn();
        } else {
            isbn10 = isbn();
            isbn13 = toIsbn13(isbn());
        }

        if (isbn10 == null && isbn13 == null) {
            return;
        }

        fetchBookData(isbn10!, isbn13!);
    }

    return (
        <div style={{"font-family": "Arial, sans-serif"}}>
            <Header/>
            <VStack maxwidth="900px" margin="0 auto" gap="15px" padding="20px">
                <h2 style={{"text-align": "center", color: "#333"}}>
                    新規登録
                </h2>
                <VStack gap="10px">
                    <label for="isbn">
                        <HStack gap="10px">
                            <b>ISBN (13桁または10桁の識別子)</b>
                            <NowLoadingImage isOpen={isFetchingBookInfo()}></NowLoadingImage>
                        </HStack>
                    </label>
                    <HStack height="38px">
                        <input
                            type="text"
                            id="isbn"
                            value={isbn()}
                            onInput={(e) => setIsbn(e.currentTarget.value)}
                            onFocusOut={(e) => {
                                updateIsbnEvent()
                            }}
                            class={styles.inputfield}
                            style={{"width": "100%"}}
                        />
                        <button class={styles.cameraButton} onClick={openCameraModal}>
                            <img src="/camera.png" class={styles.cameraIcon}></img>
                        </button>
                    </HStack>
                </VStack>
                <VStack gap="10px">
                    <label for="title"><b>タイトル</b></label>
                    <input
                        type="text"
                        id="title"
                        value={title()}
                        onInput={(e) => setTitle(e.currentTarget.value)}
                        class={styles.inputfield}
                    />
                </VStack>
                <VStack gap="10px">
                    <label for="author"><b>著者</b></label>
                    <input
                        type="text"
                        id="author"
                        value={author()}
                        onInput={(e) => setAuthor(e.currentTarget.value)}
                        class={styles.inputfield}
                    />
                </VStack>
                <VStack gap="10px">
                    {amazonPageSrc() ? (
                        <label for="summary"><b>概要 (<a href={amazonPageSrc()!} target="_blank">Amazon商品ページ</a>より引用)</b></label>
                    ) : (
                        <label for="summary"><b>概要</b></label>
                    )}
                    <textarea
                        id="summary"
                        value={summary()}
                        onInput={(e) => setSummary(e.currentTarget.value)}
                        class={styles.textarea}
                    ></textarea>
                </VStack>
                <VStack gap="10px">
                    <label for="cover"><b>表紙</b></label>
                    <input
                        type="file"
                        id="cover"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        ref={fileInputRef}
                        class={styles.inputfile}
                    />
                </VStack>
                {coverPreview() && (
                    <img src={coverPreview()!} alt="Cover Preview" class={styles.coverPreview}/>
                )}
                <button type="submit" class={styles.submitButton} onClick={handleSubmit}>登録</button>

                <Camera isOpen={isCameraModalOpen()} onClose={closeCameraModal} onDetectIsbn={detectIsbn}></Camera>
            </VStack>
        </div>
    );
};

export default BookRegister;

