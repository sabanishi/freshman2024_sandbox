import firebase from "firebase/compat/app";
import "firebase/compat/database";
import {ref} from "firebase/database";
import {getStorage} from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCahwePB9Eth4yrGJprSVTq9a19r81Wxmg",
    authDomain: "freshman-sandbox.firebaseapp.com",
    databaseURL: "https://freshman-sandbox-default-rtdb.firebaseio.com/",
    projectId: "freshman-sandbox",
    storageBucket: "freshman-sandbox.appspot.com",
    messagingSenderId: "970469296840",
    appId: "1:970469296840:web:cbf095f3f8df814731b3fd",
    measurementId: "G-6XV3YTD0T6",
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database(app);
const storage = getStorage(app);

const my_ref = (path:string) =>ref(db,`${port}/${path}`);

const port = "dev";

export { my_ref,storage};