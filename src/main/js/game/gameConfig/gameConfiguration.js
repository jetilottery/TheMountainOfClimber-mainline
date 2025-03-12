define({
    'landscape':{
        'climberManCoordinate': {
            x: 610,
            y: 317
        },
        'snowManCoordinate': {
            x: 645,
            y: 383
        },
        'goatCoordinate': {
            x: 625,
            y: 397
        },
        'originThrowCoordinate': {
            'climberMan': {
                x: 686,
                y: 408
            },
            'snowMan': {
                x: 716,
                y: 408
            }
        },
        'climberManThrowLineDiscrepancy': {
            x0: 476,
            x: 686,
            y: 378
        },
        'snowManThrowLineDiscrepancy': {
            x0: 476,
            x: 686,
            y: 378
        },
        'keyIconFramePosition': {
            x: 652 , 
            y: 358
        },
        'climberManPathDestination': {
            x: 736,
            y: 418
        },
        'snowManPathDestination':{
            x: 710,
            y: 418
        },
        'lineStep': 8.25,
        'pointerOriginTop': 690
    },
    'portrait':{
        'climberManCoordinate': {
            x: 240,
            y: 597
        },
        'snowManCoordinate': {
            x: 255,
            y: 667
        },
        'goatCoordinate': {
            x: 225,
            y: 677
        },
        'originThrowCoordinate': {
            'climberMan': {
                x: 316,
                y: 688
            },
            'snowMan': {
                x: 330,
                y: 658
            }
        },
        'climberManThrowLineDiscrepancy': {
            x0: 90,
            x: 306,
            y: 658
        },
        'snowManThrowLineDiscrepancy': {
            x0: 87,
            x: 290,
            y: 658
        },
        'keyIconFramePosition': {
            x:266 , 
            y:648
        },
        'climberManPathDestination': {
            x: 410,
            y: 624
        },
        'snowManPathDestination':{
            x: 360,
            y: 704
        },
        'lineStep': 11.6,
        'pointerOriginTop': 973
    },
    'universal':{
        'climberSkinConfiguration' : {
            1:{
                standing: '01Boy01Standing',
                climb: '02Boy01climb',
                coverAnimation1: 'BoyUp01',
                coverAnimation2: 'BoyUp02',
                win: '01BoyWin',
                rollDown: 'Boy01SnowTumble'
            },
            2:{
                standing: '01GirlStanding',
                climb: '02GirlClimb',
                coverAnimation1: 'GirlUp01',
                coverAnimation2: 'GirlUp02',
                win: '01GirlWin',
                rollDown: 'Boy02SnowTumble'
            },
            3:{
                standing: '01snowman02Standing',
                climb: '02snowman02UP',
                coverAnimation: '02snowman02UPupdated',
                win: '02snowman02UP',
                rollDown: 'SownMan02SnowTumble_0001'
            },
            4:{
                standing: '01goatStandby',
                climb: '02goatUP01',
                coverAnimation1: '03goatRun',
                coverAnimation2: 'GoatRunLight',
                //coverAnimation2: 'SownMan01UP01',
                //coverStanding: 'SnowMan01UP01_0010',
                win: '01goatStandby',
                rollDown: 'goatTumble'
            },
        }
    }
});