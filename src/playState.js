/**
 * Play state
 * @returns {playState}
 */
function playState() {
    "use strict";
    var that = Object.create(FM.state()),
        avatarType = FM.objectType("avatar"),
        wallType = FM.objectType("wall"),
        visibilityObjectType = FM.objectType("visibilityObject"),
        player = avatar(avatarType),
        eye = FM.gameObject(98),
        iris = FM.gameObject(99),
        cursor = FM.gameObject(99),
        walls = [],
        newWalls = [],
        visibilityTestObject = FM.gameObject(99),
        visibilityTestObjectSpatial,
        visibilityTestObjectPhysic,
        visibilityTestObjectPath,
        persistentData = JSON.parse(FM.assetManager.getAssetByName("persistentData").getContent()),
        cursorSpatial,
        cursorRenderer,
        cursorDistance,
        eyeSpatial,
        eyeRenderer,
        eyePhysic,
        irisSpatial,
        irisRenderer,
        irisPhysic,
        irisAudio,
        irisPath,
        timeWatched = 0,
        maxTimeWatched = 5,
        wallsCount = 0,
        maxWalls = 2,
        move = false,
        dead = false,
        invisible = true,
        checkingVisibility = false,
        finalGoalReached = false;

    /**
     * Initialize the play state
     */
    that.init = function () {
        //Setting the bounds of the world
        Object.getPrototypeOf(that).init(1024, 768);

        //Retrieve IP address and check for its existence
        var hr = new XMLHttpRequest();
        hr.open("POST", "src/web/addIp.php", false);
        hr.send();

        var ambiance = FM.gameObject(0),
            ambianceAudio = FM.audioComponent(ambiance);
        ambianceAudio.addSound(FM.assetManager.getAssetByName("ambiance"));
        //ambianceAudio.play("ambiance", 0.2, true);

        //Loading tmx file
        var background,
            irisDist,
            renderer,
            i,
            body,
            wall;
        //map.load(FM.assetManager.getAssetByName("world").getContent());
        //Load tiles
        //tilemap = FM.tileMap(FM.assetManager.getAssetByName("ground"), 38, 38, 32, 32, [], 1, false);
        //that.getWorld().loadTileMap(tilemap, map, "ground", "ground");
        background = FM.gameObject(1);
        FM.spatialComponent(0, 0, background);
        FM.spriteRendererComponent(FM.assetManager.getAssetByName("background"), 1024, 768, background);
        //Cursor
        cursorSpatial = FM.spatialComponent(FM.game.getMouseX(), FM.game.getMouseY(), cursor);
        cursorRenderer = FM.animatedSpriteRendererComponent(FM.assetManager.getAssetByName("cursor"), 11, 21, cursor);
        cursorRenderer.addAnimation("default", [0, 1, 2, 3, 2, 1, 0], 20, true);
        cursorRenderer.play("default");
        //Eye
        eyeSpatial = FM.spatialComponent(474, 346, eye);
        eyeRenderer = FM.spriteRendererComponent(FM.assetManager.getAssetByName("eye"), 300, 300, eye);
        eyeRenderer.changeSize(0.25);
        eyePhysic = FM.circleComponent(18, eye);
        eyePhysic.offset.x = 37.5 - 18;
        eyePhysic.offset.y = 37.5 - 18;
        //Iris
        irisSpatial = FM.spatialComponent(eyeSpatial.position.x + eyePhysic.radius, eyeSpatial.position.y + eyePhysic.radius, iris);
        irisRenderer = FM.spriteRendererComponent(FM.assetManager.getAssetByName("iris"), 120, 120, iris);
        irisRenderer.changeSize(0.25);
        irisPhysic = FM.circleComponent(15, iris);
        irisPath = FM.simplePathComponent(iris);
        irisAudio = FM.audioComponent(iris);
        irisAudio.addSound(FM.assetManager.getAssetByName("visible"));
        //Visibility test object
        visibilityTestObject.addType(visibilityObjectType);
        visibilityTestObjectSpatial = FM.spatialComponent(irisSpatial.position.x + irisPhysic.radius - 1, irisSpatial.position.y + irisPhysic.radius - 1, visibilityTestObject);
        visibilityTestObjectPhysic = FM.aabbComponent(2, 2, visibilityTestObject);
        visibilityTestObjectPath = FM.simplePathComponent(visibilityTestObject);
        //Read persistent data
        for (i = 0; i < persistentData.positions.length; i = i + 1) {
            body = FM.gameObject(10);
            FM.spatialComponent(persistentData.positions[i].x, persistentData.positions[i].y, body);
            FM.spriteRendererComponent(FM.assetManager.getAssetByName("body"), 20, 20, body);
            that.add(body);
        }
        for (i = 0; i < persistentData.walls.length; i = i + 1) {
            wall = FM.gameObject(15);
            wall.addType(wallType);
            FM.spatialComponent(Math.round(persistentData.walls[i].x), Math.round(persistentData.walls[i].y), wall);
            if (persistentData.walls[i].inclined === "true") {
                FM.spriteRendererComponent(FM.assetManager.getAssetByName("wallInclined"), 10, 100, wall);
                FM.aabbComponent(10, 100, wall);
            } else {
                FM.spriteRendererComponent(FM.assetManager.getAssetByName("wall"), 100, 10, wall);
                FM.aabbComponent(100, 10, wall);
            }
            that.add(wall);
            walls.push(wall);
        }

        //Add objects
        that.add(background);
        that.add(player);
        that.add(eye);
        that.add(iris);
        that.add(cursor);
        that.add(visibilityTestObject);
        that.sortByZIndex();
    };

    /**
     * Update the play state
     */
    that.update = function (dt) {
        Object.getPrototypeOf(that).update(dt);

        //Check inputs
        if (!finalGoalReached && !dead && FM.game.isMouseClicked()) {
            player.audio.play("walk", 1, false);
            move = true;
            player.path.clearPath();
            player.path.add(FM.game.getMouseX(), FM.game.getMouseY());
            player.path.startFollowingPath(40);
            cursorDistance = FM.vector(player.spatial.position.x - (FM.game.getMouseX() - player.physic.offset.x - player.physic.radius), player.spatial.position.y - (FM.game.getMouseY() - player.physic.offset.y));
            if (cursorDistance.y < 0) {
                player.spatial.angle = -Math.acos(cursorDistance.x / Math.sqrt(cursorDistance.x * cursorDistance.x + cursorDistance.y * cursorDistance.y)) - Math.PI / 2;
            } else {
                player.spatial.angle = Math.acos(cursorDistance.x / Math.sqrt(cursorDistance.x * cursorDistance.x + cursorDistance.y * cursorDistance.y)) - Math.PI / 2;
            }
        }
        //Avatar movement
        if (!finalGoalReached && !dead && move) {
            if (player.renderer.getCurrentAnim() !== "walk") {
                player.renderer.play("walk");
            }
            if (player.path.isLastWaypointReached()) {
                move = false;
                player.renderer.play("idle");
            }
        }
        if (!finalGoalReached && !dead && wallsCount < maxWalls && FM.game.isKeyReleased(FM.keyboard.SPACE)) {
            player.audio.play("wallSound", 1, false);
            var wall = FM.gameObject(15),
                pos = FM.vector(player.spatial.position.x, player.spatial.position.y),
                wallSpatial,
                asset = FM.assetManager.getAssetByName("wall"),
                width = 100,
                height = 10;
            wall.addType(wallType);
            wallSpatial = FM.spatialComponent(pos.x, pos.y, wall);
            if (player.spatial.angle >= 0.8 || player.spatial.angle <= -4) {
                asset = FM.assetManager.getAssetByName("wallInclined");
                width = 10;
                height = 100;
                pos.x += 40;
            } else if (player.spatial.angle < 0.8 && player.spatial.angle >= -0.8) {
                asset = FM.assetManager.getAssetByName("wall");
                width = 100;
                height = 10;
                pos.y -= 20;
            } else if (player.spatial.angle <= -2.5 && player.spatial.angle > -4) {
                asset = FM.assetManager.getAssetByName("wall");
                width = 100;
                height = 10;
                pos.y += 40;
            } else if (player.spatial.angle < -0.8 && player.spatial.angle > -2.5) {
                asset = FM.assetManager.getAssetByName("wallInclined");
                width = 10;
                height = 100;
                pos.x -= 40;
            }
            wallSpatial.position.copy(pos);
            FM.spriteRendererComponent(asset, width, height, wall);
            FM.aabbComponent(width, height, wall);
            that.add(wall);
            walls.push(wall);
            newWalls.push(wall);
            wallsCount += 1;
        }
        //Eye movement following
        if (!invisible && !finalGoalReached && !dead) {
            if (!irisAudio.isPlaying("visible")) {
                irisAudio.play("visible", 1, true);
            }
            irisPath.clearPath();
            irisPath.add(player.spatial.position.x + player.physic.offset.x + player.physic.radius, player.spatial.position.y + player.physic.offset.y + player.physic.radius);
            irisPath.startFollowingPath(300);
            if (player.spatial.position.x - irisPhysic.width < irisSpatial.position.x && irisSpatial.position.x <= eyeSpatial.position.x) {
                irisPhysic.velocity.x = 0;
            }
            if (player.spatial.position.x > irisSpatial.position.x && irisSpatial.position.x + irisPhysic.width >= eyeSpatial.position.x + eyePhysic.width) {
                irisPhysic.velocity.x = 0;
            }
            if (player.spatial.position.y - irisPhysic.height < irisSpatial.position.y && irisSpatial.position.y <= eyeSpatial.position.y) {
                irisPhysic.velocity.y = 0;
            }
            if (player.spatial.position.y > irisSpatial.position.y && irisSpatial.position.y + irisPhysic.height >= eyeSpatial.position.y + eyePhysic.height) {
                irisPhysic.velocity.y = 0;
            }
            //Update time watched
            timeWatched += dt;
        } else if (!finalGoalReached && !dead) {
            if (irisAudio.isPlaying("visible")) {
                irisAudio.pause("visible");
            }
            irisPath.clearPath();
            irisPath.stopFollowingPath();
            irisSpatial.position.reset(Math.round(eyeSpatial.position.x + eyeRenderer.getWidth() / 2 - irisPhysic.radius), Math.round(eyeSpatial.position.y + eyeRenderer.getWidth() / 2 - irisPhysic.radius));
        }
        //Reducing avatar's size
        if (!finalGoalReached && !dead && !checkingVisibility) {
            visibilityTestObjectPath.clearPath();
            visibilityTestObjectPath.add(player.spatial.position.x + player.physic.offset.x + player.physic.radius, player.spatial.position.y + player.physic.offset.y + player.physic.radius);
            visibilityTestObjectPath.startFollowingPath(400);
            checkingVisibility = true;
        } else if (!finalGoalReached && !dead && visibilityTestObjectPath.isLastWaypointReached()) {
            var cursorDistance = FM.vector((player.spatial.position.x + player.physic.offset.x + player.physic.radius) - eyeSpatial.position.x, (player.spatial.position.y + player.physic.offset.y + player.physic.radius) - eyeSpatial.position.y);
            cursorDistance = cursorDistance.getLength();
            var factor = 1 - (timeWatched / maxTimeWatched),
                distFactor = cursorDistance / that.getWorld().width / 2;
            //console.log(player.physic.radius);
            player.renderer.changeSize(factor);
            player.physic.radius = player.physic.radius * factor;
            player.physic.width = player.physic.radius * 2;
            player.physic.height = player.physic.radius * 2;
            player.physic.offset.x += 1.6;
            player.physic.offset.y += 1.2;
            checkingVisibility = false;
            invisible = false;
            visibilityTestObjectSpatial.position.reset(irisSpatial.position.x + irisPhysic.radius - 1, irisSpatial.position.y + irisPhysic.radius - 1);
        }
        //Check collision with walls
        if (wallType.overlapsWithObject(visibilityTestObject)) {
            visibilityTestObjectPath.stopFollowingPath();
            checkingVisibility = false;
            visibilityTestObjectSpatial.position.reset(irisSpatial.position.x + irisPhysic.radius - 1, irisSpatial.position.y + irisPhysic.radius - 1);
            invisible = true;
        }
        //Check if dead, send data and end the game
        if (timeWatched >= maxTimeWatched && !dead && !finalGoalReached) {
            console.log("DEAD");
            dead = true;
            move = false;
            player.renderer.play("idle");
            player.kill();
            player.hide();
            invisible = true;
            irisRenderer.changeSize(1.5);
            irisSpatial.position.reset(eyeSpatial.position.x + eyePhysic.radius - irisRenderer.getWidth() / 2, eyeSpatial.position.y + eyePhysic.radius - irisRenderer.getHeight() / 2);
            irisPath.clearPath();
            irisPath.stopFollowingPath();
            var hr = new XMLHttpRequest(),
                wall1,
                wall2,
                wall1Spatial,
                wall2Spatial,
                wall1Inclined,
                wall2Inclined,
                dataToSend = "x=" + player.spatial.position.x + "&y=" + player.spatial.position.y;
            if (newWalls[0]) {
                wall1 = newWalls[0];
                wall1Spatial = wall1.components[FM.componentTypes.SPATIAL];
                wall1Inclined = wall1.components[FM.componentTypes.PHYSIC].width === 10;
                dataToSend += "&wall1x=" + wall1Spatial.position.x + "&wall1y=" + wall1Spatial.position.y + "&wall1inclined=" + wall1Inclined;
            }
            if (newWalls[1]) {
                wall2 = newWalls[1];
                wall2Spatial = wall2.components[FM.componentTypes.SPATIAL];
                wall2Inclined = wall2.components[FM.componentTypes.PHYSIC].width === 10;
                dataToSend += "&wall2x=" + wall2Spatial.position.x + "&wall2y=" + wall2Spatial.position.y + "&wall2inclined=" + wall2Inclined;
            }
            hr.open("POST", "src/web/addPosition.php", true);
            hr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            hr.send(dataToSend);
            //TODO have players put their name
            FM.game.switchState(endState(false))
        }
        //Check if the player won
        if (!finalGoalReached && !dead && player.physic.overlapsWithObject(eyePhysic)) {
            console.log("WON");
            finalGoalReached = true;
            iris.kill();
            iris.hide();
            player.kill();
            player.hide();
            invisible = true;

            var hr = new XMLHttpRequest();
            hr.open("POST", "src/web/reset.php", true);
            hr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            hr.send(dataToSend);
            FM.game.switchState(endState(true));
        }
        //Map cursor and modify player's angle
        cursorSpatial.position.x = FM.game.getMouseX();
        cursorSpatial.position.y = FM.game.getMouseY();
    };

    return that;
}