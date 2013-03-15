var SwarmFeedMap = {
	'Acceleration': {
		values: ['x', 'y', 'z'],
		units: 'G',
		min: -1.5,
		max: 1.5
	},
	'Location': {
		values: ['latitude','longitude'],
		units: '\u00B0'
	},
	'Temperature': {
		values: ['TempF'],
		units: '\u00B0F',
		min:-10,
		max:110
	},
	'Light': {
		values: ['Value'],
		units: 'Lux',
		min:0,
		max:1024
	},
	'Potentiometer': {
		values: ['Raw'],
		units: '',
		min:0,
		max:1024
	},
	'Button': {
		values: ['b1','b2','b3'],
		units: ''
	},
	'Sound Level': {
		values: ['Raw'],
		units: 'dB'
	}
};