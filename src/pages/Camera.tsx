import {Component, createEffect, onCleanup} from "solid-js";

import Modal from "./Modal";
import {BrowserMultiFormatReader} from "@zxing/library";
import {toIsbn10} from "../utils/IsbnUtils";

interface CameraProps {
    isOpen: boolean;
    onClose: () => void;
    onDetectIsbn: (isbn13:string) => void;
}

const Camera: Component<CameraProps> = (props: CameraProps) => {
    let videoRef: HTMLVideoElement | undefined;
    let canvasRef: HTMLCanvasElement | undefined;
    let reader: BrowserMultiFormatReader;

    createEffect(()=>{
        if(props.isOpen) {
            startCamera();
        }else{
            stopCamera();
        }
    });

    onCleanup(() => {
        stopCamera();
    });

    const stopCamera = () => {
        if (videoRef && videoRef.srcObject) {
            (videoRef.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            videoRef.srcObject = null;
        }
        if (reader) {
            reader.reset();
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
                    //ISBNコードを取得
                    const isbn13 = result.getText();
                    if(isbn13!=null){
                        props.onDetectIsbn(isbn13);
                    }
                }
            });
        } catch (err) {
            alert("カメラのアクセスが許可されていません。");
        }
    };

    return (
        <>
            <Modal isOpen={props.isOpen} onClose={props.onClose} title="カメラ">
                <div>
                    <video ref={el => videoRef = el} width="100%" height="100%"
                           style={{maxWidth: "400px", maxHeight: "300px"}} autoPlay playsInline></video>
                </div>
            </Modal>
            {/* Canvas を隠して写真を描画する */}
            <canvas ref={el => canvasRef = el} style={{display: "none"}} width="400" height="300"></canvas>
        </>

    );
};

export default Camera;