import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAG02M_8hsaX3trSdplxOYaYt-_IwZMhxc",
  authDomain: "blog-e4e84.firebaseapp.com",
  projectId: "blog-e4e84",
  storageBucket: "blog-e4e84.appspot.com",
  messagingSenderId: "279327100902",
  appId: "1:279327100902:web:50cef57c4c9790569dd027",
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
