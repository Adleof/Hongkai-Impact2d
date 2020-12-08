var sketchProc=function(processingInstance){ with (processingInstance){


size(1200, 600); 
frameRate(60);
// spinning of coin
// initialization of tilemap
// drawing of maze
// variable keep track of key pressed
var keyArray = [];
var pkeyArray = [];
pkeyArray[RIGHT] = 0;
pkeyArray[LEFT] = 0;
keyArray[RIGHT] = 0;
keyArray[LEFT] = 0;

var keyPressed = function() {
    keyArray[keyCode] = 1;
};

var keyReleased = function() {
    keyArray[keyCode] = 0;
};

angleMode = "radians";

// speed variable controling playing speed
var playerspeed = 1;
var globalspeed = 0.4;
var player_evade_cooldown = 720;//12 second cooldown time
var player_ult_cooldown = 900;//15 second cooldown time

// variable keep track of time fracture function
var timefractureFrame = 0;
var extra_timefractureFrame = 0;
var camerashakeFrame = 0;

// variable for camera shaking
var shakeintensity = 1.5;

// variable controlling game state
var gamestat = 1;
var difficulty = 1;

/**
 *  start time fracture
 * @param {*} t current frameCount
 * @param {*} te extra frameCount
 */
var timeFracture = function(t,te)
{
	if(frameCount > extra_timefractureFrame)
	{
		timefractureFrame = frameCount + t*60;
		extra_timefractureFrame = timefractureFrame + te*60;
	}
};

/**
 * shake camera
 * @param {*} t current frame count
 */
var cameraShake = function(t)
{
	camerashakeFrame = frameCount + t*60;
};

var playertarget = [];

/**
 * keyFrame object to control character animation
 */
var keyFrame = function()
{
    this.keyframes = [];
    this.insertkf = function(progress,x)
    {
        this.keyframes.push([progress,x]);
    };
    this.getPos = function(progress)
    {
        if(progress < this.keyframes[0][0])
        {
            return this.keyframes[0][1];
        }
        for(var i = 0; i < this.keyframes.length; i++)
        {
            if(i+1 < this.keyframes.length && this.keyframes[i+1][0] < progress)
            {
                continue;
            }
            if(i+1 === this.keyframes.length)
            {
                return this.keyframes[i][1];
            }
            else
            {
                var precenti = (progress - this.keyframes[i][0])/(this.keyframes[i+1][0] - this.keyframes[i][0]);
                var retlist = [];
                for(var j = 0;j < this.keyframes[i][1].length;j++)
                {
                    retlist.push((1-precenti)*this.keyframes[i][1][j] + precenti*this.keyframes[i+1][1][j]);
                }
                return retlist;
            }
        }
    };
    this.drawkp = function()
    {
        for(var i = 0; i < this.keyframes.length; i++)
        {
            fill(255, 0, 0);
            ellipse(this.keyframes[i][1][0],this.keyframes[i][1][1],10,10);
        }
    };
};
//var k = new keyFrame();

/**
 * Player object
 * @param {*} x x position
 * @param {*} y y position
 */
var sakuraCha = function(x,y)
{
	this.x = x;
	this.y = y;
	this.dir = 0.5;//0.5 for right,-0.5 left
	this.bladedir = 1;//1 for normal, -1 for fliped
	// body image
	this.body = loadImage("chara_sakura/body.png");
	this.blade = loadImage("chara_sakura/blade.png");
	this.cloth = loadImage("chara_sakura/cloth.png");
	this.arm_l0 = loadImage("chara_sakura/arm_l0.png");
	this.arm_l1 = loadImage("chara_sakura/arm_l1.png");
	this.arm_r0 = loadImage("chara_sakura/arm_r0.png");
	this.arm_r1 = loadImage("chara_sakura/arm_r1.png");
	this.leg_r0 = loadImage("chara_sakura/leg_r0.png");
	this.leg_r1 = loadImage("chara_sakura/leg_r1.png");
	this.leg_l0 = this.leg_r0;
	this.leg_l1 = this.leg_r1;
	// set offset of each image
	this.bone_body_arm_r0 = [2.4+1.61,45.7];//rotation,length (fixed)
	this.bone_arm_r0_arm_r1 = [0.5,30];//rotation,length
	this.arm_r1_rotate = -1;
	this.bone_body_arm_l0 = [1.2-2.46,35.7];//rotation,length (fixed)
	this.bone_arm_l0_arm_l1 = [-0.3,30];//rotation,length
	this.arm_l1_rotate = -1;
	this.bone_body_leg_l0 = [1.55-3.03,12];//rotation,length (fixed)
	this.bone_leg_l0_leg_l1 = [-0.3,53];//rotation,length
	this.leg_l1_rotate = 1;
	this.bone_body_leg_r0 = [1.95+1.68,23];//rotation,length (fixed)
	this.bone_leg_r0_leg_r1 = [-0.7,50];//rotation,length
	this.leg_r1_rotate = 0.2;
	this.bodyrotate = 0.5;
	this.bone_blade = -1.4;
	// animation key frame
	this.stand = new keyFrame();
	this.stand.insertkf(0,  [-0.3,-0.1,-0.0,-0,-0.3,0.2,-0.25,0.0,0,-1.6,0,0]);
	this.stand.insertkf(50,  [-0.35,-0.2,0.2,-0,-0.3,0.2,-0.25,0.0,0,-1.6,0,0]);
	this.stand.insertkf(100,  [-0.3,-0.1,-0.0,-0,-0.3,0.2,-0.25,0.0,0,-1.6,0,0]);
	this.mdownblade = new keyFrame();
	this.mdownblade.insertkf(0,  [-0.3,-0.1,-0.0,-0,-0.3,0.2,-0.25,0.0,0,-1.6,0,0]);
	this.mdownblade.insertkf(25,  [-2.7, -0.5, -1.5,-0.9,-0.6,0.5,-0.37,0.2,0.15,-1.0,0,0]);
	this.mdownblade.insertkf(50,  [-2.7, -0.5, -1.5,-0.9,-0.6,0.5,-0.37,0.2,0.15,-1.0,0,0]);
	this.mdownblade.insertkf(60,  [-0.9, 0, 0.3,-0.0,-0.6,0.5,-0.37,0.2,0.15,-0.9,0,0]);
	this.upblade = new keyFrame();
	this.upblade.insertkf(0,  [-1.9, 0, 0.3,-0.0,-0.6,0.5,-0.25,0.0,0.15,0.1,0,0]);
	this.upblade.insertkf(10,  [-3.5, 0, -2.3,-0.0,-0.6,0.5,-0.25,0.0,0.15,-0.3,0,0]);
	this.downblade = new keyFrame();
	this.downblade.insertkf(0,  [-2.7, -0.5, -1.5,-0.9,-0.6,0.5,-0.37,0.2,0.15,-1.0,0,0]);
	this.downblade.insertkf(10,  [-0.9, 0, 0.3,-0.0,-0.6,0.5,-0.37,0.2,0.15,-0.9,0,0]);
	this.run = new keyFrame();
	this.run.insertkf(00,  [-0.5,-1.1,-0.0,-0,-0.9,0.9,-0.25,0.0,0.3,-1.6,0,0]);
	this.run.insertkf(20,  [-0.3,-0.1,-0.5,-0.2,0.4,0.0,-1.25,0.7,0.3,-1.6,0,0]);
	this.run.insertkf(40,  [-0.5,-1.1,-0.0,-0,-0.9,0.9,-0.25,0.0,0.3,-1.6,0,0]);
	this.run.insertkf(60,  [-0.3,-0.1,-0.5,-0.2,0.4,0.0,-1.25,0.7,0.3,-1.6,0,0]);
	this.run.insertkf(80,  [-0.5,-1.1,-0.0,-0,-0.9,0.9,-0.25,0.0,0.3,-1.6,0,0]);
	this.run.insertkf(100,  [-0.3,-0.1,-0.0,-0,-0.3,0.2,-0.25,0.0,0,-1.6,0,0]);
	
	this.downtostand = new keyFrame();
	this.downtostand.insertkf(0,  [-0.9, 0, 0.3,-0.0,-0.6,0.5,-0.37,0.2,0.15,-0.9,0,0]);
	this.downtostand.insertkf(40,  [-0.3,-0.1,-0.0,-0,-0.3,0.2,-0.25,0.0,0,-1.6,0,0]);
	
	// state of sakura
	this.state = [new sakura_stand_state(),new sakura_run_state(),new sakura_attack1_state(),new sakura_attack2_state(),new sakura_attack3_state(),new sakura_directionEvade_state(),new sakura_noDirectionEvade_state(),new sakura_hit_state(),new sakura_dead_state(),new sakura_ult_state()];
	this.curstate = 0;
	
	this.evadeCD = 0;//12 seconds cooldown
	
	this.maxhp = 10;
	this.HP = this.maxhp;
	this.collision = true;
	this.sp = 15;
	this.maxsp = 30;
	this.ultcd = 0;
	this.curx = this.x;
	
	this.draw = function(progress,animation)
	{
		if(this.evadeCD > 0)
		{
			this.evadeCD -= 1;
		}
		if(this.ultcd > 0)
		{
			this.ultcd -= 1;
		}
		//line(this.x + this.dir* 20,0,this.x + this.dir* 20,600);
		//line(this.x + this.dir* 300,0,this.x + this.dir* 300,600);
		var p = animation.getPos(progress);
		this.bone_arm_r0_arm_r1[0] = p[0]-1.61;
		this.arm_r1_rotate = p[1];
		this.bone_arm_l0_arm_l1[0] = p[2]+2.46;
		this.arm_l1_rotate = p[3];
		this.bone_leg_l0_leg_l1[0] = p[4]+3.03;
		this.leg_l1_rotate = p[5]
		this.bone_leg_r0_leg_r1[0] = p[6]-1.68;
		this.leg_r1_rotate = p[7];
		this.bodyrotate = p[8];
		this.bone_blade = p[9];
		var xdisp = p[10];
		var ydisp = p[11];
		this.curx = this.x + xdisp*this.dir;
		if(gamestat === 4)//display HP 
		{
			fill(255,50,50);
			noStroke();
			rect(this.x+this.dir*xdisp - 60,this.y - 150,this.HP/this.maxhp*100,20);
			stroke(0,0,0);
			strokeWeight(3);
			noFill();
			rect(this.x+this.dir*xdisp - 60,this.y - 150,100,20);
			text(this.HP,this.x+this.dir*xdisp - 60,this.y - 150);
		}
		if(this.collision)
		{
			if( abs(this.curx - playertarget[0].curx) < 100)
			{
				if(this.curx < playertarget[0].curx)
				{
					this.x -= this.curx - playertarget[0].curx + 100;
				}
				if(this.curx > playertarget[0].curx)
				{
					this.x += playertarget[0].curx + 100 - this.curx;
				}
				
			}
		}
		
		pushMatrix();
		translate(this.x,this.y);
		
		scale(this.dir,0.5);
		translate(xdisp,ydisp);
		rotate(this.bodyrotate);
		
		image(this.cloth,-60,-2);//draw cloth
		
		//draw left arm
		pushMatrix();
		rotate(this.bone_body_arm_l0[0]);//bone location translate
		translate(this.bone_body_arm_l0[1],0);
		rotate(this.bone_arm_l0_arm_l1[0]);
		image(this.arm_l0,-10,-25);
		//ellipse(0,0,10,10);
		pushMatrix();
		translate(this.bone_arm_l0_arm_l1[1],0);
		rotate(this.arm_l1_rotate);
		image(this.arm_l1,-10,-20);
		rotate(-this.arm_l1_rotate);
		//ellipse(0,0,10,10);
		popMatrix();
		popMatrix();
		//finish draw left arm
		
		//draw left leg
		pushMatrix();
		rotate(this.bone_body_leg_l0[0]);//bone location translate
		translate(this.bone_body_leg_l0[1],0);
		rotate(this.bone_leg_l0_leg_l1[0]);
		image(this.leg_l0,-10,-17);
		//ellipse(0,0,10,10);
		pushMatrix();
		translate(this.bone_leg_l0_leg_l1[1],0);
		rotate(this.leg_l1_rotate);
		image(this.leg_l1,-5,-25);
		rotate(-this.leg_l1_rotate);
		//ellipse(0,0,10,10);
		popMatrix();
		popMatrix();
		//finish draw left leg
		
		//draw right leg
		pushMatrix();
		rotate(this.bone_body_leg_r0[0]);//bone location translate
		translate(this.bone_body_leg_r0[1],0);
		rotate(this.bone_leg_r0_leg_r1[0]);
		image(this.leg_r0,-10,-17);
		//ellipse(0,0,10,10);
		pushMatrix();
		translate(this.bone_leg_r0_leg_r1[1],0);
		rotate(this.leg_r1_rotate);
		image(this.leg_r1,-5,-25);
		rotate(-this.leg_r1_rotate);
		//ellipse(0,0,10,10);
		popMatrix();
		popMatrix();
		//finish draw right leg
		
		image(this.body,-155,-242);//draw body, image location correction
		//ellipse(0,0,10,10);
		
		
		//draw right arm
		pushMatrix();
		rotate(this.bone_body_arm_r0[0]);//bone location translate
		translate(this.bone_body_arm_r0[1],0);
		rotate(this.bone_arm_r0_arm_r1[0]);
		image(this.arm_r0,0,-15);
		//ellipse(0,0,10,10);
		pushMatrix();
		translate(this.bone_arm_r0_arm_r1[1],0);
		rotate(this.arm_r1_rotate);
		pushMatrix();
		translate(50,0);//hand length
		rotate(this.bone_blade);
		scale(1,this.bladedir);
		image(this.blade,-40,-30);
		//ellipse(0,0,10,10);
		popMatrix();
		image(this.arm_r1,-5,-15);
		rotate(-this.arm_r1_rotate);
		//ellipse(0,0,10,10);
		popMatrix();
		popMatrix();
		//finish draw right arm
		
		
		
		rotate(-this.bodyrotate);
		
		popMatrix();
	};
	this.move = function()
	{
		if(keyArray[RIGHT])
		{
			this.x += 2;
		}
		else if(keyArray[LEFT])
		{
			this.x -= 1;
		}
		if(keyArray[UP])
		{
			this.y -= 1;
		}
		else if(keyArray[DOWN])
		{
			this.y += 1;
		}
	};
};

var redeye = loadImage("Boss/redeye.png");

/**
 * Boss object
 * @param {*} x x position
 * @param {*} y y position
 */
var bossCha = function(x,y)
{
	this.x = x;
	this.y = y;
	this.dir = -1;//1 for right,-1 left
	this.body = loadImage("Boss/Boss_body.png");
	this.fshoulder = loadImage("Boss/Boss_fshoulder.png");
	this.farm = loadImage("Boss/Boss_farm.png");
	this.fblade = loadImage("Boss/Boss_fblade.png");
	this.bshoulder = loadImage("Boss/Boss_bshoulder.png");
	this.barm = loadImage("Boss/Boss_barm.png");
	this.bblade = loadImage("Boss/Boss_bblade.png");
	this.dangerimg = loadImage("Boss/danger.png");
	this.bone_body_bshoulder = [-0.95,80];//rotation,length
	this.bone_bshoulder_barm = [2.4,58];//rotation,length (fixed)
	this.bone_barm_bblade = [-0.3,90];//rotation,length (fixed)
	this.bbladerotate = -1.5;
	
	this.bone_body_fshoulder = [-2.5,125];//rotation,length
	this.bone_fshoulder_farm = [-1.9,70];//rotation,length (fixed)
	this.bone_farm_fblade = [-0.3,95];//rotation,length (fixed)
	this.fbladerotate = -1.5;
	this.bodyrotate = 0.0;
	this.curstate = 0;
	this.state = [new boss_run(),new boss_3blade(),new jumpAtk(),new stabAtk(),new Boss_dead(),new Boss_second_trans(),new Boss_5combo(),new Boss_jumpstab()];
	
	this.curx = this.x;
	this.maxhp = 80;
	this.HP = this.maxhp;
	this.secondphase = false;
	
	this.draw = function(progress,animation)
	{
		var p = animation.getPos(progress);
		this.bone_body_bshoulder[0] = p[0]-0.95;
		this.bone_body_bshoulder[1] = p[1]+80;
		this.bone_bshoulder_barm[0] = p[2]+2.4;
		this.bone_barm_bblade[0] = p[3]-0.3;
		this.bbladerotate = p[4]-1.5;
		
		this.bone_body_fshoulder[0] = p[5]-2.5;
		this.bone_body_fshoulder[1] = p[6]+125;
		this.bone_fshoulder_farm[0] = p[7]-1.9;
		this.bone_farm_fblade[0] = p[8]-0.3;
		this.fbladerotate = p[9]-1.5;
		
		this.bodyrotate = p[10];
		
		var xdisp = p[11];
		var ydisp = p[12];
		
		this.curx = this.x + this.dir*xdisp;
		//line(this.x + this.dir* 20,0,this.x + this.dir* 20,600);
		//line(this.x + this.dir* 380,0,this.x + this.dir* 380,600);
		
		if(gamestat === 4)//display HP 
		{
			fill(255,50,50);
			noStroke();
			rect(this.x+this.dir*xdisp - 200,this.y - 250,this.HP/this.maxhp * 400,20);
			stroke(0,0,0);
			strokeWeight(3);
			noFill();
			rect(this.x+this.dir*xdisp - 200,this.y - 250,400,20);
			fill(255,255,255);
			text(this.HP,this.x+this.dir*xdisp - 200,this.y - 250)
		}
		pushMatrix();
		translate(this.x,this.y);
		scale(this.dir,1);
		translate(xdisp,ydisp);
		rotate(this.bodyrotate);
		
		pushMatrix();
		rotate(this.bone_body_bshoulder[0]);
		translate(this.bone_body_bshoulder[1],0);
		rotate(this.bone_bshoulder_barm[0]);
		image(this.bshoulder,-70,-50);
		//ellipse(0,0,10,10);
		translate(this.bone_bshoulder_barm[1],0);
		rotate(this.bone_barm_bblade[0]);
		image(this.barm,-15,-30);
		//ellipse(0,0,10,10);
		translate(this.bone_barm_bblade[1],0);
		rotate(this.bbladerotate);
		image(this.bblade,-45,-35);
		//ellipse(0,0,10,10);
		popMatrix();
		
		image(this.body,-135,-150);
		//ellipse(0,0,10,10);
		if(this.secondphase)
		{
			image(redeye,-40,-80);
			image(redeye,-20,-80);
		}
		pushMatrix();
		rotate(this.bone_body_fshoulder[0]);
		translate(this.bone_body_fshoulder[1],0);
		rotate(this.bone_fshoulder_farm[0]);
		image(this.fshoulder,-70,-50);
		//ellipse(0,0,10,10);
		translate(this.bone_fshoulder_farm[1],0);
		rotate(this.bone_farm_fblade[0]);
		image(this.farm,-20,-25);
		//ellipse(0,0,10,10);
		translate(this.bone_farm_fblade[1],0);
		rotate(this.fbladerotate);
		image(this.fblade,-45,-29);
		//ellipse(0,0,10,10);
		popMatrix();
		
		popMatrix();
	};
};

var sound_sakura_walk = new Audio("sound/walk.wav");

/**
 * Running state for player object
 * @param {*} me player object
 */
var sakura_run_state = function(me)
{
	this.keyFrame = new keyFrame();
	this.keyFrame.insertkf(-10, [-2.7, -0.5, -1.5,-0.9,-0.6,0.5,-0.37,0.2,0.15,-1.0,0,0]);//special keyframe location for transition
	this.keyFrame.insertkf(00,  [-0.9,-1.1, 0.6,-0.5,-0.6,0.3,-0.6,0.9,0.2, -1.4,0,7]);
	this.keyFrame.insertkf(12,  [-0.6,-0.9, 0.2,-0.5, 0.1,0.3,-1.2,0.9,0.2,-1.5,0,5]);
	this.keyFrame.insertkf(24,  [-0.1,-0.6,-0.3,-0.5,  0.1,0.7,-0.9,0.0,0.2, -1.6,0,12]);
	this.keyFrame.insertkf(36,  [-0.6,-0.9, 0.2,-0.5,  -0.5,0.7,-0.2,0.0,0.2, -1.5,0,5]);
	this.keyFrame.insertkf(48,  [-0.9,-1.1, 0.6,-0.5,-0.6,0.3,-0.6,0.9,0.2, -1.4,0,7]);
	this.progress = -10;
	this.execute = function(me)
	{
		me.draw(this.progress,this.keyFrame);
		me.x += me.dir * 7;
		this.progress += playerspeed;
		if(this.progress > 48)
		{
			this.progress = 0;
		}
		sound_sakura_walk.play();
		if(keyArray[68])//key d
		{
			me.dir = 0.5;
			if(keyArray[75])//key k
			{
				me.curstate = 5;//change to attack state
				me.state[5].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
				this.progress = -10;
			}
		}
		else if(keyArray[65])//key a
		{
			me.dir = -0.5;
			if(keyArray[75])//key k
			{
				me.curstate = 5;//change to evade state
				me.state[5].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
				this.progress = -10;
			}
		}
		else
		{
			me.curstate = 0;//change to stand state
			me.state[0].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
			this.progress = -10;
		}
		if(keyArray[74])//key j
		{
			me.curstate = 2;//change to attack state
			me.state[2].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
			this.progress = -10;
		}
		if(keyArray[73])//key i
		{
			if(me.sp >= 15 && me.ultcd <= 0)
			{
				me.sp -= 15;
				me.ultcd = player_ult_cooldown;
				me.curstate = 9;//change to ult state
				me.state[9].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
				this.progress = -10;
			}
		}
	};
};

/**
 * Stand state for player object
 */
var sakura_stand_state = function()
{
	this.keyFrame = new keyFrame();
	this.keyFrame.insertkf(-10,  [-0.35,-0.2,0.2,-0,-0.3,0.2,-0.25,0.0,0,-1.6,0,0]);//special keyframe location for transition
	this.keyFrame.insertkf(0,  [-0.3,-0.1,-0.0,-0,-0.3,0.2,-0.25,0.0,0,-1.6,0,0]);
	this.keyFrame.insertkf(50,  [-0.35,-0.2,0.2,-0,-0.3,0.2,-0.25,0.0,0,-1.6,0,0]);
	this.keyFrame.insertkf(100,  [-0.3,-0.1,-0.0,-0,-0.3,0.2,-0.25,0.0,0,-1.6,0,0]);
	this.progress = -10;
	this.execute = function(me)
	{
		me.draw(this.progress,this.keyFrame);
		this.progress += playerspeed;
		if(this.progress > 100)
		{
			this.progress = 0;
		}
		
		if(keyArray[74])//key j
		{
			me.curstate = 2;//change to attack state
			me.state[2].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
			this.progress = -10;
		}
		
		if(keyArray[75])//key k
		{
			me.curstate = 6;//change to evade state
			me.state[6].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
			this.progress = -10;
		}
		if(keyArray[68])//key d
		{
			me.curstate = 1;//change to run state
			me.state[1].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
			me.dir = 0.5;
			this.progress = -10;
		}
		else if(keyArray[65])//key a
		{
			me.curstate = 1;//change to run state
			me.state[1].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
			me.dir = -0.5;
			this.progress = -10;
		}
		if(keyArray[73])//key i
		{
			if(me.sp >= 15 && me.ultcd <= 0)
			{
				me.sp -= 15;
				me.ultcd = player_ult_cooldown;
				me.curstate = 9;//change to ult state
				me.state[9].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
				this.progress = -10;
			}
		}
		
	};
};

/**
 * attack state 1 for player object
 */
var sakura_attack1_state = function()
{
	this.keyFrame = new keyFrame();
	this.keyFrame.insertkf(-5,  [-0.35,-0.2,0.2,-0,-0.3,0.2,-0.25,0.0,0,-1.6,0,0]);//special keyframe location for transition
	this.keyFrame.insertkf(0,  [-4.0, -0.5, -1.4,-0.6,-0.9,0.6,-0.3,0.2,0.2,-1.0,18,10]);
	this.keyFrame.insertkf(3, [-4.0, -0.5, -1.4,-0.6,-0.9,0.6,-0.3,0.2,0.2,-1.0,18,10]);
	this.keyFrame.insertkf(10,[-1,  0,   0.3, -0.0,-0.7,0.6,-0.3,0.2,0.15,-0.9,300,3]);
	this.keyFrame.insertkf(30,[-1,  0,   0.3, -0.0,-0.7,0.6,-0.3,0.2,0.15,-0.9,300,3]);
	this.progress = -5;
	this.hitbox = true;
	
	this.execute = function(me)
	{
		me.draw(this.progress,this.keyFrame);
		this.progress += playerspeed;
		if(this.progress < 3)
		{
			this.hitbox = true;
		}
		if(this.progress > 3 && this.progress < 5)
		{
			var sound_sakura_blade = new Audio("sound/sakura_blade.wav");
			sound_sakura_blade.play();
		}
		if(this.hitbox)
		{
			if(this.progress >=6 && this.progress<=10 )
			{
				if((playertarget[0].curx < me.curx - me.dir* 50 && playertarget[0].curx > me.curx + me.dir* 300)||(playertarget[0].curx > me.curx - me.dir* 50 && playertarget[0].curx < me.curx + me.dir* 300))
				{
					//rect(100,100,50,50);
					playertarget[0].x -= playertarget[0].dir*15;
					playertarget[0].HP -=1;
					me.sp += 1;
					timeFracture(0.05,0);
					this.hitbox = false;
					var hit = new Audio("sound/hit.wav");
					hit.play();
				}
			}
		}
		if(this.progress > 90)
		{
			/*
			me.curstate = 0;//change to stand state
			me.state[0].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
			this.progress = -5;
			*/
			me.curstate = 0;//change to stand state
			me.state[0].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress).slice();
			var xdisplace = me.state[0].keyFrame.keyframes[0][1][10];
			me.x += xdisplace*me.dir;
			me.state[0].keyFrame.keyframes[0][1][10] = 0;
			this.progress = -5;
		}
		if(this.progress > 30)
		{
			if(keyArray[68])//key d
			{
				/*
				me.curstate = 1;//change to run state
				me.state[1].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
				this.progress = -5;*/
				
				me.curstate = 1;//change to stand state
				me.state[1].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress).slice();
				var xdisplace = me.state[1].keyFrame.keyframes[0][1][10];
				me.x += xdisplace*me.dir;
				me.state[1].keyFrame.keyframes[0][1][10] = 0;
				this.progress = -5;
				me.dir = 0.5;
			}
			else if(keyArray[65])//key a
			{
				/*
				me.curstate = 1;//change to run state
				me.state[1].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
				this.progress = -5;*/
				
				me.curstate = 1;//change to stand state
				me.state[1].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress).slice();
				var xdisplace = me.state[1].keyFrame.keyframes[0][1][10];
				me.x += xdisplace*me.dir;
				me.state[1].keyFrame.keyframes[0][1][10] = 0;
				this.progress = -5;
				me.dir = -0.5;
			}
		}
		if(this.progress > 20)
		{
			if(keyArray[74])//key j
			{
				me.curstate = 3;//change to stand state
				me.state[3].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress).slice();
				var xdisplace = me.state[3].keyFrame.keyframes[0][1][10];
				me.x += xdisplace*me.dir;
				me.state[3].keyFrame.keyframes[0][1][10] = 0;
				this.progress = -5;
				//change direction
				if(keyArray[68])//key d
				{
					me.dir = 0.5;
				}
				else if(keyArray[65])//key a
				{
					me.dir = -0.5;
				}
				/*
				me.curstate = 3;//change to attack2 state
				me.state[3].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
				this.progress = -5;*/
				
			}
		}
		
		if(keyArray[75])//key k
		{
			if(keyArray[68])//key d
			{
				me.curstate = 5;//change to stand state
				me.state[me.curstate].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress).slice();
				var xdisplace = me.state[me.curstate].keyFrame.keyframes[0][1][10];
				me.x += xdisplace*me.dir;
				me.state[me.curstate].keyFrame.keyframes[0][1][10] = 0;
				this.progress = -5;
				me.dir = 0.5;
				/*
				me.curstate = 5;//change to evade state
				me.state[5].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
				this.progress = -5;*/
				
			}
			else if(keyArray[65])//key a
			{
				me.curstate = 5;//change to stand state
				me.state[me.curstate].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress).slice();
				var xdisplace = me.state[me.curstate].keyFrame.keyframes[0][1][10];
				me.x += xdisplace*me.dir;
				me.state[me.curstate].keyFrame.keyframes[0][1][10] = 0;
				this.progress = -5;
				me.dir = -0.5;
				/*
				me.curstate = 5;//change to evade state
				me.state[5].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
				this.progress = -5;*/
				
			}
			else
			{
				/*
				me.curstate = 6;//change to no direction evade state
				me.state[6].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
				this.progress = -5;
				*/
				
				me.curstate = 6;//change to stand state
				me.state[me.curstate].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress).slice();
				var xdisplace = me.state[me.curstate].keyFrame.keyframes[0][1][10];
				me.x += xdisplace*me.dir;
				me.state[me.curstate].keyFrame.keyframes[0][1][10] = 0;
				this.progress = -5;
			}
			
		}
		
		if(keyArray[73])//key i
		{
			if(me.sp >= 15 && me.ultcd <= 0)
			{
				me.sp -= 15;
				me.ultcd = player_ult_cooldown;
				/*
				me.curstate = 9;//change to ult state
				me.state[9].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
				this.progress = -10;*/
				
				
				me.curstate = 9;//change to stand state
				me.state[me.curstate].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress).slice();
				var xdisplace = me.state[me.curstate].keyFrame.keyframes[0][1][10];
				me.x += xdisplace*me.dir;
				me.state[me.curstate].keyFrame.keyframes[0][1][10] = 0;
				this.progress = -5;
			}
		}
	};
};

