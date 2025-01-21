// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'; 
import { getFirestore, collection, getDocs, setDoc, doc } from 'firebase/firestore';  // Corrigido para importar funções do Firestore



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAqux-jHkhNNJuPCz8K67DKkxQcmmZM3rU",
  authDomain: "reactproject-3dfa2.firebaseapp.com",
  projectId: "reactproject-3dfa2",
  storageBucket: "reactproject-3dfa2.firebasestorage.app",
  messagingSenderId: "469984749808",
  appId: "1:469984749808:web:79669ddc7efda8c7fe3a35",
  measurementId: "G-BXMSQWN60E"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);  // Inicializando a autenticação
const db = getFirestore(app);  // Inicializando o Firestore

export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, collection, getDocs, setDoc, doc }; // Corrigido para exportar as funções necessárias