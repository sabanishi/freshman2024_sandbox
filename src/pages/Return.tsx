import { Component } from "solid-js";
import Header from "./Header";

const Return: Component = () => {
  return (
    <>
      <Header />
      <div>
        <h1>返却ページ</h1>
        <p>これは返却ページです.</p>
        <img src="https://picsum.photos/400/300" alt="placeholder" />
      </div>
    </>
    
  );
};

export default Return;
