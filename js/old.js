    // ============================================
    // クリック
    // ============================================
    onClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const clickableObjects = [
            this.parts.gasScrew,
            this.parts.airScrew,
            this.parts.cock,
            this.parts.mainValve,
            this.parts.lighter
        ].filter(obj => obj !== null);
        
        const intersects = this.raycaster.intersectObjects(clickableObjects, true);
        
        if (intersects.length > 0) {
            const object = intersects[0].object.parent;
            if (object.userData.clickable && window.game) {
                const type = object.userData.type;
                
                // ゲームロジックを呼び出し
                switch(type) {
                    case 'gasScrew':
                        window.game.handleGasScrew();
                        break;
                    case 'airScrew':
                        window.game.handleAirScrew();
                        break;
                    case 'cock':
                        window.game.handleCock();
                        break;
                    case 'mainValve':
                        window.game.handleMainValve();
                        break;
                    case 'lighter':
                        window.game.handleLighter();
                        break;
                }
            }
        }
    }
