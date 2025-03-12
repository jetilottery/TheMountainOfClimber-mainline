define({
    "configuration":{
        "alpha": {
            "start": 1,
            "end": 0.9,
            "isStepped": false
        },
        "scale": {
            "start": 0.8,
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
            "start": 400,
            "end": 200,
            "isStepped": false,
            "minimumSpeedMultiplier": 1
        },
        "startRotation": {
            "min": 0,
            "max": 0
        },
        "rotationSpeed": {
            "min": 0,
            "max": 180
        },
        "lifetime": {
            "min": 1,
            "max": 1
        },
        "frequency": 0.05,
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
            "r": 100,
            "minR": 99
        }
    },
});