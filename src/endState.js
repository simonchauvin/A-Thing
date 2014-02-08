/*globals FM */
/**
 * End state
 * @returns {endState}
 */
var endState = function (won) {
    "use strict";
    FM.State.apply(this);
    this.won = won;
};
endState.prototype = Object.create(FM.State.prototype);
/**
 * Initialize the stare
 */
endState.prototype.init = function () {
    FM.State.prototype.init.apply(this);

    var title = new FM.GameObject(99),
        spatial = title.addComponent(new FM.SpatialComponent(FM.Game.getScreenWidth() / 2 - 100, FM.Game.getScreenHeight() / 2 - 150, title)),
        renderer = title.addComponent(new FM.TextRendererComponent("You lost, but you helped the next one.", title));
    if (this.won) {
        renderer.text = "You won, the simulation has been reset.";
    }
    renderer.setFormat('#fff', '30px sans-serif', 'middle');
    this.add(title);
};

/**
 * Update the state
 */
endState.prototype.update = function (dt) {
    FM.State.prototype.update.apply(this, [dt]);
};