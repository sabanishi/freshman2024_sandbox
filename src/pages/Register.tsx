import { Component, createSignal } from "solid-js";
import Header from "./Header";
import Modal from "./Modal";

const Register: Component = () => {
  const [isModalOpen, setModalOpen] = createSignal(false);
  const [isOptionModalOpen, setOptionModalOpen] = createSignal(false);
  const [photo, setPhoto] = createSignal<string | null>(null);
  const [isCameraModalOpen, setCameraModalOpen] = createSignal(false);
  let videoRef: HTMLVideoElement | undefined;
  let canvasRef: HTMLCanvasElement | undefined;

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const openOptionModal = () => setOptionModalOpen(true);
  const closeOptionModal = () => setOptionModalOpen(false);
  const openCameraModal = () => setCameraModalOpen(true);
  const closeCameraModal = () => {
    setCameraModalOpen(false);
    if (videoRef && videoRef.srcObject) {
      (videoRef.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      videoRef.srcObject = null;
    }
  };

  const handleCapture = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhoto(e.target?.result as string);
        closeOptionModal();
        openModal();
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef) {
        videoRef.srcObject = stream;
        videoRef.play();
      }
    } catch (err) {
      alert("カメラのアクセスが許可されていません。");
    }
  };

  const capturePhoto = () => {
    if (canvasRef && videoRef) {
      const context = canvasRef.getContext("2d");
      if (context) {
        context.drawImage(videoRef, 0, 0, canvasRef.width, canvasRef.height);
        const dataUrl = canvasRef.toDataURL("image/png");
        setPhoto(dataUrl);
        closeCameraModal();
        openModal();
      }
    }
  };

  return (
    <>
      <Header />
      <div>
        <h1>登録ページ</h1>
        <p>これは登録ページです.</p>
        {/* 隠されたファイル入力をカメラの起動に使用 */}
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          id="fileInput"
          onChange={handleCapture}
        />
        <input
          type="file"
          accept="image/*"
          capture="environment" // スマホの背面カメラを使用するように指定
          style={{ display: "none" }}
          id="cameraInput"
          onChange={handleCapture}
        />
        {/* ボタンをクリックしてオプションモーダルをトリガー */}
        <button onClick={openOptionModal}>登録</button>
        <Modal isOpen={isOptionModalOpen()} onClose={closeOptionModal} title="オプション選択">
          <div>
            <button onClick={() => document.getElementById("fileInput")?.click()}>ファイルから選択</button>
            <button onClick={async () => { openCameraModal(); await startCamera(); }}>カメラから取得</button>
          </div>
        </Modal>
        <Modal isOpen={isCameraModalOpen()} onClose={closeCameraModal} title="カメラ">
          <div>
            <video ref={el => videoRef = el} width="400" height="300"></video>
            <button onClick={capturePhoto}>写真を撮る</button>
          </div>
        </Modal>
        <Modal isOpen={isModalOpen()} onClose={closeModal} title="登録モーダル">
          {/* 取得した写真を表示 */}
          {photo() ? (
            <img src={photo()!} alt="Captured" class="responsive-image" width={400} height={300} />
          ) : (
            <img src="https://picsum.photos/400/300" alt="placeholder" class="responsive-image" width={400} height={300} />
          )}
          <button onClick={closeModal}>閉じる</button>
        </Modal>
        {/* Canvas を隠して写真を描画する */}
        <canvas ref={el => canvasRef = el} style={{ display: "none" }} width="400" height="300"></canvas>
      </div>
    </>
  );
};

export default Register;
