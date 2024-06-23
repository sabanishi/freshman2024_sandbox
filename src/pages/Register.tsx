import "@solidjs/router"
import { Component, createSignal } from "solid-js";
import Header from "./Header";
import Modal from "./Modal";

const Register: Component = () => {
  const [isModalOpen, setModalOpen] = createSignal(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <>
      <Header />
      <div>
        <h1>登録ページ</h1>
        <p>これは登録ページです.</p>
        <button onClick={openModal}>登録</button>
        <Modal isOpen={isModalOpen()} onClose={closeModal} title="登録モーダル">
          <img src="https://picsum.photos/400/300" alt="placeholder" width={400} height={300} />
          <button onClick={closeModal}>閉じる</button>
        </Modal>
      </div>
    </>
  );
};

export default Register;