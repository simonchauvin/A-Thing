/**
 * Avatar
 * @returns {avatar}
 */
function avatar(pType) {
    "use strict";
    var that = FM.gameObject(10);
    that.spatial = FM.spatialComponent(465, 20, that);
    that.renderer = FM.animatedSpriteRendererComponent(FM.assetManager.getAssetByName("avatar"), 72, 35, that);
    that.physic = FM.circleComponent(20, that);
    that.path = FM.simplePathComponent(that);
    that.audio = FM.audioComponent(that);

    that.audio.addSound(FM.assetManager.getAssetByName("wallSound"));
    that.audio.addSound(FM.assetManager.getAssetByName("walk"));

    that.spatial.angle = 0;

    that.addType(pType);

    that.renderer.addAnimation("idle", [0], 40, false);
    that.renderer.addAnimation("walk", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], 60, true);
    that.renderer.play("idle");

    //that.renderer.changeSize(0.5);
    that.physic.offset.reset(13, 0);
    //that.physic.width = 36;
    //that.physic.height = 17.5;
    //that.physic.radius = 20;
    /**
     * Update the avatar
     */
    that.update = function (dt) {

    };

    return that;
}