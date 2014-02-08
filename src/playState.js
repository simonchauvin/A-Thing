/*globals FM */
/**
 * Play state
 */
var playState = function () {
    "use strict";
    FM.State.apply(this);

    this.avatarType = new FM.ObjectType("avatar");
    this.wallType = new FM.ObjectType("wall");
    this.visibilityObjectType = new FM.ObjectType("visibilityObject");
    this.player = avatar(this.avatarType);
    this.eye = new FM.GameObject(98);
    this.iris = new FM.GameObject(99);
    this.cursor = new FM.GameObject(99);
    this.walls = [];
    this.newWalls = [];
    this.visibilityTestObject = new FM.GameObject(99);
    this.visibilityTestObjectSpatial = null;
    this.visibilityTestObjectPhysic = null;
    this.visibilityTestObjectPath = null;
    this.persistentData = JSON.parse(FM.AssetManager.getAssetByName("persistentData").getContent());
    this.cursorSpatial = null;
    this.cursorRenderer = null;
    this.cursorDistance = null;
    this.eyeSpatial = null;
    this.eyeRenderer = null;
    this.eyePhysic = null;
    this.irisSpatial = null;
    this.irisRenderer = null;
    this.irisPhysic = null;
    this.irisAudio = null;
    this.irisPath = null;
    this.timeWatched = 0;
    this.maxTimeWatched = 5;
    this.wallsCount = 0;
    this.maxWalls = 2;
    this.move = false;
    this.dead = false;
    this.invisible = true;
    this.checkingVisibility = false;
    this.finalGoalReached = false;
};
playState.prototype = Object.create(FM.State.prototype);
/**
 * Initialize the play state
 */
playState.prototype.init = function () {
    //Setting the bounds of the world
    FM.State.prototype.init.apply(this, [1024, 768]);

    //Retrieve IP address and check for its existence
    var hr = new XMLHttpRequest();
    hr.open("POST", "src/web/addIp.php", false);
    hr.send();

    var ambiance = new FM.GameObject(0),
        ambianceAudio = ambiance.addComponent(new FM.AudioComponent(ambiance));
    ambianceAudio.addSound(FM.AssetManager.getAssetByName("ambiance"));
    //ambianceAudio.play("ambiance", 0.2, true);

    //Loading tmx file
    var background,
        irisDist,
        renderer,
        i,
        body,
        wall;
    //map.load(FM.AssetManager.getAssetByName("world").getContent());
    //Load tiles
    //tilemap = new FM.TileMap(FM.assetManager.getAssetByName("ground"), 38, 38, 32, 32, [], 1, false);
    //that.getWorld().loadTileMap(tilemap, map, "ground", "ground");
    background = new FM.GameObject(1);
    background.addComponent(new FM.SpatialComponent(0, 0, background));
    background.addComponent(new FM.SpriteRendererComponent(FM.AssetManager.getAssetByName("background"), 1024, 768, background));
    //Cursor
    this.cursorSpatial = this.cursor.addComponent(new FM.SpatialComponent(FM.Game.getMouseX(), FM.Game.getMouseY(), this.cursor));
    this.cursorRenderer = this.cursor.addComponent(new FM.AnimatedSpriteRendererComponent(FM.AssetManager.getAssetByName("cursor"), 11, 21, this.cursor));
    this.cursorRenderer.addAnimation("default", [0, 1, 2, 3, 2, 1, 0], 20, true);
    this.cursorRenderer.play("default");
    //Eye
    this.eyeSpatial = this.eye.addComponent(new FM.SpatialComponent(474, 346, this.eye));
    this.eyeRenderer = this.eye.addComponent(new FM.SpriteRendererComponent(FM.AssetManager.getAssetByName("eye"), 300, 300, this.eye));
    this.eyeRenderer.changeSize(0.25);
    this.eyePhysic = this.eye.addComponent(new FM.CircleComponent(18, this.eye));
    this.eyePhysic.offset.x = 37.5 - 18;
    this.eyePhysic.offset.y = 37.5 - 18;
    //Iris
    this.irisSpatial = this.iris.addComponent(new FM.SpatialComponent(this.eyeSpatial.position.x + this.eyePhysic.radius, this.eyeSpatial.position.y + this.eyePhysic.radius, this.iris));
    this.irisRenderer = this.iris.addComponent(new FM.SpriteRendererComponent(FM.AssetManager.getAssetByName("iris"), 120, 120, this.iris));
    this.irisRenderer.changeSize(0.25);
    this.irisPhysic = this.iris.addComponent(new FM.CircleComponent(15, this.iris));
    this.irisPath = this.iris.addComponent(new FM.SimplePathComponent(this.iris));
    this.irisAudio = this.iris.addComponent(new FM.AudioComponent(this.iris));
    this.irisAudio.addSound(FM.AssetManager.getAssetByName("visible"));
    //Visibility test object
    this.visibilityTestObject.addType(this.visibilityObjectType);
    this.visibilityTestObjectSpatial = this.visibilityTestObject.addComponent(new FM.SpatialComponent(this.irisSpatial.position.x + this.irisPhysic.radius - 1, this.irisSpatial.position.y + this.irisPhysic.radius - 1, this.visibilityTestObject));
    this.visibilityTestObjectPhysic = this.visibilityTestObject.addComponent(new FM.AabbComponent(2, 2, this.visibilityTestObject));
    this.visibilityTestObjectPath = this.visibilityTestObject.addComponent(new FM.SimplePathComponent(this.visibilityTestObject));
    //Read persistent data
    for (i = 0; i < this.persistentData.positions.length; i = i + 1) {
        body = new FM.GameObject(10);
        body.addComponent(new FM.SpatialComponent(this.persistentData.positions[i].x, this.persistentData.positions[i].y, body));
        body.addComponent(new FM.SpriteRendererComponent(FM.AssetManager.getAssetByName("body"), 20, 20, body));
        this.add(body);
    }
    for (i = 0; i < this.persistentData.walls.length; i = i + 1) {
        wall = new FM.GameObject(15);
        wall.addType(this.wallType);
        wall.addComponent(new FM.SpatialComponent(Math.round(this.persistentData.walls[i].x), Math.round(this.persistentData.walls[i].y), wall));
        if (this.persistentData.walls[i].inclined === "true") {
            wall.addComponent(new FM.SpriteRendererComponent(FM.AssetManager.getAssetByName("wallInclined"), 10, 100, wall));
            wall.addComponent(new FM.AabbComponent(10, 100, wall));
        } else {
            wall.addComponent(new FM.SpriteRendererComponent(FM.AssetManager.getAssetByName("wall"), 100, 10, wall));
            wall.addComponent(new FM.AabbComponent(100, 10, wall));
        }
        this.add(wall);
        this.walls.push(wall);
    }

    //Add objects
    this.add(background);
    this.add(this.player);
    this.add(this.eye);
    this.add(this.iris);
    this.add(this.cursor);
    this.add(this.visibilityTestObject);
    this.sortByZIndex();
};

