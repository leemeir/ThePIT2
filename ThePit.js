(function (cjs, an) {

var p; // shortcut to reference prototypes
var lib={};var ss={};var img={};
lib.ssMetadata = [
		{name:"ThePit_atlas_1", frames: [[1131,853,740,740],[1131,0,851,851],[0,1011,740,740],[0,0,1129,1009]]},
		{name:"ThePit_atlas_2", frames: [[0,0,963,553],[965,0,858,475],[965,477,414,883],[1381,477,356,875],[0,555,508,879],[510,555,419,876],[0,1436,1366,318]]},
		{name:"ThePit_atlas_3", frames: [[1676,685,311,887],[728,915,306,880],[418,915,308,884],[1255,685,419,680],[938,0,419,683],[0,915,416,683],[1359,0,419,683],[0,685,1253,228],[0,0,936,328]]},
		{name:"ThePit_atlas_4", frames: [[542,1299,572,251],[542,1016,713,281],[1116,1573,270,311],[542,1552,572,251],[0,1665,216,249],[1116,1299,121,121],[1574,1524,384,248],[0,0,303,881],[1574,763,78,118],[305,0,358,721],[1291,763,281,808],[1683,757,303,765],[1345,0,336,761],[1683,0,327,755],[1006,0,337,760],[1574,883,62,45],[450,1805,246,115],[218,1787,230,147],[665,0,339,759],[273,1016,267,769],[0,883,271,780],[305,723,312,10],[1388,1774,312,209],[305,762,984,252],[1702,1774,309,207]]}
];


(lib.AnMovieClip = function(){
	this.actionFrames = [];
	this.ignorePause = false;
	this.currentSoundStreamInMovieclip;
	this.soundStreamDuration = new Map();
	this.streamSoundSymbolsList = [];

	this.gotoAndPlayForStreamSoundSync = function(positionOrLabel){
		cjs.MovieClip.prototype.gotoAndPlay.call(this,positionOrLabel);
	}
	this.gotoAndPlay = function(positionOrLabel){
		this.clearAllSoundStreams();
		var pos = this.timeline.resolve(positionOrLabel);
		if (pos != null) { this.startStreamSoundsForTargetedFrame(pos); }
		cjs.MovieClip.prototype.gotoAndPlay.call(this,positionOrLabel);
	}
	this.play = function(){
		this.clearAllSoundStreams();
		this.startStreamSoundsForTargetedFrame(this.currentFrame);
		cjs.MovieClip.prototype.play.call(this);
	}
	this.gotoAndStop = function(positionOrLabel){
		cjs.MovieClip.prototype.gotoAndStop.call(this,positionOrLabel);
		this.clearAllSoundStreams();
	}
	this.stop = function(){
		cjs.MovieClip.prototype.stop.call(this);
		this.clearAllSoundStreams();
	}
	this.startStreamSoundsForTargetedFrame = function(targetFrame){
		for(var index=0; index<this.streamSoundSymbolsList.length; index++){
			if(index <= targetFrame && this.streamSoundSymbolsList[index] != undefined){
				for(var i=0; i<this.streamSoundSymbolsList[index].length; i++){
					var sound = this.streamSoundSymbolsList[index][i];
					if(sound.endFrame > targetFrame){
						var targetPosition = Math.abs((((targetFrame - sound.startFrame)/lib.properties.fps) * 1000));
						var instance = playSound(sound.id);
						var remainingLoop = 0;
						if(sound.offset){
							targetPosition = targetPosition + sound.offset;
						}
						else if(sound.loop > 1){
							var loop = targetPosition /instance.duration;
							remainingLoop = Math.floor(sound.loop - loop);
							if(targetPosition == 0){ remainingLoop -= 1; }
							targetPosition = targetPosition % instance.duration;
						}
						instance.loop = remainingLoop;
						instance.position = Math.round(targetPosition);
						this.InsertIntoSoundStreamData(instance, sound.startFrame, sound.endFrame, sound.loop , sound.offset);
					}
				}
			}
		}
	}
	this.InsertIntoSoundStreamData = function(soundInstance, startIndex, endIndex, loopValue, offsetValue){ 
 		this.soundStreamDuration.set({instance:soundInstance}, {start: startIndex, end:endIndex, loop:loopValue, offset:offsetValue});
	}
	this.clearAllSoundStreams = function(){
		this.soundStreamDuration.forEach(function(value,key){
			key.instance.stop();
		});
 		this.soundStreamDuration.clear();
		this.currentSoundStreamInMovieclip = undefined;
	}
	this.stopSoundStreams = function(currentFrame){
		if(this.soundStreamDuration.size > 0){
			var _this = this;
			this.soundStreamDuration.forEach(function(value,key,arr){
				if((value.end) == currentFrame){
					key.instance.stop();
					if(_this.currentSoundStreamInMovieclip == key) { _this.currentSoundStreamInMovieclip = undefined; }
					arr.delete(key);
				}
			});
		}
	}

	this.computeCurrentSoundStreamInstance = function(currentFrame){
		if(this.currentSoundStreamInMovieclip == undefined){
			var _this = this;
			if(this.soundStreamDuration.size > 0){
				var maxDuration = 0;
				this.soundStreamDuration.forEach(function(value,key){
					if(value.end > maxDuration){
						maxDuration = value.end;
						_this.currentSoundStreamInMovieclip = key;
					}
				});
			}
		}
	}
	this.getDesiredFrame = function(currentFrame, calculatedDesiredFrame){
		for(var frameIndex in this.actionFrames){
			if((frameIndex > currentFrame) && (frameIndex < calculatedDesiredFrame)){
				return frameIndex;
			}
		}
		return calculatedDesiredFrame;
	}

	this.syncStreamSounds = function(){
		this.stopSoundStreams(this.currentFrame);
		this.computeCurrentSoundStreamInstance(this.currentFrame);
		if(this.currentSoundStreamInMovieclip != undefined){
			var soundInstance = this.currentSoundStreamInMovieclip.instance;
			if(soundInstance.position != 0){
				var soundValue = this.soundStreamDuration.get(this.currentSoundStreamInMovieclip);
				var soundPosition = (soundValue.offset?(soundInstance.position - soundValue.offset): soundInstance.position);
				var calculatedDesiredFrame = (soundValue.start)+((soundPosition/1000) * lib.properties.fps);
				if(soundValue.loop > 1){
					calculatedDesiredFrame +=(((((soundValue.loop - soundInstance.loop -1)*soundInstance.duration)) / 1000) * lib.properties.fps);
				}
				calculatedDesiredFrame = Math.floor(calculatedDesiredFrame);
				var deltaFrame = calculatedDesiredFrame - this.currentFrame;
				if((deltaFrame >= 0) && this.ignorePause){
					cjs.MovieClip.prototype.play.call(this);
					this.ignorePause = false;
				}
				else if(deltaFrame >= 2){
					this.gotoAndPlayForStreamSoundSync(this.getDesiredFrame(this.currentFrame,calculatedDesiredFrame));
				}
				else if(deltaFrame <= -2){
					cjs.MovieClip.prototype.stop.call(this);
					this.ignorePause = true;
				}
			}
		}
	}
}).prototype = p = new cjs.MovieClip();
// symbols:



(lib.CachedBmp_55 = function() {
	this.initialize(ss["ThePit_atlas_4"]);
	this.gotoAndStop(0);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_53 = function() {
	this.initialize(ss["ThePit_atlas_4"]);
	this.gotoAndStop(1);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_52 = function() {
	this.initialize(ss["ThePit_atlas_4"]);
	this.gotoAndStop(2);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_51 = function() {
	this.initialize(ss["ThePit_atlas_4"]);
	this.gotoAndStop(3);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_54 = function() {
	this.initialize(ss["ThePit_atlas_4"]);
	this.gotoAndStop(4);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_49 = function() {
	this.initialize(ss["ThePit_atlas_1"]);
	this.gotoAndStop(0);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_48 = function() {
	this.initialize(ss["ThePit_atlas_1"]);
	this.gotoAndStop(1);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_47 = function() {
	this.initialize(ss["ThePit_atlas_1"]);
	this.gotoAndStop(2);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_46 = function() {
	this.initialize(ss["ThePit_atlas_4"]);
	this.gotoAndStop(5);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_45 = function() {
	this.initialize(ss["ThePit_atlas_4"]);
	this.gotoAndStop(6);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_44 = function() {
	this.initialize(ss["ThePit_atlas_2"]);
	this.gotoAndStop(0);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_43 = function() {
	this.initialize(ss["ThePit_atlas_2"]);
	this.gotoAndStop(1);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_42 = function() {
	this.initialize(ss["ThePit_atlas_4"]);
	this.gotoAndStop(7);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_41 = function() {
	this.initialize(ss["ThePit_atlas_3"]);
	this.gotoAndStop(0);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_40 = function() {
	this.initialize(ss["ThePit_atlas_2"]);
	this.gotoAndStop(2);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_39 = function() {
	this.initialize(ss["ThePit_atlas_2"]);
	this.gotoAndStop(3);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_38 = function() {
	this.initialize(ss["ThePit_atlas_3"]);
	this.gotoAndStop(1);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_37 = function() {
	this.initialize(ss["ThePit_atlas_3"]);
	this.gotoAndStop(2);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_36 = function() {
	this.initialize(ss["ThePit_atlas_2"]);
	this.gotoAndStop(4);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_35 = function() {
	this.initialize(ss["ThePit_atlas_2"]);
	this.gotoAndStop(5);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_34 = function() {
	this.initialize(ss["ThePit_atlas_3"]);
	this.gotoAndStop(3);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_33 = function() {
	this.initialize(ss["ThePit_atlas_3"]);
	this.gotoAndStop(4);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_32 = function() {
	this.initialize(ss["ThePit_atlas_3"]);
	this.gotoAndStop(5);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_31 = function() {
	this.initialize(ss["ThePit_atlas_3"]);
	this.gotoAndStop(6);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_30 = function() {
	this.initialize(ss["ThePit_atlas_4"]);
	this.gotoAndStop(8);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_29 = function() {
	this.initialize(ss["ThePit_atlas_4"]);
	this.gotoAndStop(9);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_28 = function() {
	this.initialize(ss["ThePit_atlas_4"]);
	this.gotoAndStop(10);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_27 = function() {
	this.initialize(ss["ThePit_atlas_4"]);
	this.gotoAndStop(11);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_26 = function() {
	this.initialize(ss["ThePit_atlas_4"]);
	this.gotoAndStop(12);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_25 = function() {
	this.initialize(ss["ThePit_atlas_4"]);
	this.gotoAndStop(13);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_24 = function() {
	this.initialize(ss["ThePit_atlas_4"]);
	this.gotoAndStop(14);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_23 = function() {
	this.initialize(ss["ThePit_atlas_4"]);
	this.gotoAndStop(15);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_22 = function() {
	this.initialize(ss["ThePit_atlas_4"]);
	this.gotoAndStop(16);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_21 = function() {
	this.initialize(ss["ThePit_atlas_4"]);
	this.gotoAndStop(17);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_20 = function() {
	this.initialize(ss["ThePit_atlas_4"]);
	this.gotoAndStop(18);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_19 = function() {
	this.initialize(ss["ThePit_atlas_4"]);
	this.gotoAndStop(19);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_18 = function() {
	this.initialize(ss["ThePit_atlas_4"]);
	this.gotoAndStop(20);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_17 = function() {
	this.initialize(ss["ThePit_atlas_4"]);
	this.gotoAndStop(21);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_16 = function() {
	this.initialize(ss["ThePit_atlas_4"]);
	this.gotoAndStop(22);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_15 = function() {
	this.initialize(img.CachedBmp_15);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,2491,564);


(lib.CachedBmp_14 = function() {
	this.initialize(img.CachedBmp_14);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,3408,640);


(lib.CachedBmp_13 = function() {
	this.initialize(ss["ThePit_atlas_4"]);
	this.gotoAndStop(23);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_12 = function() {
	this.initialize(ss["ThePit_atlas_2"]);
	this.gotoAndStop(6);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_11 = function() {
	this.initialize(img.CachedBmp_11);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,3372,1601);


(lib.CachedBmp_10 = function() {
	this.initialize(img.CachedBmp_10);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,3372,1601);


(lib.CachedBmp_56 = function() {
	this.initialize(img.CachedBmp_56);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,2627,1774);


(lib.CachedBmp_8 = function() {
	this.initialize(img.CachedBmp_8);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,3142,1578);


(lib.CachedBmp_7 = function() {
	this.initialize(img.CachedBmp_7);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,2641,714);


(lib.CachedBmp_6 = function() {
	this.initialize(img.CachedBmp_6);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,2579,1656);


(lib.CachedBmp_5 = function() {
	this.initialize(ss["ThePit_atlas_1"]);
	this.gotoAndStop(3);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_4 = function() {
	this.initialize(ss["ThePit_atlas_4"]);
	this.gotoAndStop(24);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_3 = function() {
	this.initialize(img.CachedBmp_3);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,2563,1805);


(lib.CachedBmp_2 = function() {
	this.initialize(ss["ThePit_atlas_3"]);
	this.gotoAndStop(7);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_1 = function() {
	this.initialize(ss["ThePit_atlas_3"]);
	this.gotoAndStop(8);
}).prototype = p = new cjs.Sprite();
// helper functions:

function mc_symbol_clone() {
	var clone = this._cloneProps(new this.constructor(this.mode, this.startPosition, this.loop, this.reversed));
	clone.gotoAndStop(this.currentFrame);
	clone.paused = this.paused;
	clone.framerate = this.framerate;
	return clone;
}

function getMCSymbolPrototype(symbol, nominalBounds, frameBounds) {
	var prototype = cjs.extend(symbol, cjs.MovieClip);
	prototype.clone = mc_symbol_clone;
	prototype.nominalBounds = nominalBounds;
	prototype.frameBounds = frameBounds;
	return prototype;
	}


(lib.סיום = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#2B2B2A").s().p("AlQFRQiMiMABjFQgBjECMiMQCMiLDEAAQDFAACMCLQCMCLAADFQAADFiMCMQiMCLjFAAQjEAAiMiLg");
	this.shape.setTransform(11.65,11.65,0.2448,0.2448,0,0,0,-0.1,-0.1);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,23.4,23.4);


(lib.button = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.CachedBmp_47();
	this.instance.setTransform(-5.1,-5.1,0.5,0.5);

	this.instance_1 = new lib.CachedBmp_48();
	this.instance_1.setTransform(-32.9,-32.9,0.5,0.5);

	this.instance_2 = new lib.CachedBmp_49();
	this.instance_2.setTransform(-5.1,-5.1,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance}]}).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_2}]},1).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-32.9,-32.9,425.5,425.5);


(lib.Ellipse = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#2B2B2A").ss(3).p("AOXAAQAAC7hICrQhGClh/B/Qh/B/ilBGQirBIi7AAQi6AAirhIQilhGh/h/Qh/h/hGilQhIirAAi7QAAi6BIirQBGilB/h/QB/h/ClhGQCrhIC6AAQC7AACrBIQClBGB/B/QB/B/BGClQBICrAAC6g");
	this.shape.setTransform(93.425,93.425);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FFFFFF").s().p("AllNPQilhGh/h/Qh/h/hGilQhIirAAi7QAAi6BIirQBGilB/h/QB/h/ClhGQCrhIC6AAQC7AACrBIQClBGB/B/QB/B/BGClQBICrAAC6QAAC7hICrQhGClh/B/Qh/B/ilBGQirBIi7AAQi6AAirhIg");
	this.shape_1.setTransform(93.425,93.425);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.Ellipse, new cjs.Rectangle(0.1,0.1,186.70000000000002,186.70000000000002), null);


(lib.Symbol2 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.CachedBmp_46();
	this.instance.setTransform(0,0,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.Symbol2, new cjs.Rectangle(0,0,60.5,60.5), null);


(lib.Symbol1 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.CachedBmp_45();
	this.instance.setTransform(-0.5,0,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.Symbol1, new cjs.Rectangle(-0.5,0,192,124), null);


(lib.Symbol4 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.CachedBmp_44();
	this.instance.setTransform(79.45,24.45,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.Symbol4, new cjs.Rectangle(79.5,24.5,481.5,276.5), null);


(lib.Symbol3 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.CachedBmp_43();
	this.instance.setTransform(-0.45,-0.45,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.Symbol3, new cjs.Rectangle(-0.4,-0.4,429,237.5), null);


(lib.Symbol12 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.CachedBmp_42();
	this.instance.setTransform(-0.3,-0.15,0.4351,0.4351);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.Symbol12, new cjs.Rectangle(-0.3,-0.1,131.9,383.3), null);


(lib.Symbol7 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.CachedBmp_41();
	this.instance.setTransform(-1.45,-0.1,0.3436,0.3436);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.Symbol7, new cjs.Rectangle(-1.4,-0.1,106.80000000000001,304.8), null);


(lib.Symbol6 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.CachedBmp_40();
	this.instance.setTransform(-0.45,-0.05,0.3273,0.3273);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.Symbol6, new cjs.Rectangle(-0.4,0,135.5,289), null);


(lib.Symbol5 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.CachedBmp_39();
	this.instance.setTransform(-0.5,-0.15,0.3266,0.3266);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.Symbol5, new cjs.Rectangle(-0.5,-0.1,116.3,285.70000000000005), null);


(lib.Symbol4_1 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance_1 = new lib.CachedBmp_38();
	this.instance_1.setTransform(-0.75,-0.5,0.3206,0.3206);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.Symbol4_1, new cjs.Rectangle(-0.7,-0.5,98.10000000000001,282.1), null);


(lib.Symbol3_1 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance_1 = new lib.CachedBmp_37();
	this.instance_1.setTransform(-0.55,0,0.315,0.315);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.Symbol3_1, new cjs.Rectangle(-0.5,0,97,278.5), null);


(lib.Symbol2_1 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance_1 = new lib.CachedBmp_36();
	this.instance_1.setTransform(-2.1,0,0.2982,0.2982);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.Symbol2_1, new cjs.Rectangle(-2.1,0,151.5,262.2), null);


(lib.Symbol1_1 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance_1 = new lib.CachedBmp_35();
	this.instance_1.setTransform(-0.7,-0.05,0.2627,0.2627);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.Symbol1_1, new cjs.Rectangle(-0.7,0,110.10000000000001,230.1), null);


(lib.Tween17 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.CachedBmp_33();
	this.instance.setTransform(-72.5,-118.9,0.3503,0.3503);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-72.5,-118.9,146.8,239.3);


(lib.Tween16 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.CachedBmp_32();
	this.instance.setTransform(-72.55,-118.85,0.3503,0.3503);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-72.5,-118.8,145.7,239.2);


(lib.Tween15 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.CachedBmp_31();
	this.instance.setTransform(-72.55,-118.85,0.3503,0.3503);

	this.instance_1 = new lib.CachedBmp_30();
	this.instance_1.setTransform(-5,-29.45,0.3503,0.3503);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_1},{t:this.instance}]}).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-72.5,-118.8,146.7,239.2);


(lib.מתנשף10 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.CachedBmp_29();
	this.instance.setTransform(-0.5,0,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.מתנשף10, new cjs.Rectangle(-0.5,0,179,360.5), null);


(lib.מתנשף9 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.CachedBmp_28();
	this.instance.setTransform(-0.9,0,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-0.9,0,140.5,404);


(lib.מתנשף8 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.CachedBmp_27();
	this.instance.setTransform(-0.35,0,0.2677,0.2677);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-0.3,0,81.1,204.8);


(lib.מתנשף7 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.CachedBmp_26();
	this.instance.setTransform(-0.75,-0.05,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-0.7,0,168,380.5);


(lib.מתנשף6 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.CachedBmp_25();
	this.instance.setTransform(-0.5,0,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-0.5,0,163.5,377.5);


(lib.מתנשף5 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.CachedBmp_24();
	this.instance.setTransform(-0.75,0,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-0.7,0,168.5,380);


(lib.טיפות1 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.CachedBmp_23();
	this.instance.setTransform(-11.75,-8.25,0.3754,0.3754);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-11.7,-8.2,23.299999999999997,16.9);


(lib.בועה = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// flash0_ai
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#2B2B2A").p("AhZAkQgaAnAKA0QAJAwAiAlQAWAYAbAOQAcAPAeAAQAfAAAbgSQAcgSAIgdQAjAcAoAOQArAPApgFQAsgFAjgcQAjgeAJgpQAHgegJggQgIgfgUgZQgjgshEgcQAjgXAUgeQAYgigCgkQgDgrgmgeQgmgdgsAEQgrAEgiAgQghAfgMAsQg5gVgvARQgZAKgSAUQgTAWgCAaQiXAIi0guQCXAuCLBqg");
	this.shape.setTransform(-23.5686,-7.4084,0.3704,0.3704);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#F6F6F6").s().p("AAXEJQgdAAgdgPQgbgOgWgYQgiglgJgwQgKg0AagnQiLhqiXguQC0AuCXgIQACgaATgWQASgUAagKQAugRA5AVQAMgsAhgfQAiggArgEQAsgEAmAdQAmAeADArQACAkgYAiQgUAegjAXQBEAcAjAsQAUAZAIAfQAJAggHAeQgJApgjAeQgjAcgsAFQgpAFgrgPQgogOgjgcQgIAdgcASQgaASgeAAIgCAAg");
	this.shape_1.setTransform(-22.7494,-7.4084,0.3704,0.3704);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f().s("#2B2B2A").p("AjBg3QBWAWBJgEQAAgMAJgLQAJgJAMgFQAWgIAbAKQAGgVAQgPQAQgPAVgCQAVgCASAOQASAOABAVQABARgLAQQgKAPgQALQAgANARAUQAJANAEAOQAFAPgEAPQgEAUgRAOQgRANgUADQgUACgVgHQgTgHgRgNQgEANgNAJQgNAJgPAAQgNAAgOgHQgNgHgKgLQgRgSgEgXQgFgZANgSQhDgzhIgWg");
	this.shape_2.setTransform(-18.2104,-6.0125);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#F6F6F6").s().p("AgQB4QgNgHgLgLQgQgSgFgXQgEgZAMgSQhCgzhJgWQBWAWBJgEQABgMAJgLQAIgJANgFQAWgIAbAKQAFgVAQgPQAQgPAVgCQAVgCASAOQATAOABAVQAAARgLAQQgJAPgRALQAhANAQAUQAKANAEAOQAEAPgDAPQgFAUgQAOQgRANgVADQgUACgVgHQgTgHgQgNQgEANgNAJQgNAJgPAAQgOAAgNgHg");
	this.shape_3.setTransform(-18.3984,-6.0125);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f().s("#2B2B2A").p("AjthEQBqAbBZgFQABgPALgMQAKgMAPgGQAcgKAhAMQAGgZAUgTQAUgTAZgCQAagCAWARQAXARABAaQABAUgNAVQgMARgVAOQAoAQAUAZQAMAPAFASQAFATgEASQgFAYgVARQgUARgaADQgYADgZgJQgYgIgUgRQgFARgQALQgQAKgSAAQgRAAgRgIQgPgIgOgPQgUgVgFgdQgGgeAPgXQhRg+hZgbg");
	this.shape_4.setTransform(-13.8731,-4.6355);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#F6F6F6").s().p("AgUCTQgPgIgOgPQgUgVgFgdQgGgeAPgXQhRg+hZgbQBqAbBZgFQABgPALgMQAKgMAPgGQAcgKAhAMQAGgZAUgTQAUgTAZgCQAagCAWARQAXARABAaQABAUgNAVQgMARgVAOQAoAQAUAZQAMAPAFASQAFATgEASQgFAYgVARQgUARgaADQgYADgZgJQgYgIgUgRQgFARgQALQgQAKgSAAQgRAAgRgIg");
	this.shape_5.setTransform(-14.0611,-4.6355);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f().s("#2B2B2A").p("AkYhQQB9AgBpgGQABgSAOgPQAMgOASgHQAggMAoAOQAHgeAXgVQAYgXAegDQAfgDAaAVQAbAVABAeQABAYgQAYQgOAVgYAQQAwAUAXAeQAOARAGAVQAGAXgEAUQgHAdgYAVQgYAUgfADQgdADgegKQgcgJgXgUQgGAUgTANQgTAMgWAAQgUAAgTgLQgTgJgQgRQgXgZgHgiQgGgkARgbQhghKhpgfg");
	this.shape_6.setTransform(-9.52,-3.2428);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#F6F6F6").s().p("AAQC4QgUAAgTgLQgTgJgQgRQgXgZgHgiQgGgkARgbQhghKhpgfQB9AgBpgGQABgSAOgPQAMgOASgHQAggMAoAOQAHgeAXgVQAYgXAegDQAfgDAaAVQAbAVABAeQABAYgQAYQgOAVgYAQQAwAUAXAeQAOARAGAVQAGAXgEAUQgHAdgYAVQgYAUgfADQgdADgegKQgcgJgXgUQgGAUgTANQgTAMgVAAIgBAAg");
	this.shape_7.setTransform(-9.708,-3.2428);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f().s("#2B2B2A").p("AlEhdQCRAlB5gHQACgUAPgSQAOgQAVgIQAlgOAuARQAJgjAbgZQAbgaAjgDQAjgEAfAYQAeAYACAjQACAcgTAcQgQAYgcASQA3AXAbAjQAQAUAHAYQAHAagFAYQgIAigcAXQgcAXgjAEQghAEgjgMQgggLgcgXQgGAXgXAPQgVAPgagBQgWAAgXgMQgWgLgSgTQgbgdgIgnQgHgqAUgfQhvhVh6glg");
	this.shape_8.setTransform(-5.1828,-1.8464);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#F6F6F6").s().p("AASDUQgWAAgXgMQgWgLgSgTQgbgdgIgnQgHgqAUgfQhvhVh6glQCRAlB5gHQACgUAPgSQAOgQAVgIQAlgOAuARQAJgjAbgZQAbgaAjgDQAjgEAfAYQAeAYACAjQACAcgTAcQgQAYgcASQA3AXAbAjQAQAUAHAYQAHAagFAYQgIAigcAXQgcAXgjAEQghAEgjgMQgggLgcgXQgGAXgXAPQgVAOgYAAIgCAAg");
	this.shape_9.setTransform(-5.3708,-1.8464);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f().s("#2B2B2A").p("AlvhpQCkAqCKgIQABgXASgUQAQgTAXgIQArgQA0ATQAKgoAegcQAfgdAogEQAogEAiAbQAjAbACAnQACAggVAgQgTAbgfAVQA+AaAfAnQASAYAIAbQAIAdgGAcQgJAmggAaQgfAagoAFQgmAEgngOQglgMgfgaQgIAagZARQgZARgcgBQgaAAgagNQgZgNgUgVQgfgigJgsQgIgwAXgjQh+hhiKgpg");
	this.shape_10.setTransform(-0.8335,-0.4501);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#F6F6F6").s().p("AAVDxQgaAAgagNQgZgNgUgVQgfgigJgtQgIgvAXgjQh+hhiKgpQCkAqCKgIQABgYASgTQAQgTAXgIQArgRA0AUQAKgoAegdQAfgdAogDQAogFAiAbQAjAcACAnQACAggVAgQgTAbgfAVQA+AaAfAnQASAYAIAbQAIAdgGAbQgJAmggAbQgfAagoAFQgmADgngNQglgMgfgaQgIAagZARQgYAQgcAAIgBAAg");
	this.shape_11.setTransform(-1.0214,-0.4501);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f().s("#2B2B2A").p("Ambh2QC3AvCbgJQACgaATgWQASgVAagKQAwgRA6AVQAMgsAiggQAjghArgEQAtgEAnAeQAnAeACAsQACAkgYAkQgUAegkAXQBGAdAjAsQAUAaAJAfQAIAhgGAfQgJAqglAeQgjAdgtAFQgpAFgtgPQgpgOgjgdQgIAdgcATQgcASggAAQgdAAgdgPQgcgOgWgZQgjglgKgyQgJg1AagnQiOhsiagvg");
	this.shape_12.setTransform(3.5036,0.9271);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("#F6F6F6").s().p("AAXEOQgdAAgdgPQgcgOgWgZQgjglgKgyQgJg1AagnQiOhsiagvQC3AvCbgJQACgaATgWQASgVAagKQAwgRA6AVQAMgsAiggQAjghArgEQAtgEAnAeQAnAeACAsQACAkgYAkQgUAegkAXQBGAdAjAsQAUAaAJAfQAIAhgGAfQgJAqglAeQgjAdgtAFQgpAFgtgPQgpgOgjgdQgIAdgcATQgbASgfAAIgCAAg");
	this.shape_13.setTransform(3.3158,0.9271);

	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.f().s("#2B2B2A").p("AnGiDQDKA0CrgJQADgdAVgZQATgXAegLQA1gTBAAXQAMgxAmgjQAngkAwgFQAygEAqAhQAsAiACAwQACAogaAnQgWAigoAaQBNAfAmAxQAXAdAKAjQAJAkgHAiQgKAugoAiQgnAfgyAGQguAFgxgQQgtgQgnggQgJAhgfAUQgfAVgjgBQghAAgggQQgfgQgZgbQgmgqgLg2QgKg7AcgrQich4iqg0g");
	this.shape_14.setTransform(7.8533,2.3236);

	this.shape_15 = new cjs.Shape();
	this.shape_15.graphics.f("#F6F6F6").s().p("AAaEqQghAAgggQQgfgQgZgbQgmgqgLg2QgKg7AcgrQich4iqg0QDKA0CrgJQADgdAVgZQATgXAegLQA1gTBAAXQAMgxAmgjQAngkAwgFQAygEAqAhQAsAiACAwQACAogaAnQgWAigoAaQBNAfAmAxQAXAdAKAjQAJAkgHAiQgKAugoAiQgnAfgyAGQguAFgxgQQgtgQgnggQgJAhgfAUQgeAUgiAAIgCAAg");
	this.shape_15.setTransform(7.6654,2.3236);

	this.shape_16 = new cjs.Shape();
	this.shape_16.graphics.f().s("#2B2B2A").p("AnxiQQDeA5C7gKQADggAXgaQAVgaAggMQA7gVBGAaQAOg2ApgnQAqgnA1gFQA3gFAuAkQAwAlADA1QACAsgdArQgYAkgsAdQBUAjArA1QAYAgALAmQAKAngIAmQgLAzgsAkQgqAjg3AGQgyAGg2gSQgxgRgrgjQgKAjgiAXQgiAWgmAAQgkAAgkgSQghgRgbgeQgrgugLg8QgMhAAggvQiriEi7g5g");
	this.shape_16.setTransform(12.1906,3.7201);

	this.shape_17 = new cjs.Shape();
	this.shape_17.graphics.f("#F6F6F6").s().p("AAcFHQgjAAgkgSQgigRgbgeQgqgugMg8QgLhAAfgvQiriEi7g5QDeA5C7gKQADggAXgaQAWgaAggMQA6gVBGAaQAOg2AqgnQAqgnA1gFQA2gFAvAkQAvAlADA1QADAsgdArQgZAkgrAdQBUAjAqA1QAZAgALAmQAKAngIAmQgLAzgsAkQgrAjg2AGQgyAGg2gSQgygRgrgjQgJAjgjAXQggAWgmAAIgCAAg");
	this.shape_17.setTransform(12.0028,3.7201);

	this.shape_18 = new cjs.Shape();
	this.shape_18.graphics.f().s("#2B2B2A").p("AodicQDyA+DLgLQADgjAagdQAXgcAjgNQA/gXBNAcQAPg7AsgpQAugrA6gGQA7gGAzAoQA0ApADA5QACAwgfAuQgbAogvAfQBcAmAuA7QAaAiAMApQALArgIAoQgNA4gvAoQguAmg8AGQg3AGg6gTQg2gSgugnQgLAnglAZQglAYgqgBQgnAAgmgUQglgSgdggQgugygNhBQgMhGAigzQi6iQjMg9g");
	this.shape_18.setTransform(16.5435,5.1128);

	this.shape_19 = new cjs.Shape();
	this.shape_19.graphics.f("#F6F6F6").s().p("AAeFjQgmAAgngUQglgSgdggQgugygMhBQgNhGAigzQi6iQjLg9QDxA+DMgLQADgjAZgdQAXgcAjgNQA/gXBNAcQAPg7AtgpQAugrA6gGQA7gGAzAoQAzApADA5QADAwggAuQgaAogvAfQBbAmAuA7QAbAiALApQAMArgJAoQgMA4gwAoQguAmg7AGQg3AGg7gTQg1gSgvgnQgLAnglAZQgjAXgoAAIgEAAg");
	this.shape_19.setTransform(16.3556,5.1128);

	this.shape_20 = new cjs.Shape();
	this.shape_20.graphics.f().s("#2B2B2A").p("ApIipQEFBDDbgMQAEglAbgfQAZgfAmgNQBEgZBTAeQAQg/AxguQAyguA+gGQBAgGA3ArQA3ArAEA/QADAzgiAyQgdArgzAiQBjApAxA/QAdAlANAtQAMAugJAsQgNA8g0ArQgyAphAAHQg7AHg/gWQg7gTgygqQgLAqgpAbQgnAagugBQgpAAgqgVQgogUgggjQgxg2gOhGQgNhLAkg4QjJibjbhDg");
	this.shape_20.setTransform(20.8807,6.4901);

	this.shape_21 = new cjs.Shape();
	this.shape_21.graphics.f("#F6F6F6").s().p("AAhGAQgpAAgqgVQgogUgggjQgxg2gOhGQgNhLAkg4QjJibjbhDQEFBDDbgMQAEglAbgfQAZgfAmgNQBEgZBTAeQAQg/AxguQAyguA+gGQBAgGA3ArQA3ArAEA/QADAzgiAyQgdArgzAiQBjApAxA/QAdAlANAtQAMAugJAsQgNA8g0ArQgyAphAAHQg7AHg/gWQg7gTgygqQgLAqgpAbQgmAZgsAAIgDAAg");
	this.shape_21.setTransform(20.6929,6.4901);

	this.shape_22 = new cjs.Shape();
	this.shape_22.graphics.f().s("#2B2B2A").p("Ap0i1QEZBIDsgNQADgoAegiQAbghAogOQBKgbBZAgQARhEA0gwQA2gyBDgHQBEgGA7AuQA8AvAEBDQADA3glA2QgfAug2AkQBqAsA1BEQAfAoAOAwQANAygKAvQgOBAg4AuQg1AshFAIQhAAHhEgXQg+gVg2gsQgNAtgrAcQgqAdgxgBQgtAAgtgXQgrgWgiglQg1g6gPhLQgOhRAng8QjYinjshHg");
	this.shape_22.setTransform(25.2302,7.8865);

	this.shape_23 = new cjs.Shape();
	this.shape_23.graphics.f("#F6F6F6").s().p("AAkGdQgtAAgtgXQgrgWgiglQg1g6gPhLQgOhRAng8QjYinjshHQEZBIDsgNQADgoAegiQAbghAogOQBKgbBZAgQARhEA0gwQA2gyBDgHQBEgGA7AuQA8AvAEBDQADA3glA2QgfAug2AkQBqAsA1BEQAfAoAOAwQANAygKAvQgOBAg4AuQg1AshFAIQhAAHhEgXQg+gVg2gsQgNAtgrAcQgpAcgvAAIgDAAg");
	this.shape_23.setTransform(25.0424,7.8865);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape}]}).to({state:[{t:this.shape_3},{t:this.shape_2}]},1).to({state:[{t:this.shape_5},{t:this.shape_4}]},1).to({state:[{t:this.shape_7},{t:this.shape_6}]},1).to({state:[{t:this.shape_9},{t:this.shape_8}]},1).to({state:[{t:this.shape_11},{t:this.shape_10}]},1).to({state:[{t:this.shape_13},{t:this.shape_12}]},1).to({state:[{t:this.shape_15},{t:this.shape_14}]},1).to({state:[{t:this.shape_17},{t:this.shape_16}]},1).to({state:[{t:this.shape_19},{t:this.shape_18}]},1).to({state:[{t:this.shape_21},{t:this.shape_20}]},1).to({state:[{t:this.shape_23},{t:this.shape_22}]},1).to({state:[]},1).wait(3));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-42.5,-34.4,131.3,84.6);


(lib.חושב3 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.CachedBmp_20();
	this.instance.setTransform(-1.05,0,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-1,0,169.5,379.5);


(lib.חושב2 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.CachedBmp_19();
	this.instance.setTransform(-0.6,0,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-0.6,0,133.5,384.5);


(lib.חושב1 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.CachedBmp_18();
	this.instance.setTransform(-0.55,0,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-0.5,0,135.5,390);


(lib.עיניים = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.CachedBmp_16();
	this.instance.setTransform(-0.45,-0.45,0.5,0.5);

	this.instance_1 = new lib.CachedBmp_17();
	this.instance_1.setTransform(-0.45,49.65,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance}]}).to({state:[{t:this.instance_1}]},14).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-0.4,-0.4,156,104.5);


(lib.Tween10 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#90C033").s().p("AgLF6Mgq4AABIAArlQBeAqCnAfQFLA9Flg9QCvgdC+goQCNgdCbADQCSADCXAfQCDAcCFA0QBngXB3gXQDvgtBYACQASgCA0AKQA1AKBDARQBqAcA5AYQEsArE/g2QCwgeC7gnQCOgdCbADQCTADCWAfQCHAdCCAyQB5gYCIgVQEPgrBFALIAALWMgrPAABg");
	this.shape.setTransform(0.0237,-0.0057,4.1968,4.1968);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-1156.6,-161.5,2313.3,323.1);


(lib.Tween9 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#2B2B2A").ss(1.4).p("AFlAAQAAAchoAVQhpAUiUAAQiTAAhpgUQhogVAAgcQAAgcBogUQBpgUCTAAQCUAABpAUQBoAUAAAcg");
	this.shape.setTransform(1.1681,6.2015,4.5546,4.5546);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#2B2B2A").s().p("Aj8AxQhogVAAgcQAAgcBogUQBpgUCTAAQCUAABoAUQBpAUAAAcQAAAchpAVQhoAUiUAAQiTAAhpgUg");
	this.shape_1.setTransform(1.1681,6.2015,4.5546,4.5546);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#5E6162").s().p("AkHA7QhtgZAAgiQAAghBtgZQBtgYCaAAQCaAABuAYQBtAZAAAhQAAAihtAZQhuAYiaAAQiaAAhtgYg");
	this.shape_2.setTransform(-0.426,-0.175,4.5546,4.5546);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-170.1,-37.8,339.4,76.3);


(lib.Tween8 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#2B2B2A").ss(1.4).p("AFlAAQAAAchoAVQhpAUiUAAQiTAAhpgUQhogVAAgcQAAgcBogUQBpgUCTAAQCUAABpAUQBoAUAAAcg");
	this.shape.setTransform(1.1642,6.177,4.5545,4.5545);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#2B2B2A").s().p("Aj8AxQhogVAAgcQAAgcBogUQBpgUCTAAQCUAABoAUQBpAUAAAcQAAAchpAVQhoAUiUAAQiTAAhpgUg");
	this.shape_1.setTransform(1.1642,6.177,4.5545,4.5545);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#5E6162").s().p("AkHA7QhtgZAAgiQAAghBtgZQBtgYCaAAQCaAABuAYQBtAZAAAhQAAAihtAZQhuAYiaAAQiaAAhtgYg");
	this.shape_2.setTransform(-0.4299,-0.1992,4.5545,4.5545);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-170.1,-37.9,339.29999999999995,76.4);


(lib.Symbol5_1 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance_1 = new lib.CachedBmp_15();
	this.instance_1.setTransform(0,-0.6,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.Symbol5_1, new cjs.Rectangle(0,-0.6,1245.5,282), null);


(lib.Symbol13 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.CachedBmp_14();
	this.instance.setTransform(0,0,0.3827,0.3827);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.Symbol13, new cjs.Rectangle(0,0,1304.1,244.9), null);


(lib.ציפור = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// flash0_ai
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#2B2B2A").p("AkvAIQBOgVBYACQCtAFAyB4QAAACABABABWByQgPgmASgvQAlhhCygw");
	this.shape.setTransform(-564.929,-189.7);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#2B2B2A").p("AhlhVQAqAsApAyQBHBaADAoQAAAFgBAFAA4CLQAChEAHhFQAPiSAYgD");
	this.shape_1.setTransform(-561.9945,-191.25);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape}]}).to({state:[{t:this.shape_1}]},5).wait(5));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-596.3,-207.1,62.799999999999955,31.69999999999999);


(lib.Scene_1_רקע = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// רקע
	this.instance = new lib.CachedBmp_56();
	this.instance.setTransform(-33.05,-14.15,0.5,0.5);

	this.instance_1 = new lib.CachedBmp_10();
	this.instance_1.setTransform(-143.25,-75.3,0.5,0.5);

	this.instance_2 = new lib.CachedBmp_11();
	this.instance_2.setTransform(-143.25,-75.3,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance}]}).to({state:[{t:this.instance_1}]},487).to({state:[{t:this.instance_2}]},210).wait(60));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.___Camera___ = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// timeline functions:
	this.frame_0 = function() {
		this.visible = false;
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(2));

	// cameraBoundary
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("rgba(0,0,0,0)").ss(2,1,1,3,true).p("EAq+AfQMhV7AAAMAAAg+fMBV7AAAg");

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(2));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-641,-361,1282,722);


(lib.play = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// flash0.ai
	this.instance = new lib.CachedBmp_51();
	this.instance.setTransform(59.2,85.4,0.2711,0.2711);

	this.instance_1 = new lib.CachedBmp_54();
	this.instance_1.setTransform(117.05,82.3,0.2711,0.2711);

	this.instance_2 = new lib.Ellipse();
	this.instance_2.setTransform(134.05,116.1,1,1,0,0,0,93.5,93.5);
	this.instance_2.alpha = 0.1992;

	this.instance_3 = new lib.CachedBmp_53();
	this.instance_3.setTransform(40.7,79.8,0.2711,0.2711);

	this.instance_4 = new lib.CachedBmp_52();
	this.instance_4.setTransform(112.75,73.95,0.2711,0.2711);

	this.instance_5 = new lib.CachedBmp_55();
	this.instance_5.setTransform(59.2,85.4,0.2711,0.2711);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_2,p:{regY:93.5,scaleX:1,scaleY:1,x:134.05,y:116.1}},{t:this.instance_1},{t:this.instance}]}).to({state:[{t:this.instance_2,p:{regY:93.3,scaleX:1.25,scaleY:1.25,x:133.95,y:116}},{t:this.instance_4},{t:this.instance_3}]},1).to({state:[{t:this.instance_2,p:{regY:93.5,scaleX:1,scaleY:1,x:134.05,y:116.1}},{t:this.instance_1},{t:this.instance_5}]},1).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(17.1,-0.6,233.5,233.5);


(lib.כוכב2 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_2
	this.instance = new lib.Symbol2();
	this.instance.setTransform(-245.6,174.2,1,1,0,0,0,30.3,30.3);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(28).to({_off:false},0).wait(1).to({regX:30.2,regY:30.2,x:-208.25,y:166.2},0).wait(1).to({x:-173.1,y:158.5},0).wait(1).to({x:-140.2,y:151},0).wait(1).to({x:-109.55,y:143.7},0).wait(1).to({x:-81.15,y:136.55},0).wait(1).to({x:-55,y:129.65},0).wait(1).to({x:-31.1,y:122.9},0).wait(1).to({x:-9.45,y:116.3},0).wait(1).to({x:10,y:109.95},0).wait(1).to({x:27.15,y:103.75},0).wait(1).to({x:42.05,y:97.75},0).wait(1).to({x:54.75,y:91.95},0).wait(1).to({x:65.2,y:86.3},0).wait(1).to({x:73.4,y:80.9},0).wait(1).to({x:79.35,y:75.6},0).wait(1).to({x:83.1,y:70.55},0).wait(1).to({x:84.6,y:65.7},0).wait(1).to({x:83.8,y:61},0).wait(1).to({x:80.85,y:56.45},0).wait(1).to({x:75.6,y:52.15},0).wait(1).to({x:68.1,y:48},0).wait(1).to({x:58.35,y:44.05},0).wait(1).to({x:46.4,y:40.3},0).wait(1).to({x:32.15,y:36.7},0).wait(1).to({x:15.75,y:33.35},0).wait(1).to({x:-3,y:30.15},0).wait(1));

	// Layer_1
	this.instance_1 = new lib.Symbol2();
	this.instance_1.setTransform(30.3,30.3,1,1,0,0,0,30.3,30.3);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(1).to({regX:30.2,regY:30.2,x:47,y:34.5},0).wait(1).to({x:60.3,y:39.1},0).wait(1).to({x:70.65,y:43.9},0).wait(1).to({x:78.45,y:48.85},0).wait(1).to({x:84,y:53.95},0).wait(1).to({x:87.55,y:59.15},0).wait(1).to({x:89.2,y:64.45},0).wait(1).to({x:89.15,y:69.8},0).wait(1).to({x:87.4,y:75.2},0).wait(1).to({x:84.1,y:80.6},0).wait(1).to({x:79.25,y:86.05},0).wait(1).to({x:72.85,y:91.55},0).wait(1).to({x:64.9,y:97},0).wait(1).to({x:55.45,y:102.45},0).wait(1).to({x:44.45,y:107.85},0).wait(1).to({x:31.85,y:113.25},0).wait(1).to({x:17.65,y:118.65},0).wait(1).to({x:1.65,y:123.95},0).wait(1).to({x:-16.2,y:129.2},0).wait(1).to({x:-35.95,y:134.35},0).wait(1).to({x:-57.9,y:139.4},0).wait(1).to({x:-82.1,y:144.3},0).wait(1).to({x:-109,y:149.1},0).wait(1).to({x:-138.8,y:153.7},0).wait(1).to({x:-172.05,y:158.1},0).wait(1).to({x:-209.35,y:162.2},0).wait(1).to({x:-251.75,y:165.95},0).to({_off:true},1).wait(27));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-281.9,0,401.4,204.4);


(lib.כוכב1 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_2
	this.instance = new lib.Symbol1();
	this.instance.setTransform(488.5,108.6,1,1,0,0,0,95.6,61.9);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(30).to({_off:false},0).wait(1).to({regX:95.5,regY:62,x:429.45,y:116.95},0).wait(1).to({x:373.5,y:124.35},0).wait(1).to({x:320.55,y:130.85},0).wait(1).to({x:270.65,y:136.5},0).wait(1).to({x:223.75,y:141.2},0).wait(1).to({x:179.8,y:145.05},0).wait(1).to({x:138.9,y:148},0).wait(1).to({x:101,y:150.05},0).wait(1).to({x:66.1,y:151.2},0).wait(1).to({x:34.2,y:151.5},0).wait(1).to({x:5.25,y:150.85},0).wait(1).to({x:-20.65,y:149.35},0).wait(1).to({x:-43.6,y:147},0).wait(1).to({x:-63.55,y:143.7},0).wait(1).to({x:-80.55,y:139.55},0).wait(1).to({x:-94.5,y:134.45},0).wait(1).to({x:-105.45,y:128.5},0).wait(1).to({x:-113.45,y:121.7},0).wait(1).to({x:-118.45,y:113.95},0).wait(1).to({x:-120.45,y:105.35},0).wait(1).to({x:-119.45,y:95.8},0).wait(1).to({x:-115.45,y:85.4},0).wait(1).to({x:-108.45,y:74.1},0).wait(1).to({x:-98.45,y:61.95},0).wait(1));

	// Layer_1
	this.instance_1 = new lib.Symbol1();
	this.instance_1.setTransform(-67.8,61.9,1,1,0,0,0,95.6,61.9);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(1).to({regX:95.5,regY:62,x:-80.3,y:72},0).wait(1).to({x:-90.45,y:81.4},0).wait(1).to({x:-98.3,y:90.2},0).wait(1).to({x:-103.85,y:98.4},0).wait(1).to({x:-107.1,y:106},0).wait(1).to({x:-108.1,y:113},0).wait(1).to({x:-106.8,y:119.35},0).wait(1).to({x:-103.2,y:125.15},0).wait(1).to({x:-97.35,y:130.3},0).wait(1).to({x:-89.2,y:134.85},0).wait(1).to({x:-78.8,y:138.8},0).wait(1).to({x:-66.05,y:142.15},0).wait(1).to({x:-51.1,y:144.9},0).wait(1).to({x:-33.8,y:147.05},0).wait(1).to({x:-14.25,y:148.55},0).wait(1).to({x:7.6,y:149.5},0).wait(1).to({x:31.7,y:149.85},0).wait(1).to({x:58.1,y:149.55},0).wait(1).to({x:86.8,y:148.65},0).wait(1).to({x:117.75,y:147.15},0).wait(1).to({x:151,y:145.05},0).wait(1).to({x:186.55,y:142.35},0).wait(1).to({x:224.35,y:139.05},0).wait(1).to({x:264.5,y:135.15},0).wait(1).to({x:306.9,y:130.65},0).wait(1).to({x:351.6,y:125.5},0).wait(1).to({x:398.6,y:119.75},0).wait(1).to({x:447.9,y:113.45},0).wait(1).to({x:499.55,y:106.5},0).to({_off:true},1).wait(25));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-216.4,0,812,213.5);


(lib.יד2 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_4
	this.instance = new lib.Symbol4();
	this.instance.setTransform(286.15,75.7,0.9999,0.9999,21.9669,0,0,238.9,136.1);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(62).to({_off:false},0).wait(1).to({regX:320.2,regY:162.7,rotation:21.9675,x:351.55,y:125.45},0).wait(1).to({y:120.1},0).wait(1).to({y:114.75},0).wait(1).to({y:109.4},0).wait(1).to({y:104.05},0).wait(1).to({y:98.7},0).wait(1).to({y:93.35},0).wait(1).to({y:88},0).wait(1).to({y:82.65},0).wait(1).to({y:77.3},0).wait(1).to({y:71.95},0).wait(1).to({y:66.6},0).wait(1).to({y:61.25},0).wait(1).to({y:55.9},0).wait(1).to({y:50.55},0).wait(1).to({y:45.2},0).wait(1).to({y:39.85},0).wait(1).to({y:34.5},0).wait(1).to({y:29.15},0).wait(1).to({y:23.8},0).wait(1).to({y:18.45},0).wait(1).to({y:13.1},0).wait(1).to({y:7.75},0).wait(1).to({y:2.4},0).wait(1).to({y:-2.95},0).wait(1).to({y:-8.3},0).wait(1).to({y:-13.65},0).wait(1).to({y:-19},0).wait(1).to({y:-24.35},0).wait(1).to({y:-29.7},0).to({_off:true},1).wait(3));

	// Layer_2
	this.instance_1 = new lib.Symbol4();
	this.instance_1.setTransform(287.75,231.4,1,1,-13.9854,0,0,237.8,136.3);
	this.instance_1._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(32).to({_off:false},0).wait(1).to({regX:320.2,regY:162.7,rotation:-12.7462,x:373.9,y:233.55},0).wait(1).to({rotation:-11.5064,x:373.7,y:230.1},0).wait(1).to({rotation:-10.2666,x:373.5,y:226.55},0).wait(1).to({rotation:-9.0268,x:373.3,y:223},0).wait(1).to({rotation:-7.787,x:372.95,y:219.45},0).wait(1).to({rotation:-6.5472,x:372.6,y:215.95},0).wait(1).to({rotation:-5.3074,x:372.2,y:212.4},0).wait(1).to({rotation:-4.0676,x:371.8,y:208.85},0).wait(1).to({rotation:-2.8278,x:371.35,y:205.25},0).wait(1).to({rotation:-1.588,x:370.8,y:201.7},0).wait(1).to({rotation:-0.3482,x:370.3,y:198.1},0).wait(1).to({rotation:0.8916,x:369.65,y:194.55},0).wait(1).to({rotation:2.1314,x:369.05,y:190.9},0).wait(1).to({rotation:3.3712,x:368.45,y:187.25},0).wait(1).to({rotation:4.611,x:367.7,y:183.65},0).wait(1).to({rotation:5.8508,x:366.95,y:180.05},0).wait(1).to({rotation:7.0906,x:366.2,y:176.3},0).wait(1).to({rotation:8.3304,x:365.4,y:172.7},0).wait(1).to({rotation:9.5702,x:364.6,y:169},0).wait(1).to({rotation:10.81,x:363.7,y:165.2},0).wait(1).to({rotation:12.0498,x:362.8,y:161.5},0).wait(1).to({rotation:13.2896,x:361.8,y:157.75},0).wait(1).to({rotation:14.5294,x:360.85,y:153.95},0).wait(1).to({rotation:15.7692,x:359.85,y:150.1},0).wait(1).to({rotation:17.009,x:358.8,y:146.3},0).wait(1).to({rotation:18.2488,x:357.7,y:142.4},0).wait(1).to({rotation:19.4886,x:356.55,y:138.6},0).wait(1).to({rotation:20.7284,x:355.4,y:134.7},0).wait(1).to({rotation:21.9682,x:354.25,y:130.8},0).to({_off:true},1).wait(34));

	// Layer_1
	this.instance_2 = new lib.Symbol4();
	this.instance_2.setTransform(257.65,137.7,1,1,0,0,0,242.7,137.7);

	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(1).to({regX:320.2,regY:162.7,rotation:-0.4512,x:336.35,y:165.1},0).wait(1).to({rotation:-0.9024,x:337.45,y:167.5},0).wait(1).to({rotation:-1.3536,x:338.65,y:169.9},0).wait(1).to({rotation:-1.8049,x:339.8,y:172.3},0).wait(1).to({rotation:-2.2561,x:340.95,y:174.7},0).wait(1).to({rotation:-2.7073,x:342.1,y:177.15},0).wait(1).to({rotation:-3.1585,x:343.2,y:179.5},0).wait(1).to({rotation:-3.6097,x:344.35,y:181.9},0).wait(1).to({rotation:-4.0609,x:345.5,y:184.3},0).wait(1).to({rotation:-4.5122,x:346.65,y:186.7},0).wait(1).to({rotation:-4.9634,x:347.8,y:189.15},0).wait(1).to({rotation:-5.4146,x:348.85,y:191.5},0).wait(1).to({rotation:-5.8658,x:350,y:193.95},0).wait(1).to({rotation:-6.317,x:351.1,y:196.3},0).wait(1).to({rotation:-6.7682,x:352.2,y:198.65},0).wait(1).to({rotation:-7.2195,x:353.3,y:201.05},0).to({_off:true},1).wait(5).to({_off:false,regX:241.9,regY:137.5,rotation:-9.9263,x:279.1,y:204.1},0).wait(1).to({regX:320.2,regY:162.7,rotation:-10.378,x:361.55,y:217.75},0).wait(1).to({rotation:-10.8292,x:362.65,y:220.15},0).wait(1).to({rotation:-11.2804,x:363.65,y:222.5},0).wait(1).to({rotation:-11.7316,x:364.75,y:224.9},0).wait(1).to({rotation:-12.1828,x:365.85,y:227.3},0).wait(1).to({rotation:-12.634,x:366.85,y:229.65},0).wait(1).to({rotation:-13.0853,x:367.9,y:232},0).wait(1).to({rotation:-13.5365,x:368.9,y:234.45},0).wait(1).to({rotation:-13.9877,x:369.9,y:236.75},0).to({_off:true},1).wait(64));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,-247.8,641.2,677.2);


(lib.יד1 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.Symbol3();
	this.instance.setTransform(214.1,118.2,1,1,0,0,0,214.1,118.2);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1).to({regY:118.3,x:202.85,y:118.7},0).wait(1).to({x:191.55,y:119.1},0).wait(1).to({x:180.25,y:119.5},0).wait(1).to({x:168.95,y:119.9},0).wait(1).to({x:157.65,y:120.3},0).wait(1).to({x:146.35,y:120.7},0).wait(1).to({x:135.05,y:121.1},0).wait(1).to({x:123.75,y:121.5},0).wait(1).to({x:112.45,y:121.9},0).wait(1).to({x:101.15,y:122.3},0).wait(1).to({x:89.85,y:122.7},0).wait(1).to({x:78.55,y:123.1},0).wait(1).to({x:67.25,y:123.5},0).wait(1).to({x:55.95,y:123.9},0).wait(1).to({x:44.65,y:124.3},0).wait(1).to({x:33.35,y:124.7},0).wait(1).to({x:22.05,y:125.1},0).wait(1).to({x:10.75,y:125.5},0).wait(1).to({x:-0.55,y:125.9},0).wait(1).to({x:-11.85,y:126.3},0).wait(1).to({x:-23.15,y:126.7},0).wait(1).to({x:-34.45,y:127.1},0).wait(1).to({x:-45.75,y:127.5},0).wait(1).to({x:-57.05,y:127.9},0).wait(1).to({x:-68.35,y:128.3},0).wait(1).to({x:-79.65,y:128.7},0).wait(1).to({x:-90.95,y:129.1},0).wait(1).to({x:-102.25,y:129.5},0).wait(1).to({x:-113.55,y:129.9},0).wait(1).to({x:-124.85,y:130.3},0).wait(1).to({x:-136.15,y:130.7},0).wait(1).to({x:-147.45,y:131.1},0).wait(1).to({x:-158.75,y:131.5},0).wait(1).to({x:-170.05,y:131.9},0).wait(1).to({x:-181.35,y:132.3},0).wait(1).to({x:-192.65,y:132.7},0).wait(1).to({x:-203.95,y:133.1},0).wait(1).to({x:-215.25,y:133.5},0).to({_off:true},1).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-429.8,-0.4,858.4000000000001,252.70000000000002);


(lib.אישמופתע = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// flash0_ai
	this.instance = new lib.Tween15("synched",0);
	this.instance.setTransform(-146.15,-1.55);

	this.instance_1 = new lib.Tween16("synched",0);
	this.instance_1.setTransform(-146.2,-0.85);

	this.instance_2 = new lib.Tween17("synched",0);
	this.instance_2.setTransform(-146.55,-0.85);

	this.instance_3 = new lib.CachedBmp_34();
	this.instance_3.setTransform(-219.7,-119.1,0.3503,0.3503);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance}]}).to({state:[{t:this.instance_1}]},10).to({state:[{t:this.instance_2}]},12).to({state:[{t:this.instance_3}]},12).to({state:[{t:this.instance_3}]},6).to({state:[]},1).to({state:[{t:this.instance_3}]},2).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-219.7,-120.4,147.79999999999998,240);


(lib.טיפות = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// flash0_ai
	this.instance = new lib.טיפות1("synched",0,false);
	this.instance.setTransform(364.95,21.45,1.3318,1.3318,0,0,0,0,0.1);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1).to({regX:-0.1,regY:0.2,scaleX:1.4286,scaleY:1.4286,rotation:5.7692,x:380.9,y:25.85},0).wait(1).to({scaleX:1.5253,scaleY:1.5253,rotation:11.5384,x:392.5,y:29.8},0).wait(1).to({scaleX:1.622,scaleY:1.622,rotation:17.3076,x:401.75,y:33.85},0).wait(1).to({scaleX:1.7187,scaleY:1.7187,rotation:23.0768,x:409.65,y:38.05},0).wait(1).to({scaleX:1.8154,scaleY:1.8154,rotation:28.846,x:416.6,y:42.3},0).wait(1).to({scaleX:1.9121,scaleY:1.9121,rotation:34.6152,x:422.8,y:46.8},0).wait(1).to({scaleX:2.0088,scaleY:2.0088,rotation:40.3843,x:428.4,y:51.55},0).wait(1).to({scaleX:2.1055,scaleY:2.1055,rotation:46.1535,x:433.45,y:56.7},0).wait(1).to({scaleX:2.2022,scaleY:2.2022,rotation:51.9227,x:438.1,y:62.15},0).wait(1).to({scaleX:2.299,scaleY:2.299,rotation:57.6919,x:442.45,y:68.2},0).wait(1).to({scaleX:2.3957,scaleY:2.3957,rotation:63.4611,x:446.4,y:74.95},0).wait(1).to({scaleX:2.4924,scaleY:2.4924,rotation:69.2303,x:450.1,y:82.75},0).wait(1).to({scaleX:2.5891,scaleY:2.5891,rotation:74.9995,x:453.45,y:92.2},0).wait(1).to({scaleX:2.6858,scaleY:2.6858,rotation:89.9982,x:456.55,y:105.15},0).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(349.3,10.3,133.09999999999997,126.10000000000001);


(lib.אישהולךבסוף = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// flash0_ai
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#2B2B2A").ss(1.1).p("ABqgeQgHgpghgZIiqAGIBFC2QABACgCABQA0gFA2gHQALgCAFgKQAcg7gIgqg");
	this.shape.setTransform(79.6356,16.6425,1.4044,1.4044);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#737372").s().p("AglBdIhFi2ICqgGQAiAZAHApQAIAqgcA7QgFALgMABQg2AHg0AFQABAAAAgBQAAAAABAAQAAgBAAAAQAAgBgBAAg");
	this.shape_1.setTransform(79.8005,16.4552,1.4044,1.4044);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f().s("#2B2B2A").ss(1.1).p("AibhKQgHAEgJAIQgKAMgEANQgEAOAAAZQABA5AXAtQABACADAAQDogPB0gLQgOgSgXg5QgYg7gBgbQAAgCgCAAIg+gWQhUAGg7AGQgmAEgSAGQgNAGgEADQAJgEAIACQAMAEAIAQQANAbAAAiQAAAZgHAmQgDANgEAHQgGAKgJABQgKACgJgJQgHgGgEgMQgNgfgCgcQgBggAOgZQAFgJAFgDQAIgGAHADQAGACAEAHQAHAMACAaQABAegDAdQgCANgEAFQgDAFgFABQgFACgEgCQgEgCgDgGQgJgRAEgfQADgVAGgLQADgGAEAAQAIgCACAMQAIAdgNAeIgBACQgCACgCgGQgEgRAJgj");
	this.shape_2.setTransform(35.9382,19.5599,1.3609,1.3608,0,0,-0.7381);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#737372").s().p("AikBoQgXgtgBg5QAAgZAFgOQAEgNAKgMQAIgIAIgEQAGgDAFAAIAAAAIAAAAIAFABIABAAQAMAEAHAQQAOAbAAAiQAAAZgIAmQgDANgDAHQgHAKgJABIgDABIAAAAIgBAAQgHgBgGgFIgBgBIgBgBIAAAAQgGgGgFgMQgNgfgBgcIAAgEQAAgeANgXQAEgJAGgDIAAgBIACgBQADgCAEAAIABAAIAAAAIAEABIABAAQAGACADAHQAHAMACAaIABARQAAAWgDAUQgCANgEAFQgCAFgFABIgEABIAAAAIgBAAIAAAAIgBAAIgCgBIgCAAQgDgCgDgGQgGgLAAgTIABgSQADgVAGgLQACgGAFAAIABAAIAAAAIAAAAIABAAQAGAAACAKQADALAAALQAAATgIASIgBACIgBAAIgBAAIAAAAQAAAAAAAAQgBAAAAAAQAAgBAAAAQgBgBAAAAIAAgCQgCgFAAgIQAAgQAGgXQgGAXAAAQQAAAIACAFIAAACQAAAAABABQAAAAAAABQAAAAABAAQAAAAAAAAIAAAAIABAAIABAAIABgCQAIgSAAgTQAAgLgDgLQgCgKgGAAIgBAAIAAAAIAAAAIgBAAQgFAAgCAGQgGALgDAVIgBASQAAATAGALQADAGADACIACAAIACABIABAAIAAAAIABAAIAAAAIAEgBQAFgBACgFQAEgFACgNQADgUAAgWIgBgRQgCgagHgMQgDgHgGgCIgBAAIgEgBIAAAAIgBAAQgEAAgDACIgCABIAAABQgGADgEAJQgNAXAAAeIAAAEQABAcANAfQAFAMAGAGIAAAAIABABIABABQAGAFAHABIABAAIAAAAIADgBQAJgBAHgKQADgHADgNQAIgmAAgZQAAgigOgbQgHgQgMgEIgBAAIgFgBIAAAAIAAAAQgFAAgGADQAEgDAMgGQASgGAngEQA7gGBTgGIA+AWQABAAAAAAQAAAAABABQAAAAAAAAQAAABAAAAQABAbAZA7QAWA5APASQh1ALjoAPQAAAAgBAAQgBAAAAgBQAAAAgBAAQAAAAgBgBg");
	this.shape_3.setTransform(35.734,19.5666,1.3609,1.3608,0,0,-0.7381);

	this.instance = new lib.Symbol1_1();
	this.instance.setTransform(12.5,17.3,1.2203,1.2203,0,0,0,50.1,114.7);

	this.instance_1 = new lib.Symbol2_1();
	this.instance_1.setTransform(14.8,19,1.0748,1.0748,0,0,0,73.2,129.3);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f().s("#2B2B2A").ss(1.1).p("ABygeQgHgqghgYIi6AGIBGC4QAAABAAABQA5gFA/gIQAMgCAEgLQAcg7gIgpg");
	this.shape_4.setTransform(75.2477,19.6775,1.2892,1.2892);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#737372").s().p("AgsBfIhGi4IC6gHQAiAZAHApQAHApgbA8QgFALgMABQg+AIg6AGIAAgCg");
	this.shape_5.setTransform(75.3998,19.6322,1.2892,1.2892);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f().s("#2B2B2A").ss(1.1).p("ACCgjQgHgogigaQiOAFhGAEQAEAigGAIQgLAPAKCIQCGgMBVgLQAMgBAFgLQAcg7gIgqg");
	this.shape_6.setTransform(45.3628,21.5121,1.4703,1.4703);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#737372").s().p("Ah9gyQAGgIgEgiIDUgJQAiAaAHAoQAIArgcA7QgFAKgMABQhVAMiGAMQgKiIALgQg");
	this.shape_7.setTransform(45.3628,21.4823,1.4703,1.4703);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f().s("#2B2B2A").ss(1.1).p("AhehJQgHAEgJAIQgJAMgFANQgEAOAAAZQABA7AXArQADACABAAQDKgOAlgDIAAjDQhdAGhDAHQgmAEgSAGQgKAFgHAEQAJgEAIACQAMAEAIAQQANAbAAAiQAAAZgHAmQgDANgEAHQgGAKgJABQgKACgJgJQgFgEgGgOQgOgfAAgcQgCggAOgZQAEgIAGgFQAIgFAIADQAFADAEAGQAHAMACAZQABAfgDAdQgCANgEAFQgDAFgFABQgFACgEgCQgEgCgDgGQgJgRAEgfQADgVAHgLQADgGADgBQAIAAADALQAHAegNAdIgBACQgCACgCgGQgEgRAJgj");
	this.shape_8.setTransform(-5.6758,24.9653,1.4278,1.4278);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#737372").s().p("AhtBpQgXgrgBg8QAAgYAEgOQAFgNAJgNQAJgHAHgEQAGgDAFAAIABAAIAAAAIAFAAIAAAAQAMAEAIARQANAbAAAiQAAAYgHAnQgDANgEAHQgGAJgJACIgBAAIgDAAIAAAAIAAAAQgHAAgHgGIgBgBQgFgFgGgOQgOgfAAgbIAAgGQAAgdAMgXQAEgHAGgFQAFgDAFgBIAAAAIABAAIAEABIAAAAIAAAAIABABQAFADAEAGQAHAMACAZIAAASQAAAVgCAUQgCAOgEAFQgDAEgFACIgEABIAAAAIAAAAIgBAAIAAAAIgDgBIgBgBQgEgCgDgFQgGgMAAgSIABgSQADgWAHgLQADgFADgBIABAAIAAAAIAAAAIAAAAQAGAAADAIIABADQACAKAAALQAAATgIATIgBACIAAAAIgBAAIAAAAIAAAAQAAAAgBAAQAAAAAAgBQgBAAAAgBQAAAAAAgBIgBgBQgBgGAAgHQAAgQAGgXQgGAXAAAQQAAAHABAGIABABQAAABAAAAQAAABABAAQAAABAAAAQABAAAAAAIAAAAIAAAAIABAAIAAAAIABgCQAIgTAAgTQAAgLgCgKIgBgDQgDgIgGAAIAAAAIAAAAIAAAAIgBAAQgDABgDAFQgHALgDAWIgBASQAAASAGAMQADAFAEACIABABIADABIAAAAIABAAIAAAAIAAAAIAEgBQAFgCADgEQAEgFACgOQACgUAAgVIAAgSQgCgZgHgMQgEgGgFgDIgBgBIAAAAIAAAAIgEgBIgBAAIAAAAQgFABgFADQgGAFgEAHQgMAXAAAdIAAAGQAAAbAOAfQAGAOAFAFIABABQAHAGAHAAIAAAAIAAAAIADAAIABAAQAJgCAGgJQAEgHADgNQAHgnAAgYQAAgigNgbQgIgRgMgEIAAAAIgFAAIAAAAIgBAAQgFAAgGADIARgJQASgGAmgEQBDgHBdgHIAADEIjvARIgEgCg");
	this.shape_9.setTransform(-4.9966,24.9913,1.4278,1.4278);

	this.instance_2 = new lib.Symbol3_1();
	this.instance_2.setTransform(5.05,15.5,1.0177,1.0177,0,0,0,46.5,139);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f().s("#2B2B2A").ss(1.1).p("AhRh3QgMACgIADQgNAGgKALQgKALgKAXQgXA3ADAwQABACACAAIDQBOIB1h4Igcg3QhYghg3gTQgigLgWgCQgGAAgMABQAKAAAGAFQAJAIABATQAAAfgOAfQgLAZgVAcQgIAKgGAFQgKAIgJgDQgKgDgFgMQgDgJABgMQAAgfALgbQAMgfAYgRQAHgGAHgBQAJgCAGAGQAEAEABAIQABAPgJAXQgLAcgPAZQgIALgFADQgEADgGgBQgFAAgDgEQgDgDAAgGQgBgSARgcQALgSAKgIQAGgEADABQAIACgDAMQgGAfgXAVIgCABQgCAAAAgEQADgRAXge");
	this.shape_10.setTransform(3.644,17.8333,1.3228,1.3228);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#737372").s().p("AihArQAAAAgBgBQAAAAAAAAQgBAAAAgBQAAAAgBgBQgDgwAXg2QAKgXALgMQAKgLANgGQAHgDAMgCQALAAAGAGQAIAIABASIAAACQAAAegNAeQgLAZgWAdQgHAKgHAFIAAAAIAAAAIgBABIAAAAQgGAEgGAAIAAAAIAAAAIgFAAIgBgBQgKgDgEgLQgCgHAAgIIAAgGQAAgfALgbQALgfAYgSQAIgFAGgCIABAAIABAAIABAAIABAAIAAAAIABAAQAGAAAEAEQAEAEABAIIABAEQgBAOgHAUQgLAdgQAYQgHAMgGADQgDACgEAAIAAAAIAAAAIgBAAIgBAAQgFgBgDgDQgDgEAAgGIAAgCQAAgRAPgaQALgTALgIIAAAAIACgBIAAAAIAEgBIABAAIABAAIAAAAIABAAQAGABAAAHIgBAGQgGAegYAVIgBABQgDAAAAgEQADgRAXgdQgXAdgDARQAAAEADAAIABgBQAYgVAGgeIABgGQAAgHgGgBIgBAAIAAAAIgBAAIgBAAIgEABIAAAAIgCABIAAAAQgLAIgLATQgPAaAAARIAAACQAAAGADAEQADADAFABIABAAIABAAIAAAAIAAAAQAEAAADgCQAGgDAHgMQAQgYALgdQAHgUABgOIgBgEQgBgIgEgEQgEgEgGAAIgBAAIAAAAIgBAAIgBAAIgBAAIgBAAQgGACgIAFQgYASgLAfQgLAbAAAfIAAAGQAAAIACAHQAEALAKADIABABIAFAAIAAAAIAAAAQAGAAAGgEIAAAAIABgBIAAAAIAAAAQAHgFAHgKQAWgdALgZQANgeAAgeIAAgCQgBgSgIgIQgGgGgLAAIATAAQAWABAiAMQA2ASBYAhIAdA3Ih1B4g");
	this.shape_11.setTransform(3.5644,17.7736,1.3228,1.3228);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f().s("#2B2B2A").ss(1.1).p("AB9gvIilhEIAJA/IhmBrQAkAOAdAJQA5ATBCAUQAKAEAKgIQAxgrALgpQAKgngUglg");
	this.shape_12.setTransform(41.9143,31.4919,1.3372,1.3372);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("#737372").s().p("AA1B0QhCgUg5gUQgdgJgkgNIBmhrIgJg/IClBDQAUAlgKAnQgLAqgxArQgGAFgHAAIgHgBg");
	this.shape_13.setTransform(42.1959,31.7046,1.3372,1.3372);

	this.instance_3 = new lib.Symbol4_1();
	this.instance_3.setTransform(7.05,21.3,1,1,0,0,0,47.9,141);

	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.f().s("#2B2B2A").ss(1.1).p("ACmgQIiihyIipB5QB9BPBlA7QAKAGAKgFQA6gfAUgmQATglgMgog");
	this.shape_14.setTransform(38.4467,34.0758,1.1961,1.1961);

	this.shape_15 = new cjs.Shape();
	this.shape_15.graphics.f("#737372").s().p("AA6CBQhlg7h9hQICph4ICjByQAMAogUAkQgTAng6AeQgFACgFAAQgFAAgGgCg");
	this.shape_15.setTransform(38.705,34.1494,1.1961,1.1961);

	this.shape_16 = new cjs.Shape();
	this.shape_16.graphics.f().s("#2B2B2A").ss(1.1).p("AgmhwQgLgBgJACQgOADgMAIQgNAKgPATQgiAwgJAvIADAEICGBYICshsIgJgSQg7gng3giQgfgTgTgGQgMgDgHgBQALADAEAGQAHAKgDASQgHAegUAcQgRAUgcAZQgIAHgIAEQgMAFgIgFQgJgFgCgMQgBgIAEgNQAIghAQgWQASgaAbgNQAJgDAHAAQAJAAAEAHQADAEgBAJQgBAOgOAVQgSAZgUAVQgKAJgGACQgFABgFgBQgFgCgCgEQgCgFABgFQADgRAXgYQAPgPAMgFQAGgDADACQAGADgEAMQgOAdgbAPIgBABQgDAAABgFQAHgRAdgX");
	this.shape_16.setTransform(7.6432,11.7187,1.225,1.225);

	this.shape_17 = new cjs.Shape();
	this.shape_17.graphics.f("#737372").s().p("AiXAaIgDgDQAIgwAjgvQAOgUAOgJQAMgJAOgDQAJgBALABQAKACAFAHQAEAGAAALIAAALQgHAdgUAcQgRAVgcAYQgIAIgIAEQgMAEgIgEQgJgFgCgNIAAgEQAAgHADgJQAIghAPgWQATgbAbgMQAJgEAGAAQAKAAAEAHQACAEAAAFIAAAEQgCAOgOAVQgRAagVAUQgJAKgHACIgBAAIAAAAIgCAAIAAAAIgCAAIgEgBQgGgBgCgEIAAgGIAAgDQADgTAWgXQAQgQALgFIABAAIAEgCIACAAIAAAAIACABIAAAAIAAAAQAEACAAAFIgCAIQgNAegbAPIgBAAQgBAAAAAAQgBAAAAAAQAAgBAAAAQAAgBAAAAIAAgDQAHgRAdgWQgdAWgHARIAAADQAAAAAAABQAAAAAAABQAAAAABAAQAAAAABAAIABAAQAbgPANgeIACgIQAAgFgEgCIAAAAIAAAAIgCgBIAAAAIgCAAIgEACIgBAAQgLAFgQAQQgWAXgDATIAAADIAAAGQACAEAGABIAEABIACAAIAAAAIACAAIAAAAIABAAQAHgCAJgKQAVgUARgaQAOgVACgOIAAgEQAAgFgCgEQgEgHgKAAQgGAAgJAEQgbAMgTAbQgPAWgIAhQgDAJAAAHIAAAEQACANAJAFQAIAEAMgEQAIgEAIgIQAcgYARgVQAUgcAHgdIAAgLQAAgLgEgGQgFgHgKgCIATADQATAHAfATQA3AiA7AmIAJASIisBtg");
	this.shape_17.setTransform(7.5613,11.8868,1.225,1.225);

	this.instance_4 = new lib.Symbol5();
	this.instance_4.setTransform(18.8,18.75,0.9816,0.9816,0,0,0,57.5,142.2);

	this.instance_5 = new lib.CachedBmp_21();
	this.instance_5.setTransform(-25.05,2.3,0.3206,0.3206);

	this.instance_6 = new lib.Symbol6();
	this.instance_6.setTransform(20.3,19.5,0.9794,0.9794,0,0,0,65.3,134.6);

	this.shape_18 = new cjs.Shape();
	this.shape_18.graphics.f().s("#2B2B2A").ss(1.1).p("AhLhUQgIAEgJAHQgKAKgGAOQgGAQgCAYQgEA6ATAsQACACACAAQBuADBuAAIAAjDQg/AAg9AAQgnABgSAGQgGABgLAFQAJgDAIADQALAFAHARQAKAcgCAiQgCAagLAkQgEANgEAGQgHAKgJAAQgLABgIgKQgEgEgFgOQgLgiACgaQABggAQgYQAGgJAFgDQAIgFAHAEQAGACADAIQAHAOgBAYQgBAcgGAfQgCALgFAHQgEAEgFABQgFABgEgCQgDgCgDgGQgHgTAGgeQAFgVAHgKQAEgGADAAQAIAAACAMQAEAegOAcQgBABgBAAQgCACgBgFQgEgRANgj");
	this.shape_18.setTransform(5.041,28.0884,1.0914,1.0914);

	this.shape_19 = new cjs.Shape();
	this.shape_19.graphics.f("#737372").s().p("AhjBfQgBAAAAAAQgBAAAAAAQgBgBAAAAQgBAAAAgBQgTgsADg6QACgYAGgQQAHgOAJgKQAKgHAHgEQAKgDAHADQAMAFAGARQAJAWAAAcIgBAMQgCAagKAkQgEANgEAGQgHAKgKAAIgBAAIAAAAIgBAAIAAAAQgIAAgHgHIAAAAIgBgCIAAAAQgEgEgGgOQgJgeAAgYIAAgGQABggARgYQAGgJAFgDQAEgDAEAAIABAAIAAAAIAEABIAAAAIABAAIABABQAFACAEAIQAFAMAAATIAAAHQAAAcgHAfQgBALgGAHQgDAEgFABIgBAAIgDAAQgDAAgCgBQgDgCgDgGQgEgKAAgNQAAgMADgOQAFgVAHgKQADgGAEAAIAAAAIAAAAIAAAAIABAAQAGAAACAMIABAOQAAAWgLAWIgBABIgBAAIAAAAIAAAAIAAAAIgBAAIAAAAIgBgCIgBgBIAAgJQAAgQAJgbQgJAbAAAQIAAAJIABABIABACIAAAAIABAAIAAAAIAAAAIAAAAIABAAIABgBQALgWAAgWIgBgOQgCgMgGAAIgBAAIAAAAIAAAAIAAAAQgEAAgDAGQgHAKgFAVQgDAOAAAMQAAANAEAKQADAGADACQACABADAAIADAAIABAAQAFgBADgEQAGgHABgLQAHgfAAgcIAAgHQAAgTgFgMQgEgIgFgCIgBgBIgBAAIAAAAIgEgBIAAAAIgBAAQgEAAgEADQgFADgGAJQgRAYgBAgIAAAGQAAAYAJAeQAGAOAEAEIAAAAIABACIAAAAQAHAHAIAAIAAAAIABAAIAAAAIABAAQAKAAAHgKQAEgGAEgNQAKgkACgaIABgMQAAgcgJgWQgGgRgMgFQgHgDgKADIARgGQATgGAmgBIB8AAIAADDQhuAAhtgDg");
	this.shape_19.setTransform(5.3221,28.0871,1.0914,1.0914);

	this.shape_20 = new cjs.Shape();
	this.shape_20.graphics.f().s("#2B2B2A").ss(1.1).p("ACIgRQgEgpgggcQh7gGhngEQAAALgDAEQgMAQANCiQBtAABtgEQAMgBAFgKQAhg4gEgrg");
	this.shape_20.setTransform(46.8213,27.4377,1.1901,1.1901);

	this.shape_21 = new cjs.Shape();
	this.shape_21.graphics.f("#737372").s().p("AiBhSQADgDAAgLQBnADB7AHQAgAbAEAqQAEArghA4QgFAKgMABQhtAEhtAAQgNiiAMgRg");
	this.shape_21.setTransform(46.8213,27.4489,1.1901,1.1901);

	this.instance_7 = new lib.Symbol7();
	this.instance_7.setTransform(9.6,18.5,0.9329,0.9329,0,0,0,51.4,152);

	this.instance_8 = new lib.CachedBmp_22();
	this.instance_8.setTransform(-10.75,11.25,0.3206,0.3206);

	this.instance_9 = new lib.Symbol12();
	this.instance_9.setTransform(8.3,20.15,0.7368,0.7368,0,0,0,61.6,187.8);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance},{t:this.shape_3,p:{scaleX:1.3609,scaleY:1.3608,skewY:-0.7381,x:35.734,y:19.5666}},{t:this.shape_2,p:{scaleX:1.3609,scaleY:1.3608,skewY:-0.7381,x:35.9382,y:19.5599}},{t:this.shape_1},{t:this.shape}]}).to({state:[{t:this.shape_5},{t:this.shape_4},{t:this.instance_1},{t:this.shape_3,p:{scaleX:1.3528,scaleY:1.3528,skewY:0,x:33.779,y:21.868}},{t:this.shape_2,p:{scaleX:1.3528,scaleY:1.3528,skewY:0,x:33.982,y:21.8639}}]},4).to({state:[{t:this.instance_2},{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6}]},4).to({state:[{t:this.instance_3},{t:this.shape_13},{t:this.shape_12},{t:this.shape_11},{t:this.shape_10}]},4).to({state:[{t:this.instance_4},{t:this.shape_17},{t:this.shape_16},{t:this.shape_15},{t:this.shape_14}]},4).to({state:[{t:this.instance_6},{t:this.instance_5}]},4).to({state:[{t:this.instance_7},{t:this.shape_21},{t:this.shape_20},{t:this.shape_19},{t:this.shape_18}]},4).to({state:[{t:this.instance_9},{t:this.instance_8}]},4).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-66.1,-125.9,162.8,296.6);


(lib.אישהולך = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.Symbol1_1();
	this.instance.setTransform(12.3,17.3,1.2203,1.2203,0,0,0,53.6,114.7);

	this.instance_1 = new lib.Symbol2_1();
	this.instance_1.setTransform(14.65,19,1.0748,1.0748,0,0,0,73.2,129.4);

	this.instance_2 = new lib.Symbol3_1();
	this.instance_2.setTransform(5.05,15.5,1.0177,1.0177,0,0,0,46.6,139);

	this.instance_3 = new lib.Symbol4_1();
	this.instance_3.setTransform(7.05,21.3,1,1,0,0,0,47.9,141);

	this.instance_4 = new lib.Symbol5();
	this.instance_4.setTransform(18.8,18.75,0.9816,0.9816,0,0,0,57.6,142.3);

	this.instance_5 = new lib.Symbol6();
	this.instance_5.setTransform(20.35,19.5,0.9794,0.9794,0,0,0,66.1,143.5);

	this.instance_6 = new lib.Symbol7();
	this.instance_6.setTransform(9.6,18.5,0.9329,0.9329,0,0,0,51.4,152);

	this.instance_7 = new lib.Symbol12();
	this.instance_7.setTransform(8.3,20.15,0.7368,0.7368,0,0,0,64.7,190.8);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance}]}).to({state:[{t:this.instance_1}]},4).to({state:[{t:this.instance_2}]},4).to({state:[{t:this.instance_3}]},4).to({state:[{t:this.instance_4}]},4).to({state:[{t:this.instance_5}]},4).to({state:[{t:this.instance_6}]},4).to({state:[{t:this.instance_7}]},4).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-66.2,-125.9,162.8,287.9);


(lib.Scene_1_כוכבים = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// כוכבים
	this.instance = new lib.כוכב2("synched",0);
	this.instance.setTransform(769.35,-9.45,1,1,0,0,0,30.3,30.3);

	this.instance_1 = new lib.כוכב1("synched",0);
	this.instance_1.setTransform(519.5,151.75,0.5524,0.5524,0,0,0,20.8,78);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.instance_1},{t:this.instance}]},518).wait(112));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.Scene_1_דשא = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// דשא
	this.instance = new lib.Tween10("synched",0);
	this.instance.setTransform(123.35,558.45);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(477));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.Scene_1_בור = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// בור
	this.instance = new lib.Tween8("synched",0);
	this.instance.setTransform(186.4,727.1);
	this.instance._off = true;

	this.instance_1 = new lib.Tween9("synched",0);
	this.instance_1.setTransform(450.6,651.55);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.instance}]},272).to({state:[{t:this.instance_1}]},56).wait(149));
	this.timeline.addTween(cjs.Tween.get(this.instance).wait(272).to({_off:false},0).to({_off:true,x:450.6,y:651.55},56).wait(149));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.Scene_1_שביל_1 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// שביל
	this.instance = new lib.Symbol13();
	this.instance.setTransform(678.85,620.2,1.3066,1.3066,0,0,0,644.8,122.5);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(757).to({_off:false},0).wait(1).to({regX:652.1,x:689.05,y:620},0).wait(1).to({x:689.7,y:619.85},0).wait(1).to({x:690.3,y:619.7},0).wait(1).to({x:690.95,y:619.55},0).wait(1).to({x:691.6,y:619.4},0).wait(1).to({x:692.2,y:619.25},0).wait(1).to({x:692.85,y:619.1},0).wait(1).to({x:693.5,y:618.95},0).wait(1).to({x:694.15,y:618.8},0).wait(1).to({x:694.75,y:618.65},0).wait(1).to({x:695.4,y:618.5},0).wait(1).to({x:696.05,y:618.35},0).wait(1).to({x:696.65,y:618.2},0).wait(1).to({x:697.3,y:618.05},0).wait(1).to({x:697.95,y:617.9},0).wait(1).to({x:698.55,y:617.75},0).wait(1).to({x:699.2,y:617.6},0).wait(1).to({x:699.85,y:617.45},0).wait(1).to({x:700.5,y:617.25},0).wait(1).to({x:701.1,y:617.1},0).wait(1).to({x:701.75,y:616.95},0).wait(1).to({x:702.4,y:616.8},0).wait(1).to({x:703,y:616.65},0).wait(1).to({x:703.65,y:616.5},0).wait(1).to({x:704.3,y:616.35},0).wait(1).to({x:704.9,y:616.2},0).wait(1).to({x:705.55,y:616.05},0).wait(1).to({x:706.2,y:615.9},0).wait(1).to({x:706.85,y:615.75},0).wait(1).to({x:707.45,y:615.6},0).wait(1).to({x:708.1,y:615.45},0).wait(1).to({x:708.75,y:615.3},0).wait(1).to({x:709.35,y:615.15},0).wait(1).to({x:710,y:615},0).wait(1).to({x:710.65,y:614.85},0).wait(1).to({x:711.25,y:614.7},0).wait(1).to({x:711.9,y:614.55},0).wait(1).to({x:712.55,y:614.4},0).wait(1).to({x:713.2,y:614.2},0).wait(1).to({x:713.8,y:614.05},0).wait(1).to({x:714.45,y:613.9},0).wait(1).to({x:715.1,y:613.75},0).wait(1).to({x:715.7,y:613.6},0).wait(1).to({x:716.35,y:613.45},0).wait(1).to({x:717,y:613.3},0).wait(1).to({x:717.6,y:613.15},0).wait(1).to({x:718.25,y:613},0).wait(1).to({x:718.9,y:612.85},0).wait(1).to({x:719.55,y:612.7},0).wait(1).to({x:720.15,y:612.55},0).wait(1).to({x:720.8,y:612.4},0).wait(1).to({x:721.45,y:612.25},0).wait(1).to({x:722.05,y:612.1},0).wait(1).to({x:722.7,y:611.95},0).wait(1).to({x:723.35,y:611.8},0).wait(1).to({x:723.95,y:611.65},0).wait(1).to({x:724.6,y:611.5},0).wait(1).to({x:725.25,y:611.35},0).wait(1).to({x:725.9,y:611.15},0).wait(1).to({x:726.5,y:611},0).wait(1).to({x:727.15,y:610.85},0).wait(1).to({x:727.8,y:610.7},0).wait(1).to({x:728.4,y:610.55},0).wait(1).to({x:729.05,y:610.4},0).wait(1).to({x:729.7,y:610.25},0).wait(1).to({x:730.3,y:610.1},0).wait(1).to({x:730.95,y:609.95},0).wait(1).to({x:731.6,y:609.8},0).wait(1).to({x:732.25,y:609.65},0).wait(1).to({x:732.85,y:609.5},0).wait(1).to({x:733.5,y:609.35},0).wait(1).to({x:734.15,y:609.2},0).wait(1).to({x:734.75,y:609.05},0).wait(1).to({x:735.4,y:608.9},0).wait(1).to({x:736.05,y:608.75},0).wait(1).to({x:736.65,y:608.6},0).wait(1).to({x:737.3,y:608.45},0).wait(1).to({x:737.95,y:608.3},0).wait(1).to({x:738.6,y:608.1},0).wait(1).to({x:739.2,y:607.95},0).wait(1).to({x:739.85,y:607.8},0).wait(1).to({x:740.5,y:607.65},0).wait(1).to({x:741.1,y:607.5},0).wait(1).to({x:741.75,y:607.35},0).wait(1).to({x:742.4,y:607.2},0).wait(1).to({x:743,y:607.05},0).wait(1).to({x:743.65,y:606.9},0).wait(1).to({x:744.3,y:606.75},0).wait(1).to({x:744.95,y:606.6},0).wait(1).to({x:745.55,y:606.45},0).wait(1).to({x:746.2,y:606.3},0).wait(1).to({x:746.85,y:606.15},0).wait(1).to({x:747.45,y:606},0).wait(1).to({x:748.1,y:605.85},0).wait(1).to({x:748.75,y:605.7},0).wait(1).to({x:749.35,y:605.55},0).wait(1).to({x:750,y:605.4},0).wait(1).to({x:750.65,y:605.2},0).wait(1).to({x:751.3,y:605.05},0).wait(1).to({x:751.9,y:604.9},0).wait(1).to({x:752.55,y:604.75},0).wait(1).to({x:753.2,y:604.6},0).wait(1).to({x:753.8,y:604.45},0).wait(1).to({x:754.45,y:604.3},0).wait(1).to({x:755.1,y:604.15},0).wait(1).to({x:755.7,y:604},0).wait(1).to({x:756.35,y:603.85},0).wait(1).to({x:757,y:603.7},0).wait(1).to({x:757.65,y:603.55},0).wait(1).to({x:758.25,y:603.4},0).wait(1).to({x:758.9,y:603.25},0).wait(1).to({x:759.55,y:603.1},0).wait(1).to({x:760.15,y:602.95},0).wait(1).to({x:760.8,y:602.8},0).wait(1).to({x:761.45,y:602.65},0).wait(1).to({x:762.05,y:602.5},0).wait(1).to({x:762.7,y:602.35},0).wait(1).to({x:763.35,y:602.15},0).wait(1).to({x:764,y:602},0).wait(1).to({x:764.6,y:601.85},0).wait(1).to({x:765.25,y:601.7},0).wait(1).to({x:765.9,y:601.55},0).wait(1).to({x:766.5,y:601.4},0).wait(1).to({x:767.15,y:601.25},0).wait(1).to({x:767.8,y:601.1},0).wait(1).to({x:768.4,y:600.95},0).wait(1).to({x:769.05,y:600.8},0).wait(1).to({x:769.7,y:600.65},0).wait(1).to({x:770.35,y:600.5},0).wait(1).to({x:770.95,y:600.35},0).wait(1).to({x:771.6,y:600.2},0).wait(1).to({x:772.25,y:600.05},0).wait(1).to({x:772.85,y:599.9},0).wait(1).to({x:773.5,y:599.75},0).wait(1).to({x:774.15,y:599.6},0).wait(1).to({x:774.75,y:599.45},0).wait(1).to({x:775.4,y:599.3},0).wait(1).to({x:776.05,y:599.1},0).wait(1).to({x:776.65,y:598.95},0).wait(1).to({x:777.3,y:598.8},0).wait(1).to({x:777.95,y:598.65},0).wait(1).to({x:778.6,y:598.5},0).wait(1).to({x:779.2,y:598.35},0).wait(1).to({x:779.85,y:598.2},0).wait(1).to({x:780.5,y:598.05},0).wait(1).to({x:781.1,y:597.9},0).wait(1).to({x:781.75,y:597.75},0).wait(1).to({x:782.4,y:597.6},0).wait(1).to({x:783,y:597.45},0).wait(1).to({x:783.65,y:597.3},0).wait(1).to({x:784.3,y:597.15},0).wait(1).to({x:784.95,y:597},0).wait(1).to({x:785.55,y:596.85},0).wait(1).to({x:786.2,y:596.7},0).wait(1).to({x:786.85,y:596.55},0).wait(1).to({x:787.45,y:596.4},0).wait(1).to({x:788.1,y:596.2},0).wait(1).to({x:788.75,y:596.05},0).wait(1).to({x:789.35,y:595.9},0).wait(1).to({x:790,y:595.75},0).wait(1).to({x:790.65,y:595.6},0).wait(1).to({x:791.3,y:595.45},0).wait(1).to({x:791.9,y:595.3},0).wait(1).to({x:792.55,y:595.15},0).wait(1).to({x:793.2,y:595},0).wait(1).to({x:793.8,y:594.85},0).wait(1).to({x:794.45,y:594.7},0).wait(1).to({x:795.1,y:594.55},0).wait(1).to({x:795.7,y:594.4},0).wait(1).to({x:796.35,y:594.25},0).wait(1).to({x:797,y:594.1},0).wait(1).to({x:797.65,y:593.95},0).wait(1).to({x:798.25,y:593.8},0).wait(1).to({x:798.9,y:593.65},0).wait(1).to({x:799.55,y:593.5},0).wait(1).to({x:800.15,y:593.35},0).wait(1).to({x:800.8,y:593.15},0).wait(1).to({x:801.45,y:593},0).wait(1).to({x:802.05,y:592.85},0).wait(1).to({x:802.7,y:592.7},0).wait(1).to({x:803.35,y:592.55},0).wait(1).to({x:804,y:592.4},0).wait(1).to({x:804.6,y:592.25},0).wait(1).to({x:805.25,y:592.1},0).wait(1).to({x:805.9,y:591.95},0).wait(1).to({x:806.5,y:591.8},0).wait(1).to({x:807.15,y:591.65},0).wait(1).to({x:807.8,y:591.5},0).wait(1).to({x:808.4,y:591.35},0).wait(1).to({x:809.05,y:591.2},0).wait(1).to({x:809.7,y:591.05},0).wait(1).to({x:810.35,y:590.9},0).wait(1).to({x:810.95,y:590.75},0).wait(1).to({x:811.6,y:590.6},0).wait(1).to({x:812.25,y:590.45},0).wait(1).to({x:812.85,y:590.3},0).wait(1).to({x:813.5,y:590.1},0).wait(1).to({x:814.15,y:589.95},0).wait(1).to({x:814.75,y:589.8},0).wait(1).to({x:815.4,y:589.65},0).wait(1).to({x:816.05,y:589.5},0).wait(1).to({x:816.7,y:589.35},0).wait(1).to({x:817.3,y:589.2},0).wait(1).to({x:817.95,y:589.05},0).wait(1).to({x:818.6,y:588.9},0).wait(1).to({x:819.2,y:588.75},0).wait(1).to({x:819.85,y:588.6},0).wait(1).to({x:820.5,y:588.45},0).wait(1).to({x:821.1,y:588.3},0).wait(1).to({x:821.75,y:588.15},0).wait(1).to({x:822.4,y:588},0).wait(1).to({x:823.05,y:587.85},0).wait(1).to({x:823.65,y:587.7},0).wait(1).to({x:824.3,y:587.55},0).wait(1).to({x:824.95,y:587.4},0).wait(1).to({x:825.55,y:587.2},0).wait(1).to({x:826.2,y:587.05},0).wait(1).to({x:826.85,y:586.9},0).wait(1).to({x:827.45,y:586.75},0).wait(1).to({x:828.1,y:586.6},0).wait(1).to({x:828.75,y:586.45},0).wait(1).to({x:829.4,y:586.3},0).wait(1).to({x:830,y:586.15},0).wait(1).to({x:830.65,y:586},0).wait(1).to({x:831.3,y:585.85},0).wait(1).to({x:831.9,y:585.7},0).wait(1).to({x:832.55,y:585.55},0).wait(1).to({x:833.2,y:585.4},0).wait(1).to({x:833.8,y:585.25},0).wait(1).to({x:834.45,y:585.1},0).wait(1).to({x:835.1,y:584.95},0).wait(1).to({x:835.75,y:584.8},0).wait(1).to({x:836.35,y:584.65},0).wait(1).to({x:837,y:584.5},0).wait(1).to({x:837.65,y:584.35},0).wait(1).to({x:838.25,y:584.15},0).wait(1).to({x:838.9,y:584},0).wait(1).to({x:839.55,y:583.85},0).wait(1).to({x:840.15,y:583.7},0).wait(1).to({x:840.8,y:583.55},0).wait(1).to({x:841.45,y:583.4},0).wait(1).to({x:842.1,y:583.25},0).wait(1).to({x:842.7,y:583.1},0).wait(1).to({x:843.35,y:582.95},0).wait(1).to({x:844,y:582.8},0).wait(1).to({x:844.6,y:582.65},0).wait(1).to({x:845.25,y:582.5},0).wait(1).to({x:845.9,y:582.35},0).wait(1).to({x:846.5,y:582.2},0).wait(1).to({x:847.15,y:582.05},0).wait(1).to({x:847.8,y:581.9},0).wait(1).to({x:848.45,y:581.75},0).wait(1).to({x:849.05,y:581.6},0).wait(1).to({x:849.7,y:581.45},0).wait(1).to({x:850.35,y:581.3},0).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.Scene_1_שביל = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// שביל
	this.instance = new lib.Symbol13();
	this.instance.setTransform(427.95,635.2,1.3067,1.3067,0,0,0,652,122.5);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({scaleX:1.3066,scaleY:1.3066,x:744.2,y:605.85},259).to({scaleX:1.3067,scaleY:1.3067,x:811.3,y:599.7},55).wait(163));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.Scene_1_רקע_1 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// רקע
	this.instance = new lib.Tween10("synched",0);
	this.instance.setTransform(1139.45,562.55);

	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#2B2B2A").p("EhlPhAbMDKeAAAMAAACA3MjKeAAAg");
	this.shape.setTransform(647.95,412.375);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.lf(["#8ED3F6","#ECF7FE"],[0,1],-0.9,-205.5,0.5,79.7).s().p("EhlPBAcMAAAiA3MDKeAAAMAAACA3g");
	this.shape_1.setTransform(647.95,412.375);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.shape_1},{t:this.shape},{t:this.instance}]},757).wait(256));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.Scene_1_ציפור_2 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// ציפור_2
	this.instance = new lib.ציפור("synched",0);
	this.instance.setTransform(112,199.05,1.2747,1.2747,0,0,0,-564.4,-190.8);

	
	var _tweenStr_0 = cjs.Tween.get(this.instance).wait(1).to({regX:-564.9,regY:-191.2,scaleX:1.2743,scaleY:1.2743,x:114.15,y:198.15,startPosition:1},0).wait(1).to({scaleX:1.2739,scaleY:1.2739,x:117,y:197.85,startPosition:2},0).wait(1).to({scaleX:1.2735,scaleY:1.2735,x:119.8,y:197.5,startPosition:3},0).wait(1).to({scaleX:1.2731,scaleY:1.2731,x:122.6,y:197.2,startPosition:4},0).wait(1).to({scaleX:1.2728,scaleY:1.2728,x:125.45,y:196.8,startPosition:5},0).wait(1).to({scaleX:1.2724,scaleY:1.2724,x:128.25,y:196.5,startPosition:6},0).wait(1).to({scaleX:1.272,scaleY:1.272,x:131.05,y:196.15,startPosition:7},0).wait(1).to({scaleX:1.2716,scaleY:1.2716,x:133.9,y:195.8,startPosition:8},0).wait(1).to({scaleX:1.2712,scaleY:1.2712,x:136.7,y:195.45,startPosition:9},0).wait(1).to({scaleX:1.2708,scaleY:1.2708,x:139.5,y:195.1,startPosition:0},0).wait(1).to({scaleX:1.2704,scaleY:1.2704,x:142.3,y:194.8,startPosition:1},0).wait(1).to({scaleX:1.2701,scaleY:1.2701,x:145.15,y:194.45,startPosition:2},0).wait(1).to({scaleX:1.2697,scaleY:1.2697,x:147.95,y:194.1,startPosition:3},0).wait(1).to({scaleX:1.2693,scaleY:1.2693,x:150.8,y:193.75,startPosition:4},0).wait(1).to({scaleX:1.2689,scaleY:1.2689,x:153.6,y:193.45,startPosition:5},0).wait(1).to({scaleX:1.2685,scaleY:1.2685,x:156.4,y:193.1,startPosition:6},0).wait(1).to({scaleX:1.2681,scaleY:1.2681,x:159.25,y:192.75,startPosition:7},0).wait(1).to({scaleX:1.2678,scaleY:1.2678,x:162.05,y:192.4,startPosition:8},0).wait(1).to({scaleX:1.2674,scaleY:1.2674,x:164.85,y:192.1,startPosition:9},0).wait(1).to({scaleX:1.267,scaleY:1.267,x:167.7,y:191.75,startPosition:0},0).wait(1).to({scaleX:1.2666,scaleY:1.2666,x:170.5,y:191.4,startPosition:1},0).wait(1).to({scaleX:1.2662,scaleY:1.2662,x:173.3,y:191.05,startPosition:2},0).wait(1).to({scaleX:1.2658,scaleY:1.2658,x:176.15,y:190.7,startPosition:3},0).wait(1).to({scaleX:1.2655,scaleY:1.2655,x:178.95,y:190.4,startPosition:4},0).wait(1).to({scaleX:1.2651,scaleY:1.2651,x:181.75,y:190,startPosition:5},0).wait(1).to({scaleX:1.2647,scaleY:1.2647,x:184.6,y:189.7,startPosition:6},0).wait(1).to({scaleX:1.2643,scaleY:1.2643,x:187.4,y:189.35,startPosition:7},0).wait(1).to({scaleX:1.2639,scaleY:1.2639,x:190.2,y:189.05,startPosition:8},0).wait(1).to({scaleX:1.2635,scaleY:1.2635,x:193.05,y:188.65,startPosition:9},0).wait(1).to({scaleX:1.2632,scaleY:1.2632,x:195.85,y:188.35,startPosition:0},0).wait(1).to({scaleX:1.2628,scaleY:1.2628,x:198.65,y:188,startPosition:1},0).wait(1).to({scaleX:1.2624,scaleY:1.2624,x:201.5,y:187.7,startPosition:2},0).wait(1).to({scaleX:1.262,scaleY:1.262,x:204.3,y:187.3,startPosition:3},0).wait(1).to({scaleX:1.2616,scaleY:1.2616,x:207.1,y:187,startPosition:4},0).wait(1).to({scaleX:1.2612,scaleY:1.2612,x:209.95,y:186.65,startPosition:5},0).wait(1).to({scaleX:1.2608,scaleY:1.2608,x:212.75,y:186.35,startPosition:6},0).wait(1).to({scaleX:1.2605,scaleY:1.2605,x:215.55,y:186,startPosition:7},0).wait(1).to({scaleX:1.2601,scaleY:1.2601,x:218.4,y:185.6,startPosition:8},0).wait(1).to({scaleX:1.2597,scaleY:1.2597,x:221.2,y:185.3,startPosition:9},0).wait(1).to({scaleX:1.2593,scaleY:1.2593,x:224,y:184.95,startPosition:0},0).wait(1).to({scaleX:1.2589,scaleY:1.2589,x:226.85,y:184.65,startPosition:1},0).wait(1).to({scaleX:1.2585,scaleY:1.2585,x:229.65,y:184.25,startPosition:2},0).wait(1).to({scaleX:1.2582,scaleY:1.2582,x:232.45,y:183.95,startPosition:3},0).wait(1).to({scaleX:1.2578,scaleY:1.2578,x:235.3,y:183.6,startPosition:4},0).wait(1).to({scaleX:1.2574,scaleY:1.2574,x:238.1,y:183.3,startPosition:5},0).wait(1).to({scaleX:1.257,scaleY:1.257,x:240.9,y:182.9,startPosition:6},0).wait(1).to({scaleX:1.2566,scaleY:1.2566,x:243.75,y:182.6,startPosition:7},0).wait(1).to({scaleX:1.2562,scaleY:1.2562,x:246.55,y:182.25,startPosition:8},0).wait(1).to({scaleX:1.2559,scaleY:1.2559,x:249.35,y:181.95,startPosition:9},0).wait(1).to({scaleX:1.2555,scaleY:1.2555,x:252.2,y:181.55,startPosition:0},0).wait(1).to({scaleX:1.2551,scaleY:1.2551,x:255,y:181.25,startPosition:1},0).wait(1).to({scaleX:1.2547,scaleY:1.2547,x:257.8,y:180.9,startPosition:2},0).wait(1).to({scaleX:1.2543,scaleY:1.2543,x:260.65,y:180.55,startPosition:3},0).wait(1).to({scaleX:1.2539,scaleY:1.2539,x:263.45,y:180.2,startPosition:4},0).wait(1).to({scaleX:1.2536,scaleY:1.2536,x:266.3,y:179.85,startPosition:5},0).wait(1).to({scaleX:1.2532,scaleY:1.2532,x:269.1,y:179.55,startPosition:6},0).wait(1).to({scaleX:1.2528,scaleY:1.2528,x:271.9,y:179.2,startPosition:7},0).wait(1).to({scaleX:1.2524,scaleY:1.2524,x:274.7,y:178.85,startPosition:8},0).wait(1).to({scaleX:1.252,scaleY:1.252,x:277.55,y:178.5,startPosition:9},0).wait(1).to({scaleX:1.2516,scaleY:1.2516,x:280.35,y:178.2,startPosition:0},0).wait(1).to({scaleX:1.2513,scaleY:1.2513,x:283.15,y:177.85,startPosition:1},0).wait(1).to({scaleX:1.2509,scaleY:1.2509,x:286,y:177.5,startPosition:2},0).wait(1).to({scaleX:1.2505,scaleY:1.2505,x:288.8,y:177.15,startPosition:3},0).wait(1).to({scaleX:1.2501,scaleY:1.2501,x:291.6,y:176.85,startPosition:4},0).wait(1).to({scaleX:1.2497,scaleY:1.2497,x:294.45,y:176.5,startPosition:5},0).wait(1).to({scaleX:1.2493,scaleY:1.2493,x:297.25,y:176.15,startPosition:6},0).wait(1).to({scaleX:1.2489,scaleY:1.2489,x:300.05,y:175.8,startPosition:7},0).wait(1).to({scaleX:1.2486,scaleY:1.2486,x:302.9,y:175.5,startPosition:8},0).wait(1).to({scaleX:1.2482,scaleY:1.2482,x:305.7,y:175.15,startPosition:9},0).wait(1).to({scaleX:1.2478,scaleY:1.2478,x:308.5,y:174.75,startPosition:0},0).wait(1).to({scaleX:1.2474,scaleY:1.2474,x:311.35,y:174.45,startPosition:1},0).wait(1).to({scaleX:1.247,scaleY:1.247,x:314.15,y:174.1,startPosition:2},0).wait(1).to({scaleX:1.2466,scaleY:1.2466,x:316.95,y:173.8,startPosition:3},0).wait(1).to({scaleX:1.2463,scaleY:1.2463,x:319.8,y:173.4,startPosition:4},0).wait(1).to({scaleX:1.2459,scaleY:1.2459,x:322.65,y:173.1,startPosition:5},0).wait(1).to({scaleX:1.2455,scaleY:1.2455,x:325.5,y:172.75,startPosition:6},0).wait(1).to({scaleX:1.2451,scaleY:1.2451,x:328.3,y:172.45,startPosition:7},0).wait(1).to({scaleX:1.2447,scaleY:1.2447,x:331.1,y:172.1,startPosition:8},0).wait(1).to({scaleX:1.2443,scaleY:1.2443,x:333.9,y:171.75,startPosition:9},0).wait(1).to({scaleX:1.244,scaleY:1.244,x:336.75,y:171.4,startPosition:0},0).wait(1).to({scaleX:1.2436,scaleY:1.2436,x:339.55,y:171.1,startPosition:1},0).wait(1).to({scaleX:1.2432,scaleY:1.2432,x:342.4,y:170.75,startPosition:2},0).wait(1).to({scaleX:1.2428,scaleY:1.2428,x:345.2,y:170.4,startPosition:3},0).wait(1).to({scaleX:1.2424,scaleY:1.2424,x:348,y:170.05,startPosition:4},0).wait(1).to({scaleX:1.242,scaleY:1.242,x:350.8,y:169.7,startPosition:5},0).wait(1).to({scaleX:1.2417,scaleY:1.2417,x:353.65,y:169.4,startPosition:6},0).wait(1).to({scaleX:1.2413,scaleY:1.2413,x:356.45,y:169,startPosition:7},0).wait(1).to({scaleX:1.2409,scaleY:1.2409,x:359.3,y:168.7,startPosition:8},0).wait(1).to({scaleX:1.2405,scaleY:1.2405,x:362.1,y:168.35,startPosition:9},0).wait(1).to({scaleX:1.2401,scaleY:1.2401,x:364.9,y:168.05,startPosition:0},0).wait(1).to({scaleX:1.2397,scaleY:1.2397,x:367.75,y:167.65,startPosition:1},0).wait(1).to({scaleX:1.2394,scaleY:1.2394,x:370.55,y:167.35,startPosition:2},0).wait(1).to({scaleX:1.239,scaleY:1.239,x:373.35,y:167,startPosition:3},0).wait(1).to({scaleX:1.2386,scaleY:1.2386,x:376.2,y:166.7,startPosition:4},0).wait(1).to({scaleX:1.2382,scaleY:1.2382,x:379,y:166.3,startPosition:5},0).wait(1).to({scaleX:1.2378,scaleY:1.2378,x:381.8,y:166,startPosition:6},0).wait(1).to({scaleX:1.2374,scaleY:1.2374,x:384.65,y:165.65,startPosition:7},0).wait(1).to({scaleX:1.237,scaleY:1.237,x:387.45,y:165.35,startPosition:8},0).wait(1).to({scaleX:1.2367,scaleY:1.2367,x:390.25,y:164.95,startPosition:9},0).wait(1).to({scaleX:1.2363,scaleY:1.2363,x:393.1,y:164.65,startPosition:0},0).wait(1).to({scaleX:1.2359,scaleY:1.2359,x:395.9,y:164.3,startPosition:1},0).wait(1).to({scaleX:1.2355,scaleY:1.2355,x:398.7,y:163.95,startPosition:2},0).wait(1).to({scaleX:1.2351,scaleY:1.2351,x:401.55,y:163.6,startPosition:3},0).wait(1).to({scaleX:1.2347,scaleY:1.2347,x:404.35,y:163.25,startPosition:4},0).wait(1).to({scaleX:1.2344,scaleY:1.2344,x:407.15,y:162.95,startPosition:5},0).wait(1).to({scaleX:1.234,scaleY:1.234,x:410,y:162.6,startPosition:6},0).wait(1).to({scaleX:1.2336,scaleY:1.2336,x:412.8,y:162.25,startPosition:7},0).wait(1).to({scaleX:1.2332,scaleY:1.2332,x:415.6,y:161.9,startPosition:8},0).wait(1).to({scaleX:1.2328,scaleY:1.2328,x:418.45,y:161.6,startPosition:9},0).wait(1).to({scaleX:1.2324,scaleY:1.2324,x:421.25,y:161.25,startPosition:0},0).wait(1).to({scaleX:1.2321,scaleY:1.2321,x:424.05,y:160.9,startPosition:1},0).wait(1).to({scaleX:1.2317,scaleY:1.2317,x:426.9,y:160.55,startPosition:2},0).wait(1).to({scaleX:1.2313,scaleY:1.2313,x:429.7,y:160.25,startPosition:3},0).wait(1).to({scaleX:1.2309,scaleY:1.2309,x:432.5,y:159.9,startPosition:4},0).wait(1).to({scaleX:1.2305,scaleY:1.2305,x:435.35,y:159.55,startPosition:5},0).wait(1).to({scaleX:1.2301,scaleY:1.2301,x:438.15,y:159.2,startPosition:6},0).wait(1).to({scaleX:1.2298,scaleY:1.2298,x:440.95,y:158.85,startPosition:7},0).wait(1).to({scaleX:1.2294,scaleY:1.2294,x:443.8,y:158.55,startPosition:8},0).wait(1).to({scaleX:1.229,scaleY:1.229,x:446.6,y:158.2,startPosition:9},0).wait(1).to({scaleX:1.2286,scaleY:1.2286,x:449.4,y:157.85,startPosition:0},0).wait(1).to({scaleX:1.2282,scaleY:1.2282,x:452.25,y:157.5,startPosition:1},0).wait(1).to({scaleX:1.2278,scaleY:1.2278,x:455.05,y:157.2,startPosition:2},0).wait(1).to({scaleX:1.2274,scaleY:1.2274,x:457.85,y:156.85,startPosition:3},0).wait(1).to({scaleX:1.2271,scaleY:1.2271,x:460.7,y:156.5,startPosition:4},0).wait(1).to({scaleX:1.2267,scaleY:1.2267,x:463.5,y:156.15,startPosition:5},0).wait(1).to({scaleX:1.2263,scaleY:1.2263,x:466.3,y:155.85,startPosition:6},0).wait(1).to({scaleX:1.2259,scaleY:1.2259,x:469.15,y:155.5,startPosition:7},0).wait(1).to({scaleX:1.2255,scaleY:1.2255,x:471.95,y:155.15,startPosition:8},0).wait(1).to({scaleX:1.2251,scaleY:1.2251,x:474.75,y:154.8,startPosition:9},0).wait(1).to({scaleX:1.2248,scaleY:1.2248,x:477.6,y:154.5,startPosition:0},0).wait(1).to({scaleX:1.2244,scaleY:1.2244,x:480.4,y:154.15,startPosition:1},0).wait(1).to({scaleX:1.224,scaleY:1.224,x:483.2,y:153.75,startPosition:2},0).wait(1).to({scaleX:1.2236,scaleY:1.2236,x:486.05,y:153.45,startPosition:3},0).wait(1).to({scaleX:1.2232,scaleY:1.2232,x:488.85,y:153.1,startPosition:4},0).wait(1).to({scaleX:1.2228,scaleY:1.2228,x:491.65,y:152.8,startPosition:5},0).wait(1).to({scaleX:1.2225,scaleY:1.2225,x:494.5,y:152.4,startPosition:6},0).wait(1).to({scaleX:1.2221,scaleY:1.2221,x:497.3,y:152.1,startPosition:7},0).wait(1).to({scaleX:1.2217,scaleY:1.2217,x:500.1,y:151.75,startPosition:8},0).wait(1).to({scaleX:1.2213,scaleY:1.2213,x:502.95,y:151.45,startPosition:9},0).wait(1).to({scaleX:1.2209,scaleY:1.2209,x:505.75,y:151.05,startPosition:0},0).wait(1).to({scaleX:1.2205,scaleY:1.2205,x:508.55,y:150.75,startPosition:1},0).wait(1).to({scaleX:1.2202,scaleY:1.2202,x:511.4,y:150.4,startPosition:2},0).wait(1).to({scaleX:1.2198,scaleY:1.2198,x:514.2,y:150.1,startPosition:3},0).wait(1).to({scaleX:1.2194,scaleY:1.2194,x:517,y:149.7,startPosition:4},0).wait(1).to({scaleX:1.219,scaleY:1.219,x:519.85,y:149.4,startPosition:5},0).wait(1).to({scaleX:1.2186,scaleY:1.2186,x:522.65,y:149.05,startPosition:6},0).wait(1).to({scaleX:1.2182,scaleY:1.2182,x:525.45,y:148.7,startPosition:7},0).wait(1).to({scaleX:1.2179,scaleY:1.2179,x:528.3,y:148.35,startPosition:8},0).wait(1).to({scaleX:1.2175,scaleY:1.2175,x:531.1,y:148,startPosition:9},0).wait(1).to({scaleX:1.2171,scaleY:1.2171,x:533.95,y:147.7,startPosition:0},0).wait(1).to({scaleX:1.2167,scaleY:1.2167,x:536.75,y:147.35,startPosition:1},0).wait(1).to({scaleX:1.2163,scaleY:1.2163,x:539.55,y:147,startPosition:2},0).wait(1).to({scaleX:1.2159,scaleY:1.2159,x:542.35,y:146.65,startPosition:3},0).wait(1).to({scaleX:1.2155,scaleY:1.2155,x:545.2,y:146.35,startPosition:4},0).wait(1).to({scaleX:1.2152,scaleY:1.2152,x:548,y:146,startPosition:5},0).wait(1).to({scaleX:1.2148,scaleY:1.2148,x:550.85,y:145.65,startPosition:6},0).wait(1).to({scaleX:1.2144,scaleY:1.2144,x:553.65,y:145.3,startPosition:7},0).wait(1).to({scaleX:1.214,scaleY:1.214,x:556.45,y:145,startPosition:8},0).wait(1).to({scaleX:1.2136,scaleY:1.2136,x:559.25,y:144.65,startPosition:9},0).wait(1).to({scaleX:1.2132,scaleY:1.2132,x:562.1,y:144.35,startPosition:0},0).wait(1).to({scaleX:1.2129,scaleY:1.2129,x:564.95,y:143.95,startPosition:1},0).wait(1).to({scaleX:1.2125,scaleY:1.2125,x:567.8,y:143.65,startPosition:2},0).wait(1).to({scaleX:1.2121,scaleY:1.2121,x:570.6,y:143.3,startPosition:3},0).wait(1).to({scaleX:1.2117,scaleY:1.2117,x:573.4,y:142.95,startPosition:4},0).wait(1).to({scaleX:1.2113,scaleY:1.2113,x:576.25,y:142.6,startPosition:5},0).wait(1).to({scaleX:1.2109,scaleY:1.2109,x:579.05,y:142.25,startPosition:6},0).wait(1).to({scaleX:1.2106,scaleY:1.2106,x:581.85,y:141.95,startPosition:7},0).wait(1).to({scaleX:1.2102,scaleY:1.2102,x:584.7,y:141.6,startPosition:8},0).wait(1).to({scaleX:1.2098,scaleY:1.2098,x:587.5,y:141.25,startPosition:9},0).wait(1).to({scaleX:1.2094,scaleY:1.2094,x:590.3,y:140.9,startPosition:0},0).wait(1).to({scaleX:1.209,scaleY:1.209,x:593.15,y:140.6,startPosition:1},0).wait(1).to({scaleX:1.2086,scaleY:1.2086,x:595.95,y:140.25,startPosition:2},0).wait(1).to({scaleX:1.2083,scaleY:1.2083,x:598.75,y:139.9,startPosition:3},0).wait(1).to({scaleX:1.2079,scaleY:1.2079,x:601.55,y:139.55,startPosition:4},0).wait(1).to({scaleX:1.2075,scaleY:1.2075,x:604.4,y:139.25,startPosition:5},0).wait(1).to({scaleX:1.2071,scaleY:1.2071,x:607.2,y:138.9,startPosition:6},0).wait(1).to({scaleX:1.2067,scaleY:1.2067,x:610.05,y:138.55,startPosition:7},0).wait(1).to({scaleX:1.2063,scaleY:1.2063,x:612.85,y:138.2,startPosition:8},0).wait(1).to({scaleX:1.206,scaleY:1.206,x:615.65,y:137.85,startPosition:9},0).wait(1).to({scaleX:1.2056,scaleY:1.2056,x:618.5,y:137.55,startPosition:0},0).wait(1).to({scaleX:1.2052,scaleY:1.2052,x:621.3,y:137.15,startPosition:1},0).wait(1).to({scaleX:1.2048,scaleY:1.2048,x:624.1,y:136.85,startPosition:2},0).wait(1).to({scaleX:1.2044,scaleY:1.2044,x:626.95,y:136.5,startPosition:3},0).wait(1).to({scaleX:1.204,scaleY:1.204,x:629.75,y:136.2,startPosition:4},0).wait(1).to({scaleX:1.2036,scaleY:1.2036,x:632.55,y:135.8,startPosition:5},0).wait(1).to({scaleX:1.2033,scaleY:1.2033,x:635.4,y:135.5,startPosition:6},0).wait(1).to({scaleX:1.2029,scaleY:1.2029,x:638.2,y:135.15,startPosition:7},0).wait(1).to({scaleX:1.2025,scaleY:1.2025,x:641,y:134.85,startPosition:8},0).wait(1).to({scaleX:1.2021,scaleY:1.2021,x:643.85,y:134.45,startPosition:9},0).wait(1).to({scaleX:1.2017,scaleY:1.2017,x:646.65,y:134.15,startPosition:0},0).wait(1).to({scaleX:1.2013,scaleY:1.2013,x:649.45,y:133.8,startPosition:1},0).wait(1).to({scaleX:1.201,scaleY:1.201,x:652.3,y:133.5,startPosition:2},0).wait(1).to({scaleX:1.2006,scaleY:1.2006,x:655.1,y:133.1,startPosition:3},0).wait(1).to({scaleX:1.2002,scaleY:1.2002,x:657.9,y:132.8,startPosition:4},0).wait(1).to({scaleX:1.1998,scaleY:1.1998,x:660.75,y:132.45,startPosition:5},0).wait(1).to({scaleX:1.1994,scaleY:1.1994,x:663.55,y:132.1,startPosition:6},0).wait(1).to({scaleX:1.199,scaleY:1.199,x:666.35,y:131.75,startPosition:7},0).wait(1).to({scaleX:1.1987,scaleY:1.1987,x:669.2,y:131.4,startPosition:8},0).wait(1).to({scaleX:1.1983,scaleY:1.1983,x:672,y:131.1,startPosition:9},0).wait(1).to({scaleX:1.1979,scaleY:1.1979,x:674.8,y:130.75,startPosition:0},0).wait(1).to({scaleX:1.1975,scaleY:1.1975,x:677.65,y:130.45,startPosition:1},0).wait(1).to({scaleX:1.1971,scaleY:1.1971,x:680.45,y:130.05,startPosition:2},0).wait(1).to({scaleX:1.1967,scaleY:1.1967,x:683.25,y:129.75,startPosition:3},0).wait(1).to({scaleX:1.1964,scaleY:1.1964,x:686.1,y:129.4,startPosition:4},0).wait(1).to({scaleX:1.196,scaleY:1.196,x:688.9,y:129.1,startPosition:5},0).wait(1).to({scaleX:1.1956,scaleY:1.1956,x:691.7,y:128.7,startPosition:6},0).wait(1).to({scaleX:1.1952,scaleY:1.1952,x:694.55,y:128.4,startPosition:7},0).wait(1).to({scaleX:1.1948,scaleY:1.1948,x:697.35,y:128.05,startPosition:8},0).wait(1).to({scaleX:1.1944,scaleY:1.1944,x:700.15,y:127.75,startPosition:9},0).wait(1).to({scaleX:1.1941,scaleY:1.1941,x:703,y:127.35,startPosition:0},0).wait(1).to({scaleX:1.1937,scaleY:1.1937,x:705.8,y:127,startPosition:1},0).wait(1).to({scaleX:1.1933,scaleY:1.1933,x:708.6,y:126.7,startPosition:2},0).wait(1).to({scaleX:1.1929,scaleY:1.1929,x:711.45,y:126.35,startPosition:3},0).wait(1).to({scaleX:1.1925,scaleY:1.1925,x:714.25,y:126,startPosition:4},0).wait(1).to({scaleX:1.1921,scaleY:1.1921,x:717.05,y:125.65,startPosition:5},0).wait(1).to({scaleX:1.1917,scaleY:1.1917,x:719.9,y:125.35,startPosition:6},0).wait(1).to({scaleX:1.1914,scaleY:1.1914,x:722.7,y:125,startPosition:7},0).wait(1).to({scaleX:1.191,scaleY:1.191,x:725.5,y:124.65,startPosition:8},0).wait(1).to({scaleX:1.1906,scaleY:1.1906,x:728.35,y:124.3,startPosition:9},0).wait(1).to({scaleX:1.1902,scaleY:1.1902,x:731.15,y:124,startPosition:0},0).wait(1).to({scaleX:1.1898,scaleY:1.1898,x:733.95,y:123.65,startPosition:1},0).wait(1).to({scaleX:1.1894,scaleY:1.1894,x:736.8,y:123.3,startPosition:2},0).wait(1).to({scaleX:1.1891,scaleY:1.1891,x:739.6,y:122.95,startPosition:3},0).wait(1).to({scaleX:1.1887,scaleY:1.1887,x:742.4,y:122.65,startPosition:4},0).wait(1).to({scaleX:1.1883,scaleY:1.1883,x:745.25,y:122.3,startPosition:5},0).wait(1).to({scaleX:1.1879,scaleY:1.1879,x:748.05,y:121.9,startPosition:6},0).wait(1).to({scaleX:1.1875,scaleY:1.1875,x:750.85,y:121.6,startPosition:7},0).wait(1).to({scaleX:1.1871,scaleY:1.1871,x:753.7,y:121.25,startPosition:8},0).wait(1).to({scaleX:1.1868,scaleY:1.1868,x:756.5,y:120.95,startPosition:9},0).wait(1).to({scaleX:1.1864,scaleY:1.1864,x:759.3,y:120.55,startPosition:0},0).wait(1).to({scaleX:1.186,scaleY:1.186,x:762.15,y:120.25,startPosition:1},0).wait(1).to({scaleX:1.1856,scaleY:1.1856,x:764.95,y:119.9,startPosition:2},0).wait(1).to({scaleX:1.1852,scaleY:1.1852,x:767.75,y:119.6,startPosition:3},0).wait(1).to({scaleX:1.1848,scaleY:1.1848,x:770.6,y:119.2,startPosition:4},0).wait(1).to({scaleX:1.1845,scaleY:1.1845,x:773.4,y:118.9,startPosition:5},0).wait(1).to({scaleX:1.1841,scaleY:1.1841,x:776.2,y:118.55,startPosition:6},0).wait(1).to({scaleX:1.1837,scaleY:1.1837,x:779.05,y:118.25,startPosition:7},0).wait(1).to({scaleX:1.1833,scaleY:1.1833,x:781.85,y:117.85,startPosition:8},0).wait(1).to({scaleX:1.1829,scaleY:1.1829,x:784.7,y:117.55,startPosition:9},0).wait(1).to({scaleX:1.1825,scaleY:1.1825,x:787.5,y:117.2,startPosition:0},0).wait(1).to({scaleX:1.1821,scaleY:1.1821,x:790.3,y:116.85,startPosition:1},0).wait(1).to({scaleX:1.1818,scaleY:1.1818,x:793.1,y:116.55,startPosition:2},0).wait(1).to({scaleX:1.1814,scaleY:1.1814,x:795.95,y:116.15,startPosition:3},0).wait(1).to({scaleX:1.181,scaleY:1.181,x:798.75,y:115.85,startPosition:4},0).wait(1).to({scaleX:1.1806,scaleY:1.1806,x:801.6,y:115.5,startPosition:5},0).wait(1).to({scaleX:1.1802,scaleY:1.1802,x:804.4,y:115.2,startPosition:6},0).wait(1).to({scaleX:1.1798,scaleY:1.1798,x:807.25,y:114.8,startPosition:7},0).wait(1).to({scaleX:1.1795,scaleY:1.1795,x:810.05,y:114.5,startPosition:8},0).wait(1).to({scaleX:1.1791,scaleY:1.1791,x:812.9,y:114.15,startPosition:9},0).wait(1).to({scaleX:1.1787,scaleY:1.1787,x:815.7,y:113.85,startPosition:0},0).wait(1).to({scaleX:1.1783,scaleY:1.1783,x:818.55,y:113.45,startPosition:1},0).wait(1).to({scaleX:1.1779,scaleY:1.1779,x:821.35,y:113.15,startPosition:2},0).wait(1).to({scaleX:1.1775,scaleY:1.1775,x:824.15,y:112.8,startPosition:3},0).wait(1).to({scaleX:1.1772,scaleY:1.1772,x:827,y:112.5,startPosition:4},0).wait(1).to({scaleX:1.1768,scaleY:1.1768,x:829.8,y:112.1,startPosition:5},0).wait(1).to({scaleX:1.1764,scaleY:1.1764,x:832.6,y:111.8,startPosition:6},0).wait(1).to({scaleX:1.176,scaleY:1.176,x:835.45,y:111.45,startPosition:7},0).wait(1).to({scaleX:1.1756,scaleY:1.1756,x:838.25,y:111.1,startPosition:8},0).wait(1).to({scaleX:1.1752,scaleY:1.1752,x:841.05,y:110.75,startPosition:9},0).wait(1).to({scaleX:1.1749,scaleY:1.1749,x:843.9,y:110.4,startPosition:0},0).wait(1).to({scaleX:1.1745,scaleY:1.1745,x:846.7,y:110.1,startPosition:1},0).wait(1).to({scaleX:1.1741,scaleY:1.1741,x:849.5,y:109.75,startPosition:2},0).wait(1).to({scaleX:1.1737,scaleY:1.1737,x:852.35,y:109.4,startPosition:3},0).wait(1).to({scaleX:1.1733,scaleY:1.1733,x:855.15,y:109.05,startPosition:4},0).wait(1).to({scaleX:1.1729,scaleY:1.1729,x:857.95,y:108.75,startPosition:5},0).wait(1).to({scaleX:1.1726,scaleY:1.1726,x:860.8,y:108.4,startPosition:6},0).wait(1).to({scaleX:1.1722,scaleY:1.1722,x:863.6,y:108.05,startPosition:7},0).wait(1).to({scaleX:1.1718,scaleY:1.1718,x:866.4,y:107.7,startPosition:8},0).wait(1).to({scaleX:1.1714,scaleY:1.1714,x:869.25,y:107.4,startPosition:9},0).wait(1).to({scaleX:1.171,scaleY:1.171,x:872.05,y:107.05,startPosition:0},0).wait(1).to({scaleX:1.1706,scaleY:1.1706,x:874.85,y:106.7,startPosition:1},0).wait(1).to({scaleX:1.1702,scaleY:1.1702,x:877.7,y:106.35,startPosition:2},0).wait(1).to({scaleX:1.1699,scaleY:1.1699,x:880.5,y:106,startPosition:3},0).wait(1).to({scaleX:1.1695,scaleY:1.1695,x:883.3,y:105.7,startPosition:4},0).wait(1).to({scaleX:1.1691,scaleY:1.1691,x:886.15,y:105.3,startPosition:5},0).wait(1).to({scaleX:1.1687,scaleY:1.1687,x:888.95,y:105,startPosition:6},0).wait(1).to({scaleX:1.1683,scaleY:1.1683,x:891.75,y:104.65,startPosition:7},0).wait(1).to({scaleX:1.1679,scaleY:1.1679,x:894.6,y:104.35,startPosition:8},0).wait(1).to({scaleX:1.1676,scaleY:1.1676,x:897.4,y:103.95,startPosition:9},0).wait(1).to({scaleX:1.1672,scaleY:1.1672,x:900.2,y:103.65,startPosition:0},0).wait(1).to({scaleX:1.1668,scaleY:1.1668,x:903.05,y:103.3,startPosition:1},0).wait(1).to({scaleX:1.1664,scaleY:1.1664,x:905.85,y:103,startPosition:2},0).wait(1).to({scaleX:1.166,scaleY:1.166,x:908.65,y:102.65,startPosition:3},0).wait(1).to({scaleX:1.1656,scaleY:1.1656,x:911.5,y:102.3,startPosition:4},0).wait(1).to({scaleX:1.1653,scaleY:1.1653,x:914.3,y:101.95,startPosition:5},0).wait(1).to({scaleX:1.1649,scaleY:1.1649,x:917.1,y:101.65,startPosition:6},0).wait(1).to({scaleX:1.1645,scaleY:1.1645,x:919.95,y:101.3,startPosition:7},0).wait(1).to({scaleX:1.1641,scaleY:1.1641,x:922.75,y:100.95,startPosition:8},0).wait(1).to({scaleX:1.1637,scaleY:1.1637,x:925.55,y:100.6,startPosition:9},0).wait(1).to({scaleX:1.1633,scaleY:1.1633,x:928.4,y:100.25,startPosition:0},0).wait(1).to({scaleX:1.163,scaleY:1.163,x:931.2,y:99.95,startPosition:1},0).wait(1).to({scaleX:1.1626,scaleY:1.1626,x:934,y:99.55,startPosition:2},0).wait(1).to({scaleX:1.1622,scaleY:1.1622,x:936.85,y:99.25,startPosition:3},0).wait(1).to({scaleX:1.1618,scaleY:1.1618,x:939.65,y:98.9,startPosition:4},0).wait(1).to({scaleX:1.1614,scaleY:1.1614,x:942.45,y:98.6,startPosition:5},0).wait(1).to({scaleX:1.161,scaleY:1.161,x:945.3,y:98.2,startPosition:6},0).wait(1).to({scaleX:1.1607,scaleY:1.1607,x:948.1,y:97.9,startPosition:7},0).wait(1).to({scaleX:1.1603,scaleY:1.1603,x:950.9,y:97.55,startPosition:8},0).wait(1).to({scaleX:1.1599,scaleY:1.1599,x:953.75,y:97.25,startPosition:9},0).wait(1).to({scaleX:1.1595,scaleY:1.1595,x:956.55,y:96.85,startPosition:0},0).wait(1).to({scaleX:1.1591,scaleY:1.1591,x:959.35,y:96.55,startPosition:1},0).wait(1).to({scaleX:1.1587,scaleY:1.1587,x:962.2,y:96.2,startPosition:2},0).wait(1).to({scaleX:1.1583,scaleY:1.1583,x:965,y:95.9,startPosition:3},0).wait(1).to({scaleX:1.158,scaleY:1.158,x:967.8,y:95.5,startPosition:4},0).wait(1).to({scaleX:1.1576,scaleY:1.1576,x:970.65,y:95.15,startPosition:5},0).wait(1).to({scaleX:1.1572,scaleY:1.1572,x:973.45,y:94.85,startPosition:6},0).wait(1).to({scaleX:1.1568,scaleY:1.1568,x:976.25,y:94.5,startPosition:7},0).wait(1).to({scaleX:1.1564,scaleY:1.1564,x:979.1,y:94.15,startPosition:8},0).wait(1).to({scaleX:1.156,scaleY:1.156,x:981.9,y:93.8,startPosition:9},0).wait(1).to({scaleX:1.1557,scaleY:1.1557,x:984.7,y:93.5,startPosition:0},0).wait(1).to({scaleX:1.1553,scaleY:1.1553,x:987.55,y:93.15,startPosition:1},0).wait(1).to({scaleX:1.1549,scaleY:1.1549,x:990.35,y:92.8,startPosition:2},0).wait(1).to({scaleX:1.1545,scaleY:1.1545,x:993.2,y:92.45,startPosition:3},0).wait(1).to({scaleX:1.1541,scaleY:1.1541,x:996,y:92.15,startPosition:4},0).wait(1).to({scaleX:1.1537,scaleY:1.1537,x:998.8,y:91.8,startPosition:5},0).wait(1).to({scaleX:1.1534,scaleY:1.1534,x:1001.6,y:91.45,startPosition:6},0).wait(1).to({scaleX:1.153,scaleY:1.153,x:1004.45,y:91.1,startPosition:7},0).wait(1).to({scaleX:1.1526,scaleY:1.1526,x:1007.25,y:90.8,startPosition:8},0).wait(1).to({scaleX:1.1522,scaleY:1.1522,x:1010.1,y:90.45,startPosition:9},0).wait(1).to({scaleX:1.1518,scaleY:1.1518,x:1012.9,y:90.05,startPosition:0},0).wait(1).to({scaleX:1.1514,scaleY:1.1514,x:1015.7,y:89.75,startPosition:1},0).wait(1).to({scaleX:1.1511,scaleY:1.1511,x:1018.5,y:89.4,startPosition:2},0).wait(1).to({scaleX:1.1507,scaleY:1.1507,x:1021.35,y:89.1,startPosition:3},0).wait(1).to({scaleX:1.1503,scaleY:1.1503,x:1024.15,y:88.75,startPosition:4},0).wait(1).to({scaleX:1.1499,scaleY:1.1499,x:1027,y:88.4,startPosition:5},0).wait(1).to({scaleX:1.1495,scaleY:1.1495,x:1029.8,y:88.05,startPosition:6},0).wait(1).to({scaleX:1.1491,scaleY:1.1491,x:1032.6,y:87.75,startPosition:7},0).wait(1).to({scaleX:1.1487,scaleY:1.1487,x:1035.45,y:87.4,startPosition:8},0).wait(1).to({scaleX:1.1484,scaleY:1.1484,x:1038.25,y:87.05,startPosition:9},0).wait(1).to({scaleX:1.148,scaleY:1.148,x:1041.05,y:86.7,startPosition:0},0).wait(1).to({scaleX:1.1476,scaleY:1.1476,x:1043.9,y:86.4,startPosition:1},0).wait(1).to({scaleX:1.1472,scaleY:1.1472,x:1046.7,y:86.05,startPosition:2},0).wait(1).to({scaleX:1.1468,scaleY:1.1468,x:1049.55,y:85.7,startPosition:3},0).wait(1).to({scaleX:1.1464,scaleY:1.1464,x:1052.4,y:85.35,startPosition:4},0).wait(1).to({scaleX:1.1461,scaleY:1.1461,x:1055.2,y:85,startPosition:5},0).wait(1).to({scaleX:1.1457,scaleY:1.1457,x:1058,y:84.7,startPosition:6},0).wait(1).to({scaleX:1.1453,scaleY:1.1453,x:1060.8,y:84.3,startPosition:7},0).wait(1).to({scaleX:1.1449,scaleY:1.1449,x:1063.65,y:84,startPosition:8},0).wait(1).to({scaleX:1.1445,scaleY:1.1445,x:1066.45,y:83.65,startPosition:9},0).wait(1).to({scaleX:1.1441,scaleY:1.1441,x:1069.3,y:83.35,startPosition:0},0).wait(1).to({scaleX:1.1438,scaleY:1.1438,x:1072.1,y:82.95,startPosition:1},0).wait(1).to({scaleX:1.1434,scaleY:1.1434,x:1074.9,y:82.65,startPosition:2},0).wait(1).to({scaleX:1.143,scaleY:1.143,x:1077.7,y:82.3,startPosition:3},0).wait(1).to({scaleX:1.1426,scaleY:1.1426,x:1080.55,y:82,startPosition:4},0).wait(1).to({scaleX:1.1422,scaleY:1.1422,x:1083.35,y:81.6,startPosition:5},0).wait(1).to({scaleX:1.1418,scaleY:1.1418,x:1086.2,y:81.3,startPosition:6},0).wait(1).to({scaleX:1.1415,scaleY:1.1415,x:1089,y:80.95,startPosition:7},0).wait(1).to({scaleX:1.1411,scaleY:1.1411,x:1091.8,y:80.65,startPosition:8},0).wait(1).to({scaleX:1.1407,scaleY:1.1407,x:1094.65,y:80.25,startPosition:9},0).wait(1).to({scaleX:1.1403,scaleY:1.1403,x:1097.45,y:79.95,startPosition:0},0).wait(1).to({scaleX:1.1399,scaleY:1.1399,x:1100.25,y:79.6,startPosition:1},0).wait(1).to({scaleX:1.1395,scaleY:1.1395,x:1103.1,y:79.25,startPosition:2},0).wait(1).to({scaleX:1.1392,scaleY:1.1392,x:1105.9,y:78.9,startPosition:3},0).wait(1).to({scaleX:1.1388,scaleY:1.1388,x:1108.7,y:78.55,startPosition:4},0).wait(1).to({scaleX:1.1384,scaleY:1.1384,x:1111.55,y:78.25,startPosition:5},0).wait(1).to({scaleX:1.138,scaleY:1.138,x:1114.35,y:77.9,startPosition:6},0).wait(1).to({scaleX:1.1376,scaleY:1.1376,x:1117.15,y:77.55,startPosition:7},0).wait(1).to({scaleX:1.1372,scaleY:1.1372,x:1120,y:77.2,startPosition:8},0).wait(1).to({scaleX:1.1368,scaleY:1.1368,x:1122.8,y:76.9,startPosition:9},0).wait(1).to({scaleX:1.1365,scaleY:1.1365,x:1125.6,y:76.55,startPosition:0},0).wait(1).to({scaleX:1.1361,scaleY:1.1361,x:1128.45,y:76.2,startPosition:1},0).wait(1).to({scaleX:1.1357,scaleY:1.1357,x:1131.25,y:75.85,startPosition:2},0).wait(1).to({scaleX:1.1353,scaleY:1.1353,x:1134.05,y:75.55,startPosition:3},0).wait(1).to({scaleX:1.1349,scaleY:1.1349,x:1136.9,y:75.2,startPosition:4},0).wait(1).to({scaleX:1.1345,scaleY:1.1345,x:1139.7,y:74.9,startPosition:5},0).wait(1).to({scaleX:1.1342,scaleY:1.1342,x:1142.5,y:74.5,startPosition:6},0).wait(1).to({scaleX:1.1338,scaleY:1.1338,x:1145.35,y:74.15,startPosition:7},0).wait(1).to({scaleX:1.1334,scaleY:1.1334,x:1148.15,y:73.85,startPosition:8},0).wait(1).to({scaleX:1.133,scaleY:1.133,x:1150.95,y:73.5,startPosition:9},0).wait(1).to({scaleX:1.1326,scaleY:1.1326,x:1153.8,y:73.15,startPosition:0},0).wait(1).to({scaleX:1.1322,scaleY:1.1322,x:1156.6,y:72.8,startPosition:1},0).wait(1).to({scaleX:1.1319,scaleY:1.1319,x:1159.4,y:72.5,startPosition:2},0).wait(1).to({scaleX:1.1315,scaleY:1.1315,x:1162.25,y:72.15,startPosition:3},0).wait(1).to({scaleX:1.1311,scaleY:1.1311,x:1165.05,y:71.8,startPosition:4},0).wait(1).to({scaleX:1.1307,scaleY:1.1307,x:1167.85,y:71.45,startPosition:5},0).wait(1).to({scaleX:1.1303,scaleY:1.1303,x:1170.7,y:71.15,startPosition:6},0).wait(1).to({scaleX:1.1299,scaleY:1.1299,x:1173.5,y:70.8,startPosition:7},0).wait(1).to({scaleX:1.1296,scaleY:1.1296,x:1176.3,y:70.45,startPosition:8},0).wait(1).to({scaleX:1.1292,scaleY:1.1292,x:1179.15,y:70.1,startPosition:9},0).wait(1).to({scaleX:1.1288,scaleY:1.1288,x:1181.95,y:69.8,startPosition:0},0).wait(1).to({scaleX:1.1284,scaleY:1.1284,x:1184.75,y:69.45,startPosition:1},0).wait(1).to({scaleX:1.128,scaleY:1.128,x:1187.6,y:69.1,startPosition:2},0).wait(1).to({scaleX:1.1276,scaleY:1.1276,x:1190.4,y:68.75,startPosition:3},0).wait(1).to({scaleX:1.1273,scaleY:1.1273,x:1193.2,y:68.4,startPosition:4},0).wait(1).to({scaleX:1.1269,scaleY:1.1269,x:1196.05,y:68.1,startPosition:5},0).wait(1).to({scaleX:1.1265,scaleY:1.1265,x:1198.85,y:67.7,startPosition:6},0).wait(1).to({scaleX:1.1261,scaleY:1.1261,x:1201.65,y:67.4,startPosition:7},0).wait(1).to({scaleX:1.1257,scaleY:1.1257,x:1204.5,y:67.05,startPosition:8},0).wait(1).to({scaleX:1.1253,scaleY:1.1253,x:1207.3,y:66.75,startPosition:9},0).wait(1).to({scaleX:1.1249,scaleY:1.1249,x:1210.1,y:66.35,startPosition:0},0).wait(1).to({scaleX:1.1246,scaleY:1.1246,x:1212.95,y:66.05,startPosition:1},0).wait(1).to({scaleX:1.1242,scaleY:1.1242,x:1215.75,y:65.7,startPosition:2},0).wait(1).to({scaleX:1.1238,scaleY:1.1238,x:1218.55,y:65.4,startPosition:3},0).wait(1).to({scaleX:1.1234,scaleY:1.1234,x:1221.4,y:65,startPosition:4},0).wait(1).to({scaleX:1.123,scaleY:1.123,x:1224.2,y:64.7,startPosition:5},0).wait(1).to({scaleX:1.1226,scaleY:1.1226,x:1227,y:64.35,startPosition:6},0).wait(1).to({scaleX:1.1223,scaleY:1.1223,x:1229.85,y:64.05,startPosition:7},0).wait(1).to({scaleX:1.1219,scaleY:1.1219,x:1232.65,y:63.65,startPosition:8},0).wait(1);
	this.timeline.addTween(_tweenStr_0.to({scaleX:1.1215,scaleY:1.1215,x:1235.45,y:63.3,startPosition:9},0).wait(1).to({scaleX:1.1211,scaleY:1.1211,x:1238.3,y:63,startPosition:0},0).wait(1).to({scaleX:1.1207,scaleY:1.1207,x:1241.1,y:62.65,startPosition:1},0).wait(1).to({scaleX:1.1203,scaleY:1.1203,x:1243.95,y:62.3,startPosition:2},0).wait(1).to({scaleX:1.12,scaleY:1.12,x:1246.75,y:61.95,startPosition:3},0).wait(1).to({scaleX:1.1196,scaleY:1.1196,x:1249.55,y:61.65,startPosition:4},0).wait(1).to({scaleX:1.1192,scaleY:1.1192,x:1252.35,y:61.3,startPosition:5},0).wait(1).to({scaleX:1.1188,scaleY:1.1188,x:1255.2,y:61,startPosition:6},0).wait(1).to({scaleX:1.1184,scaleY:1.1184,x:1258,y:60.6,startPosition:7},0).wait(1).to({scaleX:1.118,scaleY:1.118,x:1260.85,y:60.3,startPosition:8},0).wait(1).to({scaleX:1.1177,scaleY:1.1177,x:1263.65,y:59.95,startPosition:9},0).wait(1).to({scaleX:1.1173,scaleY:1.1173,x:1266.45,y:59.65,startPosition:0},0).wait(1).to({scaleX:1.1169,scaleY:1.1169,x:1269.25,y:59.25,startPosition:1},0).wait(1).to({scaleX:1.1165,scaleY:1.1165,x:1272.1,y:58.95,startPosition:2},0).wait(1).to({scaleX:1.1161,scaleY:1.1161,x:1274.9,y:58.6,startPosition:3},0).wait(1).to({scaleX:1.1157,scaleY:1.1157,x:1277.75,y:58.25,startPosition:4},0).wait(1).to({scaleX:1.1153,scaleY:1.1153,x:1280.55,y:57.9,startPosition:5},0).wait(1).to({scaleX:1.115,scaleY:1.115,x:1283.35,y:57.55,startPosition:6},0).wait(1).to({scaleX:1.1146,scaleY:1.1146,x:1286.15,y:57.25,startPosition:7},0).wait(1).to({scaleX:1.1142,scaleY:1.1142,x:1289,y:56.9,startPosition:8},0).wait(1).to({scaleX:1.1138,scaleY:1.1138,x:1291.85,y:56.55,startPosition:9},0).wait(1).to({scaleX:1.1134,scaleY:1.1134,x:1294.7,y:56.2,startPosition:0},0).wait(1).to({scaleX:1.113,scaleY:1.113,x:1297.5,y:55.9,startPosition:1},0).wait(1).to({scaleX:1.1127,scaleY:1.1127,x:1300.3,y:55.55,startPosition:2},0).wait(1).to({scaleX:1.1123,scaleY:1.1123,x:1303.15,y:55.2,startPosition:3},0).wait(1).to({scaleX:1.1119,scaleY:1.1119,x:1305.95,y:54.85,startPosition:4},0).wait(1).to({scaleX:1.1115,scaleY:1.1115,x:1308.75,y:54.55,startPosition:5},0).wait(1).to({scaleX:1.1111,scaleY:1.1111,x:1311.6,y:54.2,startPosition:6},0).wait(1).to({scaleX:1.1107,scaleY:1.1107,x:1314.4,y:53.85,startPosition:7},0).wait(1).to({scaleX:1.1104,scaleY:1.1104,x:1317.2,y:53.5,startPosition:8},0).wait(1).to({scaleX:1.11,scaleY:1.11,x:1320.05,y:53.15,startPosition:9},0).wait(1).to({scaleX:1.1096,scaleY:1.1096,x:1322.85,y:52.85,startPosition:0},0).wait(1).to({scaleX:1.1092,scaleY:1.1092,x:1325.65,y:52.45,startPosition:1},0).wait(1).to({scaleX:1.1088,scaleY:1.1088,x:1328.5,y:52.15,startPosition:2},0).wait(1).to({scaleX:1.1084,scaleY:1.1084,x:1331.3,y:51.8,startPosition:3},0).wait(1).to({scaleX:1.1081,scaleY:1.1081,x:1334.1,y:51.5,startPosition:4},0).wait(1).to({scaleX:1.1077,scaleY:1.1077,x:1336.95,y:51.1,startPosition:5},0).wait(1).to({scaleX:1.1073,scaleY:1.1073,x:1339.75,y:50.8,startPosition:6},0).wait(1).to({scaleX:1.1069,scaleY:1.1069,x:1342.55,y:50.45,startPosition:7},0).wait(1).to({scaleX:1.1065,scaleY:1.1065,x:1345.4,y:50.15,startPosition:8},0).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.Scene_1_ציפור_1 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// ציפור_1
	this.instance = new lib.ציפור("synched",0);
	this.instance.setTransform(84.7,139.35,1.0938,1.0938,0,0,0,-560.4,-190.2);

	
	var _tweenStr_1 = cjs.Tween.get(this.instance).wait(1).to({regX:-564.9,regY:-191.2,x:84.1,y:138.05,startPosition:1},0).wait(1).to({x:88.45,y:137.85,startPosition:2},0).wait(1).to({x:92.75,y:137.65,startPosition:3},0).wait(1).to({x:97.05,y:137.45,startPosition:4},0).wait(1).to({x:101.4,y:137.3,startPosition:5},0).wait(1).to({x:105.7,y:137.1,startPosition:6},0).wait(1).to({x:110.05,y:136.9,startPosition:7},0).wait(1).to({x:114.35,y:136.7,startPosition:8},0).wait(1).to({x:118.7,y:136.5,startPosition:9},0).wait(1).to({x:123,y:136.35,startPosition:0},0).wait(1).to({x:127.35,y:136.15,startPosition:1},0).wait(1).to({x:131.65,y:135.95,startPosition:2},0).wait(1).to({x:136,y:135.75,startPosition:3},0).wait(1).to({x:140.3,y:135.55,startPosition:4},0).wait(1).to({x:144.65,y:135.4,startPosition:5},0).wait(1).to({x:148.95,y:135.2,startPosition:6},0).wait(1).to({x:153.3,y:135,startPosition:7},0).wait(1).to({x:157.6,y:134.8,startPosition:8},0).wait(1).to({x:161.95,y:134.6,startPosition:9},0).wait(1).to({x:166.25,y:134.45,startPosition:0},0).wait(1).to({x:170.6,y:134.25,startPosition:1},0).wait(1).to({x:174.9,y:134.05,startPosition:2},0).wait(1).to({x:179.25,y:133.85,startPosition:3},0).wait(1).to({x:183.55,y:133.65,startPosition:4},0).wait(1).to({x:187.9,y:133.5,startPosition:5},0).wait(1).to({x:192.2,y:133.3,startPosition:6},0).wait(1).to({x:196.55,y:133.1,startPosition:7},0).wait(1).to({x:200.85,y:132.9,startPosition:8},0).wait(1).to({x:205.2,y:132.7,startPosition:9},0).wait(1).to({x:209.5,y:132.55,startPosition:0},0).wait(1).to({x:213.85,y:132.35,startPosition:1},0).wait(1).to({x:218.15,y:132.15,startPosition:2},0).wait(1).to({x:222.45,y:131.95,startPosition:3},0).wait(1).to({x:226.8,y:131.75,startPosition:4},0).wait(1).to({x:231.1,y:131.6,startPosition:5},0).wait(1).to({x:235.45,y:131.4,startPosition:6},0).wait(1).to({x:239.75,y:131.2,startPosition:7},0).wait(1).to({x:244.1,y:131,startPosition:8},0).wait(1).to({x:248.4,y:130.85,startPosition:9},0).wait(1).to({x:252.75,y:130.65,startPosition:0},0).wait(1).to({x:257.05,y:130.45,startPosition:1},0).wait(1).to({x:261.4,y:130.25,startPosition:2},0).wait(1).to({x:265.7,y:130.05,startPosition:3},0).wait(1).to({x:270.05,y:129.9,startPosition:4},0).wait(1).to({x:274.35,y:129.7,startPosition:5},0).wait(1).to({x:278.7,y:129.5,startPosition:6},0).wait(1).to({x:283,y:129.3,startPosition:7},0).wait(1).to({x:287.35,y:129.1,startPosition:8},0).wait(1).to({x:291.65,y:128.95,startPosition:9},0).wait(1).to({x:296,y:128.75,startPosition:0},0).wait(1).to({x:300.3,y:128.55,startPosition:1},0).wait(1).to({x:304.65,y:128.35,startPosition:2},0).wait(1).to({x:308.95,y:128.15,startPosition:3},0).wait(1).to({x:313.3,y:128,startPosition:4},0).wait(1).to({x:317.6,y:127.8,startPosition:5},0).wait(1).to({x:321.95,y:127.6,startPosition:6},0).wait(1).to({x:326.25,y:127.4,startPosition:7},0).wait(1).to({x:330.6,y:127.2,startPosition:8},0).wait(1).to({x:334.9,y:127.05,startPosition:9},0).wait(1).to({x:339.2,y:126.85,startPosition:0},0).wait(1).to({x:343.55,y:126.65,startPosition:1},0).wait(1).to({x:347.85,y:126.45,startPosition:2},0).wait(1).to({x:352.2,y:126.25,startPosition:3},0).wait(1).to({x:356.5,y:126.1,startPosition:4},0).wait(1).to({x:360.85,y:125.9,startPosition:5},0).wait(1).to({x:365.15,y:125.7,startPosition:6},0).wait(1).to({x:369.5,y:125.5,startPosition:7},0).wait(1).to({x:373.8,y:125.3,startPosition:8},0).wait(1).to({x:378.15,y:125.15,startPosition:9},0).wait(1).to({x:382.45,y:124.95,startPosition:0},0).wait(1).to({x:386.8,y:124.75,startPosition:1},0).wait(1).to({x:391.1,y:124.55,startPosition:2},0).wait(1).to({x:395.45,y:124.35,startPosition:3},0).wait(1).to({x:399.75,y:124.2,startPosition:4},0).wait(1).to({x:404.1,y:124,startPosition:5},0).wait(1).to({x:408.4,y:123.8,startPosition:6},0).wait(1).to({x:412.75,y:123.6,startPosition:7},0).wait(1).to({x:417.05,y:123.4,startPosition:8},0).wait(1).to({x:421.4,y:123.25,startPosition:9},0).wait(1).to({x:425.7,y:123.05,startPosition:0},0).wait(1).to({x:430.05,y:122.85,startPosition:1},0).wait(1).to({x:434.35,y:122.65,startPosition:2},0).wait(1).to({x:438.7,y:122.5,startPosition:3},0).wait(1).to({x:443,y:122.3,startPosition:4},0).wait(1).to({x:447.35,y:122.1,startPosition:5},0).wait(1).to({x:451.65,y:121.9,startPosition:6},0).wait(1).to({x:456,y:121.7,startPosition:7},0).wait(1).to({x:460.3,y:121.55,startPosition:8},0).wait(1).to({x:464.6,y:121.35,startPosition:9},0).wait(1).to({x:468.95,y:121.15,startPosition:0},0).wait(1).to({x:473.25,y:120.95,startPosition:1},0).wait(1).to({x:477.6,y:120.75,startPosition:2},0).wait(1).to({x:481.9,y:120.6,startPosition:3},0).wait(1).to({x:486.25,y:120.4,startPosition:4},0).wait(1).to({x:490.55,y:120.2,startPosition:5},0).wait(1).to({x:494.9,y:120,startPosition:6},0).wait(1).to({x:499.2,y:119.8,startPosition:7},0).wait(1).to({x:503.55,y:119.65,startPosition:8},0).wait(1).to({x:507.85,y:119.45,startPosition:9},0).wait(1).to({x:512.2,y:119.25,startPosition:0},0).wait(1).to({x:516.5,y:119.05,startPosition:1},0).wait(1).to({x:520.85,y:118.85,startPosition:2},0).wait(1).to({x:525.15,y:118.7,startPosition:3},0).wait(1).to({x:529.5,y:118.5,startPosition:4},0).wait(1).to({x:533.8,y:118.3,startPosition:5},0).wait(1).to({x:538.15,y:118.1,startPosition:6},0).wait(1).to({x:542.45,y:117.9,startPosition:7},0).wait(1).to({x:546.8,y:117.75,startPosition:8},0).wait(1).to({x:551.1,y:117.55,startPosition:9},0).wait(1).to({x:555.45,y:117.35,startPosition:0},0).wait(1).to({x:559.75,y:117.15,startPosition:1},0).wait(1).to({x:564.1,y:116.95,startPosition:2},0).wait(1).to({x:568.4,y:116.8,startPosition:3},0).wait(1).to({x:572.75,y:116.6,startPosition:4},0).wait(1).to({x:577.05,y:116.4,startPosition:5},0).wait(1).to({x:581.4,y:116.2,startPosition:6},0).wait(1).to({x:585.7,y:116,startPosition:7},0).wait(1).to({x:590,y:115.85,startPosition:8},0).wait(1).to({x:594.35,y:115.65,startPosition:9},0).wait(1).to({x:598.65,y:115.45,startPosition:0},0).wait(1).to({x:603,y:115.25,startPosition:1},0).wait(1).to({x:607.3,y:115.1,startPosition:2},0).wait(1).to({x:611.65,y:114.9,startPosition:3},0).wait(1).to({x:615.95,y:114.7,startPosition:4},0).wait(1).to({x:620.3,y:114.5,startPosition:5},0).wait(1).to({x:624.6,y:114.3,startPosition:6},0).wait(1).to({x:628.95,y:114.15,startPosition:7},0).wait(1).to({x:633.25,y:113.95,startPosition:8},0).wait(1).to({x:637.6,y:113.75,startPosition:9},0).wait(1).to({x:641.9,y:113.55,startPosition:0},0).wait(1).to({x:646.25,y:113.35,startPosition:1},0).wait(1).to({x:650.55,y:113.2,startPosition:2},0).wait(1).to({x:654.9,y:113,startPosition:3},0).wait(1).to({x:659.2,y:112.8,startPosition:4},0).wait(1).to({x:663.55,y:112.6,startPosition:5},0).wait(1).to({x:667.85,y:112.4,startPosition:6},0).wait(1).to({x:672.2,y:112.25,startPosition:7},0).wait(1).to({x:676.5,y:112.05,startPosition:8},0).wait(1).to({x:680.85,y:111.85,startPosition:9},0).wait(1).to({x:685.15,y:111.65,startPosition:0},0).wait(1).to({x:689.5,y:111.45,startPosition:1},0).wait(1).to({x:693.8,y:111.3,startPosition:2},0).wait(1).to({x:698.15,y:111.1,startPosition:3},0).wait(1).to({x:702.45,y:110.9,startPosition:4},0).wait(1).to({x:706.8,y:110.7,startPosition:5},0).wait(1).to({x:711.1,y:110.5,startPosition:6},0).wait(1).to({x:715.4,y:110.35,startPosition:7},0).wait(1).to({x:719.75,y:110.15,startPosition:8},0).wait(1).to({x:724.05,y:109.95,startPosition:9},0).wait(1).to({x:728.4,y:109.75,startPosition:0},0).wait(1).to({x:732.7,y:109.55,startPosition:1},0).wait(1).to({x:737.05,y:109.4,startPosition:2},0).wait(1).to({x:741.35,y:109.2,startPosition:3},0).wait(1).to({x:745.7,y:109,startPosition:4},0).wait(1).to({x:750,y:108.8,startPosition:5},0).wait(1).to({x:754.35,y:108.6,startPosition:6},0).wait(1).to({x:758.65,y:108.45,startPosition:7},0).wait(1).to({x:763,y:108.25,startPosition:8},0).wait(1).to({x:767.3,y:108.05,startPosition:9},0).wait(1).to({x:771.65,y:107.85,startPosition:0},0).wait(1).to({x:775.95,y:107.65,startPosition:1},0).wait(1).to({x:780.3,y:107.5,startPosition:2},0).wait(1).to({x:784.6,y:107.3,startPosition:3},0).wait(1).to({x:788.95,y:107.1,startPosition:4},0).wait(1).to({x:793.25,y:106.9,startPosition:5},0).wait(1).to({x:797.6,y:106.75,startPosition:6},0).wait(1).to({x:801.9,y:106.55,startPosition:7},0).wait(1).to({x:806.25,y:106.35,startPosition:8},0).wait(1).to({x:810.55,y:106.15,startPosition:9},0).wait(1).to({x:814.9,y:105.95,startPosition:0},0).wait(1).to({x:819.2,y:105.8,startPosition:1},0).wait(1).to({x:823.55,y:105.6,startPosition:2},0).wait(1).to({x:827.85,y:105.4,startPosition:3},0).wait(1).to({x:832.2,y:105.2,startPosition:4},0).wait(1).to({x:836.5,y:105,startPosition:5},0).wait(1).to({x:840.8,y:104.85,startPosition:6},0).wait(1).to({x:845.15,y:104.65,startPosition:7},0).wait(1).to({x:849.45,y:104.45,startPosition:8},0).wait(1).to({x:853.8,y:104.25,startPosition:9},0).wait(1).to({x:858.1,y:104.05,startPosition:0},0).wait(1).to({x:862.45,y:103.9,startPosition:1},0).wait(1).to({x:866.75,y:103.7,startPosition:2},0).wait(1).to({x:871.1,y:103.5,startPosition:3},0).wait(1).to({x:875.4,y:103.3,startPosition:4},0).wait(1).to({x:879.75,y:103.1,startPosition:5},0).wait(1).to({x:884.05,y:102.95,startPosition:6},0).wait(1).to({x:888.4,y:102.75,startPosition:7},0).wait(1).to({x:892.7,y:102.55,startPosition:8},0).wait(1).to({x:897.05,y:102.35,startPosition:9},0).wait(1).to({x:901.35,y:102.15,startPosition:0},0).wait(1).to({x:905.7,y:102,startPosition:1},0).wait(1).to({x:910,y:101.8,startPosition:2},0).wait(1).to({x:914.35,y:101.6,startPosition:3},0).wait(1).to({x:918.65,y:101.4,startPosition:4},0).wait(1).to({x:923,y:101.2,startPosition:5},0).wait(1).to({x:927.3,y:101.05,startPosition:6},0).wait(1).to({x:931.65,y:100.85,startPosition:7},0).wait(1).to({x:935.95,y:100.65,startPosition:8},0).wait(1).to({x:940.3,y:100.45,startPosition:9},0).wait(1).to({x:944.6,y:100.25,startPosition:0},0).wait(1).to({x:948.95,y:100.1,startPosition:1},0).wait(1).to({x:953.25,y:99.9,startPosition:2},0).wait(1).to({x:957.6,y:99.7,startPosition:3},0).wait(1).to({x:961.9,y:99.5,startPosition:4},0).wait(1).to({x:966.2,y:99.35,startPosition:5},0).wait(1).to({x:970.55,y:99.15,startPosition:6},0).wait(1).to({x:974.85,y:98.95,startPosition:7},0).wait(1).to({x:979.2,y:98.75,startPosition:8},0).wait(1).to({x:983.5,y:98.55,startPosition:9},0).wait(1).to({x:987.85,y:98.4,startPosition:0},0).wait(1).to({x:992.15,y:98.2,startPosition:1},0).wait(1).to({x:996.5,y:98,startPosition:2},0).wait(1).to({x:1000.8,y:97.8,startPosition:3},0).wait(1).to({x:1005.15,y:97.6,startPosition:4},0).wait(1).to({x:1009.45,y:97.45,startPosition:5},0).wait(1).to({x:1013.8,y:97.25,startPosition:6},0).wait(1).to({x:1018.1,y:97.05,startPosition:7},0).wait(1).to({x:1022.45,y:96.85,startPosition:8},0).wait(1).to({x:1026.75,y:96.65,startPosition:9},0).wait(1).to({x:1031.1,y:96.5,startPosition:0},0).wait(1).to({x:1035.4,y:96.3,startPosition:1},0).wait(1).to({x:1039.75,y:96.1,startPosition:2},0).wait(1).to({x:1044.05,y:95.9,startPosition:3},0).wait(1).to({x:1048.4,y:95.7,startPosition:4},0).wait(1).to({x:1052.7,y:95.55,startPosition:5},0).wait(1).to({x:1057.05,y:95.35,startPosition:6},0).wait(1).to({x:1061.35,y:95.15,startPosition:7},0).wait(1).to({x:1065.7,y:94.95,startPosition:8},0).wait(1).to({x:1070,y:94.75,startPosition:9},0).wait(1).to({x:1074.35,y:94.6,startPosition:0},0).wait(1).to({x:1078.65,y:94.4,startPosition:1},0).wait(1).to({x:1083,y:94.2,startPosition:2},0).wait(1).to({x:1087.3,y:94,startPosition:3},0).wait(1).to({x:1091.6,y:93.8,startPosition:4},0).wait(1).to({x:1095.95,y:93.65,startPosition:5},0).wait(1).to({x:1100.25,y:93.45,startPosition:6},0).wait(1).to({x:1104.6,y:93.25,startPosition:7},0).wait(1).to({x:1108.9,y:93.05,startPosition:8},0).wait(1).to({x:1113.25,y:92.85,startPosition:9},0).wait(1).to({x:1117.55,y:92.7,startPosition:0},0).wait(1).to({x:1121.9,y:92.5,startPosition:1},0).wait(1).to({x:1126.2,y:92.3,startPosition:2},0).wait(1).to({x:1130.55,y:92.1,startPosition:3},0).wait(1).to({x:1134.85,y:91.95,startPosition:4},0).wait(1).to({x:1139.2,y:91.75,startPosition:5},0).wait(1).to({x:1143.5,y:91.55,startPosition:6},0).wait(1).to({x:1147.85,y:91.35,startPosition:7},0).wait(1).to({x:1152.15,y:91.15,startPosition:8},0).wait(1).to({x:1156.5,y:91,startPosition:9},0).wait(1).to({x:1160.8,y:90.8,startPosition:0},0).wait(1).to({x:1165.15,y:90.6,startPosition:1},0).wait(1).to({x:1169.45,y:90.4,startPosition:2},0).wait(1).to({x:1173.8,y:90.2,startPosition:3},0).wait(1).to({x:1178.1,y:90.05,startPosition:4},0).wait(1).to({x:1182.45,y:89.85,startPosition:5},0).wait(1).to({x:1186.75,y:89.65,startPosition:6},0).wait(1).to({x:1191.1,y:89.45,startPosition:7},0).wait(1).to({x:1195.4,y:89.25,startPosition:8},0).wait(1).to({x:1199.75,y:89.1,startPosition:9},0).wait(1).to({x:1204.05,y:88.9,startPosition:0},0).wait(1).to({x:1208.4,y:88.7,startPosition:1},0).wait(1).to({x:1212.7,y:88.5,startPosition:2},0).wait(1).to({x:1217,y:88.3,startPosition:3},0).wait(1).to({x:1221.35,y:88.15,startPosition:4},0).wait(1).to({x:1225.65,y:87.95,startPosition:5},0).wait(1).to({x:1230,y:87.75,startPosition:6},0).wait(1).to({x:1234.3,y:87.55,startPosition:7},0).wait(1).to({x:1238.65,y:87.35,startPosition:8},0).wait(1).to({x:1242.95,y:87.2,startPosition:9},0).wait(1).to({x:1247.3,y:87,startPosition:0},0).wait(1).to({x:1251.6,y:86.8,startPosition:1},0).wait(1).to({x:1255.95,y:86.6,startPosition:2},0).wait(1).to({x:1260.25,y:86.4,startPosition:3},0).wait(1).to({x:1264.6,y:86.25,startPosition:4},0).wait(1).to({x:1268.9,y:86.05,startPosition:5},0).wait(1).to({x:1273.25,y:85.85,startPosition:6},0).wait(1).to({x:1277.55,y:85.65,startPosition:7},0).wait(1).to({x:1281.9,y:85.45,startPosition:8},0).wait(1).to({x:1286.2,y:85.3,startPosition:9},0).wait(1).to({x:1290.55,y:85.1,startPosition:0},0).wait(1).to({x:1294.85,y:84.9,startPosition:1},0).wait(1).to({x:1299.2,y:84.7,startPosition:2},0).wait(1).to({x:1303.5,y:84.5,startPosition:3},0).wait(1).to({x:1307.85,y:84.35,startPosition:4},0).wait(1).to({x:1312.15,y:84.15,startPosition:5},0).wait(1).to({x:1316.5,y:83.95,startPosition:6},0).wait(1).to({x:1320.8,y:83.75,startPosition:7},0).wait(1).to({x:1325.15,y:83.6,startPosition:8},0).wait(1).to({startPosition:9},0).wait(1).to({startPosition:0},0).wait(1).to({startPosition:1},0).wait(1).to({startPosition:2},0).wait(1).to({startPosition:3},0).wait(1).to({startPosition:4},0).wait(1).to({startPosition:5},0).wait(1).to({startPosition:6},0).wait(1).to({startPosition:7},0).wait(1).to({startPosition:8},0).wait(1).to({startPosition:9},0).wait(1).to({startPosition:0},0).wait(1).to({startPosition:1},0).wait(1).to({startPosition:2},0).wait(1).to({startPosition:3},0).wait(1).to({startPosition:4},0).wait(1).to({startPosition:5},0).wait(1).to({startPosition:6},0).wait(1).to({startPosition:7},0).wait(1).to({startPosition:8},0).wait(1).to({startPosition:9},0).wait(1).to({startPosition:0},0).wait(1).to({startPosition:1},0).wait(1).to({startPosition:2},0).wait(1).to({startPosition:3},0).wait(1).to({startPosition:4},0).wait(1).to({startPosition:5},0).wait(1).to({startPosition:6},0).wait(1).to({startPosition:7},0).wait(1).to({startPosition:8},0).wait(1).to({startPosition:9},0).wait(1).to({startPosition:0},0).wait(1).to({startPosition:1},0).wait(1).to({startPosition:2},0).wait(1).to({startPosition:3},0).wait(1).to({startPosition:4},0).wait(1).to({startPosition:5},0).wait(1).to({startPosition:6},0).wait(1).to({startPosition:7},0).wait(1).to({startPosition:8},0).wait(1).to({startPosition:9},0).wait(1).to({startPosition:0},0).wait(1).to({startPosition:1},0).wait(1).to({startPosition:2},0).wait(1).to({startPosition:3},0).wait(1).to({startPosition:4},0).wait(1).to({startPosition:5},0).wait(1).to({startPosition:6},0).wait(1).to({startPosition:7},0).wait(1).to({startPosition:8},0).wait(1).to({startPosition:9},0).wait(1).to({startPosition:0},0).wait(1).to({startPosition:1},0).wait(1).to({startPosition:2},0).wait(1).to({startPosition:3},0).wait(1).to({startPosition:4},0).wait(1).to({startPosition:5},0).wait(1).to({startPosition:6},0).wait(1).to({startPosition:7},0).wait(1).to({startPosition:8},0).wait(1).to({startPosition:9},0).wait(1).to({startPosition:0},0).wait(1).to({startPosition:1},0).wait(1).to({startPosition:2},0).wait(1).to({startPosition:3},0).wait(1).to({startPosition:4},0).wait(1).to({startPosition:5},0).wait(1).to({startPosition:6},0).wait(1).to({startPosition:7},0).wait(1).to({startPosition:8},0).wait(1).to({startPosition:9},0).wait(1).to({startPosition:0},0).wait(1).to({startPosition:1},0).wait(1).to({startPosition:2},0).wait(1).to({startPosition:3},0).wait(1).to({startPosition:4},0).wait(1).to({startPosition:5},0).wait(1).to({startPosition:6},0).wait(1).to({startPosition:7},0).wait(1).to({startPosition:8},0).wait(1).to({startPosition:9},0).wait(1).to({startPosition:0},0).wait(1).to({startPosition:1},0).wait(1).to({startPosition:2},0).wait(1).to({startPosition:3},0).wait(1).to({startPosition:4},0).wait(1).to({startPosition:5},0).wait(1).to({startPosition:6},0).wait(1).to({startPosition:7},0).wait(1).to({startPosition:8},0).wait(1).to({startPosition:9},0).wait(1).to({startPosition:0},0).wait(1).to({startPosition:1},0).wait(1).to({startPosition:2},0).wait(1).to({startPosition:3},0).wait(1).to({startPosition:4},0).wait(1).to({startPosition:5},0).wait(1).to({startPosition:6},0).wait(1).to({startPosition:7},0).wait(1).to({startPosition:8},0).wait(1).to({startPosition:9},0).wait(1).to({startPosition:0},0).wait(1).to({startPosition:1},0).wait(1).to({startPosition:2},0).wait(1).to({startPosition:3},0).wait(1).to({startPosition:4},0).wait(1).to({startPosition:5},0).wait(1).to({startPosition:6},0).wait(1).to({startPosition:7},0).wait(1).to({startPosition:8},0).wait(1);
	this.timeline.addTween(_tweenStr_1.to({startPosition:9},0).wait(1).to({startPosition:0},0).wait(1).to({startPosition:1},0).wait(1).to({startPosition:2},0).wait(1).to({startPosition:3},0).wait(1).to({startPosition:4},0).wait(1).to({startPosition:5},0).wait(1).to({startPosition:6},0).wait(1).to({startPosition:7},0).wait(1).to({startPosition:8},0).wait(1).to({startPosition:9},0).wait(1).to({startPosition:0},0).wait(1).to({startPosition:1},0).wait(1).to({startPosition:2},0).wait(1).to({startPosition:3},0).wait(1).to({startPosition:4},0).wait(1).to({startPosition:5},0).wait(1).to({startPosition:6},0).wait(1).to({startPosition:7},0).wait(1).to({startPosition:8},0).wait(1).to({startPosition:9},0).wait(1).to({startPosition:0},0).wait(1).to({startPosition:1},0).wait(1).to({startPosition:2},0).wait(1).to({startPosition:3},0).wait(1).to({startPosition:4},0).wait(1).to({startPosition:5},0).wait(1).to({startPosition:6},0).wait(1).to({startPosition:7},0).wait(1).to({startPosition:8},0).wait(1).to({startPosition:9},0).wait(1).to({startPosition:0},0).wait(1).to({startPosition:1},0).wait(1).to({startPosition:2},0).wait(1).to({startPosition:3},0).wait(1).to({startPosition:4},0).wait(1).to({startPosition:5},0).wait(1).to({startPosition:6},0).wait(1).to({startPosition:7},0).wait(1).to({startPosition:8},0).wait(1).to({startPosition:9},0).wait(1).to({startPosition:0},0).wait(1).to({startPosition:1},0).wait(1).to({startPosition:2},0).wait(1).to({startPosition:3},0).wait(1).to({startPosition:4},0).wait(1).to({startPosition:5},0).wait(1).to({startPosition:6},0).wait(1).to({startPosition:7},0).wait(1).to({startPosition:8},0).wait(1).to({startPosition:9},0).wait(1).to({startPosition:0},0).wait(1).to({startPosition:1},0).wait(1).to({startPosition:2},0).wait(1).to({startPosition:3},0).wait(1).to({startPosition:4},0).wait(1).to({startPosition:5},0).wait(1).to({startPosition:6},0).wait(1).to({startPosition:7},0).wait(1).to({startPosition:8},0).wait(1).to({startPosition:9},0).wait(1).to({startPosition:0},0).wait(1).to({startPosition:1},0).wait(1).to({startPosition:2},0).wait(1).to({startPosition:3},0).wait(1).to({startPosition:4},0).wait(1).to({startPosition:5},0).wait(1).to({startPosition:6},0).wait(1).to({startPosition:7},0).wait(1).to({startPosition:8},0).wait(1).to({startPosition:9},0).wait(1).to({startPosition:0},0).wait(1).to({startPosition:1},0).wait(1).to({startPosition:2},0).wait(1).to({startPosition:3},0).wait(1).to({startPosition:4},0).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.Scene_1_flash0_ai_4 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// flash0_ai
	this.instance = new lib.אישהולךבסוף("synched",0);
	this.instance.setTransform(1200.7,367.35,1,1,0,0,0,15.5,22.2);
	this.instance._off = true;

	this.instance_1 = new lib.CachedBmp_12();
	this.instance_1.setTransform(289.25,284.8,0.5,0.5);

	this.instance_2 = new lib.CachedBmp_13();
	this.instance_2.setTransform(410.85,524,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.instance}]},754).to({state:[{t:this.instance}]},258).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_2}]},32).wait(1));
	this.timeline.addTween(cjs.Tween.get(this.instance).wait(754).to({_off:false},0).to({regX:15.7,regY:22.7,scaleX:1.5598,scaleY:1.5598,x:-81.6,y:698,startPosition:23},258).to({_off:true,regX:0,regY:0,scaleX:0.5,scaleY:0.5,x:289.25,y:284.8},1).wait(33));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.Scene_1_flash0_ai_3 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// flash0_ai
	this.instance = new lib.CachedBmp_6();
	this.instance.setTransform(-9.15,-0.5,0.5,0.5);

	this.instance_1 = new lib.CachedBmp_7();
	this.instance_1.setTransform(-40.7,367.7,0.5,0.5);

	this.instance_2 = new lib.CachedBmp_8();
	this.instance_2.setTransform(-279.6,-41.05,0.5,0.5);

	this.instance_3 = new lib.Symbol5_1();
	this.instance_3.setTransform(608.85,636.8,1,1,0,0,0,622.8,140.4);
	this.instance_3._off = true;

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.instance}]},314).to({state:[{t:this.instance_1}]},173).to({state:[{t:this.instance_2}]},143).to({state:[{t:this.instance_3}]},67).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).to({state:[{t:this.instance_3}]},1).wait(1));
	this.timeline.addTween(cjs.Tween.get(this.instance_3).wait(697).to({_off:false},0).wait(1).to({scaleY:1.0319,x:607.35,y:636},0).wait(1).to({scaleY:1.0638,x:605.85,y:635.2},0).wait(1).to({scaleY:1.0957,x:604.35,y:634.45},0).wait(1).to({scaleY:1.1276,x:602.85,y:633.65},0).wait(1).to({scaleY:1.1595,x:601.35,y:632.9},0).wait(1).to({scaleY:1.1914,x:599.8,y:632.1},0).wait(1).to({scaleY:1.2233,x:598.3,y:631.35},0).wait(1).to({scaleY:1.2552,x:596.8,y:630.6},0).wait(1).to({scaleY:1.2871,x:595.3,y:629.75},0).wait(1).to({scaleY:1.319,x:593.8,y:629},0).wait(1).to({scaleY:1.3509,x:592.25,y:628.2},0).wait(1).to({scaleY:1.3828,x:590.75,y:627.45},0).wait(1).to({scaleY:1.4147,x:589.25,y:626.65},0).wait(1).to({scaleY:1.4466,x:587.75,y:625.9},0).wait(1).to({scaleY:1.4785,x:586.25,y:625.15},0).wait(1).to({scaleY:1.5104,x:584.75,y:624.35},0).wait(1).to({scaleY:1.5423,x:583.2,y:623.6},0).wait(1).to({scaleY:1.5742,x:581.7,y:622.75},0).wait(1).to({scaleY:1.6061,x:580.2,y:622},0).wait(1).to({scaleY:1.638,x:578.7,y:621.25},0).wait(1).to({scaleY:1.6699,x:577.2,y:620.45},0).wait(1).to({scaleY:1.7018,x:575.65,y:619.7},0).wait(1).to({scaleY:1.7337,x:574.15,y:618.9},0).wait(1).to({scaleY:1.7656,x:572.65,y:618.15},0).wait(1).to({scaleY:1.7975,x:571.15,y:617.35},0).wait(1).to({scaleY:1.8294,x:569.65,y:616.6},0).wait(1).to({scaleY:1.8613,x:568.15,y:615.8},0).wait(1).to({scaleY:1.8932,x:566.6,y:615},0).wait(1).to({scaleY:1.9251,x:565.1,y:614.25},0).wait(1).to({scaleY:1.957,x:563.6,y:613.45},0).wait(1).to({scaleY:1.9889,x:562.1,y:612.7},0).wait(1).to({scaleY:2.0208,x:560.6,y:611.9},0).wait(1).to({scaleY:2.0527,x:559.05,y:611.15},0).wait(1).to({scaleY:2.0846,x:557.55,y:610.4},0).wait(1).to({scaleY:2.1165,x:556.05,y:609.6},0).wait(1).to({scaleY:2.1484,x:554.55,y:608.8},0).wait(1).to({scaleY:2.1804,x:553.05,y:608},0).wait(1).to({scaleY:2.2123,x:551.55,y:607.25},0).wait(1).to({scaleY:2.2442,x:550,y:606.5},0).wait(1).to({scaleY:2.2761,x:548.5,y:605.7},0).wait(1).to({scaleY:2.308,x:547,y:604.95},0).wait(1).to({scaleY:2.3399,x:545.5,y:604.15},0).wait(1).to({scaleY:2.3718,x:544,y:603.4},0).wait(1).to({scaleY:2.4037,x:542.45,y:602.55},0).wait(1).to({scaleY:2.4356,x:540.95,y:601.8},0).wait(1).to({scaleY:2.4675,x:539.45,y:601.05},0).wait(1).to({scaleY:2.4994,x:537.95,y:600.25},0).wait(1).to({scaleY:2.5313,x:536.45,y:599.5},0).wait(1).to({scaleY:2.5632,x:534.95,y:598.7},0).wait(1).to({scaleY:2.5951,x:533.4,y:597.95},0).wait(1).to({scaleY:2.627,x:531.9,y:597.2},0).wait(1).to({scaleY:2.6589,x:530.4,y:596.4},0).wait(1).to({scaleY:2.6908,x:528.9,y:595.6},0).wait(1).to({scaleY:2.7227,x:527.4,y:594.8},0).wait(1).to({scaleY:2.7546,x:525.85,y:594.05},0).wait(1).to({scaleY:2.7865,x:524.35,y:593.25},0).wait(1).to({scaleY:2.8184,x:522.85,y:592.5},0).wait(1).to({scaleY:2.8503,x:521.35,y:591.75},0).wait(1).to({scaleY:2.8822,x:519.85,y:590.95},0).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.Scene_1_flash0_ai_2 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// flash0_ai
	this.instance = new lib.אישהולך("synched",0);
	this.instance.setTransform(1207.55,401.4,0.8157,0.8157,0,0,0,15.2,18.2);

	this.instance_1 = new lib.אישמופתע("synched",0);
	this.instance_1.setTransform(610.95,470.6,1.4273,1.4273,0,0,0,-182.2,-1);

	this.instance_2 = new lib.חושב1("synched",0);
	this.instance_2.setTransform(665.95,443.9,1,1,0,0,0,66,195.1);
	this.instance_2._off = true;

	this.instance_3 = new lib.חושב2("synched",0);
	this.instance_3.setTransform(665.7,442.45,1,1,0,0,0,65.6,192.2);
	this.instance_3._off = true;

	this.instance_4 = new lib.חושב3("synched",0);
	this.instance_4.setTransform(660.8,445,1,1,0,0,0,85.2,190.2);

	this.instance_5 = new lib.בועה("synched",0);
	this.instance_5.setTransform(770.9,388.7,1,1,0,0,0,34.9,12.1);

	this.instance_6 = new lib.מתנשף5("synched",0);
	this.instance_6.setTransform(659.6,445.8,1,1,0,0,0,83.9,190.2);

	this.instance_7 = new lib.טיפות("synched",0);
	this.instance_7.setTransform(793.05,399.95,1,0.8734,0,0,0,427.7,110.3);

	this.instance_8 = new lib.מתנשף6("synched",0);
	this.instance_8.setTransform(657.95,447.1,1,1,0,0,0,81.4,188.8);

	this.instance_9 = new lib.מתנשף7("synched",0);
	this.instance_9.setTransform(657.8,448.7,1,1,0,0,0,82.9,190.3);

	this.instance_10 = new lib.מתנשף8("synched",0);
	this.instance_10.setTransform(649.7,440,1.868,1.868,0,0,0,39.5,102.5);

	this.instance_11 = new lib.מתנשף9("synched",0);
	this.instance_11.setTransform(671.15,433.7,1,1,0,0,0,68.7,202.2);

	this.instance_12 = new lib.מתנשף10();
	this.instance_12.setTransform(687.65,470.8,1,1,0,0,0,88.7,180.2);

	this.instance_13 = new lib.CachedBmp_5();
	this.instance_13.setTransform(349.05,-6.95,0.5,0.5);

	this.instance_14 = new lib.יד1("synched",0);
	this.instance_14.setTransform(1505.4,288.05,1,1,0,0,0,214.1,118.2);

	this.instance_15 = new lib.יד2("synched",0);
	this.instance_15.setTransform(1009.2,332.6,1,1,0,0,0,242.6,137.8);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance}]}).to({state:[{t:this.instance}]},7).to({state:[{t:this.instance}]},307).to({state:[{t:this.instance_1,p:{startPosition:0}}]},14).to({state:[{t:this.instance_1,p:{startPosition:43}}]},41).to({state:[{t:this.instance_2}]},2).to({state:[{t:this.instance_3}]},9).to({state:[{t:this.instance_4}]},11).to({state:[{t:this.instance_6},{t:this.instance_5}]},18).to({state:[{t:this.instance_8},{t:this.instance_7}]},12).to({state:[{t:this.instance_9}]},15).to({state:[{t:this.instance_10}]},5).to({state:[{t:this.instance_11}]},8).to({state:[{t:this.instance_12}]},7).to({state:[{t:this.instance_13}]},31).to({state:[{t:this.instance_14}]},143).to({state:[{t:this.instance_15,p:{startPosition:0}}]},39).to({state:[{t:this.instance_15,p:{startPosition:22}}]},17).wait(71));
	this.timeline.addTween(cjs.Tween.get(this.instance).to({scaleX:0.8246,scaleY:0.8246,x:1196.35,y:402.8,startPosition:7},7).to({scaleX:1.2165,scaleY:1.2165,x:705.35,y:464,startPosition:3},307).to({_off:true},14).wait(429));
	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(371).to({_off:false},0).to({_off:true,regX:65.6,regY:192.2,x:665.7,y:442.45},9).wait(377));
	this.timeline.addTween(cjs.Tween.get(this.instance_3).wait(371).to({_off:false},9).to({_off:true,regX:85.2,regY:190.2,x:660.8,y:445},11).wait(366));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.Scene_1_flash0_ai_1 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// flash0_ai
	this.instance = new lib.CachedBmp_3();
	this.instance.setTransform(-0.25,-0.5,0.5,0.5);

	this.instance_1 = new lib.עיניים("synched",0);
	this.instance_1.setTransform(615.65,285.5,1,1,0,0,0,77.5,51.8);

	this.instance_2 = new lib.CachedBmp_4();
	this.instance_2.setTransform(538.05,234.25,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.instance}]},477).to({state:[{t:this.instance_1}]},10).to({state:[{t:this.instance_2}]},142).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


