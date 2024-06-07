import { Component } from "solid-js";
import Header from "./Header";

const Lending: Component = () => {
  return (
    <>
      <Header />
      <div>
        <h1>貸出ページ</h1>
        <p>これは貸出ページです.</p>
        <img src="https://picsum.photos/400/300" alt="placeholder" />
      </div>
    </>
    
  );
};

export default Lending;
