;(function ( $, window, document, undefined ) {

	"use strict";

		// Create the defaults once
		var pluginName = "stickyButtons",
		defaults = {
			placeholder: true,
			placeholderId: "",
			placeholderClass: "",
			maxDistance: 110,
			
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
				
				//get css position prob
				var cssPosition = $(this.element).css('position');
				if (cssPosition != 'absolute' && cssPosition != 'relative') cssPosition = 'relative';
				
				//get css display prob
				var cssDisplay = $(this.element).css('display');
				if (cssDisplay == 'inline') cssDisplay = 'inline-block';
					
				//set z-index and position
				$(this.element).css({
					position: cssPosition,
					zIndex: 3,
					display: cssDisplay
				});
				
				//Get Dimensions
				this.getDimensions(this.element, this.settings);
				
				//bind events
				this.bindEventMouseOver(this.element, this.settings);
				this.bindEventMouseMove(this.element, this.settings);
				this.bindEventWindowResize(this.element, this.settings);

			},
			
			
			
			/*
				Get Dimensions
			*/
			getDimensions: function () {
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
						plugin.getDimensions(plugin.element, plugin.settings);
					}, 100);
				});
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
		maxDistance: 50
	});
	
    $('.button.normal').stickyButtons();
	
	$('.button.absolute2').stickyButtons();
	
	$('#div').stickyButtons({
		maxDistance: 100
	});
	
	$('.social-button').stickyButtons({
		maxDistance: 50,
		placeholderClass: 'social-button-placeholder'
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