/**
 * attack state 2 for player object
 */
var sakura_attack2_state = function()
{
	this.keyFrame = new keyFrame();
	this.keyFrame.insertkf(-5,  [-0.35,-0.2,0.2,-0,-0.3,0.2,-0.25,0.0,0,-1.6,0,0]);//special keyframe location for transition
	this.keyFrame.insertkf(0,  [0, 0.5, 0.3,-0.0,-0.6,0.5,-0.25,0.0,0.15,-0.2,0,0]);
	this.keyFrame.insertkf(3,  [0, 0.5, 0.3,-0.0,-0.6,0.5,-0.25,0.0,0.15,-0.2,10,0]);
	this.keyFrame.insertkf(10,  [-2.6, -0.5, -2.3,-0.0,-0.6,0.5,-0.25,0.0,0.2,-0.3,280,0]);
	this.progress = -5;
	this.hitbox = true;
	
	this.execute = function(me)
	{
		me.bladedir = -1;
		me.draw(this.progress,this.keyFrame);
		this.progress += playerspeed;
		if(this.progress < 3)
		{
			this.hitbox = true;
		}
		
		if(this.progress > 3 && this.progress < 5)
		{
			var sound_sakura_blade = new Audio("sound/sakura_blade.wav");
			sound_sakura_blade.play();
		}
		
		if(this.hitbox)
		{
			if(this.progress >=5 && this.progress<=10 )
			{
				if((playertarget[0].curx < me.curx - me.dir* 50 && playertarget[0].curx > me.curx + me.dir* 300)||(playertarget[0].curx > me.curx - me.dir* 50 && playertarget[0].curx < me.curx + me.dir* 300))
				{
					//rect(100,100,50,50);
					playertarget[0].x -= playertarget[0].dir*15;
					playertarget[0].HP -=1.5;
					me.sp += 1;
					this.hitbox = false;
					timeFracture(0.05,0);
					var hit = new Audio("sound/hit.wav");
					hit.play();
				}
			}
		}
		if(this.progress > 90)
		{
			/*
			me.curstate = 0;//change to stand state
			me.state[0].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
			this.progress = -5;*/
			me.bladedir = 1;
				
			me.curstate = 0;//change to stand state
			me.state[me.curstate].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress).slice();
			var xdisplace = me.state[me.curstate].keyFrame.keyframes[0][1][10];
			me.x += xdisplace*me.dir;
			me.state[me.curstate].keyFrame.keyframes[0][1][10] = 0;
			this.progress = -5;
		}
		if(this.progress > 30)
		{
			if(keyArray[68])//key d
			{
				/*
				me.curstate = 1;//change to run state
				me.state[1].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
				this.progress = -5;*/
				
				me.curstate = 5;//change to stand state
				me.state[me.curstate].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress).slice();
				var xdisplace = me.state[me.curstate].keyFrame.keyframes[0][1][10];
				me.x += xdisplace*me.dir;
				me.state[me.curstate].keyFrame.keyframes[0][1][10] = 0;
				this.progress = -5;
				
				me.dir = 0.5;
				me.bladedir = 1;
			}
			else if(keyArray[65])//key a
			{
				me.curstate = 1;//change to stand state
				me.state[me.curstate].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress).slice();
				var xdisplace = me.state[me.curstate].keyFrame.keyframes[0][1][10];
				me.x += xdisplace*me.dir;
				me.state[me.curstate].keyFrame.keyframes[0][1][10] = 0;
				this.progress = -5;
				/*
				me.curstate = 1;//change to run state
				me.state[1].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
				this.progress = -5;*/
				
				me.dir = -0.5;
				me.bladedir = 1;
			}
		}
		if(this.progress > 20)
		{
			if(keyArray[74])//key j
			{
				me.curstate = 4;//change to stand state
				me.state[me.curstate].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress).slice();
				var xdisplace = me.state[me.curstate].keyFrame.keyframes[0][1][10];
				me.x += xdisplace*me.dir;
				me.state[me.curstate].keyFrame.keyframes[0][1][10] = 0;
				this.progress = -5;
				//change direction
				if(keyArray[68])//key d
				{
					me.dir = 0.5;
				}
				else if(keyArray[65])//key a
				{
					me.dir = -0.5;
				}
				/*
				me.curstate = 4;//change to attack3 state
				me.state[4].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
				this.progress = -5;*/
				
				me.bladedir = 1;
			}
		}
		if(keyArray[75])//key k
		{
			if(keyArray[68])//key d
			{
				me.curstate = 5;//change to stand state
				me.state[me.curstate].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress).slice();
				var xdisplace = me.state[me.curstate].keyFrame.keyframes[0][1][10];
				me.x += xdisplace*me.dir;
				me.state[me.curstate].keyFrame.keyframes[0][1][10] = 0;
				this.progress = -5;
				
				me.dir = 0.5;
				/*
				me.curstate = 5;//change to evade state
				me.state[5].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
				this.progress = -5;*/
				me.bladedir = 1;
			}
			else if(keyArray[65])//key a
			{
				me.curstate = 5;//change to stand state
				me.state[me.curstate].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress).slice();
				var xdisplace = me.state[me.curstate].keyFrame.keyframes[0][1][10];
				me.x += xdisplace*me.dir;
				me.state[me.curstate].keyFrame.keyframes[0][1][10] = 0;
				this.progress = -5;
				
				me.dir = -0.5;
				/*
				me.curstate = 5;//change to evade state
				me.state[5].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
				this.progress = -5;*/
				me.bladedir = 1;
			}
			else
			{
				me.curstate = 6;//change to stand state
				me.state[me.curstate].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress).slice();
				var xdisplace = me.state[me.curstate].keyFrame.keyframes[0][1][10];
				me.x += xdisplace*me.dir;
				me.state[me.curstate].keyFrame.keyframes[0][1][10] = 0;
				this.progress = -5;
				/*
				me.curstate = 6;//change to no direction evade state
				me.state[6].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
				this.progress = -5;*/
				me.bladedir = 1;
			}
		}
		if(keyArray[73])//key i
		{
			if(me.sp >= 15 && me.ultcd <= 0)
			{
				me.sp -= 15;
				me.ultcd = player_ult_cooldown;
				/*
				me.curstate = 9;//change to ult state
				me.state[9].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
				this.progress = -10;*/
				me.curstate = 9;//change to stand state
				me.state[me.curstate].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress).slice();
				var xdisplace = me.state[me.curstate].keyFrame.keyframes[0][1][10];
				me.x += xdisplace*me.dir;
				me.state[me.curstate].keyFrame.keyframes[0][1][10] = 0;
				this.progress = -5;
			}
		}
	};
};

