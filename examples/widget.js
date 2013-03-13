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
		width: 120,						//width in pixels
		printWholePayload: false,		//print whole payload, or only a feed?
		feed: 'value',					//if notWholePayload, what feed?
		value: 0
	};

	var info = function(message) {
		console.log('['+namespace+']: '+message);
	};
	var debug = function(message) {
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
		if (!(my.swarm && opts.resource)) {
			info(
				'ERR: must specify swarm and resource when creating widget');
		}
		my.element = el.append('<span id=data></span>')
						.attr('width', my.options.width)
						.children(":first");
		el.show();
	};

	//called after _create, every time widget is re-initialized
	//more complex initialization
	var init = function() {
		debug('init');

		update('Waiting for data...');
	};

	//Called when widget is detached from element
	//should re-set element to how it was before we were there
	var destroy = function() {
		debug('destroy');
	};

	var update = function(data) {
		debug('update');
		if (data !== undefined) {
			my.options.value = data;
		}
		my.element.html(my.options.value);
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