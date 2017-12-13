var Boss = function(state, atlas, x, y){
    Kiwi.GameObjects.Sprite.call(this,state, atlas, x, y, [enableInput=false]);

    var player = state.player;
    var b = this;

    this.actualTime = Date.now();
    this.lastSpecial = Date.now();

    this.hp = 25000;
    this.maxHP = 25000;
    this.rage = 0;

    this.specialHit = false;
    this.relocate = true;
    this.special = false;

    this.actualRot;
    this.playerActPos;
    this.position;
    this.angle;
    this.mid = new Kiwi.Geom.Point(this.transform.x + this.width/2, this.transform.y + this.height/2);

    this.specialCD;
    if(state.mode == 1)
        this.specialCD = 7500;
    else
        this.specialCD = 12500;

    Boss.prototype.attack = function(){
        var b = this;
        var hpBefore = player.hp;
        state.bossAttack.text = "-20";
        var timer = state.clock.createTimer( "checkDistance", 0.5 );
        timer.createTimerEvent( Kiwi.Time.TimerEvent.TIMER_STOP,
            function() {

                var difference;
                if(b.angle - b.rotation < 0)
                    difference = 360 - Kiwi.Utils.GameMath.radiansToDegrees(b.rotation) + b.angle;
                else
                    difference = b.angle - Kiwi.Utils.GameMath.radiansToDegrees(b.rotation);
                
                if(difference < 0)
                    difference = Math.sqrt(Math.pow(difference, 2));

                console.log((Kiwi.Geom.Point.distanceBetween(b.mid, player.mid) <= b.height/2-30)+";"+difference+";"+b.animation.currentCell+";"+(player.hp == hpBefore));

                if(Kiwi.Geom.Point.distanceBetween(b.mid, player.mid) <= b.height/2-10 && difference < 10 && player.hp == hpBefore && b.animation.currentCell == 4){
                    player.hp -= 20;
                    state.bossAttack.visible = true;
                    state.logFileText += ("PH: Boss-Special :"+b.special+", Damage: 20 | Time:"+(state.milliSecondsToHMinSec(Date.now()-state.startTime))+" | BossP: ("+Math.floor(b.mid.x)+","+Math.floor(b.mid.y)+"); PlayerP:("+Math.floor(player.mid.x)+","+Math.floor(player.mid.y)+")\r\n");
                    var timer2 = state.clock.createTimer( "removeDMG", 0.5 );
                    timer2.createTimerEvent( Kiwi.Time.TimerEvent.TIMER_STOP,
                        function() {
                            state.bossAttack.visible = false;
                            state.clock.removeTimer(timer2);
                        }
                    );
                    timer2.start();
                }
                state.clock.removeTimer(timer);
            }
        );
        timer.start();
    }

    Boss.prototype.specialMove = function(){
        this.lastSpecial = Date.now();
        var b = this;
        var hpBefore = player.hp;
        var timerOpen = state.clock.createTimer("openClaws", 0,5);
        timerOpen.createTimerEvent(Kiwi.Time.TimerEvent.TIMER_STOP,
            function(){
                //open Claws and get Ready for Special AOE Move
                b.animation.play("openClaws");
                state.clock.removeTimer(timerOpen);
            }
        );
        var timerGlow = state.clock.createTimer("glowClaws", 1.0);
        timerGlow.createTimerEvent(Kiwi.Time.TimerEvent.TIMER_STOP,
            function(){
                //make Claws and Body glow and load up AOE
                b.animation.play("chargeSP");
                var timerExec = state.clock.createTimer("specialAttack", 1.5);
                timerExec.createTimerEvent(Kiwi.Time.TimerEvent.TIMER_STOP,
                    function(){
                        b.animation.play("discharge");
                        var timer = state.clock.createTimer("stopSpecial", 0.5);
                        timer.createTimerEvent(Kiwi.Time.TimerEvent.TIMER_STOP,
                            function(){
                                b.specialHit = false;
                                b.special = false;
                                state.clock.removeTimer(timer);
                            }
                        );
                        state.clock.removeTimer(timerExec);
                    }
                );
                state.clock.removeTimer(timerGlow);
            }
        );
    }

    Boss.prototype.moveTowardsEnemy = function(){
        var x = this.transform.x;
        var y = this.transform.y + (2+3*(this.rage/100));
        var angle = this.rotation;
        var rotatedX = Math.cos(-angle) * (x - this.transform.x) - Math.sin(-angle) * (y - this.transform.y) + this.transform.x;
        var rotatedY = Math.sin(-angle) * (x - this.transform.x) - Math.cos(-angle) * (y - this.transform.y) + this.transform.y;
        this.mid.x += rotatedX - this.transform.x;
        this.mid.y += rotatedY - this.transform.y;
        this.transform.setPosition(rotatedX, rotatedY);
    }

    Boss.prototype.update = function(){
        Kiwi.GameObjects.Sprite.prototype.update.call(this);
        this.actualTime = Date.now();
        var boss = this;
        
        state.removeChild(state.rageBar, true);
        state.rageBar = new Kiwi.Plugins.Primitives.Rectangle( {
            state: state,
            width: (this.rage/100)*481,
            height: 39,
            x: 1920/2 - 207,
            y: 73
        } );
        state.addChild(state.rageBar);
        console.log(this.rage);

        if(this.rage > 0)
            this.rage -= 0.025;

        
        if(this.actualTime-this.lastSpecial >= this.specialCD){
            this.special = true;
            this.specialMove();
        }
        
        if(!this.special){
            //Relocate Boss(Rotation and Movement)
            if(this.relocate){
                console.log("Rerotate!");
                this.playerActPos = player.transform.getPositionPoint();
                this.playerActPos.x += player.width/2;
                this.playerActPos.y += player.height/2;
                this.position = this.transform.getPositionPoint();
                this.position.x += this.width/2;
                this.position.y += this.height/2;

                this.angle = Kiwi.Utils.GameMath.radiansToDegrees(this.mid.angleTo(player.mid));
                if(this.angle < 0)
                    this.angle += 360;

                this.angle += 90;

                if(this.angle > 360)
                    this.angle -= 360;

                this.angle = Math.ceil(this.angle);

                this.actualRot = this.rotation;
                if(this.rotation == 0)
                    this.rotation = Kiwi.Utils.GameMath.degreesToRadians(360);

                this.relocate = false;
                var timer = state.clock.createTimer( "moveTimer", 1-0.2*(this.rage/100) );
                timer.createTimerEvent( Kiwi.Time.TimerEvent.TIMER_STOP,
                    function() {
                        console.log( "Move!" );
                        boss.relocate = true;
                        state.clock.removeTimer(timer );
                    }
                );
                timer.start();
            }
            else if(!this.relocate){
                if(Kiwi.Utils.GameMath.radiansToDegrees(this.rotation) < 0)
                    this.rotation = Kiwi.Utils.GameMath.degreesToRadians(359);

                if(Math.floor(Kiwi.Utils.GameMath.radiansToDegrees(this.rotation)) == this.angle){
                    if(Kiwi.Geom.Point.distanceBetween(this.mid, player.mid) > this.height/2-100 && !this.animation.getAnimation("attack").isPlaying){
                        this.moveTowardsEnemy();
                        if(!this.animation.getAnimation("move").isPlaying)
                            this.animation.play("move");
                    }
                    else{
                        if(!this.animation.getAnimation("attack").isPlaying){
                            this.animation.play("attack");
                            this.attack();
                        }
                    }
                }
                else{
                    var negAngle;
                    var posAngle;
                    //console.log(Kiwi.Utils.GameMath.radiansToDegrees(this.rotation) + "; " + this.angle);
                    if(Kiwi.Utils.GameMath.radiansToDegrees(this.rotation) < this.angle){
                        negAngle = (360 - this.angle) + Kiwi.Utils.GameMath.radiansToDegrees(this.rotation);
                        posAngle = this.angle - Kiwi.Utils.GameMath.radiansToDegrees(this.rotation);
                    }
                    else if(Kiwi.Utils.GameMath.radiansToDegrees(this.rotation) > this.angle){
                        negAngle = Kiwi.Utils.GameMath.radiansToDegrees(this.rotation) - this.angle;
                        posAngle = (360 - Kiwi.Utils.GameMath.radiansToDegrees(this.rotation)) + this.angle;
                    }
                    //console.log("-Alpha: "+negAngle+", +Alpha: "+posAngle);
                    if(negAngle < posAngle){
                        this.rotation -= Kiwi.Utils.GameMath.degreesToRadians(1);
                        if(!this.animation.getAnimation("move").isPlaying)
                            this.animation.play("move");
                        if(Math.floor(Kiwi.Utils.GameMath.radiansToDegrees(this.rotation)) == 0)
                            this.rotation = Kiwi.Utils.GameMath.degreesToRadians(360);
                    }
                    else{
                        this.rotation += Kiwi.Utils.GameMath.degreesToRadians(1);
                        if(!this.animation.getAnimation("move").isPlaying)
                            this.animation.play("move");
                        if(this.rotation >= 2*Math.PI){
                            console.log(Kiwi.Utils.GameMath.radiansToDegrees(this.rotation));
                            this.rotation = Kiwi.Utils.GameMath.degreesToRadians(Kiwi.Utils.GameMath.radiansToDegrees(this.rotation)-360);
                        }
                    }
                }
            }
        }
        else{
            this.angle = Kiwi.Utils.GameMath.radiansToDegrees(this.mid.angleTo(player.mid));
            if(this.angle < 0)
                this.angle += 360;

            this.angle += 90;

            if(this.angle > 360)
                this.angle -= 360;

            this.angle = Math.ceil(this.angle);

            if(b.animation.getAnimation("discharge").isPlaying && this.specialHit == false){
                var difference;
                if(this.angle - this.rotation < 0)
                    difference = 360 - Kiwi.Utils.GameMath.radiansToDegrees(this.rotation) + this.angle;
                else
                    difference = this.angle - Kiwi.Utils.GameMath.radiansToDegrees(this.rotation);
                
                if(difference < 0)
                    difference = Math.sqrt(Math.pow(difference, 2));
                console.log(difference + "," + Kiwi.Geom.Point.distanceBetween(this.mid, player.mid));
                if( difference > 30 && Kiwi.Geom.Point.distanceBetween(this.mid, player.mid) < this.height/1.25 - 10){
                    var timer = state.clock.createTimer( "removeDMG", 0.25 );
                    timer.createTimerEvent( Kiwi.Time.TimerEvent.TIMER_STOP,
                        function() {
                            if( difference > 30 && Kiwi.Geom.Point.distanceBetween(b.mid, player.mid) < b.height/1.25 - 10){
                                state.bossAttack.text = "-50!";
                                player.hp -= 50;
                                state.bossAttack.visible = true;
                                state.logFileText += ("PH: Boss-Special :"+b.special+", Damage: 50 | Time:"+(state.milliSecondsToHMinSec(Date.now()-state.startTime))+" | BossP: ("+Math.floor(b.mid.x)+","+Math.floor(b.mid.y)+"); PlayerP:("+Math.floor(player.mid.x)+","+Math.floor(player.mid.y)+")\r\n");

                                var timer2 = state.clock.createTimer( "removeDMG", 0.5 );
                                timer2.createTimerEvent( Kiwi.Time.TimerEvent.TIMER_STOP,
                                    function() {
                                        state.bossAttack.visible = false;
                                        state.clock.removeTimer(timer2);
                                    }
                                );
                                timer2.start();
                                this.specialHit = true;
                            }
                            else{
                                this.specialHit = false;
                            }
                            state.clock.removeTimer(timer);
                        }
                    );
                    timer.start();
                    this.specialHit = true;
                }
            }
        }
    }
};
Kiwi.extend( Boss, Kiwi.GameObjects.Sprite );