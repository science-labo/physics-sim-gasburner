// ============================================
    // ガス調節ねじの処理
    // ============================================
    handleGasScrew() {
        console.log('handleGasScrew呼び出し - isGameActive:', this.isGameActive, 'currentStep:', this.currentStep);
        
        if (!this.isGameActive) return;
        
        const currentAction = this.steps[this.currentStep].action;
        console.log('現在のアクション:', currentAction);
        
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
                if (window.burner3d) {
                    window.burner3d.rotateGasScrew(true);
                }
                this.showFeedback('✅ ガス調節ねじを開きました！', 'success');
                this.currentStep++;
                this.nextStep();
            } else if (!this.states.cockOpen) {
                console.log('エラー: コックが開いていない');
                this.handleWrongAction('先にコックを開いてください！');
            }
        } else {
            // 間違ったタイミング
            console.log('エラー: 間違ったタイミング');
            this.handleWrongAction('このタイミングでガス調節ねじを操作してはいけません！');
        }
    }
old_string:
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
                if (window.burner3d) {
                    window.burner3d.rotateGasScrew(true);
                }
                this.showFeedback('✅ ガス調節ねじを開きました！', 'success');
                this.currentStep++;
                this.nextStep();
            } else if (!this.states.cockOpen) {
                this.handleWrongAction('先にコックを開いてください！');
            }
        } else {
            // 間違ったタイミング
            this.handleWrongAction('このタイミングでガス調節ねじを操作してはいけません！');
        }
    }
