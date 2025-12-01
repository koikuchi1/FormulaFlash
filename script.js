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