(lib.Scene_1_flash0_ai = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// flash0_ai
	this.instance = new lib.CachedBmp_1();
	this.instance.setTransform(434.8,85.8,0.5,0.5);

	this.button1 = new lib.play();
	this.button1.name = "button1";
	this.button1.setTransform(671.45,233.1,1.8441,1.8441,0,0,0,134.2,53.4);
	new cjs.ButtonHelper(this.button1, 0, 1, 2);

	this.instance_1 = new lib.סיום("synched",0);
	this.instance_1.setTransform(603.1,359.5,1,1,0,0,0,11.7,11.7);
	this.instance_1._off = true;

	this.instance_2 = new lib.CachedBmp_2();
	this.instance_2.setTransform(365.55,513.05,0.5,0.5);

	this.button2 = new lib.button();
	this.button2.name = "button2";
	this.button2.setTransform(465.35,112);
	new cjs.ButtonHelper(this.button2, 0, 1, 2);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.button1},{t:this.instance}]}).to({state:[]},3).to({state:[{t:this.instance_1}]},1019).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.button2},{t:this.instance_2}]},1).wait(4));
	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(1022).to({_off:false},0).wait(1).to({scaleX:3.2782,scaleY:3.2782,x:603.2,y:359.6},0).wait(1).to({scaleX:5.5565,scaleY:5.5565,x:603.3,y:359.7},0).wait(1).to({scaleX:7.8347,scaleY:7.8347,x:603.4,y:359.8},0).wait(1).to({scaleX:10.1129,scaleY:10.1129,x:603.5,y:359.9},0).wait(1).to({scaleX:12.3912,scaleY:12.3912,x:603.65,y:360.05},0).wait(1).to({scaleX:14.6694,scaleY:14.6694,x:603.8,y:360.2},0).wait(1).to({scaleX:16.9476,scaleY:16.9476,x:603.9,y:360.3},0).wait(1).to({scaleX:19.2258,scaleY:19.2258,x:604,y:360.4},0).wait(1).to({scaleX:21.5041,scaleY:21.5041,x:604.1,y:360.5},0).wait(1).to({scaleX:23.7823,scaleY:23.7823,x:604.2,y:360.6},0).wait(1).to({scaleX:26.0605,scaleY:26.0605,x:604.3,y:360.7},0).wait(1).to({scaleX:28.3388,scaleY:28.3388,x:604.45,y:360.85},0).wait(1).to({scaleX:30.617,scaleY:30.617,x:604.55,y:360.95},0).wait(1).to({scaleX:32.8952,scaleY:32.8952,x:604.65,y:361.1},0).wait(1).to({scaleX:35.1735,scaleY:35.1735,x:604.8,y:361.25},0).wait(1).to({scaleX:37.4517,scaleY:37.4517,x:604.9,y:361.35},0).wait(1).to({scaleX:39.7299,scaleY:39.7299,x:605,y:361.45},0).wait(1).to({scaleX:42.0082,scaleY:42.0082,x:605.15,y:361.6},0).wait(1).to({scaleX:44.2864,scaleY:44.2864,x:605.25,y:361.7},0).wait(1).to({scaleX:46.5646,scaleY:46.5646,x:605.35,y:361.8},0).wait(1).to({scaleX:48.8428,scaleY:48.8428,x:605.45,y:361.9},0).wait(1).to({scaleX:51.1211,scaleY:51.1211,x:605.55,y:362},0).wait(1).to({scaleX:53.3993,scaleY:53.3993,x:605.7,y:362.1},0).wait(1).to({scaleX:55.6775,scaleY:55.6775,x:605.9,y:362.3},0).wait(1).to({scaleX:57.9558,scaleY:57.9558,x:606,y:362.4},0).wait(1).to({scaleX:60.234,scaleY:60.234,x:606.1,y:362.5},0).to({_off:true},1).wait(4));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();


