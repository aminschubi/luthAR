var myGame = new Kiwi.Game();

var myState = new Kiwi.State("myState");

myState.preload = function () {
    Kiwi.State.prototype.preload.call(this);
    this.addSpriteSheet("hammerSprite", "img/hammerhit.png", 130,130);
    this.addSpriteSheet("boss", "img/bossSpriteSheet.png", 286, 284);
    this.addImage("bg", "img/bg.png");
    this.addImage("gameOver", "img/go.png");
    this.addImage("gG", "img/gg.png");
    this.addImage("rageBar", "img/rageBar.png");
    this.addImage("rageBorder", "img/rageBorder.png");
}

myState.create = function(){
    Kiwi.State.prototype.create.call(this);
    this.game.stage.resize(1920,1080);

    this.clock = this.game.time.clock;

    this.startTime = Date.now();
    this.endTime;
    this.logFileText = "";
    this.ended = false;

    this.gameOver = false;

    this.bg = new Kiwi.GameObjects.Sprite(this, this.textures.bg, 0,0);
    this.gameO = new Kiwi.GameObjects.Sprite(this, this.textures.gameOver, 0,0);
    this.gameO.scale=(0.5);
    this.gG = new Kiwi.GameObjects.Sprite(this, this.textures.gG, 0,0);
    this.gG.scale=(0.5);
    this.rageBar = new Kiwi.Plugins.Primitives.Rectangle( {
        state: this,
        width: 150,
        height: 39,
        //centerOnTransform = false,
        x: 1920/2 + 63,
        y: 80,
        color: [1,1,1]
    } );
    this.rageBorder = new Kiwi.GameObjects.Sprite(this, this.textures.rageBorder, 1920/2 + 50,67);

    this.player = new Player(this, this.textures.hammerSprite, 300, 300,2);
    this.player.transform.scale = 0.75;
    this.player.animation.add("move", [0,1,2,3,4], 0.1, false);
    this.player.animation.add("hit", [5,6,7,8,9,10,11,12,13,14,15,16], 0.05, false);
    this.player.animation.add("dodge", [16,17,18,19,20,21,16],0.01,false);

    this.boss = new Boss(this, this.textures.boss, 500, 474);
    this.boss.transform.scale = 1.5;
    this.boss.animation.add("idle", [0], 0.1, false);
    this.boss.animation.add("move", [1,2], 0.2, false);
    this.boss.animation.add("attack", [0,3,4], 0.2, false);
    this.boss.animation.add("openClaws", [3,5], 0.3, false);
    this.boss.animation.add("chargeSP", [6,7,8], 0.5, false);
    this.boss.animation.add("discharge", [8,9,10,11,12], 0.1, false);

    this.upKey = this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.UP);
    this.leftKey = this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.LEFT);
    this.rightKey = this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.RIGHT);
    this.downKey = this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.DOWN);
    this.spaceKey = this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.SPACEBAR);
    this.cKey = this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.C);

    this.playerAttack = new Kiwi.GameObjects.TextField(this, "",20,20, "#ffffff");
    this.playerAttack.fontFamily = "Courier New";
    this.playerAttack.fontSize = 50;
    this.playerAttack.fontWeight = "bold";
    this.playerAttack.visible = false;

    this.bossAttack = new Kiwi.GameObjects.TextField(this, "",20,20, "#ff0000");
    this.bossAttack.fontFamily = "Courier New";
    this.bossAttack.fontSize = 50;
    this.bossAttack.fontWeight = "bold";
    this.bossAttack.visible = false;

    this.dodgeCD = new Kiwi.GameObjects.TextField(this, "",20,75, "#ffffff");
    this.dodgeCD.fontFamily = "Courier New";
    this.dodgeCD.fontSize = 40;
    this.dodgeCD.fontWeight = "bold";
    this.dodgeCD.text = "Dodge-Cooldown:2/2 Seconds";

    this.hpP = new Kiwi.GameObjects.TextField(this, "",20,20, "#ffffff");
    this.hpP.fontFamily = "Courier New";
    this.hpP.fontSize = 40;
    this.hpP.fontWeight = "bold";

    this.hpB = new Kiwi.GameObjects.TextField(this, "",1920/2 - 200,20, "#c5f7f0");
    this.hpB.fontFamily = "Courier New";
    this.hpB.fontSize = 40;
    this.hpB.fontWeight = "bold";

    this.rB = new Kiwi.GameObjects.TextField(this, "",1920/2 - 200,75, "#c5f7f0");
    this.rB.fontFamily = "Courier New";
    this.rB.fontSize = 40;
    this.rB.fontWeight = "bold";
    this.rB.text = "Boss-Rage:";

    this.endTF2 = new Kiwi.GameObjects.TextField(this, "",1920/2 - 450,1080/2+400, "#ffffff");
    this.endTF2.fontFamily = "Courier New";
    this.endTF2.fontSize = 80;
    this.endTF2.fontWeight = "bold";

    this.addChild(this.bg);
    this.addChild(this.boss);
    this.addChild(this.player);
    this.addChild(this.hpP);
    this.addChild(this.hpB);
    this.addChild(this.rageBar);
    this.addChild(this.rB);
    this.addChild(this.rageBorder);
    this.addChild(this.playerAttack);
    this.addChild(this.bossAttack);
    this.addChild(this.dodgeCD);
}

