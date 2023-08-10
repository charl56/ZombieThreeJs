let sceneItems = {
    // Crypt
    cryptLargeRoof: {
        obj: './static/Models/Graveyard/OBJ_format/cryptLargeRoof.obj',      // Item
        mtl: './static/Models/Graveyard/OBJ_format/cryptLargeRoof.mtl',      // Item
        mesh: null,                                         // Données de l'affichage de l'item
        position: {                 // Position de l'item
            x: -13,
            y: 3,
            z: 11,
        },
        rotation: {                 // Rotation de l'item
            x: 0,
            y: 3*Math.PI/4,
            z: 0,
        },
        scale: 3,           // Echelle de l'item
        hitBoxPosition: {
            x: -13,
            y: 3,
            z: 11,
        },
        hitBox: {
            x: 1,
            y: 3,
            z: 1
        }
    },
    // Cercueil dans la crypt
    coffin: {
        obj: './static/Models/Graveyard/OBJ_format/coffin.obj',      // Item
        mtl: './static/Models/Graveyard/OBJ_format/coffin.mtl',      // Item
        mesh: null,                                         // Données de l'affichage de l'item
        position: {                 // Position de l'item
            x: -13,
            y: 0,
            z: 11,
        },
        rotation: {                 // Rotation de l'item
            x: 0,
            y: 3*Math.PI/4,
            z: 0,
        },
        scale: 3,           // Echelle de l'item
        hitBoxPosition: {
            x: -13,
            y: 0,
            z: 11,
        },
        hitBox: {
            x: 1,
            y: 1,
            z: 2
        }
    },
    // Arbre
    pine1: {
        obj: './static/Models/Graveyard/OBJ_format/pine.obj',      // Item
        mtl: './static/Models/Graveyard/OBJ_format/pine.mtl',      // Item
        mesh: null,                                         // Données de l'affichage de l'item
        position: {                 // Position de l'item
            x: -8,
            y: 0,
            z: 11,
        },
        rotation: {                 // Rotation de l'item
            x: 0,
            y: 0,
            z: 0,
        },
        scale: 3,           // Echelle de l'item
        hitBoxPosition: {
            x: -8,
            y: 0,
            z: 11,
        },
        hitBox: {
            x: 1.2,
            y: 3,
            z: 1.2
        }
    },
    pine2: {
        obj: './static/Models/Graveyard/OBJ_format/pine.obj',      // Item
        mtl: './static/Models/Graveyard/OBJ_format/pine.mtl',      // Item
        mesh: null,                                         // Données de l'affichage de l'item
        position: {                 // Position de l'item
            x: -14,
            y: 0,
            z: 8,
        },
        rotation: {                 // Rotation de l'item
            x: 0,
            y: 0,
            z: 0,
        },
        scale: 3,           // Echelle de l'item
        hitBoxPosition: {
            x: -14,
            y: 0,
            z: 8,
        },
        hitBox: {
            x: 1.2,
            y: 3,
            z: 1.2
        }
    },
    // Barrieres fond
    barriere1: {
        obj: './static/Models/Graveyard/OBJ_format/ironFenceBorderColumn.obj',      // Item
        mtl: './static/Models/Graveyard/OBJ_format/ironFenceBorderColumn.mtl',      // Item
        mesh: null,                                         // Données de l'affichage de l'item
        position: {                 // Position de l'item
            x: -12,
            y: 0,
            z: 17,
        },
        rotation: {                 // Rotation de l'item
            x: 0,
            y: Math.PI,
            z: 0,
        },
        scale: 3,           // Echelle de l'item
        hitBoxPosition: {
            x: -12,
            y: 0,
            z: 17,
        },
        hitBox: {
            x: 0,
            y: 0,
            z: 0
        }
    },
    barriere2: {
        obj: './static/Models/Graveyard/OBJ_format/ironFenceBorder.obj',      // Item
        mtl: './static/Models/Graveyard/OBJ_format/ironFenceBorder.mtl',      // Item
        mesh: null,                                         // Données de l'affichage de l'item
        position: {                 // Position de l'item
            x: -9,
            y: 0,
            z: 17,
        },
        rotation: {                 // Rotation de l'item
            x: 0,
            y: 0,
            z: 0,
        },
        scale: 3,           // Echelle de l'item
        hitBoxPosition: {
            x: -9,
            y: 0,
            z: 17,
        },
        hitBox: {
            x: 0,
            y: 3,
            z: 0
        }
    },
    barriere3: {
        obj: './static/Models/Graveyard/OBJ_format/ironFenceBorder.obj',      // Item
        mtl: './static/Models/Graveyard/OBJ_format/ironFenceBorder.mtl',      // Item
        mesh: null,                                         // Données de l'affichage de l'item
        position: {                 // Position de l'item
            x: -6,
            y: 0,
            z: 17,
        },
        rotation: {                 // Rotation de l'item
            x: 0,
            y: 0,
            z: 0,
        },
        scale: 3,           // Echelle de l'item
        hitBoxPosition: {
            x: -6,
            y: 0,
            z: 17,
        },
        hitBox: {
            x: 0,
            y: 3,
            z: 0
        }
    },
    barriere4: {
        obj: './static/Models/Graveyard/OBJ_format/ironFenceBorder.obj',      // Item
        mtl: './static/Models/Graveyard/OBJ_format/ironFenceBorder.mtl',      // Item
        mesh: null,                                         // Données de l'affichage de l'item
        position: {                 // Position de l'item
            x: -3,
            y: 0,
            z: 17,
        },
        rotation: {                 // Rotation de l'item
            x: 0,
            y: 0,
            z: 0,
        },
        scale: 3,           // Echelle de l'item
        hitBoxPosition: {   // Position de la hit box
            x: -3,
            y: 0,
            z: 17,
        },
        hitBox: {
            x: 0,
            y: 3,
            z: 0
        }
    },
    barriere6: {
        obj: './static/Models/Graveyard/OBJ_format/ironFenceBorder.obj',      // Item
        mtl: './static/Models/Graveyard/OBJ_format/ironFenceBorder.mtl',      // Item
        mesh: null,                                         // Données de l'affichage de l'item
        position: {                 // Position de l'item
            x: 0,
            y: 0,
            z: 17,
        },
        rotation: {                 // Rotation de l'item
            x: 0,
            y: 0,
            z: 0,
        },
        scale: 3,           // Echelle de l'item
        hitBoxPosition: {
            x: 0,
            y: 0,
            z: 17,
        },
        hitBox: {
            x: 0,
            y: 3,
            z: 0
        }
    },
    barriere7: {
        obj: './static/Models/Graveyard/OBJ_format/ironFenceBorder.obj',      // Item
        mtl: './static/Models/Graveyard/OBJ_format/ironFenceBorder.mtl',      // Item
        mesh: null,                                         // Données de l'affichage de l'item
        position: {                 // Position de l'item
            x: 3,
            y: 0,
            z: 17,
        },
        rotation: {                 // Rotation de l'item
            x: 0,
            y: 0,
            z: 0,
        },
        scale: 3,           // Echelle de l'item
        hitBoxPosition: {
            x: 3,
            y: 0,
            z: 17,
        },
        hitBox: {
            x: 0,
            y: 3,
            z: 0
        }
    },
    barriere8: {
        obj: './static/Models/Graveyard/OBJ_format/ironFenceBorder.obj',      // Item
        mtl: './static/Models/Graveyard/OBJ_format/ironFenceBorder.mtl',      // Item
        mesh: null,                                         // Données de l'affichage de l'item
        position: {                 // Position de l'item
            x: 6,
            y: 0,
            z: 17,
        },
        rotation: {                 // Rotation de l'item
            x: 0,
            y: 0,
            z: 0,
        },
        scale: 3,           // Echelle de l'item
        hitBoxPosition: {
            x: 6,
            y: 0,
            z: 17,
        },
        hitBox: {
            x: 0,
            y: 3,
            z: 0
        }
    },
    barriere9: {
        obj: './static/Models/Graveyard/OBJ_format/ironFenceBorder.obj',      // Item
        mtl: './static/Models/Graveyard/OBJ_format/ironFenceBorder.mtl',      // Item
        mesh: null,                                         // Données de l'affichage de l'item
        position: {                 // Position de l'item
            x: 9,
            y: 0,
            z: 17,
        },
        rotation: {                 // Rotation de l'item
            x: 0,
            y: 0,
            z: 0,
        },
        scale: 3,           // Echelle de l'item
        hitBoxPosition: {
            x: 9,
            y: 0,
            z: 17,
        },
        hitBox: {
            x: 0,
            y: 3,
            z: 0
        }
    },
    // Mur en brique, derrière
    brickWall1: {
        obj: './static/Models/Graveyard/OBJ_format/brickWall.obj',      // Item
        mtl: './static/Models/Graveyard/OBJ_format/brickWall.mtl',      // Item
        mesh: null,                                         // Données de l'affichage de l'item
        position: {                 // Position de l'item
            x: -6,
            y: 0,
            z: -3,
        },
        rotation: {                 // Rotation de l'item
            x: 0,
            y: 0,
            z: 0,
        },
        scale: 3,           // Echelle de l'item
        hitBoxPosition: {
            x: -6,
            y: 0,
            z: -4,
        },
        hitBox: {
            x: 1.8,
            y: 2,
            z: 0.2
        }
    },
    brickWall2: {
        obj: './static/Models/Graveyard/OBJ_format/brickWall.obj',      // Item
        mtl: './static/Models/Graveyard/OBJ_format/brickWall.mtl',      // Item
        mesh: null,                                         // Données de l'affichage de l'item
        position: {                 // Position de l'item
            x: -3,
            y: 0,
            z: -3,
        },
        rotation: {                 // Rotation de l'item
            x: 0,
            y: 0,
            z: 0,
        },
        scale: 3,           // Echelle de l'item
        hitBoxPosition: {
            x: -3,
            y: 0,
            z: -4,
        },
        hitBox: {
            x: 1.8,
            y: 2,
            z: 0.2
        }
    },
    brickWall3: {
        obj: './static/Models/Graveyard/OBJ_format/brickWall.obj',      // Item
        mtl: './static/Models/Graveyard/OBJ_format/brickWall.mtl',      // Item
        mesh: null,                                         // Données de l'affichage de l'item
        position: {                 // Position de l'item
            x: 0,
            y: 0,
            z: -3,
        },
        rotation: {                 // Rotation de l'item
            x: 0,
            y: 0,
            z: 0,
        },
        scale: 3,           // Echelle de l'item
        hitBoxPosition: {
            x:0,
            y: 0,
            z: -4,
        },
        hitBox: {
            x: 1.8,
            y: 2,
            z: 0.2
        }
    },
    brickWall4: {
        obj: './static/Models/Graveyard/OBJ_format/brickWall.obj',      // Item
        mtl: './static/Models/Graveyard/OBJ_format/brickWall.mtl',      // Item
        mesh: null,                                         // Données de l'affichage de l'item
        position: {                 // Position de l'item
            x: 3,
            y: 0,
            z: -3,
        },
        rotation: {                 // Rotation de l'item
            x: 0,
            y: 0,
            z: 0,
        },
        scale: 3,           // Echelle de l'item
        hitBoxPosition: {
            x: 3,
            y: 0,
            z: -4,
        },
        hitBox: {
            x: 1.8,
            y: 2,
            z: 0.2
        }
    },
    brickWall5: {
        obj: './static/Models/Graveyard/OBJ_format/brickWall.obj',      // Item
        mtl: './static/Models/Graveyard/OBJ_format/brickWall.mtl',      // Item
        mesh: null,                                         // Données de l'affichage de l'item
        position: {                 // Position de l'item
            x: 6,
            y: 0,
            z: -3,
        },
        rotation: {                 // Rotation de l'item
            x: 0,
            y: 0,
            z: 0,
        },
        scale: 3,           // Echelle de l'item
        hitBoxPosition: {
            x: 6,
            y: 0,
            z: -4,
        },
        hitBox: {
            x: 1.8,
            y: 2,
            z: 0.2
        }
    },
    // Bancs, derrière
    bench1: {
        obj: './static/Models/Graveyard/OBJ_format/bench.obj',      // Item
        mtl: './static/Models/Graveyard/OBJ_format/bench.mtl',      // Item
        mesh: null,                                         // Données de l'affichage de l'item
        position: {                 // Position de l'item
            x: -4,
            y: 0,
            z: -2.7,
        },
        rotation: {                 // Rotation de l'item
            x: 0,
            y: 0,
            z: 0,
        },
        scale: 3,           // Echelle de l'item
        hitBoxPosition: {
            x: -4,
            y: 0,
            z: -1.7,
        },
        hitBox: {
            x: 1.3,
            y: 0.8,
            z: 0.8
        }
    },
    bench2: {
        obj: './static/Models/Graveyard/OBJ_format/bench.obj',      // Item
        mtl: './static/Models/Graveyard/OBJ_format/bench.mtl',      // Item
        mesh: null,                                         // Données de l'affichage de l'item
        position: {                 // Position de l'item
            x: 0,
            y: 0,
            z: -2.7,
        },
        rotation: {                 // Rotation de l'item
            x: 0,
            y: 0,
            z: 0,
        },
        scale: 3,           // Echelle de l'item
        hitBoxPosition: {
            x: 0,
            y: 0,
            z: -1.7,
        },
        hitBox: {
            x: 1.3,
            y: 0.8,
            z: 0.8
        }
    },
    benchDamaged1: {
        obj: './static/Models/Graveyard/OBJ_format/benchDamaged.obj',      // Item
        mtl: './static/Models/Graveyard/OBJ_format/benchDamaged.mtl',      // Item
        mesh: null,                                         // Données de l'affichage de l'item
        position: {                 // Position de l'item
            x: 4,
            y: 0,
            z: -2.7,
        },
        rotation: {                 // Rotation de l'item
            x: 0,
            y: 0,
            z: 0,
        },
        scale: 3,           // Echelle de l'item
        hitBoxPosition: {
            x: 4,
            y: 0,
            z: -2.7,
        },
        hitBox: {
            x: 1.3,
            y: 0.8,
            z: 0.8
        }
    },
    // Tombes
    gravestoneRound1: {
        obj: './static/Models/Graveyard/OBJ_format/gravestoneRound.obj',      // Item
        mtl: './static/Models/Graveyard/OBJ_format/gravestoneRound.mtl',      // Item
        mesh: null,                                         // Données de l'affichage de l'item
        position: {                 // Position de l'item
            x: 10,
            y: 0,
            z: 14,
        },
        rotation: {                 // Rotation de l'item
            x: 0,
            y: -Math.PI/2,
            z: 0,
        },
        scale: 3,           // Echelle de l'item
        hitBoxPosition: {
            x: 10,
            y: 0,
            z: 14,
        },
        hitBox: {
            x: 0.6,
            y: 1.75,
            z: 0.1
        }
    },
    gravestoneRound2: {
        obj: './static/Models/Graveyard/OBJ_format/gravestoneRound.obj',      // Item
        mtl: './static/Models/Graveyard/OBJ_format/gravestoneRound.mtl',      // Item
        mesh: null,                                         // Données de l'affichage de l'item
        position: {                 // Position de l'item
            x: 10,
            y: 0,
            z: 11.5,
        },
        rotation: {                 // Rotation de l'item
            x: 0,
            y: -Math.PI/2,
            z: 0,
        },
        scale: 3,           // Echelle de l'item
        hitBoxPosition: {
            x: 10,
            y: 0,
            z: 11.5,
        },
        hitBox: {
            x: 0.6,
            y: 1.75,
            z: 0.1
        }
    },
    gravestoneBevel1: {
        obj: './static/Models/Graveyard/OBJ_format/gravestoneBevel.obj',      // Item
        mtl: './static/Models/Graveyard/OBJ_format/gravestoneBevel.mtl',      // Item
        mesh: null,                                         // Données de l'affichage de l'item
        position: {                 // Position de l'item
            x: 10,
            y: 0,
            z: 9,
        },
        rotation: {                 // Rotation de l'item
            x: 0,
            y: -Math.PI/2,
            z: 0,
        },
        scale: 3,           // Echelle de l'item
        hitBoxPosition: {
            x: 10,
            y: 0,
            z: 9,
        },
        hitBox: {
            x: 0.6,
            y: 1.75,
            z: 0.1
        }
    },
    graveBorder1: {
        obj: './static/Models/Graveyard/OBJ_format/graveBorder.obj',      // Item
        mtl: './static/Models/Graveyard/OBJ_format/graveBorder.mtl',      // Item
        mesh: null,                                         // Données de l'affichage de l'item
        position: {                 // Position de l'item
            x: 8,
            y: 0,
            z: 14,
        },
        rotation: {                 // Rotation de l'item
            x: 0,
            y: -Math.PI/2,
            z: 0,
        },
        scale: 3,           // Echelle de l'item
        hitBoxPosition: {
            x: 6.5,
            y: 0,
            z: 14,
        },
        hitBox: {
            x: 0,
            y: 0,
            z: 0
        }
    },
    cross1: {
        obj: './static/Models/Graveyard/OBJ_format/cross.obj',      // Item
        mtl: './static/Models/Graveyard/OBJ_format/cross.mtl',      // Item
        mesh: null,                                         // Données de l'affichage de l'item
        position: {                 // Position de l'item
            x: 6.5,
            y: 0,
            z: 11.5,
        },
        rotation: {                 // Rotation de l'item
            x: 0,
            y: -Math.PI/2,
            z: 0,
        },
        scale: 3,           // Echelle de l'item
        hitBoxPosition: {
            x: 6.5,
            y: 0,
            z: 11.5,
        },
        hitBox: {
            x: 0.1,
            y: 3,
            z: 0.1
        }
    },
    gravestoneBroken1: {
        obj: './static/Models/Graveyard/OBJ_format/gravestoneBroken.obj',      // Item
        mtl: './static/Models/Graveyard/OBJ_format/gravestoneBroken.mtl',      // Item
        mesh: null,                                         // Données de l'affichage de l'item
        position: {                 // Position de l'item
            x: 6.5,
            y: 0,
            z: 9,
        },
        rotation: {                 // Rotation de l'item
            x: 0,
            y: -Math.PI/2,
            z: 0,
        },
        scale: 3,           // Echelle de l'item
        hitBoxPosition: {
            x: 6.5,
            y: 0,
            z: 9,
        },
        hitBox: {
            x: 0.6,
            y: 1.75,
            z: 0.1
        }
    },
    gravestoneBroken2: {
        obj: './static/Models/Graveyard/OBJ_format/gravestoneBroken.obj',      // Item
        mtl: './static/Models/Graveyard/OBJ_format/gravestoneBroken.mtl',      // Item
        mesh: null,                                         // Données de l'affichage de l'item
        position: {                 // Position de l'item
            x: 10,
            y: 0,
            z: 6.5,
        },
        rotation: {                 // Rotation de l'item
            x: 0,
            y: -Math.PI/2,
            z: 0,
        },
        scale: 3,           // Echelle de l'item
        hitBoxPosition: {
            x: 10,
            y: 0,
            z: 6.5,
        },
        hitBox: {
            x: 0.6,
            y: 1.75,
            z: 0.1
        }
    },
    gravestoneCross1: {
        obj: './static/Models/Graveyard/OBJ_format/gravestoneCross.obj',      // Item
        mtl: './static/Models/Graveyard/OBJ_format/gravestoneCross.mtl',      // Item
        mesh: null,                                         // Données de l'affichage de l'item
        position: {                 // Position de l'item
            x: 6.5,
            y: 0,
            z: 6.5,
        },
        rotation: {                 // Rotation de l'item
            x: 0,
            y: -Math.PI/2,
            z: 0,
        },
        scale: 3,           // Echelle de l'item
        hitBoxPosition: {
            x: 6.5,
            y: 0,
            z: 6.5,
        },
        hitBox: {
            x: 0.2,
            y: 3,
            z: 0.2
        }
    },
    // Lampadaire
    lightpostAll1: {
        obj: './static/Models/Graveyard/OBJ_format/lightpostAll.obj',      // Item
        mtl: './static/Models/Graveyard/OBJ_format/lightpostAll.mtl',      // Item
        mesh: null,                                         // Données de l'affichage de l'item
        position: {                 // Position de l'item
            x: 10.5,
            y: 0,
            z: 3,
        },
        rotation: {                 // Rotation de l'item
            x: 0,
            y: 0,
            z: 0,
        },
        scale: 3,           // Echelle de l'item
        hitBoxPosition: {
            x: 10.5,
            y: 0,
            z: 3,
        },
        hitBox: {
            x: 0,
            y: 0,
            z: 0
        }
    },
    chaise1: {
        obj: './static/Models/Pol/Relec.obj',      // Item
        mtl: './static/Models/Pol/Relec.mtl',      // Item
        mesh: null,                                         // Données de l'affichage de l'item
        position: {                 // Position de l'item
            x: 0,
            y: 0,
            z: 0,
        },
        rotation: {                 // Rotation de l'item
            x: 0,
            y: 0,
            z: 0,
        },
        scale: 0.025,                    // Echelle de l'item 
        hitBoxPosition: {
            x: 0,
            y: 0,
            z: 0,
        },
        hitBox: {
            x: 1.3,
            y: 1.1,
            z: 2.7,
        }
    }
}
let spawnsCoord = {
    1: {
        x: -10,
        y: 0,
        z: 10,
    },
    2: {
        x: 10,
        y: 0,
        z: 10,
    },
}



export {sceneItems}           // Elements du décors, avec leur position
export {spawnsCoord}          // Coordoonées des spawns de la map