// stage content:
(lib.ThePit = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	this.actionFrames = [0,3,700,1049,1052];
	this.streamSoundSymbolsList[0] = [{id:"John_Bartmann__09__Happy_Clappy1_1_wav",startFrame:0,endFrame:1050,loop:1,offset:0}];
	this.streamSoundSymbolsList[700] = [{id:"cartoon_character_high_pitched_voice_says_oh_hehewav",startFrame:700,endFrame:732,loop:1,offset:0}];
	this.___GetDepth___ = function(obj) {
		var depth = obj.depth;
		var cameraObj = this.___camera___instance;
		if(cameraObj && cameraObj.depth && obj.isAttachedToCamera)
		{
			depth += depth + cameraObj.depth;
		}
		return depth;
		}
	this.___needSorting___ = function() {
		for (var i = 0; i < this.numChildren - 1; i++)
		{
			var prevDepth = this.___GetDepth___(this.getChildAt(i));
			var nextDepth = this.___GetDepth___(this.getChildAt(i + 1));
			if (prevDepth < nextDepth)
				return true;
		}
		return false;
	}
	this.___sortFunction___ = function(obj1, obj2) {
		return (this.exportRoot.___GetDepth___(obj2) - this.exportRoot.___GetDepth___(obj1));
	}
	this.on('tick', function (event){
		var curTimeline = event.currentTarget;
		if (curTimeline.___needSorting___()){
			this.sortChildren(curTimeline.___sortFunction___);
		}
	});

	// timeline functions:
	this.frame_0 = function() {
		this.clearAllSoundStreams();
		 
		var soundInstance = playSound("John_Bartmann__09__Happy_Clappy1_1_wav",0);
		this.InsertIntoSoundStreamData(soundInstance,0,1050,1);
		this.button1 = this.flash0_ai.button1;
		var _this = this;
		/*
		Stop a Movie Clip/Video
		Stops the specified movie clip or video.
		*/
		_this.stop();
		
		
		var _this = this;
		/*
		Clicking on the specified symbol instance executes a function.
		*/
		_this.button1.on('click', function(){
		/*
		Play a Movie Clip/Video or the current timeline.
		Plays the specified movie clip or video.
		*/
		_this.play();
		});
	}
	this.frame_3 = function() {
		this.button1 = undefined;
	}
	this.frame_700 = function() {
		var soundInstance = playSound("cartoon_character_high_pitched_voice_says_oh_hehewav",0);
		this.InsertIntoSoundStreamData(soundInstance,700,732,1);
	}
	this.frame_1049 = function() {
		this.button2 = this.flash0_ai.button2;
		var self = this;
		self.stop();
		
		
		var _this = this;
		/*
		Clicking on the specified symbol instance executes a function.
		*/
		self.button2.addEventListener("click",playAgain);
		
		function playAgain(){
		self.gotoAndPlay(1);	
		}
	}
	this.frame_1052 = function() {
		this.___loopingOver___ = true;
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(3).call(this.frame_3).wait(697).call(this.frame_700).wait(349).call(this.frame_1049).wait(3).call(this.frame_1052).wait(1));

	// Camera
	this.___camera___instance = new lib.___Camera___();
	this.___camera___instance.name = "___camera___instance";
	this.___camera___instance.setTransform(640,360,0.9738,0.9738);
	this.___camera___instance.depth = 0;

	this.timeline.addTween(cjs.Tween.get(this.___camera___instance).wait(3).to({regX:0.9,regY:0.5,scaleX:0.2245,scaleY:0.2245,x:1134.45,y:363.1,visible:false},0).to({regX:1.4,regY:1.1,scaleX:0.8981,scaleY:0.8981,x:701,y:392.6},56).wait(212).to({regY:1.2,x:689.75,y:368.85},0).to({regX:2,regY:1.6,scaleX:0.2923,scaleY:0.2923,x:450.65,y:620.65},57).wait(20).to({regX:2.6,regY:2.1,scaleX:0.4546,scaleY:0.4546,x:673.1,y:394.55},16).wait(57).to({regX:0.1,regY:0.1,scaleX:0.774,scaleY:0.774,x:505.8,y:438.65,visible:true},38).wait(18).to({regX:0.2,regY:0.2,scaleX:0.9234,scaleY:0.9234,x:632.9,y:341.95},0).wait(280).to({regX:0.8,regY:0.8,scaleX:0.1859,scaleY:0.1859,x:1083.75,y:257.25},0).to({regX:1.4,regY:1.4,scaleX:0.9555,scaleY:0.9555,x:674.1,y:351.05},31).wait(265));

	// flash0_ai_obj_
	this.flash0_ai = new lib.Scene_1_flash0_ai();
	this.flash0_ai.name = "flash0_ai";
	this.flash0_ai.setTransform(668.8,324.9,1.0269,1.0269,0,0,0,668,325.8);
	this.flash0_ai.depth = 0;
	this.flash0_ai.isAttachedToCamera = 0
	this.flash0_ai.isAttachedToMask = 0
	this.flash0_ai.layerDepth = 0
	this.flash0_ai.layerIndex = 0
	this.flash0_ai.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.flash0_ai).wait(3).to({regX:1140.7,regY:355.1,scaleX:4.4534,scaleY:4.4534,x:668.95},0).wait(1019).to({regX:700.2,regY:316.2,scaleX:1.0465,scaleY:1.0465,x:668.8,y:324.95},0).wait(1).to({regX:604.6,regY:360.9,scaleX:1,scaleY:1,x:573.2,y:369.65},0).wait(26).to({regX:700.2,regY:316.2,scaleX:1.0465,scaleY:1.0465,x:668.8,y:324.95},0).wait(4));

	// ציפור_2_obj_
	this.ציפור_2 = new lib.Scene_1_ציפור_2();
	this.ציפור_2.name = "ציפור_2";
	this.ציפור_2.setTransform(111.35,200.45,1.0269,1.0269,0,0,0,125.2,204.6);
	this.ציפור_2.depth = 0;
	this.ציפור_2.isAttachedToCamera = 0
	this.ציפור_2.isAttachedToMask = 0
	this.ציפור_2.layerDepth = 0
	this.ציפור_2.layerIndex = 1
	this.ציפור_2.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.ציפור_2).wait(1).to({regX:725.8,regY:125.6,scaleX:1,scaleY:1,x:712,y:121.5},0).wait(437).to({_off:true},1).wait(614));

	// ציפור_1_obj_
	this.ציפור_1 = new lib.Scene_1_ציפור_1();
	this.ציפור_1.name = "ציפור_1";
	this.ציפור_1.setTransform(79.75,139.95,1.0269,1.0269,0,0,0,94.4,145.7);
	this.ציפור_1.depth = 0;
	this.ציפור_1.isAttachedToCamera = 0
	this.ציפור_1.isAttachedToMask = 0
	this.ציפור_1.layerDepth = 0
	this.ציפור_1.layerIndex = 2
	this.ציפור_1.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.ציפור_1).wait(1).to({regX:702.4,regY:110.9,scaleX:1,scaleY:1,x:687.75,y:105.2},0).wait(473).to({_off:true},1).wait(578));

	// כוכבים_obj_
	this.כוכבים = new lib.Scene_1_כוכבים();
	this.כוכבים.name = "כוכבים";
	this.כוכבים.setTransform(0.05,0,1.0269,1.0269,0,0,0,16.8,9.4);
	this.כוכבים.depth = 0;
	this.כוכבים.isAttachedToCamera = 0
	this.כוכבים.isAttachedToMask = 0
	this.כוכבים.layerDepth = 0
	this.כוכבים.layerIndex = 3
	this.כוכבים.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.כוכבים).wait(518).to({regX:41.7,regY:9.3,scaleX:1.0829,scaleY:1.0829,x:0},0).to({_off:true},112).wait(423));

	// flash0_ai_obj_
	this.flash0_ai_1 = new lib.Scene_1_flash0_ai_1();
	this.flash0_ai_1.name = "flash0_ai_1";
	this.flash0_ai_1.setTransform(0.05,0,1.0269,1.0269,0,0,0,16.8,9.4);
	this.flash0_ai_1.depth = 0;
	this.flash0_ai_1.isAttachedToCamera = 0
	this.flash0_ai_1.isAttachedToMask = 0
	this.flash0_ai_1.layerDepth = 0
	this.flash0_ai_1.layerIndex = 4
	this.flash0_ai_1.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.flash0_ai_1).wait(477).to({regX:41.7,regY:9.3,scaleX:1.0829,scaleY:1.0829,x:0},0).wait(152).to({_off:true},1).wait(423));

	// flash0_ai_obj_
	this.flash0_ai_2 = new lib.Scene_1_flash0_ai_2();
	this.flash0_ai_2.name = "flash0_ai_2";
	this.flash0_ai_2.setTransform(1205.9,401,1.0269,1.0269,0,0,0,1191,399.9);
	this.flash0_ai_2.depth = 0;
	this.flash0_ai_2.isAttachedToCamera = 0
	this.flash0_ai_2.isAttachedToMask = 0
	this.flash0_ai_2.layerDepth = 0
	this.flash0_ai_2.layerIndex = 5
	this.flash0_ai_2.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.flash0_ai_2).to({regX:1261.3,regY:372.2,scaleX:4.4534,scaleY:4.4534,x:1206,y:401.05},7).to({regX:1196.7,regY:404.4,scaleX:1.1135,scaleY:1.1135,x:1205.9,y:400.9},307).wait(14).to({regX:615.5,regY:632.1,scaleX:3.4208,scaleY:3.4208,x:1206,y:400.8},0).wait(41).to({regX:929.1,regY:412.2,scaleX:2.1999,scaleY:2.1999,x:1205.9,y:400.95},0).wait(118).to({regX:1155.2,regY:379.5,scaleX:1.0829,scaleY:1.0829,x:1205.85},0).wait(199).to({_off:true},71).wait(296));

	// בור_obj_
	this.בור = new lib.Scene_1_בור();
	this.בור.name = "בור";
	this.בור.setTransform(0.05,0,1.0269,1.0269,0,0,0,16.8,9.4);
	this.בור.depth = 0;
	this.בור.isAttachedToCamera = 0
	this.בור.isAttachedToMask = 0
	this.בור.layerDepth = 0
	this.בור.layerIndex = 6
	this.בור.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.בור).wait(272).to({regX:113.7,regY:44.4,scaleX:1.1135,scaleY:1.1135,x:0,y:0.05},0).to({regX:262.9,regY:515,scaleX:3.4208,scaleY:3.4208,x:-0.15,y:0.2},56).to({_off:true},149).wait(576));

	// שביל_obj_
	this.שביל = new lib.Scene_1_שביל();
	this.שביל.name = "שביל";
	this.שביל.setTransform(427.95,635.15,1.0269,1.0269,0,0,0,433.5,627.9);
	this.שביל.depth = 0;
	this.שביל.isAttachedToCamera = 0
	this.שביל.isAttachedToMask = 0
	this.שביל.layerDepth = 0
	this.שביל.layerIndex = 7
	this.שביל.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.שביל).to({regX:509.3,regY:638.6,scaleX:1.1135,scaleY:1.1135,x:428,y:635.1},259).to({regX:498.1,regY:614.8,x:428.05,y:635.2},55).to({_off:true},163).wait(576));

	// דשא_obj_
	this.דשא = new lib.Scene_1_דשא();
	this.דשא.name = "דשא";
	this.דשא.setTransform(123.3,558.45,1.0269,1.0269,0,0,0,136.8,553.2);
	this.דשא.depth = 0;
	this.דשא.isAttachedToCamera = 0
	this.דשא.isAttachedToMask = 0
	this.דשא.layerDepth = 0
	this.דשא.layerIndex = 8
	this.דשא.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.דשא).to({_off:true},477).wait(576));

	// flash0_ai_obj_
	this.flash0_ai_3 = new lib.Scene_1_flash0_ai_3();
	this.flash0_ai_3.name = "flash0_ai_3";
	this.flash0_ai_3.setTransform(0.05,0,1.0269,1.0269,0,0,0,16.8,9.4);
	this.flash0_ai_3.depth = 0;
	this.flash0_ai_3.isAttachedToCamera = 0
	this.flash0_ai_3.isAttachedToMask = 0
	this.flash0_ai_3.layerDepth = 0
	this.flash0_ai_3.layerIndex = 9
	this.flash0_ai_3.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.flash0_ai_3).wait(314).to({regX:113.7,regY:44.4,scaleX:1.1135,scaleY:1.1135,x:0,y:0.05},0).wait(173).to({regX:41.7,regY:9.3,scaleX:1.0829,scaleY:1.0829,y:0},0).wait(211).to({regX:505.9,regY:478.2,scaleX:1,scaleY:1,x:464.25,y:468.95},0).wait(58).to({_off:true},1).wait(296));

	// רקע_obj_
	this.רקע = new lib.Scene_1_רקע();
	this.רקע.name = "רקע";
	this.רקע.setTransform(623.7,429.35,1.0269,1.0269,0,0,0,624.1,427.5);
	this.רקע.depth = 0;
	this.רקע.isAttachedToCamera = 0
	this.רקע.isAttachedToMask = 0
	this.רקע.layerDepth = 0
	this.רקע.layerIndex = 10
	this.רקע.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.רקע).wait(487).to({regX:617.6,regY:405.8,scaleX:1.0829,scaleY:1.0829,y:429.4},0).wait(210).to({_off:true},60).wait(296));

	// flash0_ai_obj_
	this.flash0_ai_4 = new lib.Scene_1_flash0_ai_4();
	this.flash0_ai_4.name = "flash0_ai_4";
	this.flash0_ai_4.setTransform(0.05,0,1.0269,1.0269,0,0,0,16.8,9.4);
	this.flash0_ai_4.depth = 0;
	this.flash0_ai_4.isAttachedToCamera = 0
	this.flash0_ai_4.isAttachedToMask = 0
	this.flash0_ai_4.layerDepth = 0
	this.flash0_ai_4.layerIndex = 11
	this.flash0_ai_4.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.flash0_ai_4).wait(754).to({regX:41.7,regY:9.3,scaleX:1.0829,scaleY:1.0829,x:0},0).to({regX:61.1,regY:5.7,scaleX:1.0465,scaleY:1.0465,x:-0.05},258).wait(33).to({_off:true},1).wait(7));

	// שביל_obj_
	this.שביל_1 = new lib.Scene_1_שביל_1();
	this.שביל_1.name = "שביל_1";
	this.שביל_1.setTransform(0.05,0,1.0269,1.0269,0,0,0,16.8,9.4);
	this.שביל_1.depth = 0;
	this.שביל_1.isAttachedToCamera = 0
	this.שביל_1.isAttachedToMask = 0
	this.שביל_1.layerDepth = 0
	this.שביל_1.layerIndex = 12
	this.שביל_1.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.שביל_1).wait(757).to({regX:964.6,regY:190.2,scaleX:5.3806,scaleY:5.3806,x:-0.25,y:0.3},0).wait(1).to({regX:769.3,regY:600.7,scaleX:1,scaleY:1,x:-195.3,y:410.6},0).wait(254).to({_off:true},1).wait(40));

	// רקע_obj_
	this.רקע_1 = new lib.Scene_1_רקע_1();
	this.רקע_1.name = "רקע_1";
	this.רקע_1.setTransform(0.05,0,1.0269,1.0269,0,0,0,16.8,9.4);
	this.רקע_1.depth = 0;
	this.רקע_1.isAttachedToCamera = 0
	this.רקע_1.isAttachedToMask = 0
	this.רקע_1.layerDepth = 0
	this.רקע_1.layerIndex = 13
	this.רקע_1.maskLayerName = 0

	this.timeline.addTween(cjs.Tween.get(this.רקע_1).wait(757).to({regX:964.6,regY:190.2,scaleX:5.3806,scaleY:5.3806,x:-0.25,y:0.3},0).to({_off:true},256).wait(40));

	this._renderFirstFrame();

}).prototype = p = new lib.AnMovieClip();
p.nominalBounds = new cjs.Rectangle(-393.2,18.8,2689.2999999999997,1044.2);
// library properties:
lib.properties = {
	id: 'D878C46D691B7D41B77EB6FE3C29B9AA',
	width: 1280,
	height: 720,
	fps: 30,
	color: "#2E2E2E",
	opacity: 1.00,
	manifest: [
		{src:"images/CachedBmp_15.png?1651076959270", id:"CachedBmp_15"},
		{src:"images/CachedBmp_14.png?1651076959270", id:"CachedBmp_14"},
		{src:"images/CachedBmp_11.png?1651076959270", id:"CachedBmp_11"},
		{src:"images/CachedBmp_10.png?1651076959270", id:"CachedBmp_10"},
		{src:"images/CachedBmp_56.png?1651076959270", id:"CachedBmp_56"},
		{src:"images/CachedBmp_8.png?1651076959270", id:"CachedBmp_8"},
		{src:"images/CachedBmp_7.png?1651076959270", id:"CachedBmp_7"},
		{src:"images/CachedBmp_6.png?1651076959270", id:"CachedBmp_6"},
		{src:"images/CachedBmp_3.png?1651076959270", id:"CachedBmp_3"},
		{src:"images/ThePit_atlas_1.png?1651076958986", id:"ThePit_atlas_1"},
		{src:"images/ThePit_atlas_2.png?1651076958986", id:"ThePit_atlas_2"},
		{src:"images/ThePit_atlas_3.png?1651076958986", id:"ThePit_atlas_3"},
		{src:"images/ThePit_atlas_4.png?1651076958986", id:"ThePit_atlas_4"},
		{src:"sounds/cartoon_character_high_pitched_voice_says_oh_hehewav.mp3?1651076959270", id:"cartoon_character_high_pitched_voice_says_oh_hehewav"},
		{src:"sounds/John_Bartmann__09__Happy_Clappy1_1_wav.mp3?1651076959270", id:"John_Bartmann__09__Happy_Clappy1_1_wav"}
	],
	preloads: []
};



