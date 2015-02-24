;(function ( $, window, document, undefined ) {

	"use strict";

		// Create the defaults once
		var pluginName = "stickyButtons",
		defaults = {
			//settings
			placeholder: true,
			placeholderId: "",
			placeholderClass: "",
			maxDistance: 110,
			useCss3: true,
			
			//callbacks
			onMove: false,
			onUnSticky: false,
			
			//hover enter
			mouseEnterLeaveAnimation: true,
			mouseenterAnimationProperties: { scale: 1.2 },
			mouseenterAnimationOptionsImportant: { queue: 'stickyButtons-mouseenterleave-animation' },
			mouseenterAnimationOptions: { duration: 200 },
			
			//hover leave
			mouseleaveAnimationProperties: { scale: 1 },
			mouseleaveAnimationOptionsImportant: { queue: 'stickyButtons-mouseenterleave-animation' },
			mouseleaveAnimationOptions: { duration: 300, delay: 50 },
			
			//internal
			followMouse: false,
			initTop: 0,
			initLeft: 0,
			initWidth: 0,
			initHeight: 0,
			parentInitTop: 0,
			parentInitLeft: 0
		};

		// The actual plugin constructor
		function Plugin ( element, options ) {
				this.element = element;
				this.settings = $.extend( {}, defaults, options );
				
				if(this.settings.placeholder) this.placeholder = $('<div></div>').addClass("sb-placeholder").appendTo($("body"));
				
				this.settings.mouseenterAnimationOptions = $.extend( {}, this.settings.mouseenterAnimationOptions, this.settings.mouseenterAnimationOptionsImportant );
				this.settings.mouseleaveAnimationOptions = $.extend( {}, this.settings.mouseleaveAnimationOptions, this.settings.mouseleaveAnimationOptionsImportant );
				this._defaults = defaults;
				this._name = pluginName;
				this.init();
		}

		// Avoid Plugin.prototype conflicts
		$.extend(Plugin.prototype, {
			/*
				Init
			*/
			init: function () {
								
				//check for velocity.js
				if(!jQuery().velocity) {
					console.error("StickyButtons.js: Can't find Velocity.js!");
				}
				
				//get css position prob
				var cssPosition = $(this.element).css('position');
				if (cssPosition != 'absolute' && cssPosition != 'relative') cssPosition = 'relative';
				
				//get css display prob
				var cssDisplay = $(this.element).css('display');
				if (cssDisplay == 'inline') cssDisplay = 'inline-block';
				
				var cssZindex = parseInt($(this.element).css('z-index'));
				if (isNaN(cssZindex)) cssZindex = 3;
					
				//set z-index and position
				$(this.element).css({
					position: cssPosition,
					zIndex: cssZindex,
					display: cssDisplay
				});
				
				//Get Dimensions
				this.getDimensions();
				
				//bind events
				if(this.settings.mouseEnterLeaveAnimation) this.bindEventMouseOver();
				this.bindEventMouseMove();
				this.bindEventWindowResize();

			},
			
			
			/*
				Overwrite Settings
			*/
			overwriteSettings: function () {
				var newSettings = arguments[0];

				if( typeof newSettings=='object' ){
					this.settings = $.extend( {}, this.settings, newSettings );
				}
			},
			
			
			/*
				Get Dimensions
			*/
			getDimensions: function () {
				var offsetParentEl = $(this.element).offsetParent()
			
				//get the default pos and size of the button
				this.settings.initLeft = $(this.element).offset().left;
				this.settings.initTop = $(this.element).offset().top;
				this.settings.parentInitLeft = offsetParentEl.offset().left;
				this.settings.parentInitTop = offsetParentEl.offset().top;
				if( $(this.element).css('position') == 'relative' ){
					this.settings.parentInitLeft += parseInt(offsetParentEl.css('padding-left'));
					this.settings.parentInitTop += parseInt(offsetParentEl.css('padding-top'));
				}
				//this.settings.parentInitLeft = this.settings.initLeft - $(this.element).position().left;
				//this.settings.parentInitTop = this.settings.initTop - $(this.element).position().top;
				this.settings.initWidth = $(this.element).innerWidth();
				this.settings.initHeight = $(this.element).innerHeight();

				//place placeholder
				if(this.settings.placeholder){
					this.placeholder.css( {
						width: this.settings.initWidth,
						height: this.settings.initHeight,
						top: this.settings.initTop,
						left: this.settings.initLeft
					} )
					.attr("id", this.settings.placeholderID)
					.addClass( this.settings.placeholderClass );
				}	
			},
			
			
			
			
			/*
				Window Resize Event
			*/
			bindEventWindowResize: function () {
				var plugin = this;
				var resizeTimer;
				$( window ).resize(function() {
					clearTimeout( resizeTimer );
					
					resizeTimer = window.setTimeout(function(){
						//Get Dimensions
						plugin.getDimensions();
					}, 100);
				});
			},

			
			
			
			/*
				Mousemove Event
			*/
			bindEventMouseMove: function () {
				var plugin = this;
				
				var bob = false, mX, mY, dX, dY, middleX, middleY, distance;
				$(document).mousemove(function(e) {  
					mX = e.pageX;
					mY = e.pageY;
					dX = mX - plugin.settings.initLeft - (plugin.settings.initWidth / 2);
					dY = mY - plugin.settings.initTop - (plugin.settings.initHeight / 2);
					middleX = mX - (plugin.settings.initWidth / 2) - plugin.settings.parentInitLeft;
					middleY = mY - (plugin.settings.initHeight / 2) - plugin.settings.parentInitTop;

					distance = plugin.helperCalculateDistance($(plugin.element), mX, mY);
					
					//mouse over element: distance = 0
					if(distance==0) plugin.settings.followMouse = true;
					
					if( distance <= plugin.settings.maxDistance && plugin.settings.followMouse){
						//mouse is in range...who is bob?
						
						bob = true;

						$(plugin.element).velocity("stop", "stickyButtons-back-animation");
						if(!plugin.settings.useCss3){
							//animate top / left
							$.Velocity.hook($(plugin.element), "left", middleX+"px");
							$.Velocity.hook($(plugin.element), "top", middleY+"px");
						}else{
							//animate translateX translateY
							$.Velocity.hook($(plugin.element), "translateX", dX+"px");
							$.Velocity.hook($(plugin.element), "translateY", dY+"px");
						}
						
						//callback onMove
						if (typeof plugin.settings.onMove == 'function') {
							plugin.settings.onMove.call(plugin, mX, mY, dX, dY, middleX, middleY, distance);
						}

					}else if( bob ){
						//mouse leave range. fire once!
						
						bob = false;
						plugin.settings.followMouse = false;

						if(!plugin.settings.useCss3){
							//animate top / left
							var actX = parseInt( $.Velocity.hook($(plugin.element), "left") );
							var actY = parseInt( $.Velocity.hook($(plugin.element), "top") );

							$(plugin.element).velocity("stop", "stickyButtons-back-animation")
							.velocity({ left: [ plugin.settings.initLeft-plugin.settings.parentInitLeft, actX ], top: [ plugin.settings.initTop-plugin.settings.parentInitTop, actY ] }, { duration: 200, delay: 100, queue:'stickyButtons-back-animation' })
							.dequeue("stickyButtons-back-animation");
						}else{
							//animate translateX translateY
							var css3actX = parseInt( $.Velocity.hook($(plugin.element), "translateX") );
							var css3actY = parseInt( $.Velocity.hook($(plugin.element), "translateY") );
							var actX = plugin.settings.initLeft + css3actX - plugin.settings.parentInitLeft;
							var actY = plugin.settings.initTop + css3actY - plugin.settings.parentInitTop;
							
							$(plugin.element).velocity("stop", "stickyButtons-back-animation")
							.velocity({ translateX: [ 0, css3actX ], translateY: [ 0, css3actY ] }, { duration: 200, delay: 100, queue:'stickyButtons-back-animation' })
							.dequeue("stickyButtons-back-animation");
						}
						
						//callback onUnSticky
						if (typeof plugin.settings.onUnSticky == 'function') {
							plugin.settings.onUnSticky.call(plugin, mX, mY, dX, dY, middleX, middleY, distance, actX, actY);
						}
					}

				});
			},
			
			
			/*
				Hover Events
			*/
			bindEventMouseOver: function () {
				var plugin = this;
				//mouseenter
				$(plugin.element).mouseenter (function() {
					$(this).velocity("stop", 'stickyButtons-mouseenterleave-animation').velocity( 
						plugin.settings.mouseenterAnimationProperties, 
						plugin.settings.mouseenterAnimationOptions
					).dequeue("stickyButtons-mouseenterleave-animation");
				})
				//mouseleave
				.mouseleave (function() {
					$(this).velocity("stop", 'stickyButtons-mouseenterleave-animation').velocity( 
						plugin.settings.mouseleaveAnimationProperties, 
						plugin.settings.mouseleaveAnimationOptions
					).dequeue("stickyButtons-mouseenterleave-animation");
				});
			},
			
			
			
			/*
				Helper: Calculate Distance
			*/
			helperCalculateDistance: function () {
				var plugin = this,
					elem = arguments[0],
					mouseX = arguments[1],
					mouseY = arguments[2];
				
				var coor = {
					tl: [ plugin.settings.initLeft, plugin.settings.initTop ],
					tr: [ (plugin.settings.initLeft + elem.innerWidth()), plugin.settings.initTop ],
					bl: [ plugin.settings.initLeft, (plugin.settings.initTop + elem.innerHeight()) ],
					br: [ (plugin.settings.initLeft + elem.innerWidth()), (plugin.settings.initTop + elem.innerHeight()) ]
				};
				
				//calc distance to element border
				// 1 2 3
				// 4 # 5
				// 6 7 8
				// # = elem
				
				if( mouseY >= coor.bl[1] && mouseX >= coor.tl[0] && mouseX <= coor.tr[0] ){
					//area 7
					//console.log('area 7');
					return mouseY - coor.bl[1];
					
				}else if( mouseY <= coor.tl[1] && mouseX >= coor.bl[0] && mouseX <= coor.br[0] ){
					//area 2
					//console.log('area 2');
					return coor.tl[1] - mouseY;
					
				}else if( mouseY >= coor.tl[1] && mouseY <= coor.bl[1] && mouseX <= coor.bl[0] ){
					//area 4
					//console.log('area 4');
					return coor.tl[0] - mouseX;
					
				}else if( mouseY >= coor.tr[1] && mouseY <= coor.br[1] && mouseX >= coor.br[0] ){
					//area 5
					//console.log('area 5');
					return mouseX - coor.tr[0];
				
				}else if( mouseX <= coor.tl[0] && mouseY <= coor.tl[1] ){
					//area 1
					//console.log('area 1');
					return Math.floor(Math.sqrt(Math.pow(mouseX - coor.tl[0], 2) + Math.pow(mouseY - coor.tl[1], 2)));
					
				}else if( mouseX >= coor.tr[0] && mouseY <= coor.tr[1] ){
					//area 3
					//console.log('area 3');
					return Math.floor(Math.sqrt(Math.pow(mouseX - coor.tr[0], 2) + Math.pow(mouseY - coor.tr[1], 2)));
					
				}else if( mouseX <= coor.bl[0] && mouseY >= coor.bl[1] ){
					//area 6
					//console.log('area 6');
					return Math.floor(Math.sqrt(Math.pow(mouseX - coor.bl[0], 2) + Math.pow(mouseY - coor.bl[1], 2)));
					
				}else if( mouseX >= coor.br[0] && mouseY >= coor.br[1] ){
					//area 8
					//console.log('area 8');
					return Math.floor(Math.sqrt(Math.pow(mouseX - coor.br[0], 2) + Math.pow(mouseY - coor.br[1], 2)));
				
				}else{
					//area #
					//console.log('hover');
					return 0;
				}
				
				//distance to element middle
				//return Math.floor(Math.sqrt(Math.pow(mouseX - (plugin.settings.initLeft+(elem.innerWidth()/2)), 2) + Math.pow(mouseY - (plugin.settings.initTop+(elem.innerHeight()/2)), 2)));
			}
			
		});

		// A really lightweight plugin wrapper around the constructor,
		// preventing against multiple instantiations
		$.fn[ pluginName ] = function ( options ) {
				var args = (arguments.length > 1) ? Array.prototype.slice.call(arguments, 1) : undefined;
		
				return this.each(function() {
					
						if ( !$.data( this, "plugin_" + pluginName ) ) {
							//create plugin instance
							$.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
						}else{
							//method calls
							var plugin = $.data( this, "plugin_" + pluginName);
							
							var fn = plugin[options];
							if (typeof fn === "function"){
								fn.apply(plugin, args);
							}
							
						}
				});
		};

})( jQuery, window, document );





