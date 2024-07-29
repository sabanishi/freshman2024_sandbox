import {Component, createEffect, createSignal, onCleanup} from "solid-js";
import Modal from "./Modal";
import {BrowserMultiFormatReader} from "@zxing/library";

interface CameraProps {
    isOpen: boolean;
    /*ポップアップを閉じる関数を引き渡すための参照*/
    onClose: () => void;
    /*ISBNを検知した時に呼びだす関数を引き渡すための参照*/
    onDetectIsbn: (isbn13: string) => void;
}

const Camera: Component<CameraProps> = (props: CameraProps) => {
    let videoRef: HTMLVideoElement | undefined;
    let canvasRef: HTMLCanvasElement | undefined;
    let reader: BrowserMultiFormatReader;
    const [isCameraReady, setIsCameraReady] = createSignal(false);
    const [redBoxRef, setRedBoxRef] = createSignal<HTMLDivElement>();

    createEffect(() => {
        if (props.isOpen) {
            startCamera();
        } else {
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
        setIsCameraReady(false);
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment",
                    width: {ideal: 1920},
                    height: {ideal: 1080}
                }
            });
            if (videoRef) {
                videoRef.srcObject = stream;
                videoRef.play();
                videoRef.onloadedmetadata = () => {
                    setIsCameraReady(true);
                    reader = new BrowserMultiFormatReader();
                    scanFrame();
                }
            }
        } catch (err) {
            alert("カメラのアクセスが許可されていません。");
        }

        /**
         * カメラの映像からISBNを検知する
         * 再帰的に自身を呼び出すことで、毎フレーム実行される
         */
        const scanFrame = async () => {
            if (canvasRef && videoRef) {
                const context = canvasRef.getContext("2d");
                const redBox = redBoxRef();
                //赤枠の中だけを検知対象とする
                if (context && redBox) {
                    const redBoxRect = redBox.getBoundingClientRect();
                    const videoRect = videoRef.getBoundingClientRect();

                    if (videoRect.width != 0 || videoRect.height != 0) {
                        const scaleX = canvasRef.width / videoRect.width;
                        const scaleY = canvasRef.height / videoRect.height;
                        const sx = (redBoxRect.left - videoRect.left) * scaleX;
                        const sy = (redBoxRect.top - videoRect.top) * scaleY;
                        const sw = redBoxRect.width * scaleX;
                        const sh = redBoxRect.height * scaleY;

                        context.drawImage(videoRef, 0, 0, canvasRef.width, canvasRef.height);
                        const imageData = context.getImageData(sx, sy, sw, sh);

                        const tempCanvas = document.createElement("canvas");
                        tempCanvas.width = sw;
                        tempCanvas.height = sh;
                        const tempContext = tempCanvas.getContext("2d");
                        if (tempContext) {
                            tempContext.putImageData(imageData, 0, 0);
                            const dataUrl = tempCanvas.toDataURL();
                            try {
                                const result = await reader.decodeFromImage(undefined, dataUrl);
                                console.log(result);
                                if (result) {
                                    //ISBNコードを取得
                                    const isbn13 = result.getText();
                                    if (isbn13 != null) {
                                        props.onDetectIsbn(isbn13);
                                    }
                                }
                            } catch (err) {
                            }
                        }
                    }
                }
            }
            //1フレーム後に自身を呼び出す
            requestAnimationFrame(scanFrame);
        }
    };

    return (
        <>
            <Modal isOpen={props.isOpen} onClose={props.onClose} title="カメラ">
                <div style={{
                    position: "relative"
                }}>
                    <video
                        ref={(el) => (videoRef = el)}
                        style={{
                            width: "100%",
                            height: "auto",
                            transform: "scaleX(-1)"
                        }}
                        autoPlay
                        playsInline
                    ></video>
                    {/*カメラの中央に赤枠を用意する*/}
                    {isCameraReady() && (
                        <div
                            ref={setRedBoxRef}
                            style={{
                                position: "absolute",
                                border: "2px solid red",
                                top: "50%",
                                left: "50%",
                                width: "40%",
                                "padding-top": "20%",
                                transform: "translate(-50%, -50%)",
                                pointerEvents: "none",
                                boxSizing: "border-box"
                            }}
                        ></div>
                    )}
                </div>
            </Modal>
            {/* Canvas を隠して写真を描画する */}
            <canvas ref={el => canvasRef = el} style={{display: "none"}} width="400" height="300"></canvas>
        </>
    );
};

export default Camera;