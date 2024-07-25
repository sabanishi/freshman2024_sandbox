import { Component,createSignal } from "solid-js";
import styles from "./BookRegister.module.css";

const BookRegister: Component = () => {
    const [isbn, setIsbn] = createSignal("");
    const [title, setTitle] = createSignal("");
    const [author, setAuthor] = createSignal("");
    const [summary, setSummary] = createSignal("");
    const [cover, setCover] = createSignal<File | null>(null);
    const [coverPreview, setCoverPreview] = createSignal<string | null>(null);

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
    };

    return (
        <div class={styles.container}>
            <h2>新規登録</h2>
            <form onSubmit={handleSubmit} class={styles.form}>
                <div class={styles.field}>
                    <label for="isbn">ISBN</label>
                    <input
                        type="text"
                        id="isbn"
                        value={isbn()}
                        onInput={(e) => setIsbn(e.currentTarget.value)}
                    />
                    <button class={styles.cameraButton}>📷</button>
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
                    {coverPreview() && (
                        <img src={coverPreview()!} alt="Cover Preview" class={styles.coverPreview} />
                    )}
                </div>
                <button type="submit" class={styles.submitButton}>登録</button>
            </form>
        </div>
    );
};

export default BookRegister;
