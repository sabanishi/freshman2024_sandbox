import { Router, Route } from "@solidjs/router";
import Lending from "./pages/Lending";
import Return from "./pages/Return";
import MainPage from "./pages/MainPage";
import FirebaseTest from "./pages/FirebaseTest";
import Register from "./pages/Register";
import Bookshell from "./pages/Bookshell";
import BookRegister from "./pages/BookRegister";

function Routing() {
  return (
    <Router>
      <Route path="/" component={MainPage} />
      <Route path="/lending" component={Lending} />
      <Route path="/return" component={Return} />
      <Route path="/firebase-test" component={FirebaseTest} />
      <Route path="/register" component={BookRegister} />
      <Route path="/bookshell" component={Bookshell} />
    </Router>
  );
}

export default Routing;