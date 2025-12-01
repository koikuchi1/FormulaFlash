// ====================
// 状態管理
// ====================
let formulas = []; // JSONから読み込んだ全データ
let currentFormulaIndex = 0;
let isFormulaVisible = false;

// DOM要素の取得
const labelElement = document.getElementById('card-label');
const formulaDisplay = document.getElementById('formula-display');
const commentElement = document.getElementById('card-comment');
const idInput = document.getElementById('id-input');

// ====================
// データ読み込み（fetch APIでJSONを読み込む）
// ====================
async function loadFormulas() {
    try {
        const response = await fetch('formulas.json');
        formulas = await response.json();

        // ★★★ 修正点: 目次作成の呼び出しを追加 ★★★
        createIndex();

        updateDisplay();
        attachEventListeners();
    } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
        labelElement.textContent = 'データの読み込みエラー';
    }
}

// ====================
// 表示更新関数
// ====================
function updateDisplay() {
    if (formulas.length === 0) return;

    const card = formulas[currentFormulaIndex];

    // ★★★ 修正点: IDナンバーをタイトルの前に組み込む ★★★
    // 例: "0-01: オイラーの公式" のように表示
    labelElement.innerHTML = `<b>${card.id}: ${card.title}</b>`;

    // タイトルは常に表示
    //labelElement.innerHTML = `<b>${card.title}</b>`;

// 非表示時はクリア（変更なし）
    if (!isFormulaVisible) {
        formulaDisplay.innerHTML = ''; 
        commentElement.innerHTML = '';
        return; // ここで処理を終了
    }

    if (isFormulaVisible) {
        let formulaContent = card.formula;
        
        // ★★★ 修正点: \begin{array}{l} ... \end{array} でラップ ★★★
        // \\ や \newline が array 内の改行として機能するようにする
        const wrappedFormula = "\\begin{array}{l}" + formulaContent + "\\end{array}";
        
        // 1. 数式を挿入 (デリミタは \[\...] の代わりに $$...$$ を使用)
        //    ここで挿入するのは、ラップされた array 環境
        formulaDisplay.innerHTML = `$$${wrappedFormula}$$`;
        commentElement.innerHTML = `<span style="margin-left: 20px;">${card.comment}</span>`;
        
        // 2. MathJaxのレンダリング関数を呼び出す
        try {
            if (window.MathJax) {
                 // MathJaxに、新しく内容が変わった formulaDisplay 要素を再レンダリングさせる
                 MathJax.typeset([formulaDisplay]);
                 
            } else {
                 console.error("MathJaxがロードされていません。");
            }
        } catch (e) {
            // 日本語テキストや複雑な構文によるエラーはここで捕捉される
            console.error("MathJaxのレンダリング中にエラーが発生しました:", e);
        }
    }
}

// ====================
// イベントハンドラ
// ====================
function onNextClicked() {
    if (isFormulaVisible) {
        currentFormulaIndex = (currentFormulaIndex + 1) % formulas.length;
    }
    isFormulaVisible = !isFormulaVisible;
    updateDisplay();
}

function onBackClicked() {
    if (isFormulaVisible) {
        currentFormulaIndex = (currentFormulaIndex - 1 + formulas.length) % formulas.length;
    }
    isFormulaVisible = !isFormulaVisible;
    updateDisplay();
}

function onJumpClicked() {
    const idValue = idInput.value.trim();
    const index = formulas.findIndex(f => f.id === idValue);
    
    if (index !== -1) {
        currentFormulaIndex = index;
        isFormulaVisible = false;
        idInput.placeholder = 'ID(例:1-01）';
        updateDisplay();
    } else {
        idInput.value = "";
        idInput.placeholder = "IDが無効です";
    }
}

