import { Component, createSignal } from "solid-js";
import Modal from "./Modal";
import { HStack, VStack } from "./CommonTool";
import NowLoadingImage from "./NowLoadingImage";
import BookData from "./BookData";
import styles from "./BookRegister.module.css";
import { isContainsBookData } from "./ToFbCommunicator";

interface BookEditProps {
  isOpen: boolean;
  oldData: BookData | null;
  /*ポップアップを閉じる関数を引き渡すための参照*/
  onClose: () => void;
}

const BookEditPanel: Component<BookEditProps> = (props: BookEditProps) => {
  const [title, setTitle] = createSignal(props.oldData ? props.oldData.title : "");
  const [author, setAuthor] = createSignal(props.oldData ? props.oldData.authors.join(",") : "");
  const [summary, setSummary] = createSignal(props.oldData ? props.oldData.description : "");
  const [coverUrl, setCoverUrl] = createSignal(props.oldData ? props.oldData.path_to_image : "");

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

    if (alertMessage != "") {
      alert(alertMessage);
      return;
    }

    const book: BookData = {
      id: props.oldData ? props.oldData.id : "",
      isbn13: props.oldData ? props.oldData.isbn13 : "",
      title: title(),
      authors: author().split(","),
      description: summary(),
      path_to_image: coverUrl()
    };

    
  };

  return (
    <>
      <Modal isOpen={props.isOpen} onClose={props.onClose} title="編集">
        <div style={{ "font-family": "Arial, sans-serif" }}>
          <VStack maxwidth="900px" minWidth="300px" margin="0 auto" gap="15px" padding="20px">
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
              <label for="summary"><b>概要</b></label>
              <textarea
                id="summary"
                value={summary()}
                onInput={(e) => setSummary(e.currentTarget.value)}
                class={styles.textarea}
              ></textarea>
            </VStack>
            <img src={coverUrl()} alt="Cover Preview" class={styles.coverPreview} />
            <button type="submit" class={styles.submitButton} onClick={handleSubmit}>編集</button>
          </VStack>
        </div>
      </Modal>
    </>
  );
};

export default BookEditPanel;