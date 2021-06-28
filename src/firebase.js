import firebase from 'firebase';

var firebaseConfig = {
    apiKey: "AIzaSyBvxotCyjPLG67LKs5rxS5QubZkXkjhxNw",
    authDomain: "secodapp-poc.firebaseapp.com",
    projectId: "secodapp-poc",
    storageBucket: "secodapp-poc.appspot.com",
    messagingSenderId: "355091368541",
    appId: "1:355091368541:web:5480fedaf9c9699621dbb4"
};

// Evitar la creacion constante de firebase.initializeApp
// Si existe se usa la que ya esta

let firebaseApp = null;

if (!firebase.apps.length) {
  firebaseApp = firebase.initializeApp(firebaseConfig);
} else {
  firebaseApp = firebase.app(); // if already initialized, use that one
}

const firebaseAppConst = firebaseApp;
const firebaseDB = firebaseApp.firestore();

const getFirebaseInstance = () => firebaseDB;

export { firebaseAppConst, getFirebaseInstance };