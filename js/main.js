// ============================================
// ゲーム状態管理
// ============================================
class GasBurnerGame {
    constructor() {
        // ゲーム設定
        this.mode = 'practice'; // 'practice' or 'challenge'
        this.currentStep = 0;
        this.score = 0;
        this.lives = 3;
        this.startTime = null;
        this.timerInterval = null;
        this.isGameActive = false;
        this.showGuide = true;
        
        // 状態フラグ
        this.states = {
            gasScrewClosed: true,
            airScrewClosed: true,
            mainValveOpen: false,
            lighterReady: false,
            cockOpen: false,
            gasScrewOpen: false,
            ignited: false,
            flameAdjusted: false
        };
        
        // 正しい手順の定義
        this.steps = [
            {
                id: 1,
                instruction: 'ガス調節ねじが閉まっているか確認してください',
                hint: 'ガス調節ねじをクリックして確認しましょう',
                action: 'checkGasScrew',
                validator: () => this.states.gasScrewClosed
            },
            {
                id: 2,
                instruction: '空気調節ねじが閉まっているか確認してください',
                hint: '空気調節ねじをクリックして確認しましょう',
                action: 'checkAirScrew',
                validator: () => this.states.airScrewClosed
            },
            {
                id: 3,
                instruction: '元栓を開けてください',
                hint: '元栓のハンドルをクリックして開きましょう',
                action: 'openMainValve',
                validator: () => this.states.mainValveOpen
            },
            {
                id: 4,
                instruction: 'マッチまたはライターを準備してください',
                hint: 'ライターをクリックして準備しましょう',
                action: 'prepareLighter',
                validator: () => this.states.lighterReady
            },
            {
                id: 5,
                instruction: 'コックを開いてください',
                hint: 'コックのハンドルをクリックして開きましょう',
                action: 'openCock',
                validator: () => this.states.cockOpen
            },
            {
                id: 6,
                instruction: 'ガス調節ねじをゆっくり開いてください',
                hint: 'ガス調節ねじをクリックして開きましょう',
                action: 'openGasScrew',
                validator: () => this.states.gasScrewOpen
            },
            {
                id: 7,
                instruction: '点火してください',
                hint: 'ライターをクリックして点火しましょう',
                action: 'ignite',
                validator: () => this.states.ignited
            },
            {
                id: 8,
                instruction: '空気調節ねじで炎を調整してください（青い炎にする）',
                hint: '空気調節ねじをクリックして炎を調整しましょう',
                action: 'adjustFlame',
                validator: () => this.states.flameAdjusted
            }
        ];
        
        this.init();
    }
    
    // ============================================
    // 初期化
    // ============================================
    init() {
        this.setupEventListeners();
        this.updateUI();
    }
    
    // ============================================
    // イベントリスナーの設定
    // ============================================
    setupEventListeners() {
        // ゲームコントロール
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetGame());
        document.getElementById('hint-btn').addEventListener('click', () => this.showHint());
        
