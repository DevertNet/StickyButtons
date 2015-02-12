(function() {
    
    var mX, mY, distance;
    
    var $element  = $('.button');
    $('.button').attr("data-sb-left", $element.offset().left);
    $('.button').attr("data-sb-top", $element.offset().top);

    function calculateDistance(elem, mouseX, mouseY) {
    	var left = parseFloat( elem.attr("data-sb-left") );
    	var top = parseFloat( elem.attr("data-sb-top") );
    	
        return Math.floor(Math.sqrt(Math.pow(mouseX - (left+(elem.innerWidth()/2)), 2) + Math.pow(mouseY - (top+(elem.innerHeight()/2)), 2)));
    }
    
    var bob = false;
    $(document).mousemove(function(e) {  
        mX = e.pageX;
        mY = e.pageY;
        distance = calculateDistance($element, mX, mY);
        console.log( distance );
        
        if( distance<= 150 ){
        	bob = true;
	        $element.css({transform: 'translateX('+distance+'px)'});
        }else if( bob ){
        	bob = false;
	        $element.velocity("stop").velocity({ translateX: '-='+distance+'px' }, { duration: 1000 });
        }
        
    });

})();