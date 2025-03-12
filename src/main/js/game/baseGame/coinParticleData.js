define({
    "configuration":{
        "alpha": {
            "start": 1,
            "end": 0.8,
            "isStepped": false
        },
        "scale": {
            "start": 0.5,
            "end": 0.7,
            "minimumScaleMultiplier": 1,
            "isStepped": false
        },
        "color": {
            "start": "ffffff",
            "end": "ffffff",
            "isStepped": false
        },
        "speed": {
            "start": 100,
            "end": 50,
            "isStepped": false
        },
        "startRotation": {
            "min": 0,
            "max": 0
        },
        "rotationSpeed": {
            "min": 0,
            "max": 360
        },
        "lifetime": {
            "min": 0.5,
            "max": 0.6
        },
        "frequency": 0.035,
        "emitterLifetime": -1,
        "maxParticles": 1000,
        "pos": {
            "x": 0,
            "y": 0
        },
        "addAtBack": false,
        "spawnType": "ring",
        "spawnCircle": {
            "x": 0,
            "y": 0,
            "r": 45,
            "minR": 44
        }
    },
    "configuration1":{
        "alpha": {
            "start": 1,
            "end": 0.8,
            "isStepped": false
        },
        "scale": {
            "start": 0.8,
            "end": 0.8,
            "minimumScaleMultiplier": 1,
            "isStepped": false
        },
        "color": {
            "start": "ffffff",
            "end": "ffffff",
            "isStepped": false
        },
        "speed": {
            "start": 100,
            "end": 50,
            "isStepped": false
        },
        "startRotation": {
            "min": 0,
            "max": 0
        },
        "rotationSpeed": {
            "min": 0,
            "max": 360
        },
        "lifetime": {
            "min": 0.3,
            "max": 0.4
        },
        "frequency": 0.03,
        "emitterLifetime": -1,
        "maxParticles": 1000,
        "pos": {
            "x": 0,
            "y": 0
        },
        "addAtBack": false,
        "spawnType": "ring",
        "spawnCircle": {
            "x": 0,
            "y": 0,
            "r": 36,
            "minR": 35
        }
    },
    "configurationDown":{
        alpha: {
			list: [{
				value: 1,
				time: 0
			}, {
				value: 0.6,
				time: 1
			}],
			isStepped: false
		},
		scale: {
			list: [{
				value: 0.6,
				time: 0
			}, {
				value: 0.6,
				time: 1
			}],
			isStepped: false
		},
		color: {
			list: [{
				value: "ffffff",
				time: 0
			}, {
				value: "ffffff",
				time: 1
			}],
			isStepped: false
		},
		speed: {
			list: [{
				value: 300,
				time: 0
			}, {
				value: 150,
				time: 1
			}],
			isStepped: false
		},
		startRotation: {
			min: 90,
			max: 90
		},
		rotationSpeed: {
			min: 180,
			max: 360
		},
		lifetime: {
			min: 8,
			max: 8
		},
		frequency: 0.05,
		spawnChance: 1,
		particlesPerWave: 1,
		emitterLifetime: -1,
		maxParticles: 1000,
        "pos": {
            "x": 0,
            "y": 0
        },
		addAtBack: false,
		spawnType: "rect",
		spawnRect: {
			x: 0,
			y: 0,
			w: 2000,
			h: 0
        }
    },
    "configurationAutoMap":{
        "alpha": {
            "start": 1,
            "end": 1
        },
        "scale": {
            "start": 0.3,
            "end": 0.34,
            "minimumScaleMultiplier": 0.74
        },
        "color": {
            "start": "#ffffff",
            "end": "#ffffff"
        },
        "speed": {
            "start": 600,
            "end": 1200,
            "minimumSpeedMultiplier": 1
        },
        "acceleration": {
            "x": 0,
            "y": 2000
        },
        "maxSpeed": 0,
        "startRotation": {
            "min": 250,
            "max": 290
        },
        "noRotation": false,
        "rotationSpeed": {
            "min": 180,
            "max": 360
        },
        "lifetime": {
            "min": 0.6,
            "max": 0.6
        },
        "blendMode": "normal",
        "frequency": 0.018,
        "emitterLifetime": 0.5,
        "maxParticles": 500,
        "pos": {
            "x": 0,
            "y": 0
        },
        "addAtBack": false,
        "spawnType": "rect",
        "spawnRect": {
            "x": 88,
            "y": 10,
            "w": 30,
            "h": 30
        }
    }
});