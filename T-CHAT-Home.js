function getParam(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, `\\$&`);
    var regex = new RegExp(`[?&]` + name + `(=([^&#]*)|&|#|$)`),
        results = regex.exec(url);
    if (!results) {
        return null;
    }
    if (!results[2]) {
        return '';
    }
    return decodeURIComponent(results[2].replace(/\+/g, ` `));
}

var firebaseConfig = {
    apiKey: "AIzaSyARxI5dZXILhMkMDTDE5MyK88yJlCh-A_Y",
    authDomain: "t-chat-d4c62.firebaseapp.com",
    projectId: "t-chat-d4c62",
    storageBucket: "t-chat-d4c62.appspot.com",
    messagingSenderId: "276479107458",
    appId: "1:276479107458:web:329742b4d052a975d16f9b",
    measurementId: "G-WPZGDY4H0F"
    };

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const search_button =document.getElementById("search_button");
const post = db. collection('post')

GetData();

search_button.addEventListener('click',function(){
    let result = document.getElementById('search_text')
    location.href = `./`
    result.value = '';
})

function getData() {
    post.get().then((doc) => {
        let addData = `<div>`;
        addData += `<section>`;
        doc.forEach((docData) => {
            addData += ``
        })    
    })
}