myState.update = function() {
       Kiwi.State.prototype.update.call(this);
       this.updateHUD();
       this.checkEnd();
       if(this.gameOver && this.cKey.isDown){
           this.destroy(true);
           this.create();
           this.boss.clock.start();
           this.player.clock.start();
           this.ended = false;
       }
}

myState.updateHUD = function(){
    this.hpP.text = "Player-HP:"+this.player.hp.toString()+"/"+this.player.maxHP.toString();
    this.hpB.text = "Boss-HP:"+this.boss.hp.toString()+"/"+this.boss.maxHP.toString();
    this.playerAttack.x = this.calcRotationPoint().x;
    this.playerAttack.y = this.calcRotationPoint().y;
    this.bossAttack.x = this.player.mid.x-20;
    this.bossAttack.y = this.player.mid.y-20;
    if(this.player.actualTime-this.player.dodgeClock < 10001)
        this.dodgeCD.text = "Dodge-Cooldown:"+(Math.round(((this.player.actualTime-this.player.dodgeClock)/1000) * 100) / 100)+"/10 Seconds";
    else
    this.dodgeCD.text = "Dodge-Cooldown:10/10 Seconds";
}

myState.checkEnd = function(){
    if(this.player.hp <= 0){
        var game = this;
        var timer = this.clock.createTimer("endGame", 0,5);
        timer.createTimerEvent(Kiwi.Time.TimerEvent.TIMER_STOP,
            function(){
                this.ended = true;
                game.endTF2.text = "Press C to restart";
                game.addChild(game.gameO);
                game.addChild(game.endTF2);
                game.boss.clock.stop();
                game.player.clock.stop();
                game.gameOver = true;
                game.clock.removeTimer(timer);
                game.endTime = Date.now();
                var outcome = ("Mode: "+game.mode+" (Mode 1: More Specials, Mode 2: Less Specials)\r\nOutcome: Loss \r\nTime: " + game.milliSecondsToHMinSec(game.endTime - game.startTime) + "\r\nRemaining Boss-HP: "+game.boss.hp+"\r\n");
                var endFile = outcome + game.logFileText;
                game.download("GPP_Log.txt", endFile);
                game.logFileText = "";
            }
        );
        
    }
    else if(this.boss.hp <= 0){
        var game = this;
        var timer = this.clock.createTimer("endGame", 0,5);
        timer.createTimerEvent(Kiwi.Time.TimerEvent.TIMER_STOP,
            function(){
                this.ended = true;
                game.endTF2.text = "Press C to restart";
                game.addChild(game.gG);
                game.addChild(game.endTF2);
                game.boss.clock.stop();
                game.player.clock.stop();
                game.gameOver = true;
                game.clock.removeTimer(timer);
                game.endTime = Date.now();
                var outcome = ("Mode: "+game.mode+" (Mode 1: More Specials, Mode 2: Less Specials)\r\nOutcome: Win \r\nTime: " + game.milliSecondsToHMinSec(game.endTime - game.startTime) + "\r\nRemaining Player-HP: "+game.player.hp+"\r\n");
                var endFile = outcome + game.logFileText;
                game.download("GPP_Log.txt", endFile);
                game.logFileText = "";
            }
        );
    }
}

myState.download = function(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}

myState.milliSecondsToHMinSec = function(millisec) {
    var seconds = (millisec / 1000).toFixed(0);
    var minutes = Math.floor(seconds / 60);
    var hours = "";
    if (minutes > 59) {
        hours = Math.floor(minutes / 60);
        hours = (hours >= 10) ? hours : "0" + hours;
        minutes = minutes - (hours * 60);
        minutes = (minutes >= 10) ? minutes : "0" + minutes;
    }

    seconds = Math.floor(seconds % 60);
    seconds = (seconds >= 10) ? seconds : "0" + seconds;
    if (hours != "") {
        return hours + ":" + minutes + ":" + seconds;
    }
    return minutes + ":" + seconds;
}

myState.calcRotationPoint = function(){
    var x;
    var y;
    switch(Kiwi.Utils.GameMath.radiansToDegrees(this.player.rotation)){
        case 0:
            x = this.player.mid.x - 15;
            y = this.player.mid.y - 50;
            break;
        case 45:
            x = this.player.mid.x - 15;
            y = this.player.mid.y - 55;
            break;
        case 90:
            x = this.player.mid.x + 5;
            y = this.player.mid.y -30;
            break;
        case 135:
            x = this.player.mid.x + 15;
            y = this.player.mid.y - 30;
            break;
        case 180:
            x = this.player.mid.x + 15;
            y = this.player.mid.y - 35;
            break;
        case 225:
            x = this.player.mid.x - 5;
            y = this.player.mid.y - 45;
            break;
        case 270:
            x = this.player.mid.x -5;
            y = this.player.mid.y -60;
            break;
        case 315:
            x = this.player.mid.x + 15;
            y = this.player.mid.y - 70;
            break;
    }
    var angle = this.player.rotation;
    var rotatedX = Math.cos(-angle) * (x - this.player.mid.x) + Math.sin(-angle) * (y - this.player.mid.y) + this.player.mid.x;
    var rotatedY = Math.sin(-angle) * (x - this.player.mid.x) + Math.cos(-angle) * (y - this.player.mid.y) + this.player.mid.y;
    return new Kiwi.Geom.Point(rotatedX,rotatedY);
}

myGame.states.addState(myState);
myGame.states.switchState("myState");