// bootstrap callback support:

(lib.Stage = function(canvas) {
	createjs.Stage.call(this, canvas);
}).prototype = p = new createjs.Stage();

p.setAutoPlay = function(autoPlay) {
	this.tickEnabled = autoPlay;
}
p.play = function() { this.tickEnabled = true; this.getChildAt(0).gotoAndPlay(this.getTimelinePosition()) }
p.stop = function(ms) { if(ms) this.seek(ms); this.tickEnabled = false; }
p.seek = function(ms) { this.tickEnabled = true; this.getChildAt(0).gotoAndStop(lib.properties.fps * ms / 1000); }
p.getDuration = function() { return this.getChildAt(0).totalFrames / lib.properties.fps * 1000; }

p.getTimelinePosition = function() { return this.getChildAt(0).currentFrame / lib.properties.fps * 1000; }

an.bootcompsLoaded = an.bootcompsLoaded || [];
if(!an.bootstrapListeners) {
	an.bootstrapListeners=[];
}

an.bootstrapCallback=function(fnCallback) {
	an.bootstrapListeners.push(fnCallback);
	if(an.bootcompsLoaded.length > 0) {
		for(var i=0; i<an.bootcompsLoaded.length; ++i) {
			fnCallback(an.bootcompsLoaded[i]);
		}
	}
};

