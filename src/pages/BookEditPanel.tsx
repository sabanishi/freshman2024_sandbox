import {Component} from "solid-js";
import Modal from "./Modal";

interface BookEditProps {
    isOpen: boolean;
    /*ポップアップを閉じる関数を引き渡すための参照*/
    onClose: () => void;
}

const BookEditPanel: Component<BookEditProps> = (props: BookEditProps) => {
    return (
        <>
            <Modal isOpen={props.isOpen} onClose={props.onClose} title="編集">
                {/*ここに編集フォームを追加する*/}
            </Modal>
        </>
    );
};

export default BookEditPanel;