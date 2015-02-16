;(function ( $, window, document, undefined ) {

	"use strict";

		// Create the defaults once
		var pluginName = "stickyButtons",
		defaults = {
			placeholder: true,
			maxDistance: 200,
			
			mouseenterAnimationProperties: { scale: 1.2 },
			mouseenterAnimationOptionsImportant: { queue: 'stickyButtons-mouseenterleave-animation' },
			mouseenterAnimationOptions: { duration: 200 },
			
			mouseleaveAnimationProperties: { scale: 1 },
			mouseleaveAnimationOptionsImportant: { queue: 'stickyButtons-mouseenterleave-animation' },
			mouseleaveAnimationOptions: { duration: 300, delay: 50 },
			
			followMouse: false,
			
			initTop: 0,
			initLeft: 0,
			initWidth: 0,
			initHeight: 0
		};

		// The actual plugin constructor
		function Plugin ( element, options ) {
				this.element = element;
				this.settings = $.extend( {}, defaults, options );
				
				if(this.settings.placeholder) this.placeholder = $('<div></div>').addClass("placeholder").appendTo($("body"));
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
				
				//get css position prob
				var cssPosition = $(this.element).css('position');
				if (cssPosition != 'absolute' && cssPosition != 'relative') cssPosition = 'relative';
				
				//get css display prob
				var cssDisplay = $(this.element).css('display');
				if (cssDisplay == 'inline') cssDisplay = 'inline-block';
				console.log( cssDisplay );
					
				//set z-index and position
				$(this.element).css({
					position: cssPosition,
					zIndex: 3,
					display: cssDisplay
				});
				
				//get the default pos and size of the button
				this.settings.initLeft = $(this.element).offset().left;
				this.settings.initTop = $(this.element).offset().top;
				this.settings.initWidth = $(this.element).innerWidth();
				this.settings.initHeight = $(this.element).innerHeight();

				//place placeholder
				if(this.settings.placeholder){
					this.placeholder.css( {
						width: this.settings.initWidth,
						height: this.settings.initHeight,
						top: this.settings.initTop,
						left: this.settings.initLeft
					} );
				}	
				
				//bind events
				this.bindEventMouseOver(this.element, this.settings);
				this.bindEventMouseMove(this.element, this.settings);

			},
			
			
			
			/*
				Mousemove Event
			*/
			bindEventMouseMove: function () {
				var plugin = this;
				
				var bob = false, mX, mY, dX, dY, distance;
				$(document).mousemove(function(e) {  
					mX = e.pageX;
					mY = e.pageY;
					dX = mX - plugin.settings.initLeft - (plugin.settings.initWidth / 2);
					dY = mY - plugin.settings.initTop - (plugin.settings.initHeight / 2);

					distance = plugin.helperCalculateDistance(plugin.element, plugin.settings, $(plugin.element), mX, mY);
				
					if( distance <= plugin.settings.maxDistance && plugin.settings.followMouse){
						//mouse is in range...who is bob?
						
						bob = true;
						//$element.velocity("stop").css({transform: 'translateX('+dX+'px) translateY('+dY+'px)'});
						$(plugin.element).velocity("stop", "stickyButtons-back-animation");
						$.Velocity.hook($(plugin.element), "translateX", dX+"px");
						$.Velocity.hook($(plugin.element), "translateY", dY+"px");
						//$element.velocity("stop").velocity({ translateX: dX, translateY: dY }, 'linear', { duration: 100 });
					}else if( bob ){
						//mouse leave range. fire once!
						
						bob = false;
						plugin.settings.followMouse = false;

						var x = parseInt( $.Velocity.hook($(plugin.element), "translateX") );
						var y = parseInt( $.Velocity.hook($(plugin.element), "translateY") );
						
						$(plugin.element).velocity("stop", "stickyButtons-back-animation")
						.velocity({ translateX: [ 0, x ], translateY: [ 0, y ] }, { duration: 200, delay: 100, queue:'stickyButtons-back-animation' })
						.dequeue("stickyButtons-back-animation");
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
					plugin.settings.followMouse = true;
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
					elem = arguments[2],
					mouseX = arguments[3],
					mouseY = arguments[4];
				return Math.floor(Math.sqrt(Math.pow(mouseX - (plugin.settings.initLeft+(elem.innerWidth()/2)), 2) + Math.pow(mouseY - (plugin.settings.initTop+(elem.innerHeight()/2)), 2)));
			}
			
		});

		// A really lightweight plugin wrapper around the constructor,
		// preventing against multiple instantiations
		$.fn[ pluginName ] = function ( options ) {
				return this.each(function() {
						if ( !$.data( this, "plugin_" + pluginName ) ) {
								$.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
						}
				});
		};

})( jQuery, window, document );



//
//
//
//
//
//
//
//
//




(function() {
	
	$('#header span').stickyButtons({
		placeholder: false,
		maxDistance: 100
	});
	
    $('.button.normal').stickyButtons({
		propertyName: 'looool?'
	});
	
	$('.button.absolute2').stickyButtons({
		propertyName: 'looool?'
	});
	
	$('#div').stickyButtons({
		placeholder: false,
		maxDistance: 100
	});
	

	
	/*
    var mX, mY, dX, dY, distance;
    
    var $element  = $('.button.first');
	var left = $element.offset().left;
	var top = $element.offset().top;
	var width = $element.innerWidth();
	var height = $element.innerHeight();


	
	//placeholder
	$('<div></div>')
	.addClass("placeholder")
	.css( {
		width: width,
		height: height,
		top: top,
		left: left
	} )
	.appendTo($("body"));
	var $placeholder  = $('.placeholder');
	
    function calculateDistance(elem, mouseX, mouseY) {
        return Math.floor(Math.sqrt(Math.pow(mouseX - (left+(elem.innerWidth()/2)), 2) + Math.pow(mouseY - (top+(elem.innerHeight()/2)), 2)));
    }
    
    var bob = false;
	var follow = false;
    $(document).mousemove(function(e) {  
        mX = e.pageX;
        mY = e.pageY;
		dX = mX - left - (width / 2);
		dY = mY - top - (height / 2);
		

        distance = calculateDistance($element, mX, mY);
		
        if( distance<= 150 && follow){
        	bob = true;
	        //$element.velocity("stop").css({transform: 'translateX('+dX+'px) translateY('+dY+'px)'});
			$element.velocity("stop", "back-animation");
			$.Velocity.hook($element, "translateX", dX+"px");
			$.Velocity.hook($element, "translateY", dY+"px");
			//$element.velocity("stop").velocity({ translateX: dX, translateY: dY }, 'linear', { duration: 100 });
        }else if( bob ){
        	bob = false;
			follow = false;
			
			var x = parseInt( $.Velocity.hook($element, "translateX") );
			var y = parseInt( $.Velocity.hook($element, "translateY") );
	        $element.velocity("stop", "back-animation").velocity({ translateX: [ 0, x ], translateY: [ 0, y ] }, { duration: 200, delay: 100, queue:'back-animation' }).dequeue("back-animation");
        }
        
    });
	
	$element.mouseenter (function() {
		follow = true;
		$element.velocity({ scale: 1.2 }, { duration: 200, queue: false });
	})
	.mouseleave (function() {
		$element.velocity({ scale: 1 }, { duration: 200, queue: false });
	});
	*/

})();