an.compositions = an.compositions || {};
an.compositions['D878C46D691B7D41B77EB6FE3C29B9AA'] = {
	getStage: function() { return exportRoot.stage; },
	getLibrary: function() { return lib; },
	getSpriteSheet: function() { return ss; },
	getImages: function() { return img; }
};

an.compositionLoaded = function(id) {
	an.bootcompsLoaded.push(id);
	for(var j=0; j<an.bootstrapListeners.length; j++) {
		an.bootstrapListeners[j](id);
	}
}

an.getComposition = function(id) {
	return an.compositions[id];
}

p._getProjectionMatrix = function(container, totalDepth) {	var focalLength = 528.25;
	var projectionCenter = { x : lib.properties.width/2, y : lib.properties.height/2 };
	var scale = (totalDepth + focalLength)/focalLength;
	var scaleMat = new createjs.Matrix2D;
	scaleMat.a = 1/scale;
	scaleMat.d = 1/scale;
	var projMat = new createjs.Matrix2D;
	projMat.tx = -projectionCenter.x;
	projMat.ty = -projectionCenter.y;
	projMat = projMat.prependMatrix(scaleMat);
	projMat.tx += projectionCenter.x;
	projMat.ty += projectionCenter.y;
	return projMat;
}
p._handleTick = function(event) {
	var cameraInstance = exportRoot.___camera___instance;
	if(cameraInstance !== undefined && cameraInstance.pinToObject !== undefined)
	{
		cameraInstance.x = cameraInstance.pinToObject.x + cameraInstance.pinToObject.pinOffsetX;
		cameraInstance.y = cameraInstance.pinToObject.y + cameraInstance.pinToObject.pinOffsetY;
		if(cameraInstance.pinToObject.parent !== undefined && cameraInstance.pinToObject.parent.depth !== undefined)
		cameraInstance.depth = cameraInstance.pinToObject.parent.depth + cameraInstance.pinToObject.pinOffsetZ;
	}
	stage._applyLayerZDepth(exportRoot);
}
p._applyLayerZDepth = function(parent)
{
	var cameraInstance = parent.___camera___instance;
	var focalLength = 528.25;
	var projectionCenter = { 'x' : 0, 'y' : 0};
	if(parent === exportRoot)
	{
		var stageCenter = { 'x' : lib.properties.width/2, 'y' : lib.properties.height/2 };
		projectionCenter.x = stageCenter.x;
		projectionCenter.y = stageCenter.y;
	}
	for(child in parent.children)
	{
		var layerObj = parent.children[child];
		if(layerObj == cameraInstance)
			continue;
		stage._applyLayerZDepth(layerObj, cameraInstance);
		if(layerObj.layerDepth === undefined)
			continue;
		if(layerObj.currentFrame != layerObj.parent.currentFrame)
		{
			layerObj.gotoAndPlay(layerObj.parent.currentFrame);
		}
		var matToApply = new createjs.Matrix2D;
		var cameraMat = new createjs.Matrix2D;
		var totalDepth = layerObj.layerDepth ? layerObj.layerDepth : 0;
		var cameraDepth = 0;
		if(cameraInstance && !layerObj.isAttachedToCamera)
		{
			var mat = cameraInstance.getMatrix();
			mat.tx -= projectionCenter.x;
			mat.ty -= projectionCenter.y;
			cameraMat = mat.invert();
			cameraMat.prependTransform(projectionCenter.x, projectionCenter.y, 1, 1, 0, 0, 0, 0, 0);
			cameraMat.appendTransform(-projectionCenter.x, -projectionCenter.y, 1, 1, 0, 0, 0, 0, 0);
			if(cameraInstance.depth)
				cameraDepth = cameraInstance.depth;
		}
		if(layerObj.depth)
		{
			totalDepth = layerObj.depth;
		}
		//Offset by camera depth
		totalDepth -= cameraDepth;
		if(totalDepth < -focalLength)
		{
			matToApply.a = 0;
			matToApply.d = 0;
		}
		else
		{
			if(layerObj.layerDepth)
			{
				var sizeLockedMat = stage._getProjectionMatrix(parent, layerObj.layerDepth);
				if(sizeLockedMat)
				{
					sizeLockedMat.invert();
					matToApply.prependMatrix(sizeLockedMat);
				}
			}
			matToApply.prependMatrix(cameraMat);
			var projMat = stage._getProjectionMatrix(parent, totalDepth);
			if(projMat)
			{
				matToApply.prependMatrix(projMat);
			}
		}
		layerObj.transformMatrix = matToApply;
	}
}
an.makeResponsive = function(isResp, respDim, isScale, scaleType, domContainers) {		
	var lastW, lastH, lastS=1;		
	window.addEventListener('resize', resizeCanvas);		
	resizeCanvas();		
	function resizeCanvas() {			
		var w = lib.properties.width, h = lib.properties.height;			
		var iw = window.innerWidth, ih=window.innerHeight;			
		var pRatio = window.devicePixelRatio || 1, xRatio=iw/w, yRatio=ih/h, sRatio=1;			
		if(isResp) {                
			if((respDim=='width'&&lastW==iw) || (respDim=='height'&&lastH==ih)) {                    
				sRatio = lastS;                
			}				
			else if(!isScale) {					
				if(iw<w || ih<h)						
					sRatio = Math.min(xRatio, yRatio);				
			}				
			else if(scaleType==1) {					
				sRatio = Math.min(xRatio, yRatio);				
			}				
			else if(scaleType==2) {					
				sRatio = Math.max(xRatio, yRatio);				
			}			
		}
		domContainers[0].width = w * pRatio * sRatio;			
		domContainers[0].height = h * pRatio * sRatio;
		domContainers.forEach(function(container) {				
			container.style.width = w * sRatio + 'px';				
			container.style.height = h * sRatio + 'px';			
		});
		stage.scaleX = pRatio*sRatio;			
		stage.scaleY = pRatio*sRatio;
		lastW = iw; lastH = ih; lastS = sRatio;            
		stage.tickOnUpdate = false;            
		stage.update();            
		stage.tickOnUpdate = true;		
	}
}