/**
 * attack state 3 for player object
 */
var sakura_attack3_state = function()
{
	this.keyFrame = new keyFrame();
	this.keyFrame.insertkf(-5,  [-0.35,-0.2,0.2,-0,-0.3,0.2,-0.25,0.0,0,-1.6,0,0]);//special keyframe location for transition
	this.keyFrame.insertkf(0,  [0,-3,-0.5,-1,-0.8,1,0.1,0.1,-0.1,-1,0,0]);
	this.keyFrame.insertkf(10,  [0,-3,-0.5,-1,-0.8,1,0.1,0.1,-0.1,-1,0,0]);
	this.keyFrame.insertkf(15,  [0,-3,-0.5,-1,-0.8,1,0.1,0.1,-0.1,-1,280,0]);
	this.keyFrame.insertkf(20,  [0.5,0,-0.5,-1,-1,1.5,0.2,0.2,0.3,0,280,20]);
	
	this.progress = -5;
	this.hitbox = true;
	this.execute = function(me)
	{
		me.draw(this.progress,this.keyFrame);
		this.progress += playerspeed;
		if(this.progress < 3)
		{
			this.hitbox = true;
		}
		
		if(this.progress > 10 && this.progress < 12)
		{
			var sound_sakura_blade = new Audio("sound/sakura_blade.wav");
			sound_sakura_blade.play();
		}
		if(this.hitbox)
		{
			if(this.progress >=17 && this.progress<=20 )
			{
				if((playertarget[0].curx < me.curx - me.dir* 50 && playertarget[0].curx > me.curx + me.dir* 300)||(playertarget[0].curx > me.curx - me.dir* 50 && playertarget[0].curx < me.curx + me.dir* 300))
				{
					//rect(100,100,50,50);
					playertarget[0].x -= playertarget[0].dir*15;
					playertarget[0].HP -=2;
					me.sp += 2;
					this.hitbox = false;
					timeFracture(0.05,0);
					var hit = new Audio("sound/hit.wav");
					hit.play();
				}
			}
		}
		if(this.progress > 150)
		{
			/*me.curstate = 0;//change to stand state
			me.state[0].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
			this.progress = -5;*/
			me.curstate = 0;//change to stand state
			me.state[me.curstate].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress).slice();
			var xdisplace = me.state[me.curstate].keyFrame.keyframes[0][1][10];
			me.x += xdisplace*me.dir;
			me.state[me.curstate].keyFrame.keyframes[0][1][10] = 0;
			this.progress = -5;
		}
		if(this.progress > 30)
		{
			if(keyArray[68])//key d
			{
				me.curstate = 1;//change to stand state
				me.state[me.curstate].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress).slice();
				var xdisplace = me.state[me.curstate].keyFrame.keyframes[0][1][10];
				me.x += xdisplace*me.dir;
				me.state[me.curstate].keyFrame.keyframes[0][1][10] = 0;
				this.progress = -5;
				/*
				me.curstate = 1;//change to run state
				me.state[1].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
				this.progress = -5;*/
				me.dir = 0.5;
			}
			else if(keyArray[65])//key a
			{
				me.curstate = 1;//change to stand state
				me.state[me.curstate].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress).slice();
				var xdisplace = me.state[me.curstate].keyFrame.keyframes[0][1][10];
				me.x += xdisplace*me.dir;
				me.state[me.curstate].keyFrame.keyframes[0][1][10] = 0;
				this.progress = -5;
				/*
				me.curstate = 1;//change to run state
				me.state[1].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
				this.progress = -5;*/
				me.dir = -0.5;
			}
			else if(keyArray[74])//key j
			{
				/*
				me.curstate = 0;//change to stand state
				me.state[0].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
				this.progress = -5;*/
				
				me.curstate = 0;//change to stand state
				me.state[me.curstate].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress).slice();
				var xdisplace = me.state[me.curstate].keyFrame.keyframes[0][1][10];
				me.x += xdisplace*me.dir;
				me.state[me.curstate].keyFrame.keyframes[0][1][10] = 0;
				this.progress = -5;
			}
		}
		if(keyArray[75])//key k
		{
			if(keyArray[68])//key d
			{
				me.curstate = 5;//change to stand state
				me.state[me.curstate].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress).slice();
				var xdisplace = me.state[me.curstate].keyFrame.keyframes[0][1][10];
				me.x += xdisplace*me.dir;
				me.state[me.curstate].keyFrame.keyframes[0][1][10] = 0;
				this.progress = -5;
				me.dir = 0.5;
				/*
				me.curstate = 5;//change to evade state
				me.state[5].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
				this.progress = -5;*/
			}
			else if(keyArray[65])//key a
			{
				me.curstate = 5;//change to stand state
				me.state[me.curstate].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress).slice();
				var xdisplace = me.state[me.curstate].keyFrame.keyframes[0][1][10];
				me.x += xdisplace*me.dir;
				me.state[me.curstate].keyFrame.keyframes[0][1][10] = 0;
				this.progress = -5;
				me.dir = -0.5;
				/*
				me.curstate = 5;//change to evade state
				me.state[5].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
				this.progress = -5;*/
			}
			else
			{
				me.curstate = 6;//change to stand state
				me.state[me.curstate].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress).slice();
				var xdisplace = me.state[me.curstate].keyFrame.keyframes[0][1][10];
				me.x += xdisplace*me.dir;
				me.state[me.curstate].keyFrame.keyframes[0][1][10] = 0;
				this.progress = -5;
				/*
				me.curstate = 6;//change to no direction evade state
				me.state[6].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
				this.progress = -5;*/
				me.bladedir = 1;
			}
		}
		if(keyArray[73])//key i
		{
			if(me.sp >= 15 && me.ultcd <= 0)
			{
				me.sp -= 15;
				me.ultcd = player_ult_cooldown;
				/*
				me.curstate = 9;//change to ult state
				me.state[9].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
				this.progress = -10;*/
				
				me.curstate = 9;//change to stand state
				me.state[me.curstate].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress).slice();
				var xdisplace = me.state[me.curstate].keyFrame.keyframes[0][1][10];
				me.x += xdisplace*me.dir;
				me.state[me.curstate].keyFrame.keyframes[0][1][10] = 0;
				this.progress = -5;
			}
		}
	};
};

