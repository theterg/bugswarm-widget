//TODO - auto-instantiate jquery if not found!

(function($, undefined) {

	//name of the Widget namespace within jQuery.
	var namespace = 'bug.swarmChart';

	//an object representing this widget's instance scope
	//this is copied from the widget's scope on create
	var my = {};

	//Default options for the widget
	//Anything passed into $('div').widget({...}) will override this.
	var options = {
		swarm: false,					//swarm session object (SWARM)
		resource: false,				//Resource to follow
		feed: false,					//What feed should we display?
		feedVars: false,				//What variables exist in feed?
		debug: true,					//print debug messages to console
		value: 0,
		width: 450,
		height: 250,
		plotlen: 100,
		numaxes: 1,
		chart: {
				series: { shadowSize: 0 }, // drawing is faster without shadows
				grid: { color: "#FFF" },
				legend: { backgroundColor: "#5C5D60" },
				yaxis: { position: "left"}
			}
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
			opts.numaxes = opts.feedVars.length;
			opts.chart.yaxis.max = SwarmFeedMap[opts.feed].max;
			opts.chart.yaxis.min = SwarmFeedMap[opts.feed].min;
		}
		$(el).css('width',my.options.width).css('height',my.options.height);
		$(el).html('loading...');
		my.data = [];
		for (var i=0;i<opts.numaxes;i++) {
			my.data.push([]);
		}
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
		if (!('feed' in payload)) { return; }
		//If no feed at all was defined, display any feed data.
		if (payload.name === my.options.feed) {
			update.apply(my, [payload.feed]);
		}
	};

	//called after _create, every time widget is re-initialized
	//more complex initialization
	var init = function() {
		debug('init');
		//Dynamically load plot libraries?
		my.element.html('');
		my.plot = $.plot(my.element, my.data, my.options.chart);
		my.options.swarm.addListener('message', onSwarmMessage, my);
		my.element.show();
		my.startTime = (new Date()).getTime();
	};

	//Called when widget is detached from element
	//should re-set element to how it was before we were there
	var destroy = function() {
		debug('destroy');
	};

	//Only update the value of this widget, avoid a full redraw.
	var update = function(data) {
		debug('update '+JSON.stringify(data));
		//console.log(data);
		if (this !== window){
			my = this;
		}
		if (data !== undefined) {
			my.options.value = data;
		}
		var currentTime = (new Date()).getTime();
		if (my.options.feedVars !== undefined) {
			for (var i in my.options.feedVars) {
				var value = my.options.feedVars[i];
				my.data[i].push(
					[(currentTime - my.startTime)/1000, data[value]]);
				if (my.data[i].length > my.options.plotlen) {
					my.data[i].shift();
				}
			}
		} else {
			var j = 0;
			for (var prop in data) {
				if (my.data[j] === undefined) {
					my.data[j] = [];
				}
				my.data[j].push([(currentTime - my.startTime)/1000, prop]);
				if (my.data[j].length > my.options.plotlen) {
					my.data[j].shift();
				}
				j++;
			}
		}
		my.plot = $.plot(my.element, my.data, my.options.chart);
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