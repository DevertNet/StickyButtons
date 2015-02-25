# StickyButtons.js
Buttons they stick at the mouse cursor.

[Demo](http://devert.net/_dev/StickyButtons/)

### Required / Dependencies
[Velocity.js](http://julian.com/research/velocity/)


### How to

Simple:
```js
$('.element').stickyButtons();
```

With Options:
```js
$('.element').stickyButtons( {
    placeholder: true,
	placeholderId: "myID",
	placeholderClass: "myClass",
	maxDistance: 110,
	useCss3: true,
	onMove: false,
	onUnSticky: false,
	mouseEnterLeaveAnimation: true
} );
```


### Options
| Option | Default | Info |
|:---|:---|:---|
| placeholder | boolean(true) | Add a placeholder element to the end of the body. |
| placeholderId | string("") | Set the ID of the placeholder element. Without #. |
| placeholderClass | string("") | Set the Class of the placeholder element. Without #. |
| maxDistance | int(110) | Set the sticky radius/range. From the element border.  |
| useCss3 | boolean(true) | true = animate tranlateX/Y; false = left/top |
| onMove | function(plugin, mX, mY, dX, dY, middleX, middleY, distance){ } | Callback during the move/sticky of the element. |
| onUnSticky | function(plugin, mX, mY, dX, dY, middleX, middleY, distance, actX, actY){ } | Callback once on unsticky. |
| mouseEnterLeaveAnimation | boolean(true) | Disable/Enable a mouseover / mouseleave animation. E.g. if you want to set the hover animation with css. |


### Callbacks
<b>onMove</b>
Called every time the button moves with the mouse.

<b># onUnSticky</b>
Called once the button released from mouse. Does not overwrite the back-animation.


### Methods / API
<b>overwriteSettings</b>
Overwrite the settings / options from the init. You can't change the placeholder(/Id/Class) settings.
```js
$('.element').stickyButtons( "overwriteSettings", { maxDistance: 200 } );
```

<b>getDimensions</b>
Recalc the placeholder and other internal dimension variables. Not necessary to trigger this method from a resize event, because the plugin does this for you.
```js
$('.element').stickyButtons( "getDimensions" );
```