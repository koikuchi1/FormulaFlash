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

    // タイトルは常に表示
    labelElement.innerHTML = `<b>${card.title}</b>`;

// 非表示時はクリア（変更なし）
    if (!isFormulaVisible) {
        formulaDisplay.innerHTML = ''; 
        commentElement.innerHTML = '';
        return; // ここで処理を終了
    }

    // script.js の updateDisplay 関数内の if (isFormulaVisible) ブロック

    if (isFormulaVisible) {
        // 数式をそのままHTML要素に挿入
        formulaDisplay.innerHTML = `$$${card.formula}$$`;
        commentElement.innerHTML = `<span style="margin-left: 20px;">${card.comment}</span>`;
        
        // MathJax v3 のレンダリング関数を使用
        try {
            if (window.MathJax) {
                 // MathJaxに、新しく内容が変わった formulaDisplay 要素を再レンダリングさせる
                 MathJax.typeset([formulaDisplay]);
                 
            } else {
                 console.error("MathJaxがロードされていません。");
            }
        } catch (e) {
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
}

// 初期化

loadFormulas();