/**
 * evade state for player object
 */
var sakura_directionEvade_state = function()
{
	this.keyFrame = new keyFrame();
	this.keyFrame.insertkf(0,  [-0.35,-0.2,0.2,-0,-0.3,0.2,-0.25,0.0,0,-1.6,0,0]);//special keyframe location for transition
	this.keyFrame.insertkf(7,   [-0.0,-1.1,-0.3,-0.9,-1.7,1.9,-1.3,0.9,0.7,-1.6,0,0]);
	this.keyFrame.insertkf(10,   [-0.5,-0.1,-0.2,-0.5,-0.0,0.0,-0.4,0.0,0.6,-1.6,150,0]);
	this.keyFrame.insertkf(15,  [-0.5,-0.1,-0.2,-0.5,-0.0,0.0,-0.4,0.0,0.6,-1.6,300,0]);
	this.keyFrame.insertkf(20,  [-0.0,-1.1,-0.3,-0.9,-1.7,1.9,-1.3,0.9,0.7,-1.6,300,0]);
	this.keyFrame.insertkf(25,  [-0.2,-0.9,-0.2,-0.2,-1.2,0.9,-0.5,0.0,0.4,-1.6,300,0]);
	this.progress = 0;
	this.execute = function(me)
	{
		me.draw(this.progress,this.keyFrame);
		if(this.progress === 0)
		{
			var sound_evade = new Audio("sound/evade.wav");
			sound_evade.play();
		}
		this.progress += playerspeed;
		
		if(this.progress > 25)
		{
			me.curstate = 0;//change to stand state
			me.state[0].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress).slice();
			var xdisplace = me.state[0].keyFrame.keyframes[0][1][10];
			me.x += xdisplace*me.dir;
			me.state[0].keyFrame.keyframes[0][1][10] = 0;
			this.progress = 0;
		}
	};
};

/**
 * evade state with no direction for player object
 */
var sakura_noDirectionEvade_state = function()
{
	this.keyFrame = new keyFrame();
	this.keyFrame.insertkf(0,  [-0.35,-0.2,0.2,-0,-0.3,0.2,-0.25,0.0,0,-1.6,0,0]);//special keyframe location for transition
	this.keyFrame.insertkf(7,   [-1.9,-1.1,-1.3,-0.9,-1.5,1.3,-1.3,0.9,0.5,-1.2,0,0]);
	this.keyFrame.insertkf(10,   [-1.6,-1.1,-1.0,-0.9,-1.1,0.3,-1.5,0.9,0.3,-1.5,-150,0]);
	this.keyFrame.insertkf(15,  [-1.6,-1.1,-1.0,-0.9,-1.1,0.3,-1.5,0.9,0.3,-1.5,-300,0]);
	this.keyFrame.insertkf(20,  [-1.9,-1.1,-1.3,-0.9,-1.5,1.3,-1.3,0.9,0.5,-1.2,-300,0]);
	this.progress = 0;
	this.execute = function(me)
	{
		me.draw(this.progress,this.keyFrame);
		if(this.progress === 0)
		{
			var sound_evade = new Audio("sound/evade.wav");
			sound_evade.play();
		}
		this.progress += playerspeed;
		
		if(this.progress > 20)
		{
			me.curstate = 0;//change to stand state
			me.state[0].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress).slice();
			var xdisplace = me.state[0].keyFrame.keyframes[0][1][10];
			me.x += xdisplace*me.dir;
			me.state[0].keyFrame.keyframes[0][1][10] = 0;
			this.progress = 0;
		}
	};
};

/**
 * hit state for player object
 */
var sakura_hit_state = function()
{
	this.keyFrame = new keyFrame();
	this.keyFrame.insertkf(0,  [-1.35,-0.9,-0.2,-0.9,0.1,0.3,-0.5,0.7,-0.6,-1.6,0,0]);//special keyframe location for transition
	this.keyFrame.insertkf(10,  [-1.4,-1.0,-0.3,-1.1,0.1,1.2,-0.5,0.7,-0.6,-1.6,-4,0]);//special keyframe location for transition
	this.keyFrame.insertkf(20,  [-1.45,-1.2,-0.4,-1.2,0.5,0.5,-0.7,0.9,-0.4,-1.3,-5,7]);
	this.keyFrame.insertkf(30,  [-1.5,-1.15,-0.7,-1.0,-0.3,0.6,-0.85,0.9,-0.05,-1.4,-40,7]);
	this.keyFrame.insertkf(40,  [-1.6,-1.1,-1.0,-0.9,-1.1,0.7,-1.0,0.9,0.3,-1.5,-80,18]);
	this.keyFrame.insertkf(50,  [-1.6,-1.1,-1.0,-0.9,-0.8,0.2,-0.5,0.0,0.3,-1.5,-80,10]);
	this.progress = 0;
	this.execute = function(me)
	{
		me.draw(this.progress,this.keyFrame);
		this.progress += playerspeed;
		
		if(this.progress > 50)
		{
			me.curstate = 0;//change to stand state
			me.state[0].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress).slice();
			var xdisplace = me.state[0].keyFrame.keyframes[0][1][10];
			me.x += xdisplace*me.dir;
			me.state[0].keyFrame.keyframes[0][1][10] = 0;
			this.progress = 0;
		}
	};
};

/**
 * dead state for player object
 */
var sakura_dead_state = function()
{
	this.keyFrame = new keyFrame();
	this.keyFrame.insertkf(0,  [-1.35,-0.9,-0.2,-0.9,0.1,0.3,-0.5,0.7,-0.6,-1.6,0,0]);
	this.keyFrame.insertkf(10,  [-1.4,-1.0,-0.3,-1.1,0.1,1.2,-0.5,0.7,-0.6,-1.6,-4,0]);
	this.keyFrame.insertkf(20,  [-1.45,-1.2,-0.4,-1.2,0.5,0.5,-0.7,0.9,-0.4,-1.3,-5,7]);
	this.keyFrame.insertkf(30,  [-1.5,-1.15,-0.7,-1.0,-0.3,0.6,-0.85,0.9,-0.5,-1.4,-40,7]);
	this.keyFrame.insertkf(50,  [-1.5,-1.15,-0.7,-1.0,-0.3,0.6,-0.85,0.9,-1.4,-1.4,-120,90]);
	this.progress = 0;
	this.execute = function(me)
	{
		me.draw(this.progress,this.keyFrame);
		this.progress += playerspeed;
	};
};

/**
 * rain bubble
 */
var drawbubble = function(x,y,d,o)
{
	var d_o = d/o;
	noFill();
	strokeWeight(d_o);
	while (o>0 && d>0) {
		stroke(255, 255, 31,o);
		ellipse(x, y, d, d);
		d -= d_o;
		o -= 2;
	}
};
var spark0 = loadImage("spark0-g.png");
var spark1 = loadImage("spark1-g.png");
var ult_flash = loadImage("chara_sakura/ult_flash_r.png");


var sound_dash = new Audio("sound/dash_1.wav");
/**
 * player ult state
 */
