var Player = function(state, atlas, x, y, weaponType){
    Kiwi.GameObjects.Sprite.call(this,state, atlas, x, y, [enableInput=false]);

    this.dodgeClock = Date.now()-10000;
    this.actualTime = Date.now();

    this.maxHP = 100;
    this.hp = 100;

    this.cPressed = false;
    this.spacePressed = false;
    this.dodged = false;

    this.mid = new Kiwi.Geom.Point(this.x + this.width/2, this.y + this.height/2);

    //#region WeaponTypes
    //Longsword
    if(weaponType == 0)
        this.movespeedfactor = 1.0;
    //Bow
    else if(weaponType == 1)
        this.movespeedfactor = 1.1;
    //Hammer
    else if(weaponType == 2)
        this.movespeedfactor = 0.8;
    //#endregion
    Player.prototype.wouldCollide = function(dx, dy){
        console.log((Kiwi.Utils.GameMath.radiansToDegrees(this.rotation)));
        if(Kiwi.Geom.Point.distanceBetween(this.mid, state.boss.mid) < state.boss.height/2-50
            && ((Kiwi.Utils.GameMath.radiansToDegrees(this.rotation) == 90 && state.boss.mid.x > this.mid.x && Kiwi.Geom.Point.distanceBetween(new Kiwi.Geom.Point(this.mid.x + 30, this.mid.y), state.boss.mid) < state.boss.height/2-40) 
            || (Kiwi.Utils.GameMath.radiansToDegrees(this.rotation) == 180 && state.boss.mid.y > this.mid.y && Kiwi.Geom.Point.distanceBetween(new Kiwi.Geom.Point(this.mid.x, this.mid.y + 30), state.boss.mid) < state.boss.height/2-40)
            || (Kiwi.Utils.GameMath.radiansToDegrees(this.rotation) == 270 && state.boss.mid.x < this.mid.x && Kiwi.Geom.Point.distanceBetween(new Kiwi.Geom.Point(this.mid.x - 30, this.mid.y), state.boss.mid) < state.boss.height/2-40) 
            || (Kiwi.Utils.GameMath.radiansToDegrees(this.rotation) == 0 && state.boss.mid.y < this.mid.y && Kiwi.Geom.Point.distanceBetween(new Kiwi.Geom.Point(this.mid.x, this.mid.y - 30), state.boss.mid) < state.boss.height/2-40)
            || (Kiwi.Utils.GameMath.radiansToDegrees(this.rotation) == 225 && state.boss.mid.y > this.mid.y && state.boss.mid.x < this.mid.x)
            || (Kiwi.Utils.GameMath.radiansToDegrees(this.rotation) == 135 && state.boss.mid.y > this.mid.y && state.boss.mid.x > this.mid.x)
            || (Kiwi.Utils.GameMath.radiansToDegrees(this.rotation) == 45 && state.boss.mid.y < this.mid.y && state.boss.mid.x > this.mid.x)
            || (Kiwi.Utils.GameMath.radiansToDegrees(this.rotation) == 315 && state.boss.mid.y < this.mid.y && state.boss.mid.x < this.mid.x))){
            return true;
        }
        else{
            return false;
        }
    }

    Player.prototype.dodge = function(){
        var p = this;
        this.dodged = true;
        if(!this.animation.getAnimation("dodge").isPlaying)
            this.animation.stop();
        this.animation.play("dodge");
        state.playerAttack.visible = false;
        var timer = state.clock.createTimer( "moveTimer", 0.1 );
        timer.createTimerEvent( Kiwi.Time.TimerEvent.TIMER_STOP,
            function() {
                console.log( "Dodge!" );
                switch(Kiwi.Utils.GameMath.radiansToDegrees(p.rotation)){
                    case 0:
                        p.transform.y -= 75;
                        p.mid.y -= 75;
                        break;
                    case 45:
                        p.transform.x += 75;
                        p.mid.x += 75;
                        p.transform.y -= 75;
                        p.mid.y -= 75;
                        break;
                    case 90:
                        p.transform.x += 75;
                        p.mid.x += 75;
                        break;
                    case 135:
                        p.transform.x += 75;
                        p.mid.x += 75;
                        p.transform.y += 75;
                        p.mid.y += 75;
                        break;
                    case 180:
                        p.transform.y += 75;
                        p.mid.y += 75;
                        break;
                    case 225:
                        p.transform.x -= 75;
                        p.mid.x -= 75;
                        p.transform.y += 75;
                        p.mid.y += 75;
                        break;
                    case 270:
                        p.transform.x -= 75;
                        p.mid.x -= 75;
                        break;
                    case 315:
                        p.transform.x -= 75;
                        p.mid.x -= 75;
                        p.transform.y -= 75;
                        p.mid.y -= 75;
                        break;
                }
                //p.transform.setPosition(rotatedX, rotatedY);
                state.clock.removeTimer(timer );
            }
        );

        this.dodgeClock = Date.now();
        var dodgeTimer = state.clock.createTimer( "dodgeCD", 10 );
        dodgeTimer.createTimerEvent( Kiwi.Time.TimerEvent.TIMER_STOP,
            function() {
                console.log( "Dodge!" );
                p.dodged = false;
                state.clock.removeTimer(dodgeTimer);
            }
        );
        timer.start();
        dodgeTimer.start();
        
    }

    Player.prototype.update = function(){
        Kiwi.GameObjects.Sprite.prototype.update.call(this);

        this.actualTime = Date.now();

        //#region Loop Animation right
        if((state.downKey.isDown || state.leftKey.isDown || state.rightKey.isDown ||state.upKey.isDown) 
        && !(!state.downKey.isDown && state.leftKey.isDown && state.rightKey.isDown && !state.upKey.isDown)
        && !(!state.downKey.isDown && state.leftKey.isDown && state.rightKey.isDown && state.upKey.isDown)
        && !(state.downKey.isDown && state.leftKey.isDown && state.rightKey.isDown && !state.upKey.isDown)
        && !(state.downKey.isDown && state.leftKey.isDown && state.rightKey.isDown && state.upKey.isDown)
        && !(state.downKey.isDown && !state.leftKey.isDown && !state.rightKey.isDown && state.upKey.isDown)
        && !(state.downKey.isDown && state.leftKey.isDown && !state.rightKey.isDown && state.upKey.isDown)
        && !(state.downKey.isDown && !state.leftKey.isDown && state.rightKey.isDown && state.upKey.isDown)
        && !this.animation.getAnimation("hit").isPlaying
        && !this.animation.getAnimation("dodge").isPlaying)
        {
            if(!this.animation.getAnimation("move").isPlaying)
                this.animation.play("move");
            state.playerAttack.visible = false;
        }
        //#endregion
        //Check if Hit is being executed
        if(!this.animation.getAnimation("hit").isPlaying && !this.animation.getAnimation("dodge").isPlaying && state.gameOver == false){
            //Down
            if(state.downKey.isDown && !state.leftKey.isDown && !state.rightKey.isDown && !state.upKey.isDown){
                if(this.rotation != Kiwi.Utils.GameMath.degreesToRadians(180)){
                    this.rotation = Kiwi.Utils.GameMath.degreesToRadians(180);
                }
                if(!this.wouldCollide(0, 4) && this.mid.y+4.0*this.movespeedfactor < 1080-this.width/2){
                    this.transform.y += 4.0*this.movespeedfactor;
                    this.mid.y += 4.0*this.movespeedfactor;
                }
            }
            //Down-Left
            else if(state.downKey.isDown && state.leftKey.isDown && !state.rightKey.isDown && !state.upKey.isDown){
                if(this.rotation != Kiwi.Utils.GameMath.degreesToRadians(225)){
                    this.rotation = Kiwi.Utils.GameMath.degreesToRadians(225);
                }
                if(!this.wouldCollide(-3, 3)  && this.mid.y+3.0*this.movespeedfactor < 1080-this.height/2 && this.mid.x - 3.0*this.movespeedfactor > 0+this.width/2){
                    this.transform.y += 3.0*this.movespeedfactor;
                    this.transform.x -= 3.0*this.movespeedfactor;
                    this.mid.y += 3.0*this.movespeedfactor;
                    this.mid.x -= 3.0*this.movespeedfactor;
                }
            }
            //Down-Right
            else if(state.downKey.isDown && !state.leftKey.isDown && state.rightKey.isDown && !state.upKey.isDown){
                if(this.rotation != Kiwi.Utils.GameMath.degreesToRadians(135)){
                    this.rotation = Kiwi.Utils.GameMath.degreesToRadians(135);
                }
                if(!this.wouldCollide(3, 3) && this.mid.y+3.0*this.movespeedfactor < 1080-this.height/2 && this.mid.x + 3.0*this.movespeedfactor < 1920-this.width/2){
                    this.transform.y += 3.0*this.movespeedfactor;
                    this.transform.x += 3.0*this.movespeedfactor;
                    this.mid.y += 3.0*this.movespeedfactor;
                    this.mid.x += 3.0*this.movespeedfactor;
                }
            }
            //Nothing Up + Down
            else if(state.downKey.isDown && !state.leftKey.isDown && !state.rightKey.isDown && state.upKey.isDown){}
            //Up
            else if(!state.downKey.isDown && !state.leftKey.isDown && !state.rightKey.isDown && state.upKey.isDown){
                if(this.rotation != 0){
                    this.rotation = 0;
                }
                if(!this.wouldCollide(0, -4) && this.mid.y+4.0*this.movespeedfactor > 0+this.height/2){
                    this.transform.y -= 4.0*this.movespeedfactor;
                    this.mid.y -= 4.0*this.movespeedfactor;
                }
            }
            //Up-Left
            else if(!state.downKey.isDown && state.leftKey.isDown && !state.rightKey.isDown && state.upKey.isDown){
                if(this.rotation != Kiwi.Utils.GameMath.degreesToRadians(315)){
                    this.rotation = Kiwi.Utils.GameMath.degreesToRadians(315);
                }
                if(!this.wouldCollide(-3, -3) && this.mid.y-3.0*this.movespeedfactor > 0+this.height/2 && this.mid.x - 3.0*this.movespeedfactor > 0+this.width/2){
                    this.transform.y -= 3.0*this.movespeedfactor;
                    this.transform.x -= 3.0*this.movespeedfactor;
                    this.mid.y -= 3.0*this.movespeedfactor;
                    this.mid.x -= 3.0*this.movespeedfactor;
                }
            }
            //Up-Right
            else if(!state.downKey.isDown && !state.leftKey.isDown && state.rightKey.isDown && state.upKey.isDown){
                if(this.rotation != Kiwi.Utils.GameMath.degreesToRadians(45)){
                    this.rotation = Kiwi.Utils.GameMath.degreesToRadians(45);
                }
                if(!this.wouldCollide(3, -3)&& this.mid.y-3.0*this.movespeedfactor > 0+this.height/2 && this.mid.x + 3.0*this.movespeedfactor < 1920-this.width/2){
                    this.transform.y -= 3.0*this.movespeedfactor;
                    this.transform.x += 3.0*this.movespeedfactor;
                    this.mid.y -= 3.0*this.movespeedfactor;
                    this.mid.x += 3.0*this.movespeedfactor;
                }
            }
            //Right
            else if(!state.downKey.isDown && !state.leftKey.isDown && state.rightKey.isDown && !state.upKey.isDown){
                if(this.rotation != Kiwi.Utils.GameMath.degreesToRadians(90)){
                    this.rotation = Kiwi.Utils.GameMath.degreesToRadians(90);
                }
                if(!this.wouldCollide(4, 0) && this.mid.x +4.0*this.movespeedfactor < 1920-this.width/2){
                    this.transform.x += 4.0*this.movespeedfactor;
                    this.mid.x += 4.0*this.movespeedfactor;
                }
            }
            //Left
            else if(!state.downKey.isDown && state.leftKey.isDown && !state.rightKey.isDown && !state.upKey.isDown){
                if(this.rotation != Kiwi.Utils.GameMath.degreesToRadians(270)){
                    this.rotation = Kiwi.Utils.GameMath.degreesToRadians(270);
                }
                if(!this.wouldCollide(-4, 0) && this.mid.x - 4.0*this.movespeedfactor > 0+this.width/2){
                    this.transform.x -= 4.0*this.movespeedfactor;
                    this.mid.x -= 4.0*this.movespeedfactor;
                }
            }
            //Nothing Left + Right
            else if(!state.downKey.isDown && state.leftKey.isDown && state.rightKey.isDown && !state.upKey.isDown){}
        }

        //Attack
        if(!this.spacePressed && state.spaceKey.isDown){
            console.log("hit");
            this.spacePressed = true;
            this.animation.stop();
            //Check if Enemy is hit
            if(Kiwi.Geom.Point.distanceBetween(this.mid, state.boss.mid) < state.boss.height/3+20 
                && ((Kiwi.Utils.GameMath.radiansToDegrees(this.rotation) == 90 && state.boss.mid.x > this.mid.x ) 
                    || (Kiwi.Utils.GameMath.radiansToDegrees(this.rotation) == 180 && state.boss.mid.y > this.mid.y )
                    || (Kiwi.Utils.GameMath.radiansToDegrees(this.rotation) == 270 && state.boss.mid.x < this.mid.x ) 
                    || (Kiwi.Utils.GameMath.radiansToDegrees(this.rotation) == 0 && state.boss.mid.y < this.mid.y )
                    || (Kiwi.Utils.GameMath.radiansToDegrees(this.rotation) == 225 && state.boss.mid.y > this.mid.y && state.boss.mid.x < this.mid.x)
                    || (Kiwi.Utils.GameMath.radiansToDegrees(this.rotation) == 135 && state.boss.mid.y > this.mid.y && state.boss.mid.x > this.mid.x)
                    || (Kiwi.Utils.GameMath.radiansToDegrees(this.rotation) == 45 && state.boss.mid.y < this.mid.y && state.boss.mid.x > this.mid.x)
                    || (Kiwi.Utils.GameMath.radiansToDegrees(this.rotation) == 315 && state.boss.mid.y < this.mid.y && state.boss.mid.x < this.mid.x))){
                var difference;
                if(state.boss.angle - state.boss.rotation < 0)
                    difference = 360 - Kiwi.Utils.GameMath.radiansToDegrees(state.boss.rotation) + state.boss.angle;
                else
                    difference = state.boss.angle - Kiwi.Utils.GameMath.radiansToDegrees(state.boss.rotation);
                
                if(difference < 0)
                    difference = Math.sqrt(Math.pow(difference, 2));
                if( difference < 22.5 && state.boss.special == true){
                    console.log("collision");
                    state.boss.hp -= 500;
                    if(state.boss.rage <= 100){
                        if(state.boss.rage + 20 > 100)
                            state.boss.rage = 100;
                        else
                            state.boss.rage += 25;
                    }
                    state.playerAttack.text = "-500!";
                    state.logFileText += ("BH: Angle:"+Math.floor(difference)+", Boss-Special:"+state.boss.special+", Damage: 500 | Time:"+(state.milliSecondsToHMinSec(Date.now()-state.startTime))+" | BossP: ("+Math.floor(state.boss.mid.x)+","+Math.floor(state.boss.mid.y)+"); PlayerP:("+Math.floor(this.mid.x)+","+Math.floor(this.mid.y)+")\r\n");
                }
                else{
                    console.log("collision");
                    state.boss.hp -= 250;
                    state.playerAttack.text = "-250";
                    state.logFileText += ("BH: Angle:"+Math.floor(difference)+", Boss-Special:"+state.boss.special+", Damage: 250 | Time:"+(state.milliSecondsToHMinSec(Date.now()-state.startTime))+" | BossP: ("+Math.floor(state.boss.mid.x)+","+Math.floor(state.boss.mid.y)+"); PlayerP:("+Math.floor(this.mid.x)+","+Math.floor(this.mid.y)+")\r\n");
                }
               
                var timer = state.clock.createTimer( "removeDMG", 0.4 );
                timer.createTimerEvent( Kiwi.Time.TimerEvent.TIMER_STOP,
                    function() {
                        state.playerAttack.visible = true;
                        state.clock.removeTimer(timer);
                    }
                );
                timer.start();
                var timer2 = state.clock.createTimer( "removeDMG", 1 );
                timer2.createTimerEvent( Kiwi.Time.TimerEvent.TIMER_STOP,
                    function() {
                        state.playerAttack.visible = false;
                        state.clock.removeTimer(timer2);
                    }
                );
                timer2.start();
            }
            this.animation.play("hit");
        }
        else if(this.spacePressed && state.spaceKey.isUp && !this.animation.getAnimation("hit").isPlaying)
            this.spacePressed = false;

        //Check if Dodge is still pressed
        if(!this.cPressed && state.cKey.isDown && !this.animation.getAnimation("hit").isPlaying && !this.dodged
            && !((Kiwi.Geom.Point.distanceBetween(new Kiwi.Geom.Point(this.mid.x,this.mid.y-75), state.boss.mid) < state.boss.height/3 && Kiwi.Utils.GameMath.radiansToDegrees(this.rotation) == 0)
                || (Kiwi.Geom.Point.distanceBetween(new Kiwi.Geom.Point(this.mid.x+75,this.mid.y-75), state.boss.mid) < state.boss.height/3 && Kiwi.Utils.GameMath.radiansToDegrees(this.rotation) == 45)
                || (Kiwi.Geom.Point.distanceBetween(new Kiwi.Geom.Point(this.mid.x+75,this.mid.y), state.boss.mid) < state.boss.height/3 && Kiwi.Utils.GameMath.radiansToDegrees(this.rotation) == 90)
                || (Kiwi.Geom.Point.distanceBetween(new Kiwi.Geom.Point(this.mid.x+75,this.mid.y+75), state.boss.mid) < state.boss.height/3 && Kiwi.Utils.GameMath.radiansToDegrees(this.rotation) == 135)
                || (Kiwi.Geom.Point.distanceBetween(new Kiwi.Geom.Point(this.mid.x,this.mid.y+75), state.boss.mid) < state.boss.height/3 && Kiwi.Utils.GameMath.radiansToDegrees(this.rotation) == 180)
                || (Kiwi.Geom.Point.distanceBetween(new Kiwi.Geom.Point(this.mid.x-75,this.mid.y+75), state.boss.mid) < state.boss.height/3 && Kiwi.Utils.GameMath.radiansToDegrees(this.rotation) == 225)
                || (Kiwi.Geom.Point.distanceBetween(new Kiwi.Geom.Point(this.mid.x-75,this.mid.y), state.boss.mid) < state.boss.height/3 && Kiwi.Utils.GameMath.radiansToDegrees(this.rotation) == 270)
                || (Kiwi.Geom.Point.distanceBetween(new Kiwi.Geom.Point(this.mid.x-75,this.mid.y-75), state.boss.mid) < state.boss.height/3 && Kiwi.Utils.GameMath.radiansToDegrees(this.rotation) == 315))){
                
                this.cPressed = true;
                this.dodge();
        }
        else if(this.cPressed && state.cKey.isUp)
            this.cPressed = false;
    }
};
Kiwi.extend( Player, Kiwi.GameObjects.Sprite );