//TODO - auto-instantiate jquery if not found!

(function($, undefined) {

	//name of the Widget namespace within jQuery.
	var namespace = 'bug.swarmMap';

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
		mapLibSrc: "http://maps.googleapis.com/maps/api/js?sensor=false&callback=googlemapinit",
		startLat: 40.72493,
		startLon: -73.996562,
		map: {
            zoom: 16
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
		var el = my.element;
		var opts = my.options;

		//Check for mandatory options
		if (!my.options.swarm) {
			info('ERR: must specify swarm creating widget');
		}
		if (opts.feed && !opts.feedVars &&
						SwarmFeedMap[opts.feed] !== undefined) {
			opts.feedVars = SwarmFeedMap[opts.feed].values;
		}
		$(el).width(my.options.width).height(my.options.height);
		$(el).css('width',my.options.width).css('height',my.options.height);
		$(el).html('loading...');
		if (window.google === undefined) {
			debug('Google maps library not found, loading...');
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.src = opts.mapLibSrc;
			document.body.appendChild(script);
		}
	};

	window.googlemapinit = function() {
		debug('...Google maps loaded, re-initializing widgets.');
		var widgets = $( ':data(bug-swarmMap)' );
		$(':data(bug-swarmMap)').each(function(index, value) {
			$(value).swarmMap();
		});
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
		if (!((window.google !== undefined) &&
				(window.google.maps !== undefined))) {
			debug('google libraries missing, not initializing');
			return;
		} 
		debug('init');
		my.element.html('');
		my.options.map.center = new google.maps.LatLng(
								my.options.startLat, my.options.startLon);
		my.options.map.mapTypeId = google.maps.MapTypeId.ROADMAP;
		my.map = new google.maps.Map(my.element.get(0), my.options.map);
		my.marker = new google.maps.Marker({
			position: my.options.map.center, 
			map: my.map });
		my.options.swarm.addListener('message', onSwarmMessage, my);
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
		if (my.options.feedVars !== undefined && 
				my.options.feedVars.length > 1) {
			var latlng = new google.maps.LatLng(data[my.options.feedVars[0]], 
												data[my.options.feedVars[1]]);
			my.marker.setPosition(latlng);
			my.map.setCenter(latlng);
		}
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