var sakura_ult_state = function()
{
	this.keyFrame = new keyFrame();
	this.waittime = 60;
	//this.keyFrame.insertkf(0,  [-0.3,-0.1,-0.0,-0,-0.3,0.2,-0.25,0.0,0,-1.6,0,0]);
	this.keyFrame.insertkf(0,  [-4.78,1.4,-1.3,-0.9,-1.2,0.8,-1.0,0.9,0.3,1.1,0,25]);//keyframe for transition
	this.keyFrame.insertkf(5,  [-4.78,1.4,-1.3,-0.9,-1.2,0.8,-1.0,0.9,0.3,1.1,0,25]);
	this.keyFrame.insertkf(this.waittime-18,  [-4.78,1.4,-1.3,-0.9,-1.2,0.8,-1.0,0.9,0.3,1.1,0,25]);//ready
	this.keyFrame.insertkf(this.waittime-13,  [-4.78,1.4,-1.3,-0.9,-1.2,0.8,-1.0,0.9,0.3,1.1,0,25]);//ready
	this.keyFrame.insertkf(this.waittime+1,  [-0.38,-0.8,-0.0,-0.9,-1.9,1.7,-1.25,1.2,0.6,1.2,-80,45]);//hit1
	this.keyFrame.insertkf(this.waittime+10,  [-0.38,-0.8,-0.0,-0.9,-1.9,1.7,-1.25,1.2,0.6,1.2,-80,45]);//hit1
	this.keyFrame.insertkf(this.waittime+13,  [-2.9,-0.8,0.6,-0.2,0.1,0.4,-0.9,0.5,0.0,1.6,700,15]);
	this.keyFrame.insertkf(this.waittime+39,  [-2.9,-0.8,0.6,-0.2,0.1,0.4,-0.9,0.5,0.0,1.6,700,15]);
	this.keyFrame.insertkf(this.waittime+48,  [-1.9,-0.8,0.6,-0.2,-0.4,0.4,-0.3,0.2,0.0,-1.2,750,7]);//hit2
	this.keyFrame.insertkf(this.waittime+51,  [0.2,-0.0,-0.2,-0.2,-0.4,0.4,-0.3,0.2,0.0,-0.2,750,7]);
	this.keyFrame.insertkf(this.waittime+81,  [0.2,-0.0,-0.2,-0.2,-0.4,0.4,-0.3,0.2,0.0,-0.2,750,7]);
	this.keyFrame.insertkf(this.waittime+91,  [-0.3,-0.1,-0.0,-0,-0.3,0.2,-0.25,0.0,0,-1.6,750,0]);
	this.lightkeyFrame = new keyFrame();
	this.lightkeyFrame.insertkf(0,  [0.1,0.2,1,1,0,57]);
	this.lightkeyFrame.insertkf(10,  [0.15,0.2,0.8,0.8,40,57]);
	this.lightkeyFrame.insertkf(15,  [1.55,0.2,0.5,0.5,127,57]);
	this.lightkeyFrame.insertkf(23,  [0.2,0.2,0,0,197,20]);
	this.lightkeyFrame.insertkf(25,  [0,0,0,0,197,0]);
	this.flashkeyFrame = new keyFrame();
	this.flashkeyFrame.insertkf(this.waittime-5,  [0,0]);
	this.flashkeyFrame.insertkf(this.waittime,  [0.1,0.1]);
	this.flashkeyFrame.insertkf(this.waittime+5,  [1.1,0.5]);
	this.flashkeyFrame.insertkf(this.waittime+9,  [8,0.1]);
	this.flashkeyFrame.insertkf(this.waittime+10,  [8,0.01]);
	
	this.progress = 0;
	this.hitbox1 = true;
	this.hitbox2 = true;
	this.lightprogress = 0;
	
	this.perfectguard = false;
	
	this.execute = function(me)
	{
		if(this.progress < 10)
		{
			if(playertarget[0].curx > me.curx)
			{
				me.dir = 0.5;
			}
			else
			{
				me.dir = -0.5;
			}
		}
		me.collision = false;
		if(this.progress < this.waittime+39)
		{
			me.bladedir =-1;
		}
		else
		{
			me.bladedir = 1;
		}
		me.draw(this.progress,this.keyFrame);
		if(this.perfectguard && this.progress > this.waittime-18)
		{
			pushMatrix();
			translate(me.x+me.dir*60,me.y-30);
			pushMatrix();
			scale(this.lightkeyFrame.getPos(this.lightprogress)[2],this.lightkeyFrame.getPos(this.lightprogress)[3]);
			image(spark0,-600,-600);
			popMatrix();
			
			pushMatrix();
			scale(this.lightkeyFrame.getPos(this.lightprogress)[0],this.lightkeyFrame.getPos(this.lightprogress)[1]);
			image(spark1,-600,-600);
			popMatrix();
			
			drawbubble(0,0,this.lightkeyFrame.getPos(this.lightprogress)[4],this.lightkeyFrame.getPos(this.lightprogress)[5]);
			popMatrix();
			this.lightprogress+=0.6;
		}
		
		if(this.progress >= this.waittime-5 && this.progress <= this.waittime + 10)
		{
			pushMatrix();
			translate(me.x+me.dir*(-100),me.y+25);
			scale(this.flashkeyFrame.getPos(this.progress)[0],this.flashkeyFrame.getPos(this.progress)[1]);
			image(ult_flash,-56,-42);
			popMatrix();
		}
		this.progress += playerspeed;
		if(this.hitbox1)
		{
			if(this.progress > this.waittime+14)
			{
				playertarget[0].x -= playertarget[0].dir*15;
				if(this.perfectguard)
				{
					playertarget[0].HP -=2;
				}
				playertarget[0].HP -=2;
				this.hitbox1 = false;
				cameraShake(0.02);
				var hit = new Audio("sound/hit.wav");
				hit.play();
			}
		}
		if(this.hitbox2)
		{
			if(this.progress > this.waittime+49)
			{
				playertarget[0].x -= playertarget[0].dir*15;
				if(this.perfectguard)
				{
					playertarget[0].HP -=3;
				}
				playertarget[0].HP -=3;
				this.hitbox2 = false;
				cameraShake(0.02);
				var hit = new Audio("sound/hit.wav");
				hit.play();
			}
		}
		
		if(this.progress > this.waittime -9 && this.progress < this.waittime -7)
		{
			sound_dash.play();
		}
		if(this.progress > this.waittime+106)
		{
			me.curstate = 0;//change to stand state
			me.state[0].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress).slice();
			var xdisplace = me.state[0].keyFrame.keyframes[0][1][10];
			me.x += xdisplace*me.dir;
			me.state[0].keyFrame.keyframes[0][1][10] = 0;
			this.progress = 0;
			this.hitbox1 = true;
			this.hitbox2 = true;
			me.collision = true;
			this.lightprogress = 0;
			this.perfectguard = false;
		}
	};
};

var player = new sakuraCha(100,410);//originally -50

var lightimg = loadImage("light.png");
var sound_ding = new Audio("sound/deflect.wav");
sound_ding.volume = 0.1;
/**
 * hit state for player object
 */
var player_hit_event = function(k=1)
{
	if((player.curstate === 5 || player.curstate === 6)&&player.state[player.curstate].progress < 16)
	{
		player.sp += 2;
		if(player.evadeCD > 0)
		{
			timeFracture(0.5,0);
		}
		else
		{
			timeFracture(0.5,3);
			player.evadeCD = player_evade_cooldown;
		}
	}
	else if(player.curstate === 9)
	{
		if(player.state[9].progress < 16)
		{
			sound_ding.play();
			player.sp += 10;
			player.ultcd -= 600;
			player.state[9].progress = player.state[9].waittime-18;
			timeFracture(0.5,3);
			cameraShake(0.2);
			player.state[9].perfectguard = true;
		}
		else if(player.state[9].progress < player.state[9].waittime-18)
		{
			player.state[9].progress = player.state[9].waittime-18;
			timeFracture(0.5,0);
			cameraShake(0.2);
		}
	}
	else
	{
		player.state[player.curstate].progress = player.state[player.curstate].keyFrame.keyframes[0][0];
		player.bladedir = 1;
		player.curstate = 7;//hit state
		player.HP -=k;
		if(playertarget[0].secondphase)
		{
			player.HP -= k;
		}
		var hit = new Audio("sound/hit.wav");
		hit.play();
	}
}

var sound_boss_blade = new Audio("sound/boss_blade.wav");
sound_boss_blade.volume = 0.5;

/**
 * boss object
 */
var boss_3blade = function()
{
	this.keyFrame = new keyFrame();//3blade
	this.keyFrame.insertkf(-5, [0,0,0,0,0,0,0,0,0,0,0,0,0]);
	
	this.keyFrame.insertkf(0, [-0.2,0,-0.1,-0.5,0.2,0.1,0,0.2,0,0,0.1,0,0]);
	this.keyFrame.insertkf(11, [-0.2,0,0.4,-0.9,-0.1,-0.1,10,-1.0,-1.3,0.3,-0.1,-15,-15]);
	this.keyFrame.insertkf(22, [-0.4,0,0.8,-1.9,-0.2,-0.2,20,-2.5,-0.3,0.4,-0.2,-30,-30]);
	this.keyFrame.insertkf(25, [-1.2,20,1.2,-2.0,0.2,0.8,-60,-2.3,0.3,0.9,0.2,0,0]);
	this.keyFrame.insertkf(26, [-1.3,30,1.2,-2.0,0.2,1.1,-60,-2.3,0.3,0.9,0.2,20,0]);
	this.keyFrame.insertkf(35, [-0.8,10,1.0,-1.0,0.0,0.5,-80,-0.6,-0.2,0.3,0.0,0,0]);
	this.keyFrame.insertkf(41, [-0.2,0,0.0,-0.8,0.3,0.0,-40,0.5,-0.5,0.1,0.0,0,0]);
	this.keyFrame.insertkf(50, [-0.4,0,-0.9,-1.2,-0.2,0.0,0,0.9,-0.9,0.1,-0.1,-15,-15]);
	this.keyFrame.insertkf(54, [-0.0,0,-0.3,0.6,0.8,0.0,0,0.7,-1.2,0.1,0.3,-0,-0]);
	this.keyFrame.insertkf(58, [0.2,0,-0.3,1.0,1.1,0.0,0,0.8,-1.1,-0.1,0.3,10,-0]);
	this.keyFrame.insertkf(72, [-0.1,0,-0.0,-0.3,0.6,0.1,0,0.2,0,0,0.1,0,0]);
	this.keyFrame.insertkf(77, [-0.3,0,-0.1,-0.3,0.6,0.2,0,0.3,-0.1,-0.2,0.0,0,0]);
	this.keyFrame.insertkf(89, [-0.4,0,-0.3,-2.0,0.5,0.0,0,-1.1,-1.5,-0.1,-0.2,-10,-20]);
	this.keyFrame.insertkf(92, [-0.4,0,-0.5,-2.2,0.6,0.0,0,-1.4,-1.7,-0.2,-0.3,-15,-25]);
	this.keyFrame.insertkf(95, [-0.0,0,-0.3,-0.2,1.2,0.0,-30,-0.8,0.2,0.8,0.3,10,-0]);
	this.keyFrame.insertkf(99, [-0.0,0,2.0,-1.9,1.0,0.0,-0,0.8,0.2,0.8,0.3,0,-0]);
	this.keyFrame.insertkf(124, [-0.2,0,-0.1,-0.5,0.2,0.1,0,0.2,0,0,0.1,0,0]);
	
	this.progress = -5;
	
	this.hitbox1 = true;
	this.hitbox2 = true;
	this.hitbox3 = true;
	
	this.execute = function(me)
	{
		me.draw(this.progress,this.keyFrame);
		this.progress += globalspeed;
		if(me.secondphase)
		{
			this.progress += 0.1;
		}
		if(player.curx > me.curx)
		{
			me.dir = 1;
		}
		else
		{
			me.dir = -1;
		}
		if(this.hitbox1)
		{
			if(this.progress >=24 && this.progress<=26 )
			{
				if((player.curx < me.curx && player.curx > me.curx + me.dir* 340)||(player.curx > me.curx && player.curx < me.curx + me.dir* 340))
				{
					//rect(100,100,50,50);
					player_hit_event();
					this.hitbox1 = false;
				}
			}
		}
		if(this.hitbox2)
		{
			if(this.progress >=52 && this.progress<=54 )
			{
				if((player.curx < me.curx && player.curx > me.curx + me.dir* 340)||(player.curx > me.curx && player.curx < me.curx + me.dir* 340))
				{
					//rect(100,100,50,50);
					player_hit_event();
					this.hitbox2 = false;
				}
			}
		}
		if(this.hitbox3)
		{
			if(this.progress >=93.5 && this.progress<=95 )
			{
				if((player.curx < me.curx && player.curx > me.curx + me.dir* 340)||(player.curx > me.curx && player.curx < me.curx + me.dir* 340))
				{
					//rect(100,100,50,50);
					player_hit_event();
					this.hitbox3 = false;
				}
			}
		}
		if(this.progress > 22 && this.progress < 23)
		{
			sound_boss_blade.play();
		}
		if(this.progress > 51 && this.progress < 52)
		{
			sound_boss_blade.play();
		}
		if(this.progress > 92 && this.progress < 93)
		{
			sound_boss_blade.play();
		}
		if(this.progress > 124)
		{
			this.hitbox1 = true;
			this.hitbox2 = true;
			this.hitbox3 = true;
			me.curstate = 0;
			me.state[0].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
			this.progress = -5;
		}
	};
};

/**
 * boss run state
 */
var boss_run = function()
{
	this.keyFrame = new keyFrame();//3blade
	this.keyFrame.insertkf(-10, [0,0,0,0,0,0,0,0,0,0,0,0,0]);
	
	this.keyFrame.insertkf(0, [-0.2,0,-0.1,-0.5,0.2,0.1,0,0.2,0,0,0.1,0,0]);
	this.keyFrame.insertkf(13, [-0.2,0,-0.1,-0.5,0.2,0.1,0,0.2,0,0,0.1,0,-15]);
	this.keyFrame.insertkf(26, [-0.2,0,-0.1,-0.5,0.2,0.1,0,0.2,0,0,0.1,0,0]);
	
	this.progress = -10;
	this.attackcooldown = 60;
	this.lastAtk = 3;
	this.execute = function(me)
	{
		me.draw(this.progress,this.keyFrame);
		this.progress += globalspeed;
		if(abs(player.x - me.x) > 190)
		{
			//rect(100,100,50,50);
			if(player.x > me.x)
			{
				if(me.secondphase)
				{
					me.x +=6*globalspeed/0.4;
				}
				else
				{
					me.x +=1.5*globalspeed/0.4;
				}
			}
			else
			{
				if(me.secondphase)
				{
					me.x -=6*globalspeed/0.4;
				}
				else
				{
					me.x -=1.5*globalspeed/0.4;
				}
			}
		}
		else if(me.secondphase)
		{
			var totalstate = [1,2,6,7];
			totalstate.splice(totalstate.indexOf(this.lastAtk),1);
			//println(totalstate);
			var nextst = totalstate[floor(random() * totalstate.length)];
			//println(nextst);
			me.curstate = nextst;
			this.lastAtk = nextst;
			me.state[nextst].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
			this.progress = -10;
		}
		else if(this.attackcooldown < 0)
		{
			this.attackcooldown = 60;
			var totalstate = [1,2,3];
			totalstate.splice(this.lastAtk-1,1);
			var rand = random();
			var nextst = totalstate[0];
			if(rand < 0.5)
			{
				nextst = totalstate[1];
			}
			me.curstate = nextst;
			this.lastAtk = nextst;
			me.state[nextst].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
			this.progress = -10;
		}
		this.attackcooldown -= 1;
		if(me.secondphase === false && me.HP < me.maxhp/2)
		{
			me.curstate = 5;
			me.state[5].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
			this.lastAtk = 1;
			this.progress = -10;
		}
		if(player.x > me.x)
		{
			me.dir = 1;
		}
		else
		{
			me.dir = -1;
		}
		if(this.progress > 26)
		{
			this.progress = 0;
		}
	};
};


var sound_boss_jump = new Audio("sound/jumpatk.wav");
var sound_boss_jump1 = new Audio("sound/jumpatk.wav");
sound_boss_jump.volume = 0.9;
sound_boss_jump1.volume = 0.9;
/**
 * boss jump attack state
 */
