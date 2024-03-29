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

function getParam(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, `\\$&`);
  var regex = new RegExp(`[?&]` + name + `(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results) {
    return null;
  }
  if (!results[2]) {
    return "";
  }
  return decodeURIComponent(results[2].replace(/\+/g, ` `));
}
// URLからタグ名を取得する関数
function getTagsArrayFromURL() {
  const tag = getTagFromURL();
  return tag ? [tag] : [];
}
function getSearchWordFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("searchWord") || "";
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

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const post_button = document.getElementById("post_button");
const searchTextInput = document.getElementById("search_text");
const searchButton = document.getElementById("search_button");

const post = db.collection("Post");

function clearSearchWordParameter() {
  const currentURL = new URL(window.location.href);
  currentURL.searchParams.delete("searchWord");
  window.history.replaceState({}, document.title, currentURL.toString());
}

function clearTagParameter() {
  const currentURL = new URL(window.location.href);
  currentURL.searchParams.delete("tag");
  window.history.replaceState({}, document.title, currentURL.toString());
}

searchButton.addEventListener("click", function (event) {
  const searchWord = searchTextInput.value.trim();
  console.log("Search Word:", searchWord);
  clearTagParameter();
  const currentURL = new URL(window.location.href);
  currentURL.searchParams.set("searchWord", searchWord);
  currentURL.searchParams.delete("tag"); // タグパラメータを削除
  window.location.href = currentURL.toString();
  const updatedURL = updateQueryStringParameter(
    currentURL,
    "searchWord",
    searchWord
  );
  window.location.href = updatedURL;
});

document.querySelector(".logo").addEventListener("click", function () {
  // 現在のURLからパラメータを取得する
  const urlParams = new URLSearchParams(window.location.search);
  const userName = urlParams.get("UserName");
  const userId = urlParams.get("UserID");
  console.log(userName, userId);
  // パラメータが存在するかチェック
  if (userName && userId) {
    window.location.href = `T-CHAT-Home.html?UserName=${encodeURIComponent(
      userName
    )}&UserID=${encodeURIComponent(userId)}`;
  } else {
    window.location.href = `T-CHAT-Home.html`;
  }
});

document.querySelector(".home").addEventListener("click", function () {
  // 現在のURLからパラメータを取得する
  const urlParams = new URLSearchParams(window.location.search);
  const userName = urlParams.get("UserName");
  const userId = urlParams.get("UserID");
  console.log(userName, userId);
  // パラメータが存在するかチェック
  if (userName && userId) {
    window.location.href = `T-CHAT-Home.html?UserName=${encodeURIComponent(
      userName
    )}&UserID=${encodeURIComponent(userId)}`;
  } else {
    window.location.href = `T-CHAT-Home.html`;
  }
});

document.querySelector(".question").addEventListener("click", function () {
  // 現在のURLからパラメータを取得する
  const urlParams = new URLSearchParams(window.location.search);
  const userName = urlParams.get("UserName");
  const userId = urlParams.get("UserID");
  console.log(userName, userId);
  // パラメータが存在するかチェック
  if (userName && userId) {
    window.location.href = `./T-CHAT-Question/T-CHAT-Question.html?UserName=${encodeURIComponent(
      userName
    )}&UserID=${encodeURIComponent(userId)}`;
  } else {
    window.location.href = `./T-CHAT-Question/T-CHAT-Question.html`;
  }
});

post_button.addEventListener("click", async function () {
  // 現在のURLからパラメータを取得する
  const urlParams = new URLSearchParams(window.location.search);
  const userName = urlParams.get("UserName");
  const userId = urlParams.get("UserID");
  console.log(userName, userId);
  // パラメータが存在するかチェック
  if (userName && userId) {
    // パラメータを引き継いでT-CHAT-Postへ遷移
    window.location.href = `./T-CHAT-Post/T-CHAT-Post.html?UserName=${encodeURIComponent(
      userName
    )}&UserID=${encodeURIComponent(userId)}`;
  } else {
    // パラメータが存在しない場合は、遷移せずに何らかの通知や処理を行う
    alert("ログインしてください。");
  }
});

async function getData(postCollection, searchWord) {
  const selectedTags = getTagsArrayFromURL();
  var add_element = document.getElementById("add-element");
  // 既存の要素をクリア
  add_element.innerHTML = "";
  searchWord = searchWord ? searchWord.toString().toLowerCase() : "";
  try {
    const querySnapshot = await postCollection.orderBy("View", "desc").get();
    let addData = "";
    for (const doc of querySnapshot.docs) {
      const postID = doc.id;
      const docData = doc.data();
      const answersSnapshot = await db
        .collection("Post")
        .doc(postID)
        .collection("Answers")
        .get();
      const answerCount = answersSnapshot.size; // 回答数を取得
      const tags = docData.Tag.split(",").map((tag) => tag.trim());
      const format = docData.Format;
      let boxClass = "";
      const titleContainsSearchWord =
        searchWord === "" ||
        docData.Title.toLowerCase().includes(searchWord.toLowerCase());
      const tagsContainSearchWord = docData.Tag.toLowerCase()
        .split(",")
        .some((tag) =>
          tag.trim().toLowerCase().includes(searchWord.toLowerCase())
        );
      const tagsMatch =
        !selectedTags ||
        selectedTags.every((selectedTag) => tags.includes(selectedTag));

      if ((titleContainsSearchWord || tagsContainSearchWord) && tagsMatch) {
        const hasUnsolvedTag = tags.includes("未回答");
        const hasNotansweredTag = tags.includes("未解決");
        const hasAnsweredTag = tags.includes("解決");

        if (hasUnsolvedTag || hasNotansweredTag || hasAnsweredTag) {
          boxClass = hasUnsolvedTag
            ? "box1"
            : hasNotansweredTag
            ? "box2"
            : "box3";
        }

        addData += `<div class="${boxClass}">`;
        addData += `<section>`;
        addData += `<div class="UserName">${docData.UserName}</div>`;
        addData += `<div class="PostDay">投稿日:${docData.PostDay}</div>`;
        const existingParams = new URLSearchParams(window.location.search);

        if (!existingParams.has("PostID")) {
          existingParams.append("PostID", postID);
        }
        const detailLink = `T-CHAT-Detail/T-CHAT-Temp.html?${existingParams.toString()}`;
        addData += `<a href="${detailLink}" class="article"> <article style="cursor: pointer;">${docData.Title}</article> </a>`;
        if (tags.length > 0) {
          let formatClass = "";
          switch (format) {
            case "プライベート":
              formatClass = "format-private";
              break;
            case "意見交換":
              formatClass = "format-exchange";
              break;
            case "Q＆A":
              formatClass = "format-qa";
              break;
          }
          // formatに応じたクラスを追加
          addData += `<span class="${formatClass}">${format}</span>`;
          addData += " ";
        }

        tags.forEach((tag) => {
          let articleCategoryClass = "";
          if (tag === "未回答" && hasUnsolvedTag) {
            articleCategoryClass = "unsolved-category";
          } else if (tag === "未解決" && hasNotansweredTag) {
            articleCategoryClass = "Notanswered-category";
          } else if (tag === "解決" && hasAnsweredTag) {
            articleCategoryClass = "answered-category";
          }

          // タグを表示
          addData += `<span class="article-category ${articleCategoryClass}" style="cursor: pointer;">${tag}</span>`;
        });
        addData += `<span class="answers-num">回答数：${answerCount}件</span>`; // 回答数を表示
        addData += `</section>`;
        addData += `</div>`;
        // 既存の要素をクリア
      }
    }
    add_element.innerHTML = addData;
    setTagClickEvent();
  } catch (error) {
    console.log("データ取得失敗:", error);
  }
}
window.onload = async function () {
  setTagClickEvent();
  try {
    // Trend コレクションの参照
    const trendCollection = db.collection("Trend");

    // Trend コレクション内の全てのドキュメントを取得
    const trendDocs = await trendCollection.get();

    // ランキングデータの配列を初期化
    const rankingData = [];

    // 各ドキュメントに対して処理を行う
    trendDocs.forEach((doc) => {
      const tagName = doc.id; // ドキュメント名がタグを表す
      const viewCount = doc.data().View || 0; // View フィールドが存在しない場合は 0 として扱う
      rankingData.push({ tag: tagName, view: viewCount });
    });

    // View 数の降順でソート
    rankingData.sort((a, b) => b.view - a.view);

    // ランキング表示を構築
    displayRanking(rankingData);
  } catch (error) {
    console.error("Error fetching Trend data:", error);
  }

  const tag = getTagsArrayFromURL();
  const searchWordFromURL = getSearchWordFromURL();
  console.log("Tag:", tag);
  console.log("Search Word from URL:", searchWordFromURL);

  if (tag) {
    getData(post, searchWordFromURL);
  } else if (searchWordFromURL) {
    getData(post, searchWordFromURL);
  } else {
    getData(post);
  }
};
async function initPage() {
  try {
    const selectedTags = getTagsArrayFromURL(); // URLから選択されたタグを取得
    const searchWord = getSearchWordFromURL(); // URLから検索ワードを取得
    await getData(post, selectedTags, searchWord); // データ取得処理
    document.getElementById("body").style.display = "block"; // データ取得後に表示
  } catch (error) {
    console.error("Error initializing page:", error);
  }
}

document.addEventListener("DOMContentLoaded", initPage);
// ランキングの表示
function displayRanking(rankingData) {
  console.log("Displaying Trend Tags:", rankingData);
  const asideElement = document.querySelector("aside");
  if (!asideElement) {
    console.error("Element with tag 'aside' not found.");
    return;
  }

  // ヘッダーの追加
  const headElement = document.createElement("div");
  headElement.className = "item-list";
  headElement.innerHTML = `<div class="head">📈 Trend</div>`;
  asideElement.appendChild(headElement);

  // ランキングの表示
  rankingData.slice(0, 10).forEach((item, index) => {
    const itemElement = document.createElement("div");
    itemElement.className = "item-list";
    if (index < 3) {
      // 1~3位は画像を表示
      itemElement.innerHTML = `
      <h4>
        <img src="./T-CHAT-Image/no${index + 1}.png" />
      </h4>
      <div class="item"style="cursor: pointer;">${item.tag}</div>
    `;
    } else {
      // 4位以降は順位を表示
      itemElement.innerHTML = `
      <div class="rank">${index + 1}</div>
      <div class="item"style="cursor: pointer;">${item.tag}</div>
    `;
    }
    // Trendアイテムにクリックイベントリスナーを追加
    itemElement.addEventListener("click", function () {
      // クリックされたタグをURLパラメータに追加し、ページをリロード
      const url = new URL(window.location);
      url.searchParams.delete("searchWord"); // searchWordパラメータを削除
      url.searchParams.set("tag", item.tag); // tagパラメータを設定または更新
      // URLを更新してページをリロード
      window.location.href = url.toString();
    });

    asideElement.appendChild(itemElement);
  });
}
// URLにパラメータを追加または更新する関数
function updateQueryStringParameter(uri, key, value) {
  const re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
  const separator = uri.indexOf("?") !== -1 ? "&" : "?";
  if (uri.match(re)) {
    return uri.replace(re, "$1" + key + "=" + value + "$2");
  } else {
    return uri + separator + key + "=" + value;
  }
}

// 2つの配列が等しいかどうかを判定する関数
function areArraysEqual(arr1, arr2) {
  return (
    arr1.length === arr2.length &&
    arr1.every((value, index) => value === arr2[index])
  );
}

function getTagFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("tag");
}

function setTagClickEvent() {
  const tagElements = document.querySelectorAll(".article-category");
  tagElements.forEach((tagElement) => {
    tagElement.addEventListener("click", function () {
      const clickedTag = tagElement.textContent.trim();
      const currentURL = new URL(window.location.href);
      currentURL.searchParams.set("tag", clickedTag);
      currentURL.searchParams.delete("searchWord"); // 検索ワードパラメータを削除
      window.location.href = currentURL.toString();
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const mediaQuery = window.matchMedia("(max-width: 430px)");

  // 透明なクリック領域に対する処理を定義
  function applyBackgroundStyle() {
    const bodyElement = document.getElementById("body");
    bodyElement.style.backgroundImage = "url('./T-CHAT-Image/T-CHAT_icon.png')";
    bodyElement.style.backgroundRepeat = "no-repeat";
    bodyElement.style.backgroundSize = "90px";
    bodyElement.style.backgroundPosition = "left 10px top 10px";
    window.location.href = "T-CHAT-Home.html";
    console.log("クリックイベントが発生しました。");
  }

  // 透明なクリック領域を作成して#bodyに追加
  const clickArea = document.createElement("div");
  clickArea.id = "invisibleClickArea";
  clickArea.style.position = "absolute";
  clickArea.style.width = "90px";
  clickArea.style.height = "90px";
  clickArea.style.top = "10px";
  clickArea.style.left = "10px";
  clickArea.style.opacity = "0";
  document.getElementById("body").appendChild(clickArea);

  // メディアクエリがマッチした時のみ透明なクリック領域にクリックイベントを追加
  function handleMediaQueryChange(mediaQuery) {
    if (mediaQuery.matches) {
      // ビューポート幅が430px以下の場合のみクリックイベントを追加
      clickArea.addEventListener("click", applyBackgroundStyle);
    } else {
      // ビューポート幅が430pxを超える場合はクリックイベントを削除
      clickArea.removeEventListener("click", applyBackgroundStyle);
    }
  }

  // メディアクエリの変更を監視
  mediaQuery.addListener(handleMediaQueryChange);

  // 初期ロード時にもメディアクエリに基づいてイベントリスナーを設定
  handleMediaQueryChange(mediaQuery);
});