// Virtual camera API : 

an.VirtualCamera = new function() {
var _camera = new Object();
function VC(timeline) {
	this.timeline = timeline;
	this.camera = timeline.___camera___instance;
	this.centerX = lib.properties.width / 2;
	this.centerY = lib.properties.height / 2;
	this.camAxisX = this.camera.x;
	this.camAxisY = this.camera.y;
	if(timeline.___camera___instance == null || timeline.___camera___instance == undefined ) {
		timeline.___camera___instance = new cjs.MovieClip();
		timeline.___camera___instance.visible = false;
		timeline.___camera___instance.parent = timeline;
		timeline.___camera___instance.setTransform(this.centerX, this.centerY);
	}
	this.camera = timeline.___camera___instance;
}

VC.prototype.moveBy = function(x, y, z) {
z = typeof z !== 'undefined' ? z : 0;
	var position = this.___getCamPosition___();
	var rotAngle = this.getRotation()*Math.PI/180;
	var sinTheta = Math.sin(rotAngle);
	var cosTheta = Math.cos(rotAngle);
	var offX= x*cosTheta + y*sinTheta;
	var offY = y*cosTheta - x*sinTheta;
	this.camAxisX = this.camAxisX - x;
	this.camAxisY = this.camAxisY - y;
	var posX = position.x + offX;
	var posY = position.y + offY;
	this.camera.x = this.centerX - posX;
	this.camera.y = this.centerY - posY;
	this.camera.depth += z;
};

VC.prototype.setPosition = function(x, y, z) {
	z = typeof z !== 'undefined' ? z : 0;

	const MAX_X = 10000;
	const MIN_X = -10000;
	const MAX_Y = 10000;
	const MIN_Y = -10000;
	const MAX_Z = 10000;
	const MIN_Z = -5000;

	if(x > MAX_X)
	  x = MAX_X;
	else if(x < MIN_X)
	  x = MIN_X;
	if(y > MAX_Y)
	  y = MAX_Y;
	else if(y < MIN_Y)
	  y = MIN_Y;
	if(z > MAX_Z)
	  z = MAX_Z;
	else if(z < MIN_Z)
	  z = MIN_Z;

	var rotAngle = this.getRotation()*Math.PI/180;
	var sinTheta = Math.sin(rotAngle);
	var cosTheta = Math.cos(rotAngle);
	var offX= x*cosTheta + y*sinTheta;
	var offY = y*cosTheta - x*sinTheta;
	
	this.camAxisX = this.centerX - x;
	this.camAxisY = this.centerY - y;
	this.camera.x = this.centerX - offX;
	this.camera.y = this.centerY - offY;
	this.camera.depth = z;
};

VC.prototype.getPosition = function() {
	var loc = new Object();
	loc['x'] = this.centerX - this.camAxisX;
	loc['y'] = this.centerY - this.camAxisY;
	loc['z'] = this.camera.depth;
	return loc;
};

VC.prototype.resetPosition = function() {
	this.setPosition(0, 0);
};

VC.prototype.zoomBy = function(zoom) {
	this.setZoom( (this.getZoom() * zoom) / 100);
};

VC.prototype.setZoom = function(zoom) {
	const MAX_zoom = 10000;
	const MIN_zoom = 1;
	if(zoom > MAX_zoom)
	zoom = MAX_zoom;
	else if(zoom < MIN_zoom)
	zoom = MIN_zoom;
	this.camera.scaleX = 100 / zoom;
	this.camera.scaleY = 100 / zoom;
};

VC.prototype.getZoom = function() {
	return 100 / this.camera.scaleX;
};

VC.prototype.resetZoom = function() {
	this.setZoom(100);
};

VC.prototype.rotateBy = function(angle) {
	this.setRotation( this.getRotation() + angle );
};

VC.prototype.setRotation = function(angle) {
	const MAX_angle = 180;
	const MIN_angle = -179;
	if(angle > MAX_angle)
		angle = MAX_angle;
	else if(angle < MIN_angle)
		angle = MIN_angle;
	this.camera.rotation = -angle;
};

VC.prototype.getRotation = function() {
	return -this.camera.rotation;
};

VC.prototype.resetRotation = function() {
	this.setRotation(0);
};

VC.prototype.reset = function() {
	this.resetPosition();
	this.resetZoom();
	this.resetRotation();
	this.unpinCamera();
};
VC.prototype.setZDepth = function(zDepth) {
	const MAX_zDepth = 10000;
	const MIN_zDepth = -5000;
	if(zDepth > MAX_zDepth)
		zDepth = MAX_zDepth;
	else if(zDepth < MIN_zDepth)
		zDepth = MIN_zDepth;
	this.camera.depth = zDepth;
}
VC.prototype.getZDepth = function() {
	return this.camera.depth;
}
VC.prototype.resetZDepth = function() {
	this.camera.depth = 0;
}

VC.prototype.pinCameraToObject = function(obj, offsetX, offsetY, offsetZ) {

	offsetX = typeof offsetX !== 'undefined' ? offsetX : 0;

	offsetY = typeof offsetY !== 'undefined' ? offsetY : 0;

	offsetZ = typeof offsetZ !== 'undefined' ? offsetZ : 0;
	if(obj === undefined)
		return;
	this.camera.pinToObject = obj;
	this.camera.pinToObject.pinOffsetX = offsetX;
	this.camera.pinToObject.pinOffsetY = offsetY;
	this.camera.pinToObject.pinOffsetZ = offsetZ;
};

VC.prototype.setPinOffset = function(offsetX, offsetY, offsetZ) {
	if(this.camera.pinToObject != undefined) {
	this.camera.pinToObject.pinOffsetX = offsetX;
	this.camera.pinToObject.pinOffsetY = offsetY;
	this.camera.pinToObject.pinOffsetZ = offsetZ;
	}
};

VC.prototype.unpinCamera = function() {
	this.camera.pinToObject = undefined;
};
VC.prototype.___getCamPosition___ = function() {
	var loc = new Object();
	loc['x'] = this.centerX - this.camera.x;
	loc['y'] = this.centerY - this.camera.y;
	loc['z'] = this.depth;
	return loc;
};

this.getCamera = function(timeline) {
	timeline = typeof timeline !== 'undefined' ? timeline : null;
	if(timeline === null) timeline = exportRoot;
	if(_camera[timeline] == undefined)
	_camera[timeline] = new VC(timeline);
	return _camera[timeline];
}

this.getCameraAsMovieClip = function(timeline) {
	timeline = typeof timeline !== 'undefined' ? timeline : null;
	if(timeline === null) timeline = exportRoot;
	return this.getCamera(timeline).camera;
}
}