var jumpAtk = function()
{
	this.keyFrame = new keyFrame();//jump attack
	this.keyFrame.insertkf(-5, [0,0,0,0,0,0,0,0,0,0,0,0,0]);
	//first attack
	this.keyFrame.insertkf(0, [-0.2,-20,0,-0.3,0,-0.3,-60,-0.3,-0.4,0,0,0,0]);
	this.keyFrame.insertkf(5, [-0.5,-20,-0.9,-1.7,0.6,-0.4,-40,-1.6,-1.1,0,-0.4,-30,-180]);
	this.keyFrame.insertkf(7, [-0.5,-20,-1.0,-1.8,0.6,-0.4,-40,-1.7,-1.2,0,-0.5,-30,-200]);
	this.keyFrame.insertkf(8, [-0.5,-20,-1.0,-1.8,0.6,-0.4,-40,-1.7,-1.2,0,-0.5,-30,-200]);
	this.keyFrame.insertkf(10, [-0.4,-20,-0.0,-0.1,0.6,0.4,-80,-1.2,-0.1,0.5,0.4,-0,-0]);
	//second attack
	this.keyFrame.insertkf(20+3, [-0.4,-20,-0.0,-0.1,0.6,0.4,-80,-1.2,-0.1,0.5,0.4,-0,-0]);
	this.keyFrame.insertkf(25+3, [-0.5,-20,-0.9,-1.7,0.6,-0.4,-40,-1.6,-1.1,0,-0.4,-30,-200]);
	this.keyFrame.insertkf(30+3, [-0.5,-20,-1.0,-1.8,0.6,-0.4,-40,-1.7,-1.2,0,-0.5,-30,-240]);
	this.keyFrame.insertkf(32+3, [-0.5,-20,-1.0,-1.8,0.6,-0.4,-40,-1.7,-1.2,0,-0.5,-30,-240]);
	this.keyFrame.insertkf(34+3, [-0.4,-20,-0.0,-0.1,0.6,0.4,-80,-1.2,-0.1,0.5,0.4,-0,-0]);
	this.keyFrame.insertkf(47+3, [-0.4,-20,-0.0,-0.1,0.6,0.4,-80,-1.2,-0.1,0.5,0.4,-0,-0]);
	
	this.progress = -5;
	
	this.hitbox1 = true;
	this.hitbox2 = true;
	
	this.execute = function(me)
	{
		me.draw(this.progress,this.keyFrame);
		this.progress += globalspeed;
		if(me.secondphase)
		{
			this.progress += 0.1;
		}
		if(player.x > me.x)
		{
			me.dir = 1;
		}
		else
		{
			me.dir = -1;
		}
		if(this.hitbox1)
		{
			if(this.progress >=9 && this.progress<=10 )
			{
				if((player.curx < me.curx && player.curx > me.curx + me.dir* 300)||(player.curx > me.curx && player.curx < me.curx + me.dir* 300))
				{
					//rect(100,100,50,50);
					player_hit_event();
					this.hitbox1 = false;
				}
			}
		}
		if(this.hitbox2)
		{
			if(this.progress >=33+3 && this.progress<=34+3 )
			{
				if((player.curx < me.curx && player.curx > me.curx + me.dir* 300)||(player.curx > me.curx && player.curx < me.curx + me.dir* 300))
				{
					//rect(100,100,50,50);
					player_hit_event();
					this.hitbox2 = false;
				}
			}
		}
		if(this.progress> 10 && this.progress < 11)
		{
			cameraShake(0.2);
		}
		if(this.progress> 34+3 && this.progress < 35+3)
		{
			cameraShake(0.2);
		}
		
		if(this.progress > 8 && this.progress < 9)
		{
			sound_boss_jump.play();
		}
		
		if(this.progress > 33+2 && this.progress < 33+3)
		{
			sound_boss_jump1.play();
		}
		if(this.progress > 47+3)
		{
			this.hitbox1 = true;
			this.hitbox2 = true;
			me.curstate = 0;//go walk
			me.state[0].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
			this.progress = -5;
		}
	};
};


var sound_danger = new Audio("sound/Omae wa mou shindeiru 2019 Edition (Sekiro perilous attack sound).mp3");
sound_danger.volume = 0.4;
/**
 * boss stab attack state
 */
var stabAtk = function()
{
	this.keyFrame = new keyFrame();//stab attack
	this.keyFrame.insertkf(-5, [0,0,0,0,0,0,0,0,0,0,0,0,0]);
	this.keyFrame.insertkf(0, [-0.2,0,-0.1,-0.5,0.2,0.1,0,0.2,0,0,0.1,0,0]);
	//first attack
	this.keyFrame.insertkf(20, [-0.15,-0,0.15,-0.8,0.2,0,0,1.3,-1.1,-0.2,0.2,-40,0]);
	this.keyFrame.insertkf(23, [-0.2,-0,0.2,-0.9,0.3,0,0,1.4,-1.2,-0.3,0.3,-50,0]);
	this.keyFrame.insertkf(24, [-0.9,-0,0.4,-1.1,0.1,0.3,-40,0.3,-1.6,0.7,0.3,0,0]);
	this.keyFrame.insertkf(25, [-1.2,20,0.6,-1.2,0.2,0.6,-40,-2.0,0.0,0.9,0.3,50,0]);
	this.keyFrame.insertkf(40, [-1.2,20,0.6,-1.2,0.2,0.6,-40,-2.0,0.0,0.9,0.3,50,0]);
	this.keyFrame.insertkf(56, [0,0,0,0,0,0,0,0,0,0,0,0,0]);
	
	this.progress = -5;
	
	this.hitbox1 = true;
	
	this.dangerkeyFrame = new keyFrame();//stab attack
	this.dangerkeyFrame.insertkf(10, [0.6]);
	this.dangerkeyFrame.insertkf(16, [1.5]);
	this.dangerkeyFrame.insertkf(23, [1.2]);
	this.dangerkeyFrame.insertkf(25, [1]);
	
	this.execute = function(me)
	{
		me.draw(this.progress,this.keyFrame);
		this.progress += globalspeed;
		if(player.x > me.x)
		{
			me.dir = 1;
		}
		else
		{
			me.dir = -1;
		}
		if(this.hitbox1)
		{
			if(this.progress >=23 && this.progress<=25 )
			{
				if((player.curx < me.curx && player.curx > me.curx + me.dir* 380)||(player.curx > me.curx && player.curx < me.curx + me.dir* 380))
				{
					//rect(100,100,50,50);
					player_hit_event(2);
					this.hitbox1 = false;
				}
			}
		}
		if(this.progress > 10 && this.progress < 11)
		{
			sound_danger.play();
		}
		if(this.progress > 10 && this.progress < 25)
		{
			pushMatrix();
			translate(me.curx +10,me.y - 220);
			scale(this.dangerkeyFrame.getPos(this.progress)[0]);
			image(me.dangerimg,-60,-60);
			popMatrix();
		}
			
		if(this.progress > 23 && this.progress < 24)
		{
			sound_boss_blade.play();
		}
		if(this.progress > 56)
		{
			this.hitbox1 = true;
			me.curstate = 0;//go walk
			me.state[0].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
			this.progress = -5;
		}
	};
};

var flameimg = loadImage("flame.png");
/**
 * boss dead state
 */
var Boss_dead = function()
{
	this.keyFrame = new keyFrame();
	this.keyFrame.insertkf(0, [0,0,0,0,0,0,0,0,0,0,0,0,0]);
	this.keyFrame.insertkf(10, [0,0,0,0,0,0,0,0,0,0,0,0,0]);
	
	this.progress = 0;
	
	this.execute = function(me)
	{
		this.progress+=1;
		if(this.progress < 200)
		{
			me.draw(this.progress,this.keyFrame);
			image(flameimg,me.x-250*this.progress/200,me.y-250*this.progress/200,500*this.progress/200,500*this.progress/200);
		}
		else if(this.progress < 300)
		{
			image(flameimg,me.x-250*(300-this.progress)/100,me.y-250*(300-this.progress)/100,500*(300-this.progress)/100,500*(300-this.progress)/100);
		}
		//image(flameimg,me.x-250,me.y-320);
		this.progress += 1;
	};
};

/**
 * boss second trans state
 */
var Boss_second_trans = function()
{
	this.keyFrame = new keyFrame();
	this.keyFrame.insertkf(-10,  [-0.2,10,0.3,-0.7,-0.2,0.2,10,-0.5,-0.7,-0.5,0,0,0]);
	this.keyFrame.insertkf(0,  [-0.2,10,0.3,-0.7,-0.2,0.2,10,-0.5,-0.7,-0.5,0,0,0]);
	this.keyFrame.insertkf(160,  [-0.2,10,0.3,-0.7,-0.2,0.2,10,-0.5,-0.7,-0.5,0,0,0]);
	this.keyFrame.insertkf(180, [0.2,10,-0.5,-0.5,0.3,-0.2,10,0.8,0,0,0,0,0]);
	this.keyFrame.insertkf(290, [0.2,10,-0.5,-0.5,0.3,-0.2,10,0.8,0,0,0,0,0]);
	this.keyFrame.insertkf(360, [-0.2,0,-0.1,-0.5,0.2,0.1,0,0.2,0,0,0.1,0,0]);
	
	this.progress = -10;
	this.firstshake = false;
	this.secondshake = false;
	
	this.execute = function(me)
	{
		this.progress+=1;
		me.draw(this.progress,this.keyFrame);
		if(this.firstshake === false && this.progress > 0)
		{
			cameraShake(140/60);
			this.firstshake = true;
		}
		if(this.secondshake === false && this.progress > 180)
		{
			cameraShake(110/60);
			shakeintensity = 13;
			this.secondshake = true;
		}
		if(this.progress > 200)
		{
			me.secondphase = true;
		}
		if(this.progress > 0 && this.progress < 140)
		{
			if(player.x < me.x)
			{
				player.x -= 3;
			}
			else
			{
				player.x += 3;
			}
		}
		if(this.progress > 180 && this.progress < 290)
		{
			if(player.x < me.x)
			{
				player.x -= 6;
			}
			else
			{
				player.x += 6;
			}
		}
		if(this.progress > 360)
		{
			me.curstate = 0;//go walk
			me.state[0].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
			this.progress = -10;
			shakeintensity = 1.5;
			this.firstshake = false;
			this.secondshake = false;
		}
	};
};

/**
 * boss five combo state
 */
