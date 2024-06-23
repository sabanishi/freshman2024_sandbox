import { Component } from "solid-js";
import "../styles/Modal.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: any;
}

const Modal: Component<ModalProps> = (props) => {
  return (
    <>
      {props.isOpen && (
        <div class="modal-overlay" onClick={props.onClose}>
          <div class="modal-content" onClick={(e) => e.stopPropagation()}>
            <div class="modal-header">
              <h2>{props.title}</h2>
              <button class="modal-close" onClick={props.onClose}>x</button>
            </div>
            <div class="modal-body">
              {props.children}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