// Layer depth API : 

an.Layer = new function() {
	this.getLayerZDepth = function(timeline, layerName)
	{
		if(layerName === "Camera")
		layerName = "___camera___instance";
		var script = "if(timeline." + layerName + ") timeline." + layerName + ".depth; else 0;";
		return eval(script);
	}
	this.setLayerZDepth = function(timeline, layerName, zDepth)
	{
		const MAX_zDepth = 10000;
		const MIN_zDepth = -5000;
		if(zDepth > MAX_zDepth)
			zDepth = MAX_zDepth;
		else if(zDepth < MIN_zDepth)
			zDepth = MIN_zDepth;
		if(layerName === "Camera")
		layerName = "___camera___instance";
		var script = "if(timeline." + layerName + ") timeline." + layerName + ".depth = " + zDepth + ";";
		eval(script);
	}
	this.removeLayer = function(timeline, layerName)
	{
		if(layerName === "Camera")
		layerName = "___camera___instance";
		var script = "if(timeline." + layerName + ") timeline.removeChild(timeline." + layerName + ");";
		eval(script);
	}
	this.addNewLayer = function(timeline, layerName, zDepth)
	{
		if(layerName === "Camera")
		layerName = "___camera___instance";
		zDepth = typeof zDepth !== 'undefined' ? zDepth : 0;
		var layer = new createjs.MovieClip();
		layer.name = layerName;
		layer.depth = zDepth;
		layer.layerIndex = 0;
		timeline.addChild(layer);
	}
}
an.handleSoundStreamOnTick = function(event) {
	if(!event.paused){
		var stageChild = stage.getChildAt(0);
		if(!stageChild.paused || stageChild.ignorePause){
			stageChild.syncStreamSounds();
		}
	}
}
an.handleFilterCache = function(event) {
	if(!event.paused){
		var target = event.target;
		if(target){
			if(target.filterCacheList){
				for(var index = 0; index < target.filterCacheList.length ; index++){
					var cacheInst = target.filterCacheList[index];
					if((cacheInst.startFrame <= target.currentFrame) && (target.currentFrame <= cacheInst.endFrame)){
						cacheInst.instance.cache(cacheInst.x, cacheInst.y, cacheInst.w, cacheInst.h);
					}
				}
			}
		}
	}
}


})(createjs = createjs||{}, AdobeAn = AdobeAn||{});
var createjs, AdobeAn;