var Boss_5combo = function()
{
	this.keyFrame = new keyFrame();
	this.keyFrame.insertkf(-10, [0,0,0,0,0,0,0,0,0,0,0,0,0]);
	//first
	this.keyFrame.insertkf(0, [-0.2,0,-0.1,-0.5,0.2,0.1,0,0.2,0,0,0.1,0,0]);
	this.keyFrame.insertkf(11, [-0.2,0,0.4,-0.9,-0.1,-0.1,10,-1.0,-1.3,0.3,-0.1,-15,-15]);
	this.keyFrame.insertkf(22, [-0.4,0,0.8,-1.9,-0.2,-0.2,20,-2.5,-0.3,0.4,-0.2,-30,-30]);
	this.keyFrame.insertkf(25, [-1.2,20,1.2,-2.0,0.2,0.8,-60,-2.3,0.3,0.9,0.2,0,0]);
	this.keyFrame.insertkf(26, [-1.3,30,1.2,-2.0,0.2,1.1,-60,-2.3,0.3,0.9,0.2,20,0]);
	this.keyFrame.insertkf(35, [-0.8,10,1.0,-1.0,0.0,0.5,-80,-0.6,-0.2,0.3,0.0,0,0]);
	this.keyFrame.insertkf(41, [-0.2,0,0.0,-0.8,0.3,0.0,-40,0.5,-0.5,0.1,0.0,0,0]);
	//second
	this.keyFrame.insertkf(50, [-0.4,0,-0.9,-1.2,-0.2,0.0,0,0.9,-0.9,0.1,-0.1,-15,-15]);
	this.keyFrame.insertkf(54, [-0.0,0,-0.3,0.6,0.8,0.0,0,0.7,-1.2,0.1,0.3,-0,-0]);
	this.keyFrame.insertkf(58, [0.2,0,-0.3,1.0,1.1,0.0,0,0.8,-1.1,-0.1,0.3,10,-0]);
	this.keyFrame.insertkf(72, [-0.1,0,-0.0,-0.3,0.6,0.1,0,0.2,0,0,0.1,0,0]);
	this.keyFrame.insertkf(77, [-0.3,0,-0.1,-0.3,0.6,0.2,0,0.3,-0.1,-0.2,0.0,0,0]);
	//jump1
	this.keyFrame.insertkf(8+77+0, [-0.2,-20,0,-0.3,0,-0.3,-60,-0.3,-0.4,0,0,0,0]);
	this.keyFrame.insertkf(8+77+5, [-0.5,-20,-0.9,-1.7,0.6,-0.4,-40,-1.6,-1.1,0,-0.4,-30,-180]);
	this.keyFrame.insertkf(8+77+7, [-0.5,-20,-1.0,-1.8,0.6,-0.4,-40,-1.7,-1.2,0,-0.5,-30,-200]);
	this.keyFrame.insertkf(8+77+8, [-0.5,-20,-1.0,-1.8,0.6,-0.4,-40,-1.7,-1.2,0,-0.5,-30,-200]);
	this.keyFrame.insertkf(8+77+10, [-0.4,-20,-0.0,-0.1,0.6,0.4,-80,-1.2,-0.1,0.5,0.4,-0,-0]);
	//jump2
	this.keyFrame.insertkf(8+77+20+3, [-0.4,-20,-0.0,-0.1,0.6,0.4,-80,-1.2,-0.1,0.5,0.4,-0,-0]);
	this.keyFrame.insertkf(8+77+25+3, [-0.5,-20,-0.9,-1.7,0.6,-0.4,-40,-1.6,-1.1,0,-0.4,-30,-200]);
	this.keyFrame.insertkf(8+77+30+3, [-0.5,-20,-1.0,-1.8,0.6,-0.4,-40,-1.7,-1.2,0,-0.5,-30,-240]);
	this.keyFrame.insertkf(8+77+32+3, [-0.5,-20,-1.0,-1.8,0.6,-0.4,-40,-1.7,-1.2,0,-0.5,-30,-240]);
	this.keyFrame.insertkf(8+77+34+3, [-0.4,-20,-0.0,-0.1,0.6,0.4,-80,-1.2,-0.1,0.5,0.4,-0,-0]);
	this.keyFrame.insertkf(8+77+47+3, [-0.4,-20,-0.0,-0.1,0.6,0.4,-80,-1.2,-0.1,0.5,0.4,-0,-0]);
	//third
	this.keyFrame.insertkf(8+47+3+89, [-0.4,0,-0.3,-2.0,0.5,0.0,0,-1.1,-1.5,-0.1,-0.2,-10,-20]);
	this.keyFrame.insertkf(8+47+3+92, [-0.4,0,-0.5,-2.2,0.6,0.0,0,-1.4,-1.7,-0.2,-0.3,-15,-25]);
	this.keyFrame.insertkf(8+47+3+95, [-0.0,0,-0.3,-0.2,1.2,0.0,-30,-0.8,0.2,0.8,0.3,10,-0]);
	this.keyFrame.insertkf(8+47+3+99, [-0.0,0,2.0,-1.9,1.0,0.0,-0,0.8,0.2,0.8,0.3,0,-0]);
	this.keyFrame.insertkf(8+47+3+124, [-0.2,0,-0.1,-0.5,0.2,0.1,0,0.2,0,0,0.1,0,0]);
	
	this.progress = -10;
	this.hitbox1 = true;
	this.hitbox2 = true;
	this.hitbox3 = true;
	this.hitbox4 = true;
	this.hitbox5 = true;
	
	this.execute = function(me)
	{
		me.draw(this.progress,this.keyFrame);
		this.progress+=globalspeed+0.1;
		if(player.curx > me.curx)
		{
			me.dir = 1;
		}
		else
		{
			me.dir = -1;
		}
		
		if(this.hitbox1)
		{
			if(this.progress >=24 && this.progress<=26 )
			{
				if((player.curx < me.curx && player.curx > me.curx + me.dir* 340)||(player.curx > me.curx && player.curx < me.curx + me.dir* 340))
				{
					player_hit_event();
					this.hitbox1 = false;
				}
			}
		}
		if(this.hitbox2)
		{
			if(this.progress >=52 && this.progress<=54 )
			{
				if((player.curx < me.curx && player.curx > me.curx + me.dir* 340)||(player.curx > me.curx && player.curx < me.curx + me.dir* 340))
				{
					player_hit_event();
					this.hitbox2 = false;
				}
			}
		}
		
		if(this.hitbox3)
		{
			if(this.progress >=8+77+9 && this.progress<=8+77+10 )
			{
				if((player.curx < me.curx && player.curx > me.curx + me.dir* 300)||(player.curx > me.curx && player.curx < me.curx + me.dir* 300))
				{
					//rect(100,100,50,50);
					player_hit_event();
					this.hitbox3 = false;
				}
			}
		}
		if(this.hitbox4)
		{
			if(this.progress >=8+77+33+3 && this.progress<=8+77+34+3 )
			{
				if((player.curx < me.curx && player.curx > me.curx + me.dir* 300)||(player.curx > me.curx && player.curx < me.curx + me.dir* 300))
				{
					//rect(100,100,50,50);
					player_hit_event();
					this.hitbox4 = false;
				}
			}
		}
		
		if(this.progress> 8+77+10 && this.progress < 8+77+11)
		{
			cameraShake(0.2);
		}
		if(this.progress> 8+77+34+3 && this.progress < 8+77+35+3)
		{
			cameraShake(0.2);
		}
		
		if(this.hitbox5)
		{
			if(this.progress >=8+47+3+93.5 && this.progress<=8+47+3+95 )
			{
				if((player.curx < me.curx && player.curx > me.curx + me.dir* 340)||(player.curx > me.curx && player.curx < me.curx + me.dir* 340))
				{
					player_hit_event();
					this.hitbox5 = false;
				}
			}
		}
		
		if(this.progress > 22 && this.progress < 23)
		{
			sound_boss_blade.play();
		}
		
		if(this.progress > 51 && this.progress < 52)
		{
			sound_boss_blade.play();
		}
		if(this.progress > 8+47+3+92 && this.progress < 8+47+3+93)
		{
			sound_boss_blade.play();
		}
		
		
		if(this.progress > 8+77+8 && this.progress < 8+77+9)
		{
			sound_boss_jump.play();
		}
		
		if(this.progress > 8+77+33+2 && this.progress < 8+77+33+3)
		{
			sound_boss_jump1.play();
		}
		
		if(this.progress > 8+47+3+124)
		{
			me.curstate = 0;//go walk
			me.state[0].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
			this.progress = -10;
			this.hitbox1 = true;
			this.hitbox2 = true;
			this.hitbox3 = true;
			this.hitbox4 = true;
			this.hitbox5 = true;
		}
	};
};

/**
 * boss jump stab state
 */
var Boss_jumpstab = function()
{
	this.keyFrame = new keyFrame();
	this.keyFrame.insertkf(-10, [0,0,0,0,0,0,0,0,0,0,0,0,0]);
	//jump2
	this.keyFrame.insertkf(0, [-0.2,-20,0,-0.3,0,-0.3,-60,-0.3,-0.4,0,0,0,0]);
	this.keyFrame.insertkf(5, [-0.5,-20,-0.9,-1.7,0.6,-0.4,-40,-1.6,-1.1,0,-0.4,-30,-200]);
	this.keyFrame.insertkf(10, [-0.5,-20,-1.0,-1.8,0.6,-0.4,-40,-1.7,-1.2,0,-0.5,-30,-240]);
	this.keyFrame.insertkf(12, [-0.5,-20,-1.0,-1.8,0.6,-0.4,-40,-1.7,-1.2,0,-0.5,-30,-240]);
	this.keyFrame.insertkf(14, [-0.4,-20,-0.0,-0.1,0.6,0.4,-80,-1.2,-0.1,0.5,0.4,-0,-0]);
	this.keyFrame.insertkf(27, [-0.4,-20,-0.0,-0.1,0.6,0.4,-80,-1.2,-0.1,0.5,0.4,-0,-0]);
	//third
	
	this.keyFrame.insertkf(20+20, [-0.15,-0,0.15,-0.8,0.2,0,0,1.3,-1.1,-0.2,0.2,-40,0]);
	this.keyFrame.insertkf(20+23, [-0.2,-0,0.2,-0.9,0.3,0,0,1.4,-1.2,-0.3,0.3,-50,0]);
	this.keyFrame.insertkf(20+24, [-0.9,-0,0.4,-1.1,0.1,0.3,-40,0.3,-1.6,0.7,0.3,0,0]);
	this.keyFrame.insertkf(20+25, [-1.2,20,0.6,-1.2,0.2,0.6,-40,-2.0,0.0,0.9,0.3,50,0]);
	this.keyFrame.insertkf(20+40, [-1.2,20,0.6,-1.2,0.2,0.6,-40,-2.0,0.0,0.9,0.3,50,0]);
	this.keyFrame.insertkf(20+56, [0,0,0,0,0,0,0,0,0,0,0,0,0]);
	
	this.dangerkeyFrame = new keyFrame();//stab attack
	this.dangerkeyFrame.insertkf(20+10, [0.6]);
	this.dangerkeyFrame.insertkf(20+16, [1.5]);
	this.dangerkeyFrame.insertkf(20+23, [1.2]);
	this.dangerkeyFrame.insertkf(20+25, [1]);
	
	this.progress = -10;
	this.hitbox1 = true;
	this.hitbox2 = true;
	
	this.execute = function(me)
	{
		me.draw(this.progress,this.keyFrame);
		this.progress+=globalspeed+0.1;
		if(player.curx > me.curx)
		{
			me.dir = 1;
		}
		else
		{
			me.dir = -1;
		}
		
		if(this.hitbox1)
		{
			if(this.progress >=13 && this.progress<=14 )
			{
				if((player.curx < me.curx && player.curx > me.curx + me.dir* 340)||(player.curx > me.curx && player.curx < me.curx + me.dir* 340))
				{
					player_hit_event();
					this.hitbox1 = false;
				}
			}
		}
		if(this.hitbox2)
		{
			if(this.progress >=20+23.5 && this.progress<=20+25 )
			{
				if((player.curx < me.curx && player.curx > me.curx + me.dir* 380)||(player.curx > me.curx && player.curx < me.curx + me.dir* 380))
				{
					player_hit_event(2);
					this.hitbox2 = false;
				}
			}
		}
		
		if(this.progress> 14 && this.progress < 15)
		{
			cameraShake(0.2);
		}
		
		if(this.progress > 12 && this.progress < 13)
		{
			sound_boss_jump.play();
		}
		
		if(this.progress > 20+10 && this.progress < 20+11)
		{
			sound_danger.play();
		}
		if(this.progress > 20+23 && this.progress < 20+24)
		{
			sound_boss_blade.play();
		}
		
		if(this.progress > 20+10 && this.progress < 20+25)
		{
			pushMatrix();
			translate(me.curx +10,me.y - 220);
			scale(this.dangerkeyFrame.getPos(this.progress)[0]);
			image(me.dangerimg,-60,-60);
			popMatrix();
		}
		if(this.progress > 20+56)
		{
			me.curstate = 0;//go walk
			me.state[0].keyFrame.keyframes[0][1] = this.keyFrame.getPos(this.progress);
			this.progress = -10;
			this.hitbox1 = true;
			this.hitbox2 = true;
		}
	};
};

var boss = new bossCha(1000,350);//originally -50
playertarget.push(boss);
var anim = 1;
// load image
var bk = loadImage("background.png");
var winimg = loadImage("win.png");
var loseimg = loadImage("lose.png");
var menuimg = loadImage("chara_sakura/start.png");
var raindropimg = loadImage("raindrop.png");
var tfring = loadImage("tfring.png");
// time fracture key frame
var timeFracturekeyFrame = new keyFrame();
timeFracturekeyFrame.insertkf(0, [0,0,0]);
timeFracturekeyFrame.insertkf(15, [90,4,1]);
timeFracturekeyFrame.insertkf(30, [90,8,2]);
timeFracturekeyFrame.insertkf(150, [90,8,2]);
timeFracturekeyFrame.insertkf(165, [90,4,1]);
timeFracturekeyFrame.insertkf(180, [0,0,0]);

var progress = 0;
var textbackpos = 195;
var pcamerax = 0;
var camerax = 0;
var cameray = 0;
var endanimprogress = 0;
var kfindex = 0;

/**
 * draw rain drop
 */
var raindrop = function()
{
	this.x = random(1200);
	this.y = -random(600);
	this.speed = 30;
	this.size = random(0.5)+0.5;
	this.maxy = map(this.size,0.5,1,480,590);
	this.draw = function()
	{
		pushMatrix();
		translate(this.x,this.y);
		scale(this.size);
		image(raindropimg,0,0);
		popMatrix();
		this.y += this.speed*map(globalspeed,0.03,0.4,0.03,1)*this.size;
		this.x -= (camerax - pcamerax)*this.size;
		if(this.x < 0)
		{
			this.x = 1200;
		}
		if(this.x > 1200)
		{
			this.x = 0;
		}
	};
};

/**
 * rain system for the game
 */
var rainsys = function(q)
{
	this.raindrops = [];
	this.rainnum = q;
	this.init = function()
	{
		for(var i = 0;i < this.rainnum;i++)
		{
			this.raindrops.push(new raindrop());
		}
	};
	this.draw = function()
	{
		for(var i = 0;i < this.raindrops.length;i++)
		{
			this.raindrops[i].draw();
			if(this.raindrops[i].y > this.raindrops[i].maxy)
			{
				this.raindrops.splice(i,1);
				this.raindrops.push(new raindrop());
			}
		}
	};
};

var rain = new rainsys(500);
rain.init();

// sound system and sound file
var sound_tfenter = new Audio("sound/tf_enter.wav");
var sound_tfexit = new Audio("sound/tf_exit.wav");
var sound_rain = new Audio("sound/rain.wav");
var bgm = new Audio("sound/Sekiro OST - Corrupted Monk.mp3");
var deathbgm = new Audio("sound/Sekiro Death Sound Effect.mp3");
var winbgm = new Audio("sound/Sekiro - Shinobi Execution sound effect.mp3");
var switch_deathbgm = true;

var soundimg = loadImage("sound.png");
var muteimg = loadImage("mute.png");
var bvol = 1;

mouseClicked = function() {
    //gamestat = 1;
	anim += 1;
	//progress += 20;
	//println(progress);
};

