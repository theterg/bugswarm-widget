//TODO - auto-instantiate jquery if not found!

(function($, undefined) {

	//name of the Widget namespace within jQuery.
	var namespace = 'bug.swarmField';

	//an object representing this widget's instance scope
	//this is copied from the widget's scope on create
	var my = {};

	//Default options for the widget
	//Anything passed into $('div').widget({...}) will override this.
	var options = {
		swarm: false,					//swarm session object (SWARM)
		resource: false,				//Resource to follow
		printWholePayload: false,		//print whole payload, or only a feed?
		feed: false,					//What service should we display?
		feedVars: false,				//What variables exist in feed?
		units: '',						//What are the units of the feed?
		debug: true,					//print debug messages to console
		value: 0
	};

	var info = function(message) {
		console.log('['+my.eventNamespace+']: '+message);
	};
	var debug = function(message) {
		if (options.debug)
			console.log('['+my.eventNamespace+']: '+message);
	};

	//Invoked when widget is first attached to an element
	//add classes, store references, create elements, initialize other widgets
	var create = function() {
		my = this;						//Assign this widget's scope to 'my'
		debug('create');
		var el = my.element.hide();
		var opts = my.options;

		//Check for mandatory options
		if (!my.options.swarm) {
			info('ERR: must specify swarm creating widget');
		}
		if (opts.feed && !opts.feedVars &&
						SwarmFeedMap[opts.feed] !== undefined) {
			opts.feedVars = SwarmFeedMap[opts.feed].values;
			opts.units = SwarmFeedMap[opts.feed].units;
		}
		my.element = el.append('<span id=data></span>')
						.children(":first");
		el.show();
	};

	var onSwarmMessage = function(message) {
		//The 'my' context should have been set on this callback...
		var my = this;
		//debug(my.options.feed);
		var payload  = message.payload;
		if (my.options.resource && 
			(message.from.resource !== my.options.resource)) {
			return;
		}
		if (my.options.printWholePayload){
			update(JSON.stringify(payload));
		} else {
			if (!('feed' in payload)) { return; }
			//If no feed at all was defined, display any feed data.
			if (!my.options.feed){
				update.apply(my, [JSON.stringify(payload.feed)]);
			} else if (payload.name === my.options.feed) {
				//if we don't know the structure of the feed, display whole feed
				if (!my.options.feedVars || my.options.feedVars.length > 1) {
					update.apply(my, [JSON.stringify(payload.feed)]);
				//feedVars should be known, and of length 1
				} else {
					update.apply(my, [payload.feed[my.options.feedVars[0]]+
											' '+my.options.units]);
				} 
					
				//update(JSON.stringify(payload.feed));
				//update.apply(my, [JSON.stringify(payload.feed[my.options.feed])]);
			}
		}
	};

	//called after _create, every time widget is re-initialized
	//more complex initialization
	var init = function() {
		debug('init');
		update('Waiting for data...');
		my.options.swarm.addListener('message', onSwarmMessage, my);
	};

	//Called when widget is detached from element
	//should re-set element to how it was before we were there
	var destroy = function() {
		debug('destroy');
	};

	//Only update the value of this widget, avoid a full redraw.
	var update = function(data) {
		//console.log(this);
		if (this !== window){
			my = this;
		}
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