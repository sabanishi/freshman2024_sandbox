import {Component} from "solid-js";
import styles from "./NowLoadingImage.module.css";

interface NowLoadingImageProps {
    isOpen:boolean;
}

const NowLoadingImage:Component<NowLoadingImageProps> = (props:NowLoadingImageProps) => {
    return (
        <>
            {(props.isOpen) && (
                <div class={styles.loader}></div>
            )}
        </>
    );
}

export default NowLoadingImage;