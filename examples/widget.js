//TODO - auto-instantiate jquery if not found!

(function($, undefined) {

	//name of the Widget namespace within jQuery.
	var namespace = 'bug.bugdisplay_text';

	//an object representing this widget's instance scope
	//this is copied from the widget's scope on create
	var my = {};

	//Default options for the widget
	//Anything passed into $('div').widget({...}) will override this.
	var options = {
		swarm: false,					//swarm session object (SWARM)
		resource: false,				//Resource to follow
		width: 20,						//width in pixels
		printWholePayload: false,		//print whole payload, or only a feed?
		feed: false,					//What feed should we display?
		debug: true,					//print debug messages to console
		value: 0
	};

	var info = function(message) {
		console.log('['+namespace+']: '+message);
	};
	var debug = function(message) {
		if (options.debug)
			console.log('['+namespace+']: '+message);
	};

	//Invoked when widget is first attached to an element
	//add classes, store references, create elements, initialize other widgets
	var create = function() {
		debug('create');
		my = this;						//Assign this widget's scope to 'my'
		var el = my.element.hide();
		var opts = my.options;

		//Check for mandatory options
		if (!my.options.swarm) {
			info('ERR: must specify swarm creating widget');
		}
		my.element = el.append('<span id=data width='+my.options.width+
						'></span>').children(":first");
		el.show();
	};

	onSwarmMessage = function(message) {
		var payload  = message.payload;
		if (my.options.resource && 
			(message.from.resource !== my.options.resource)) {
			return;
		}
		if (my.options.printWholePayload){
			update(JSON.stringify(payload));
		} else {
			if (!('feed' in payload)) { return; }
			if (!my.options.feed){
				update(JSON.stringify(payload));
			} else if (payload.name === my.options.feed) {
				update(JSON.stringify(payload.feed));
			}
		}
	};

	//called after _create, every time widget is re-initialized
	//more complex initialization
	var init = function() {
		debug('init');
		update('Waiting for data...');
		my.options.swarm.options.onmessage = onSwarmMessage;
	};

	//Called when widget is detached from element
	//should re-set element to how it was before we were there
	var destroy = function() {
		debug('destroy');
	};

	//Only update the value of this widget, avoid a full redraw.
	var update = function(data) {
		debug('update: '+data);
		if (data !== undefined) {
			my.options.value = data;
		}
		my.element.html(data);
	};

	//Called when a user changes an option, after the variable has been set.
	//Should re-initialize parts of the widget that depend on the option
	var optionChanged = function(name, value) {
		debug(name+' changed to '+JSON.stringify(value));
		my.options[name] = value;
		update();
	};


	$.widget(namespace, {
		// Begin jQuery-specific objects/functions: 
		_create: create,
		_init: init,
		destroy: destroy,
		_setOption: optionChanged,
		options: options,
		// End jQuery-specific options/functions
		update: update
	});
}(jQuery));