// ====================
// 目次作成関数 (階層化対応)
// ====================
function createIndex() {
    const indexListElement = document.getElementById('index-list');
    indexListElement.innerHTML = ''; // 既存の内容をクリア

    // 1. データを階層構造に整理
    const categories = {};
    
    formulas.forEach(card => {
        // IDから大分類キー（例: "0"）とタイトルを抽出
        const idParts = card.id.split('-'); // ["0", "15"]
        const majorKey = idParts[0];      // "0"

        // タイトルから大分類名（例: "用語解説"）を抽出
        const titleParts = card.title.split('：');
        const majorTitle = titleParts[0].trim(); // "用語解説"

        // 階層のキーを結合して一意な大分類名にする
        const categoryKey = `${majorKey}-${majorTitle}`; // 例: "0-用語解説"

        if (!categories[categoryKey]) {
            // 新しい大分類をオブジェクトに作成
            categories[categoryKey] = {
                title: `${majorKey}. ${majorTitle}`, // 例: "0. 用語解説"
                items: []
            };
        }
        
        // 個別のカード情報を大分類に追加
        categories[categoryKey].items.push(card);
    });

    // 2. 階層構造を使ってHTMLリストを生成
    
    // 大分類のキー（例: "0-用語解説"）でソートして表示順を制御
    const sortedKeys = Object.keys(categories).sort();

    sortedKeys.forEach(key => {
        const category = categories[key];

        // 大分類のタイトルを表示する ul 要素を作成
        const categoryContainer = document.createElement('li');
        categoryContainer.className = 'index-category';
        
        // 大分類のタイトル
        const majorTitleHeader = document.createElement('h4');
        majorTitleHeader.textContent = category.title;
        categoryContainer.appendChild(majorTitleHeader);

        // 小分類（カードリスト）の ul 要素を作成
        const subList = document.createElement('ul');
        subList.className = 'index-subcategory-list';

        category.items.forEach(card => {
            const listItem = document.createElement('li');
            
            // 小分類のリンク
            const anchor = document.createElement('a');
            anchor.href = "#";
            anchor.setAttribute('data-id', card.id);
            anchor.textContent = `${card.id}: ${card.title}`;
            
            // クリックイベントを追加 (onIndexJump を呼び出す)
            anchor.addEventListener('click', function(e) {
                e.preventDefault(); 
                onIndexJump(this.getAttribute('data-id')); 
            });

            listItem.appendChild(anchor);
            subList.appendChild(listItem);
        });

        categoryContainer.appendChild(subList);
        indexListElement.appendChild(categoryContainer);
    });
}

// ====================
// 目次クリック時のジャンプ処理
// ====================
function onIndexJump(targetId) {
    const index = formulas.findIndex(f => f.id === targetId);
    
    if (index !== -1) {
        currentFormulaIndex = index;
        isFormulaVisible = false; // 表面（タイトル）を表示
        updateDisplay();
        
        // ページトップへスムーズにスクロール
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
    } else {
        console.error(`ID ${targetId} が見つかりませんでした。`);
    }
}

// ====================
// イベントリスナーの登録
// ====================
function attachEventListeners() {
    document.getElementById('next-button').addEventListener('click', onNextClicked);
    document.getElementById('back-button').addEventListener('click', onBackClicked);
    document.getElementById('jump-button').addEventListener('click', onJumpClicked);

    const idInput = document.getElementById('id-input');

    // Enterキーが押されたときにジャンプ処理を実行
    idInput.addEventListener('keydown', function(event) {
        // Enterキー (key === 'Enter' または keyCode === 13) を検出
        if (event.key === 'Enter') {
            event.preventDefault(); // Enterキーによるフォーム送信などを防止
            onJumpClicked();        // 既存のジャンプ処理を実行
        }
    });

    // ★★★ ここからキーボード操作の追加 ★★★
    document.addEventListener('keydown', function(event) {
        // 現在フォーカスされている要素を取得
        const activeElement = document.activeElement;

        // テキスト入力欄やボタンにフォーカスがある場合は、キーボード操作を無効にする
        // (ID入力欄に文字を入力している最中にカードが切り替わるのを防ぐため)
        if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'BUTTON') {
            return;
        }

        // Nキー (Next) で「次へ」
        if (event.key.toLowerCase() === 'n') {
            event.preventDefault(); // ブラウザのデフォルト動作を防止
            onNextClicked();
        } 
        // Bキー (Back) で「戻る」
        else if (event.key.toLowerCase() === 'b') {
            event.preventDefault(); // ブラウザのデフォルト動作を防止
            onBackClicked();
        }
    });
}

// 初期化

loadFormulas();