        // モード選択
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.changeMode(e.target.closest('.mode-btn').dataset.mode));
        });
        
        // ガイド表示トグル
        document.getElementById('show-guide').addEventListener('change', (e) => {
            this.showGuide = e.target.checked;
            this.toggleGuide();
        });
        
        // ガスバーナーの各パーツ
        document.getElementById('gas-screw').addEventListener('click', () => this.handleGasScrew());
        document.getElementById('air-screw').addEventListener('click', () => this.handleAirScrew());
        document.getElementById('main-valve').addEventListener('click', () => this.handleMainValve());
        document.getElementById('cock').addEventListener('click', () => this.handleCock());
        document.getElementById('lighter').addEventListener('click', () => this.handleLighter());
        
        // モーダル
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.closeModal();
            this.resetGame();
            this.startGame();
        });
        document.getElementById('close-modal-btn').addEventListener('click', () => this.closeModal());
    }
    
    // ============================================
    // ゲーム開始
    // ============================================
    startGame() {
        if (this.isGameActive) return;
        
        this.isGameActive = true;
        this.currentStep = 0;
        this.score = 0;
        this.lives = 3;
        this.startTime = Date.now();
        
        // タイマー開始
        this.timerInterval = setInterval(() => this.updateTimer(), 100);
        
        // 最初のステップを表示
        this.nextStep();
        
        // UIを更新
        this.updateUI();
        
        // ボタンの状態を更新
        document.getElementById('start-btn').disabled = true;
    }
    
    // ============================================
    // ゲームリセット
    // ============================================
    resetGame() {
        // タイマー停止
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // 状態をリセット
        this.isGameActive = false;
        this.currentStep = 0;
        this.score = 0;
        this.lives = 3;
        this.startTime = null;
        
        // 各状態をリセット
        this.states = {
            gasScrewClosed: true,
            airScrewClosed: true,
            mainValveOpen: false,
            lighterReady: false,
            cockOpen: false,
            gasScrewOpen: false,
            ignited: false,
            flameAdjusted: false
        };
        
        // ビジュアルをリセット
        this.resetVisuals();
        
        // UIを更新
        this.updateUI();
        
        // 手順リストをリセット
        this.resetProcedureList();
        
        // ボタンの状態を更新
        document.getElementById('start-btn').disabled = false;
        
        // ステップ表示をリセット
        document.getElementById('step-instruction').textContent = '「スタート」ボタンを押して、ガスバーナーの操作を始めましょう！';
        document.getElementById('step-hint').textContent = '';
    }
    
    // ============================================
    // ビジュアルをリセット
    // ============================================
    resetVisuals() {
        // 炎を消す
        document.getElementById('flame').classList.remove('active', 'blue');
        
        // 各パーツの状態をリセット
        document.getElementById('gas-screw').classList.remove('open');
        document.getElementById('air-screw').classList.remove('open');
        document.getElementById('main-valve').classList.remove('open');
        document.getElementById('cock').classList.remove('open');
        document.getElementById('lighter').classList.remove('ready');
    }
    
    // ============================================
    // 手順リストをリセット
    // ============================================
    resetProcedureList() {
        document.querySelectorAll('#procedure-list li').forEach(li => {
            li.classList.remove('completed', 'active');
            li.classList.add('pending');
        });
    }
    
    // ============================================
    // 次のステップへ
    // ============================================
    nextStep() {
        if (this.currentStep >= this.steps.length) {
            this.completeGame();
            return;
        }
        
        const step = this.steps[this.currentStep];
        
        // ステップ表示を更新
        document.getElementById('step-number').textContent = step.id;
        document.getElementById('step-instruction').textContent = step.instruction;
        document.getElementById('step-hint').textContent = '';
        
        // 手順リストを更新
        this.updateProcedureList();
        
        // スコア加算
        if (this.currentStep > 0) {
            this.score += 100;
            this.updateUI();
        }
    }
    
    // ============================================
    // 手順リストを更新
    // ============================================
    updateProcedureList() {
        const items = document.querySelectorAll('#procedure-list li');
        items.forEach((item, index) => {
            if (index < this.currentStep) {
                item.classList.remove('pending', 'active');
                item.classList.add('completed');
            } else if (index === this.currentStep) {
                item.classList.remove('pending', 'completed');
                item.classList.add('active');
            } else {
                item.classList.remove('active', 'completed');
                item.classList.add('pending');
            }
        });
    }
    
    // ============================================
    // ヒント表示
    // ============================================
    showHint() {
        if (!this.isGameActive) return;
        
        const step = this.steps[this.currentStep];
        document.getElementById('step-hint').textContent = `💡 ${step.hint}`;
        
        // スコアを少し減らす
        this.score = Math.max(0, this.score - 10);
        this.updateUI();
    }
    
    // ============================================
    // ガス調節ねじの処理
    // ============================================
    handleGasScrew() {
        if (!this.isGameActive) return;
        
        const currentAction = this.steps[this.currentStep].action;
        
        if (currentAction === 'checkGasScrew') {
            // ステップ1: 確認
            if (this.states.gasScrewClosed) {
                this.showFeedback('✅ 正しく閉まっています！', 'success');
                this.currentStep++;
                this.nextStep();
            }
        } else if (currentAction === 'openGasScrew') {
            // ステップ6: 開く
            if (this.states.cockOpen && !this.states.gasScrewOpen) {
                this.states.gasScrewOpen = true;
                document.getElementById('gas-screw').classList.add('open');
                this.showFeedback('✅ ガス調節ねじを開きました！', 'success');
                this.currentStep++;
                this.nextStep();
            }
        } else {
            // 間違ったタイミング
            this.handleWrongAction('このタイミングでガス調節ねじを操作してはいけません！');
        }
    }
    
    // ============================================
    // 空気調節ねじの処理
    // ============================================
    handleAirScrew() {
        if (!this.isGameActive) return;
        
        const currentAction = this.steps[this.currentStep].action;
        
        if (currentAction === 'checkAirScrew') {
            // ステップ2: 確認
            if (this.states.airScrewClosed) {
                this.showFeedback('✅ 正しく閉まっています！', 'success');
                this.currentStep++;
                this.nextStep();
            }
        } else if (currentAction === 'adjustFlame') {
            // ステップ8: 炎を調整
            if (this.states.ignited && !this.states.flameAdjusted) {
                this.states.flameAdjusted = true;
                this.states.airScrewClosed = false;
                document.getElementById('air-screw').classList.add('open');
                document.getElementById('flame').classList.add('blue');
                this.showFeedback('✅ 炎を青く調整しました！完璧です！', 'success');
                this.currentStep++;
                this.completeGame();
            }
        } else {
            // 間違ったタイミング
            this.handleWrongAction('このタイミングで空気調節ねじを操作してはいけません！');
        }
    }
    
    // ============================================
    // 元栓の処理
    // ============================================
    handleMainValve() {
        if (!this.isGameActive) return;
        
        const currentAction = this.steps[this.currentStep].action;
        
        if (currentAction === 'openMainValve') {
            // ステップ3: 元栓を開く
            if (!this.states.mainValveOpen) {
                this.states.mainValveOpen = true;
                document.getElementById('main-valve').classList.add('open');
                this.showFeedback('✅ 元栓を開きました！', 'success');
                this.currentStep++;
                this.nextStep();
            }
        } else if (this.currentStep < 2) {
            // ねじの確認前に元栓を開くのはNG
            this.handleWrongAction('まず、ガス調節ねじと空気調節ねじの確認をしてください！');
        }
    }
    
    // ============================================
    // ライターの処理
    // ============================================
    handleLighter() {
        if (!this.isGameActive) return;
        
        const currentAction = this.steps[this.currentStep].action;
        
        if (currentAction === 'prepareLighter') {
            // ステップ4: ライター準備
            if (!this.states.lighterReady) {
                this.states.lighterReady = true;
                document.getElementById('lighter').classList.add('ready');
                this.showFeedback('✅ ライターを準備しました！', 'success');
                this.currentStep++;
                this.nextStep();
            }
        } else if (currentAction === 'ignite') {
            // ステップ7: 点火
            if (this.states.gasScrewOpen && this.states.lighterReady && !this.states.ignited) {
                this.states.ignited = true;
                document.getElementById('flame').classList.add('active');
                this.showFeedback('✅ 点火に成功しました！', 'success');
                this.currentStep++;
                this.nextStep();
            }
        } else if (this.currentStep < 3) {
            // 準備前に使おうとした
            this.handleWrongAction('まだライターを使用するタイミングではありません！');
        }
    }
    
    // ============================================
    // コックの処理
    // ============================================
    handleCock() {
        if (!this.isGameActive) return;
        
        const currentAction = this.steps[this.currentStep].action;
        
        if (currentAction === 'openCock') {
            // ステップ5: コックを開く
            if (this.states.lighterReady && !this.states.cockOpen) {
                this.states.cockOpen = true;
                document.getElementById('cock').classList.add('open');
                this.showFeedback('✅ コックを開きました！', 'success');
                this.currentStep++;
                this.nextStep();
            }
        } else if (this.currentStep < 4) {
            // ライター準備前にコックを開くのはNG
            this.handleWrongAction('ライターを準備してからコックを開いてください！');
        }
    }
    
    // ============================================
    // 間違った操作の処理
    // ============================================
    handleWrongAction(message) {
        this.lives--;
        this.score = Math.max(0, this.score - 50);
        
        // 爆発エフェクト
        this.showExplosion();
        
        // フィードバック表示
        this.showFeedback(`❌ ${message}`, 'error');
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.updateUI();
        }
    }
    
    // ============================================
    // 爆発エフェクト
    // ============================================
    showExplosion() {
        const explosion = document.getElementById('explosion');
        explosion.classList.add('active');
        
        // サウンドエフェクト（あれば）
        // this.playSound('explosion');
        
        setTimeout(() => {
            explosion.classList.remove('active');
        }, 800);
    }
    
    // ============================================
    // フィードバック表示
    // ============================================
    showFeedback(message, type) {
        // 簡易的なフィードバック（アラートの代わり）
        const hint = document.getElementById('step-hint');
        hint.textContent = message;
        hint.style.borderLeftColor = type === 'success' ? 'var(--success-color)' : 'var(--danger-color)';
        hint.style.background = type === 'success' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)';
        
        // 3秒後にクリア（成功の場合のみ）
        if (type === 'success') {
            setTimeout(() => {
                hint.textContent = '';
            }, 3000);
        }
    }
    
    // ============================================
    // ゲーム完了
    // ============================================
    completeGame() {
        this.isGameActive = false;
        
        // タイマー停止
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        // ボーナススコア計算
        const elapsedTime = (Date.now() - this.startTime) / 1000;
        let timeBonus = 0;
        
        if (this.mode === 'challenge') {
            // チャレンジモードではタイムボーナス
            if (elapsedTime < 30) timeBonus = 500;
            else if (elapsedTime < 60) timeBonus = 300;
            else if (elapsedTime < 90) timeBonus = 100;
        }
        
        const lifeBonus = this.lives * 100;
        this.score += timeBonus + lifeBonus;
        
        // 評価を計算
        const rating = this.calculateRating();
        
        // 結果モーダルを表示
        this.showResultModal(true, elapsedTime, rating);
    }
    
    // ============================================
    // ゲームオーバー
    // ============================================
    gameOver() {
        this.isGameActive = false;
        
        // タイマー停止
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        const elapsedTime = (Date.now() - this.startTime) / 1000;
        
        // 結果モーダルを表示
        this.showResultModal(false, elapsedTime, '失敗');
    }
    
    // ============================================
    // 評価を計算
    // ============================================
    calculateRating() {
        if (this.score >= 1000) return '⭐⭐⭐⭐⭐';
        if (this.score >= 800) return '⭐⭐⭐⭐';
        if (this.score >= 600) return '⭐⭐⭐';
        if (this.score >= 400) return '⭐⭐';
        return '⭐';
    }
    
    // ============================================
    // 結果モーダルを表示
    // ============================================
    showResultModal(success, time, rating) {
        const modal = document.getElementById('result-modal');
        const title = document.getElementById('result-title');
        const message = document.getElementById('result-message');
        const finalScore = document.getElementById('final-score');
        const finalTime = document.getElementById('final-time');
        const ratingElem = document.getElementById('rating');
        
        if (success) {
            title.textContent = '🎉 成功！完璧です！';
            message.textContent = 'おめでとうございます！正しい手順でガスバーナーを操作できました。この調子で実験を楽しんでください！';
        } else {
            title.textContent = '💥 失敗...もう一度挑戦しましょう';
            message.textContent = 'ライフが0になってしまいました。正しい手順をよく確認して、もう一度挑戦してみましょう！';
        }
        
        finalScore.textContent = this.score;
        finalTime.textContent = this.formatTime(Math.floor(time));
        ratingElem.textContent = rating;
        
        modal.classList.add('active');
    }
    
    // ============================================
    // モーダルを閉じる
    // ============================================
    closeModal() {
        document.getElementById('result-modal').classList.remove('active');
    }
    
    // ============================================
    // モード変更
    // ============================================
    changeMode(mode) {
        this.mode = mode;
        
        // ボタンのアクティブ状態を更新
        document.querySelectorAll('.mode-btn').forEach(btn => {
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // ゲームをリセット
        if (this.isGameActive) {
            this.resetGame();
        }
    }
    
    // ============================================
    // ガイド表示切り替え
    // ============================================
    toggleGuide() {
        const guide = document.getElementById('procedure-guide');
        if (this.showGuide) {
            guide.classList.remove('hidden');
        } else {
            guide.classList.add('hidden');
        }
    }
    
    // ============================================
    // タイマー更新
    // ============================================
    updateTimer() {
        if (!this.startTime) return;
        
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        document.getElementById('timer').textContent = this.formatTime(elapsed);
        
        // チャレンジモードの制限時間チェック
        if (this.mode === 'challenge' && elapsed >= 120) {
            this.handleWrongAction('制限時間が過ぎました！');
            this.gameOver();
        }
    }
    
    // ============================================
    // 時間フォーマット
    // ============================================
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // ============================================
    // UI更新
    // ============================================
    updateUI() {
        // スコア
        document.getElementById('score').textContent = this.score;
        
        // ライフ
        const hearts = '❤️'.repeat(this.lives) + '🖤'.repeat(3 - this.lives);
        document.getElementById('lives').textContent = hearts;
        
        // 現在のステップ
        document.getElementById('current-step').textContent = `${this.currentStep}/${this.steps.length}`;
    }
}

// ============================================
// ゲームインスタンスの作成
// ============================================
let game;

document.addEventListener('DOMContentLoaded', () => {
    game = new GasBurnerGame();
});