var draw = function() {
	background(255,255,255);
	if(gamestat === 0)
	{
		image(bk,0,-50);
		if(progress<120)
		{
			if(progress < 80)
			{
				player.x += 2;
			}
			player.draw(progress,player.run);
		}
		else if(progress<190)
		{
			if(progress >= 145 && progress < 170)
			{
				progress -= 0.35;
			}
			player.draw(progress-120,player.mdownblade);
		}
		else if(progress<210)
		{
			player.x = 250;
			player.dir = -0.5;
			player.bladedir = -1;
			player.draw(progress-190,player.upblade);
		}
		else if(progress<230)
		{
			player.x = 150;
			player.y = 200;
			player.dir = 0.5;
			player.bladedir = 1;
			player.draw(progress-210,player.downblade);
		}
		else if(progress<250)
		{
			player.x = 250;
			player.dir = -0.5;
			player.bladedir = -1;
			player.draw(progress-230,player.upblade);
		}
		else if(progress < 330)
		{
			player.x = 150;
			player.dir = 0.5;
			player.bladedir = 1;
			if(progress < 260)
			{
				player.y = 100;
			}
			else if(progress <= 270)
			{
				player.y += 30;
			}
			player.draw(progress-260,player.downblade);
		}
		else if(progress < 370)
		{
			player.draw(progress-330,player.downtostand);
		}
		else
		{
			player.draw((progress-370)%100,player.stand);
		}
		progress+=1;
		if(progress > 330)
		{
			fill(200 - sin(frameCount/100) * 55, 200 + cos(frameCount/100) * 55, 200 + sin(frameCount/100) * 55);
			textSize(100);
			text("Hongkai Impact 2D", 170, 250)
			textSize(30);
			text("Click To Continue",470,330);
			mouseClicked = function() {
				gamestat = 1;
			};
		}
	}
	else if(gamestat === 1)
	{
		image(bk,0,-50);
		fill(255,255,255);
		stroke(255,255,255);
		textSize(40);
		if(mouseX > 400 && mouseX < 600)
		{
			if(mouseY > 200 && mouseY < 240)
			{
				textbackpos = 195;
			}
			if(mouseY > 260 && mouseY < 330)
			{
				textbackpos = 285;
			}
			if(mouseY > 350 && mouseY < 420)
			{
				textbackpos = 375;
			}
		}
		mouseClicked = function() {
			if(mouseX > 400 && mouseX < 600)
			{
				if(mouseY > 200 && mouseY < 240)
				{
					//gamestat = 2;
					gamestat = 4;
				}
				if(mouseY > 260 && mouseY < 330)
				{
					gamestat = 3;
				}
				if(mouseY > 350 && mouseY < 420)
				{
					if (difficulty === 1) {
						difficulty = 2;
						player.maxhp = 50;
						player.HP = 50;
					} else {
						difficulty = 1;
						player.maxhp = 10;
						player.HP = 10;
					}
				}
			}
		};
		if(progress > 100)
		{
			progress = 0;
		}
		progress+=1;
		player.draw(progress,player.stand);
		fill(255,255,255);
		image(menuimg,500,textbackpos);
		text("PLAY",525,240);
		text("HELP",525,330);
		text("MODE",525,420);
		if(difficulty === 1) {
			text("HARD",670,420);
		} else {
			text("EASY",670,420);
		}
		textSize(15);
		text("Created by: Fulan Li, Ruichang Chen",25,570);
	}
	else if(gamestat === 2)
	{
		image(bk,0,-50);
		fill(255,255,255);
		stroke(255,255,255);
		progress+=1;
		player.draw(progress,player.stand);
		textSize(40);
		text("PLAY mode, under construction,\nclick to go back",170,250);
		mouseClicked = function() {
			gamestat = 1;
		};
		if(progress > 100)
		{
			progress = 0;
		}
	}
	else if(gamestat === 3)
	{
		image(bk,0,-50);
		progress+=1;
		player.draw(progress,player.stand);
		fill(255,255,255);
		stroke(255,255,255);
		textSize(40);
		text("HELP mode, click to go back",350,80);
		textSize(30);
		text("Movement Control: Use A or D to move left or right",300,140);
		text("Attack: Use J to attack",300,190);
		text("JJJ for combo attack", 400, 240);
		text("Evade: Use K to evade",300,290);
		text("If successful evade an attack, time fracture will be trigger.", 400, 340);
		text("Time fracture have an cooldown of 12 seconds which", 400, 390);
		text("indicated by yellow circle", 400, 440);
		text("Ultimate: When energy is greater than 15, Press I for ultimate", 300, 490);
		text("If press right before an incoming attack, perfect", 400, 540);
		text("counterattack will be triggered", 400, 590);

		
		mouseClicked = function() {
			gamestat = 1;
		};
		if(progress > 100)
		{
			progress = 0;
		}
	}
	else if(gamestat === 4)
	{
		sound_rain.play();
		bgm.play();
		pushMatrix();
		pcamerax = camerax;
		if(camerax < player.curx)
		{
			camerax+=min((player.curx - camerax)/15,10);
			//camerax+=(player.curx - camerax)/15;
		}
		else if(camerax > player.curx)
		{
			camerax-=min((camerax-player.curx)/15,10);
			//camerax-=(camerax-player.curx)/15;
		}
		if(camerashakeFrame > frameCount)
		{
			cameray = ((frameCount%7)-3)*shakeintensity;
			//camerax+= (noise(frameCount/10)-0.5)*80;
		}
		else
		{
			cameray = 0;
		}
		camerax = max(min(camerax,1374+174+500),500-2748);
		translate(500-camerax,cameray);
		scale(-1,1);
		image(bk,0,-50);
		image(bk,-2748,-50);
		scale(-1,1);
		image(bk,0,-50);
		image(bk,-2748,-50);
		if (timefractureFrame > frameCount)
		{
			globalspeed = 0.03;
			playerspeed = 0.125;
			sound_rain.volume = 0.2;
		}
		else if(extra_timefractureFrame > frameCount)
		{
			playerspeed = 1;
			noStroke();
			fill(31, 24, 112,timeFracturekeyFrame.getPos(frameCount-timefractureFrame)[0]);
			rect(player.curx-1200,0,2400,600);
			pushMatrix();
			translate(player.curx,400);
			scale(timeFracturekeyFrame.getPos(frameCount-timefractureFrame)[1]);
			rotate(timeFracturekeyFrame.getPos(frameCount-timefractureFrame)[2]);
			image(tfring,-300,-300);
			//fill(255,0,0);
			//ellipse(0,0,30,30);
			popMatrix();
			if(frameCount-timefractureFrame < 5)
			{
				sound_tfenter.play();
			}
			if(frameCount-timefractureFrame > 150 && frameCount-timefractureFrame < 160)
			{
				sound_tfexit.play();
			}
			sound_rain.volume = 0.2;
			bgm.volume = 0.1*bvol;
			
		}
		else
		{
			playerspeed = 1;
			globalspeed = 0.4;
			sound_rain.volume = 0.5;
			bgm.volume = 0.2*bvol;
		}
		player.state[player.curstate].execute(player);
		boss.state[boss.curstate].execute(boss);
		popMatrix();
		noFill();
		strokeWeight(3);
		stroke(255, 247, 0);
		arc(550, 540, 50,50, -(player.evadeCD)/player_evade_cooldown*2*PI-PI/2, -PI/2);
		if(player.sp >= 15)
		{
			fill(255, 247, 30,100);
			noStroke();
			ellipse(700, 540, 50,50);
		}
		else
		{
			fill(200, 200, 200,100);
			noStroke();
			ellipse(700, 540, 50,50);
		}
		fill(0,0,0,50);
		noStroke();
		arc(700, 540, 45, 45, -(player.ultcd)/player_ult_cooldown*2*PI-PI/2, -PI/2);
		noFill();
		stroke(255, 247, 30,40);
		strokeWeight(5);
		line(400,580,800,580);
		stroke(255, 247, 30);
		strokeWeight(3);
		if(player.sp > player.maxsp)
		{
			player.sp = player.maxsp;
		}
		line(400,580,400+player.sp/player.maxsp*400,580);
		fill(255, 247, 0);
		text(player.sp+"/"+player.maxsp,810,585);
		
		//audio0.play();
		mouseClicked = function() {
			//audio1.play();
			if(mouseX > 1100 && mouseX < 1155)
			{
				if(mouseY > 50 && mouseY < 95)
				{
					if(bvol === 1)
					{
						bvol = 0;
					}
					else
					{
						bvol = 1;
					}
				}
			}
		};
		if(boss.HP <= 0)
		{
			gamestat = 6;
		}
		if(player.HP <= 0)
		{
			gamestat = 7;
			deathbgm.play();
			deathbgm.volume = 0.5;
		}
		rain.draw();
		
		if(bvol === 1)
		{
			image(soundimg,1100,50,55,45);
		}
		else
		{
			image(muteimg,1100,50,55,45);
		}
	}
	else if(gamestat === 5)
	{
		background(255,255,255);
		player.x = 200;
		boss.x = 300;
		//var editingkf = player.state[2].keyFrame;
		var editingkf = boss.state[7].keyFrame;
		if(anim%2 === 0)
		{
			progress +=0.42;
			fill(255,0,0);
			ellipse(50,200,50,50);
		}
		else if(pkeyArray[RIGHT] === 0 && keyArray[RIGHT] === 1)
		{
			kfindex += 1;
			var num = kfindex%editingkf.keyframes.length;
			progress = editingkf.keyframes[num][0];
		}
		else if(pkeyArray[LEFT] === 0 && keyArray[LEFT] === 1)
		{
			kfindex -= 1;
			if(kfindex<0)
			{
				kfindex += editingkf.keyframes.length;
			}
			var num = kfindex%editingkf.keyframes.length;
			progress = editingkf.keyframes[num][0];
		}
		text(progress,150,200);
		pkeyArray[RIGHT] = keyArray[RIGHT];
		pkeyArray[LEFT] = keyArray[LEFT];
		
		if(progress > editingkf.keyframes[editingkf.keyframes.length-1][0] + 30)
		{
			progress = 0;
		}
		boss.draw(progress,editingkf);
		//boss.state[4].execute(boss);
		//player.bladedir = -1;
		//player.draw(progress,editingkf);
		//player.state[9].execute(player);
		line(0,480,1200,480);
		line(550,500,550,300);
	}
	else if(gamestat === 6)//win
	{
		pushMatrix();
		
		translate(500-camerax,cameray);
		scale(-1,1);
		image(bk,0,-50);
		image(bk,-2748,-50);
		scale(-1,1);
		image(bk,0,-50);
		image(bk,-2748,-50);
		player.state[player.curstate].execute(player);
		boss.state[4].execute(boss);
		popMatrix();
		if(boss.state[4].progress > 300)
		{
			noStroke();
			fill(0,0,0,endanimprogress);
			rect(0,0,1200,600);
			if(endanimprogress < 150)
			{
				endanimprogress+=3;
			}
			image(winimg,0,0);
			winbgm.volume = 0.3;
			if(switch_deathbgm)
			{
				winbgm.play();
				switch_deathbgm = false;
			}
		}
		fill(255,255,255);
		textSize(40);
		text("Replay",540,535);
		noFill();
		stroke(255,255,255);
		rect(500,500,200,50);
		mouseClicked = function() {
			if(mouseX > 500 && mouseX < 700)
			{
				if(mouseY > 500 && mouseY < 550)
				{
					gamestat = 1;
					player.x = 100;
					if (difficulty === 2) {
						player.maxhp = 50;
						player.HP = 50;
					} else {
						player.maxhp = 10;
						player.HP = 10;
					}
					player.sp = 15;
					boss.x = 1000;
					boss.HP = boss.maxhp;
					boss.secondphase = false;
					switch_deathbgm = true;
					boss.state[4].progress = 0;
					endanimprogress = 0;
				}
			}
		};
	}
	else if(gamestat === 7)//lose
	{
		pushMatrix();
		
		
		translate(500-camerax,cameray);
		scale(-1,1);
		image(bk,0,-50);
		image(bk,-2748,-50);
		scale(-1,1);
		image(bk,0,-50);
		image(bk,-2748,-50);
		player.curstate = 8;
		player.state[player.curstate].execute(player);
		boss.state[boss.curstate].execute(boss);
		popMatrix();
		noStroke();
		fill(0,0,0,endanimprogress);
		rect(0,0,1200,600);
		if(endanimprogress < 350)
		{
			endanimprogress+=2;
		}
		image(loseimg,0,0);
		fill(255,0,0);
		textSize(40);
		text("Replay",540,535);
		noFill();
		stroke(255,0,0);
		rect(500,500,200,50);
		mouseClicked = function() {
			if(mouseX > 500 && mouseX < 700)
			{
				if(mouseY > 500 && mouseY < 550)
				{
					gamestat = 1;
					player.x = 100;
					if (difficulty === 2) {
						player.maxhp = 50;
						player.HP = 50;
					} else {
						player.maxhp = 10;
						player.HP = 10;
					}
					player.sp = 15;
					boss.x = 1000;//originally -50
					boss.HP = boss.maxhp;
					boss.secondphase = false;
					endanimprogress = 0;
					player.state[8].progress = 0;
					player.curstate = 0;
				}
			}
		};
	}
	
};

}};
