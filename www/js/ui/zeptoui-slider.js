/*
 *
 * Find more about this plugin by visiting
 * http://miniapps.co.uk/
 *
 * Copyright (c) 2010 Alex Gibson, http://miniapps.co.uk/
 * Released under MIT license
 * http://miniapps.co.uk/license/
 *
 */

(function() {

	function ZeptoSlider(id) {

		this.element = document.getElementById(id);

		//detect support for Webkit CSS 3d transforms
		this.supportsWebkit3dTransform = ('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix());

		//get knob width
		this.knob = this.element.getElementsByClassName('knob')[0];
		this.knobWidth = this.knob.offsetWidth - 2;

		//get track width
		this.track = this.element.getElementsByClassName('track')[0];
		this.trackWidth = this.track.offsetWidth;

		this.element.addEventListener('touchstart', this, false);
		this.element.addEventListener('mousedown', this, false);
	}

	ZeptoSlider.prototype.touchstart = function(e) {

		e.preventDefault();

		this.moveToWithCallback(e.targetTouches[0].pageX);

		this.element.addEventListener('touchmove', this, false);
		this.element.addEventListener('touchend', this, false);
		this.element.addEventListener('touchcancel', this, false);
	};

	ZeptoSlider.prototype.touchmove = function(e) {

		e.preventDefault();

		this.moveToWithCallback(e.targetTouches[0].pageX);
	};

	ZeptoSlider.prototype.touchend = function(e) {

		e.preventDefault();

		this.moveToWithCallback(e.changedTouches[0].pageX);

		this.element.removeEventListener('touchmove', this, false);
		this.element.removeEventListener('touchend', this, false);
		this.element.removeEventListener('touchcancel', this, false);
	};

	ZeptoSlider.prototype.touchcancel = function(e) {

		e.preventDefault();

		this.moveToWithCallback(e.changedTouches[0].pageX);

		this.element.removeEventListener('touchmove', this, false);
		this.element.removeEventListener('touchend', this, false);
		this.element.removeEventListener('touchcancel', this, false);
	};

	ZeptoSlider.prototype.mousedown = function(e) {

		e.preventDefault();

		this.moveToWithCallback(e.clientX);

		this.element.addEventListener('mousemove', this, false);
		this.element.addEventListener('mouseup', this, false);
	};

	ZeptoSlider.prototype.mousemove = function(e) {

		e.preventDefault();

		this.moveToWithCallback(e.pageX);
	};

	ZeptoSlider.prototype.mouseup = function(e) {

		e.preventDefault();

		this.moveToWithCallback(e.pageX);

		this.element.removeEventListener('mousemove', this, false);
		this.element.removeEventListener('mouseup', this, false);
	};

	//moveSlider
	ZeptoSlider.prototype.moveTo = function(x) {
		x = x - this.element.offsetLeft;
		x = Math.min(x, this.trackWidth);
		x = Math.max(x - this.knobWidth, 0);

		//use Webkit CSS 3d transforms for hardware acceleration if available
		if (this.supportsWebkit3dTransform) {

			this.knob.style.webkitTransform = 'translate3d(' + x + 'px, 0, 0)';
		}
		else {
			this.knob.style.webkitTransform = this.knob.style.MozTransform = this.knob.style.msTransform = this.knob.style.OTransform = this.knob.style.transform = 'translateX(' + x + 'px)';
		}
		return x;
	}

	//moves the slider with callback
	ZeptoSlider.prototype.moveToWithCallback = function(x) {
	  //moveSlider
	  x = this.moveTo(x);


		//return value change as a percentage
		var percentage = Math.round(x  / (this.trackWidth - this.knobWidth) * 100);
	  console.log('percentage='+percentage+' x='+x+' this.trackWidth='+this.trackWidth+' this.knobWidth='+this.knobWidth);
		this.callback(percentage);
	};


	//change percentage of slider with callback
	ZeptoSlider.prototype.setPercentage = function(percentage) {
		var x = Math.round((this.trackWidth - this.knobWidth) * percentage/100);
		x=this.moveTo(x);
	  console.log('percentage='+percentage+' x='+x+' this.trackWidth='+this.trackWidth+' this.knobWidth='+this.knobWidth);
		this.callback(percentage);
	}

	//callback method will be implemented by user
	ZeptoSlider.prototype.callback = function() {

	};

	//event handler
	ZeptoSlider.prototype.handleEvent = function(e) {

		if (typeof(this[e.type]) === 'function' ) {
			return this[e.type](e);
		}
	};

	//public function
	window.ZeptoSlider = ZeptoSlider;

})();