/**
 * Update the play state
 */
playState.prototype.update = function (dt) {
    FM.State.prototype.update.apply(this, [dt]);

    //Check inputs
    if (!this.finalGoalReached && !this.dead && FM.Game.isMouseClicked()) {
        this.player.audio.play("walk", 1, false);
        this.move = true;
        this.player.path.clearPath();
        this.player.path.add(FM.Game.getMouseX(), FM.Game.getMouseY());
        this.player.path.startFollowingPath(40);
        this.cursorDistance = new FM.Vector(this.player.spatial.position.x - (FM.Game.getMouseX() - this.player.physic.offset.x - this.player.physic.radius), this.player.spatial.position.y - (FM.Game.getMouseY() - this.player.physic.offset.y));
        if (this.cursorDistance.y < 0) {
            this.player.spatial.angle = -Math.acos(this.cursorDistance.x / Math.sqrt(this.cursorDistance.x * this.cursorDistance.x + this.cursorDistance.y * this.cursorDistance.y)) - Math.PI / 2;
        } else {
            this.player.spatial.angle = Math.acos(this.cursorDistance.x / Math.sqrt(this.cursorDistance.x * this.cursorDistance.x + this.cursorDistance.y * this.cursorDistance.y)) - Math.PI / 2;
        }
    }
    //Avatar movement
    if (!this.finalGoalReached && !this.dead && this.move) {
        if (this.player.renderer.getCurrentAnim() !== "walk") {
            this.player.renderer.play("walk");
        }
        if (this.player.path.isLastWaypointReached()) {
            this.move = false;
            this.player.renderer.play("idle");
        }
    }
    if (!this.finalGoalReached && !this.dead && this.wallsCount < this.maxWalls && FM.Game.isKeyReleased(FM.Keyboard.SPACE)) {
        this.player.audio.play("wallSound", 1, false);
        var wall = new FM.GameObject(15),
            pos = new FM.Vector(this.player.spatial.position.x, this.player.spatial.position.y),
            wallSpatial,
            asset = FM.AssetManager.getAssetByName("wall"),
            width = 100,
            height = 10;
        wall.addType(this.wallType);
        wallSpatial = wall.addComponent(new FM.SpatialComponent(pos.x, pos.y, wall));
        if (this.player.spatial.angle >= 0.8 || this.player.spatial.angle <= -4) {
            asset = FM.AssetManager.getAssetByName("wallInclined");
            width = 10;
            height = 100;
            pos.x += 40;
        } else if (this.player.spatial.angle < 0.8 && this.player.spatial.angle >= -0.8) {
            asset = FM.AssetManager.getAssetByName("wall");
            width = 100;
            height = 10;
            pos.y -= 20;
        } else if (this.player.spatial.angle <= -2.5 && this.player.spatial.angle > -4) {
            asset = FM.AssetManager.getAssetByName("wall");
            width = 100;
            height = 10;
            pos.y += 40;
        } else if (this.player.spatial.angle < -0.8 && this.player.spatial.angle > -2.5) {
            asset = FM.AssetManager.getAssetByName("wallInclined");
            width = 10;
            height = 100;
            pos.x -= 40;
        }
        wallSpatial.position.copy(pos);
        wall.addComponent(new FM.SpriteRendererComponent(asset, width, height, wall));
        wall.addComponent(new FM.AabbComponent(width, height, wall));
        this.add(wall);
        this.walls.push(wall);
        this.newWalls.push(wall);
        this.wallsCount += 1;
    }
    //Eye movement following
    if (!this.invisible && !this.finalGoalReached && !this.dead) {
        if (!this.irisAudio.isPlaying("visible")) {
            this.irisAudio.play("visible", 1, true);
        }
        this.irisPath.clearPath();
        this.irisPath.add(this.player.spatial.position.x + this.player.physic.offset.x + this.player.physic.radius, this.player.spatial.position.y + this.player.physic.offset.y + this.player.physic.radius);
        this.irisPath.startFollowingPath(300);
        if (this.player.spatial.position.x - this.irisPhysic.width < this.irisSpatial.position.x && this.irisSpatial.position.x <= this.eyeSpatial.position.x) {
            this.irisPhysic.velocity.x = 0;
        }
        if (this.player.spatial.position.x > this.irisSpatial.position.x && this.irisSpatial.position.x + this.irisPhysic.width >= this.eyeSpatial.position.x + this.eyePhysic.width) {
            this.irisPhysic.velocity.x = 0;
        }
        if (this.player.spatial.position.y - this.irisPhysic.height < this.irisSpatial.position.y && this.irisSpatial.position.y <= this.eyeSpatial.position.y) {
            this.irisPhysic.velocity.y = 0;
        }
        if (this.player.spatial.position.y > this.irisSpatial.position.y && this.irisSpatial.position.y + this.irisPhysic.height >= this.eyeSpatial.position.y + this.eyePhysic.height) {
            this.irisPhysic.velocity.y = 0;
        }
        //Update time watched
        this.timeWatched += dt;
    } else if (!this.finalGoalReached && !this.dead) {
        if (this.irisAudio.isPlaying("visible")) {
            this.irisAudio.pause("visible");
        }
        this.irisPath.clearPath();
        this.irisPath.stopFollowingPath();
        this.irisSpatial.position.reset(Math.round(this.eyeSpatial.position.x + this.eyeRenderer.getWidth() / 2 - this.irisPhysic.radius), Math.round(this.eyeSpatial.position.y + this.eyeRenderer.getWidth() / 2 - this.irisPhysic.radius));
    }
    //Reducing avatar's size
    if (!this.finalGoalReached && !this.dead && !this.checkingVisibility) {
        this.visibilityTestObjectPath.clearPath();
        this.visibilityTestObjectPath.add(this.player.spatial.position.x + this.player.physic.offset.x + this.player.physic.radius, this.player.spatial.position.y + this.player.physic.offset.y + this.player.physic.radius);
        this.visibilityTestObjectPath.startFollowingPath(400);
        this.checkingVisibility = true;
    } else if (!this.finalGoalReached && !this.dead && this.visibilityTestObjectPath.isLastWaypointReached()) {
        var cursorDistance = new FM.Vector((this.player.spatial.position.x + this.player.physic.offset.x + this.player.physic.radius) - this.eyeSpatial.position.x, (this.player.spatial.position.y + this.player.physic.offset.y + this.player.physic.radius) - this.eyeSpatial.position.y);
        cursorDistance = cursorDistance.getLength();
        var factor = 1 - (this.timeWatched / this.maxTimeWatched),
            distFactor = cursorDistance / this.getWorld().width / 2;
        //console.log(player.physic.radius);
        this.player.renderer.changeSize(factor);
        this.player.physic.radius = this.player.physic.radius * factor;
        this.player.physic.width = this.player.physic.radius * 2;
        this.player.physic.height = this.player.physic.radius * 2;
        this.player.physic.offset.x += 1.6;
        this.player.physic.offset.y += 1.2;
        this.checkingVisibility = false;
        this.invisible = false;
        this.visibilityTestObjectSpatial.position.reset(this.irisSpatial.position.x + this.irisPhysic.radius - 1, this.irisSpatial.position.y + this.irisPhysic.radius - 1);
    }
    //Check collision with walls
    if (this.wallType.overlapsWithObject(this.visibilityTestObject)) {
        this.visibilityTestObjectPath.stopFollowingPath();
        this.checkingVisibility = false;
        this.visibilityTestObjectSpatial.position.reset(this.irisSpatial.position.x + this.irisPhysic.radius - 1, this.irisSpatial.position.y + this.irisPhysic.radius - 1);
        this.invisible = true;
    }
    //Map cursor and modify player's angle
    this.cursorSpatial.position.x = FM.Game.getMouseX();
    this.cursorSpatial.position.y = FM.Game.getMouseY();
    //Check if dead, send data and end the game
    if (this.timeWatched >= this.maxTimeWatched && !this.dead && !this.finalGoalReached) {
        console.log("DEAD");
        this.dead = true;
        this.move = false;
        this.player.renderer.play("idle");
        this.player.kill();
        this.player.hide();
        this.invisible = true;
        this.irisRenderer.changeSize(1.5);
        this.irisSpatial.position.reset(this.eyeSpatial.position.x + this.eyePhysic.radius - this.irisRenderer.getWidth() / 2, this.eyeSpatial.position.y + this.eyePhysic.radius - this.irisRenderer.getHeight() / 2);
        this.irisPath.clearPath();
        this.irisPath.stopFollowingPath();
        var hr = new XMLHttpRequest(),
            wall1,
            wall2,
            wall1Spatial,
            wall2Spatial,
            wall1Inclined,
            wall2Inclined,
            dataToSend = "x=" + this.player.spatial.position.x + "&y=" + this.player.spatial.position.y;
        if (this.newWalls[0]) {
            wall1 = this.newWalls[0];
            wall1Spatial = wall1.components[FM.ComponentTypes.SPATIAL];
            wall1Inclined = wall1.components[FM.ComponentTypes.PHYSIC].width === 10;
            dataToSend += "&wall1x=" + wall1Spatial.position.x + "&wall1y=" + wall1Spatial.position.y + "&wall1inclined=" + wall1Inclined;
        }
        if (this.newWalls[1]) {
            wall2 = this.newWalls[1];
            wall2Spatial = wall2.components[FM.ComponentTypes.SPATIAL];
            wall2Inclined = wall2.components[FM.ComponentTypes.PHYSIC].width === 10;
            dataToSend += "&wall2x=" + wall2Spatial.position.x + "&wall2y=" + wall2Spatial.position.y + "&wall2inclined=" + wall2Inclined;
        }
        hr.open("POST", "src/web/addPosition.php", true);
        hr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        hr.send(dataToSend);
        //TODO have players put their name
        FM.Game.switchState(new endState(false));
    }
    //Check if the player won
    if (!this.finalGoalReached && !this.dead && this.player.physic.overlapsWithObject(this.eyePhysic)) {
        console.log("WON");
        this.finalGoalReached = true;
        this.iris.kill();
        this.iris.hide();
        this.player.kill();
        this.player.hide();
        this.invisible = true;

        var hr = new XMLHttpRequest();
        hr.open("POST", "src/web/reset.php", true);
        hr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        hr.send(dataToSend);
        FM.Game.switchState(new endState(true));
    }
};