//モーダルウィンドウ
function showModal() {
  var overlay = document.getElementById("overlay");
  var modal = document.getElementById("modal");

  overlay.style.display = "block";
  modal.style.display = "flex";
}

function closeModal() {
  var overlay = document.getElementById("overlay");
  var modal = document.getElementById("modal");

  overlay.style.display = "none";
  modal.style.display = "none";
}

var firebaseConfig = {
  apiKey: "AIzaSyARxI5dZXILhMkMDTDE5MyK88yJlCh-A_Y",
  authDomain: "t-chat-d4c62.firebaseapp.com",
  projectId: "t-chat-d4c62",
  storageBucket: "t-chat-d4c62.appspot.com",
  messagingSenderId: "276479107458",
  appId: "1:276479107458:web:329742b4d052a975d16f9b",
  measurementId: "G-WPZGDY4H0F",
};
var toolbarOptions = [
  [{ header: [2, 3, false] }],
  ["bold", "italic", "underline"], // toggled buttons
  /* [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown　*/
  ["blockquote"],
  ["image"],
  [{ list: "ordered" }, { list: "bullet" }], // superscript/subscript
  [{ align: [] }],
  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  /* ['clean']                                         // remove formatting button*/
];

const editor = new Quill("#editor_area", {
  bounds: "#edito",
  modules: {
    toolbar: toolbarOptions,
  },
  placeholder: "テキストを入力",
  theme: "snow",
});
// Firebaseの初期化
firebase.initializeApp(firebaseConfig);

// Firestoreの参照取得
const db = firebase.firestore();

// URLからPostIDを取得する関数
function getPostIDFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("PostID");
}

// PostIDでデータを検索する関数
async function findDocumentByPostID(postID) {
  try {
    console.log("Searching for PostID:", postID);
    const collectionRef = await db
      .collection("Post")
      .where("UserID", "==", postID)
      .get();

    if (!collectionRef.empty) {
      // 一致するドキュメントが見つかった場合
      const doc = collectionRef.docs[0];
      const data = doc.data();
      const postElement = document.getElementById("post-element");
      const displayContainer = document.getElementById("display-container");
      const boxParent = document.getElementsByClassName("box")[0]; // "box" クラスの要素を取得
      if (!boxParent) {
        console.error("Element with class 'box' not found.");
        return;
      }

      var add_element_data = "";
      add_element_data += `<p class="name">${data.UserName}</p>`;
      add_element_data += `<p class="date">投稿日:${data.PostDay}</p>`;
      add_element_data += `<p class="large">${data.Title}</p>`;
      // タグを区切り文字「,」で分割
      const tags = data.Tag.split(",");

      let boxClass = ""; // ボックスのクラスを格納する変数
      tags.forEach((tag) => {
        let articleCategoryClass = "";
        if (tag.trim() === "未回答") {
          articleCategoryClass = "unsolved-category";
          boxClass = "box1";
        } else if (tag.trim() === "未解決") {
          articleCategoryClass = "Notanswered-category";
          boxClass = "box2";
        } else if (tag.trim() === "解決") {
          articleCategoryClass = "answered-category";
          boxClass = "box3";
        }

        add_element_data += `<span class="article-category ${articleCategoryClass}" style="cursor: pointer;">${tag.trim()}</span>`;
        add_element_data += " "; // ここで適切なスペースを追加する
      });

      // boxのクラスを適用
      boxParent.className = boxClass;

      postElement.innerHTML = add_element_data;
      if (Array.isArray(data.Content)) {
        const htmlContent = data.Content.map(
          (item) => `<${item.tagName}>${item.content}</${item.tagName}>`
        ).join("");
        displayContainer.innerHTML = htmlContent;
      } else {
        // Contentが配列でない場合は通常の表示
        displayContainer.innerHTML = data.content;
      }
      // Post/PostID ドキュメント内にViewフィールドが存在するか確認
      if (!data.hasOwnProperty("View")) {
        // View フィールドが存在しない場合は新たに作成
        await doc.ref.update({
          View: 1,
        });
      } else {
        // View フィールドが存在する場合はインクリメント
        await doc.ref.update({
          View: firebase.firestore.FieldValue.increment(1),
        });
      }

      // 更新された投稿のタグに対してTrend/TagのViewを更新
      await updateTrendTags(tags);
    } else {
      // 一致するドキュメントが見つからなかった場合
      console.error("Document not found in Firestore with PostID:", postID);
    }
  } catch (error) {
    console.error("Error fetching data from Firestore:", error);
  }
}

// Trend/TagのViewを更新する関数
async function updateTrendTags(tags) {
  try {
    const trendTagCollection = db.collection("Trend");

    // 各タグに対して処理を行う
    tags.forEach(async (tag) => {
      // Trend/Tag内にタグが存在するか確認
      const tagDoc = await trendTagCollection.doc(tag.trim()).get();

      if (tagDoc.exists) {
        // タグが存在する場合はViewを更新
        trendTagCollection.doc(tag.trim()).update({
          View: firebase.firestore.FieldValue.increment(1),
        });
      } else {
        // タグが存在しない場合は新たにドキュメントを作成
        trendTagCollection.doc(tag.trim()).set({
          View: 1,
        });
      }
    });
  } catch (error) {
    console.error("Error updating Trend/Tag:", error);
  }
}

// PostIDを取得して検索
const postID = getPostIDFromURL();
console.log("PostID:", postID);
if (postID) {
  findDocumentByPostID(postID);
} else {
  console.error("PostID not provided in the URL parameters.");
}
