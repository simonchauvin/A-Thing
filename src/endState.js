/**
 * End state
 * @returns {endState}
 */
function endState(won) {
    "use strict";
    var that = Object.create(FM.state());

    /**
     * Initialize the stare
     */
    that.init = function () {
        Object.getPrototypeOf(that).init();

        var title = FM.gameObject(99),
            spatial = FM.spatialComponent(FM.game.getScreenWidth() / 2 - 100, FM.game.getScreenHeight() / 2 - 150, title),
            renderer = FM.textRendererComponent("You lost, but you helped the next one.", title);
        if (won) {
            renderer.text = "You won, the simulation has been reset.";
        }
        renderer.setFormat('#fff', '30px sans-serif', 'middle');
        that.add(title);
    };

    /**
     * Update the state
     */
    that.update = function (dt) {
        Object.getPrototypeOf(that).update(dt);
    };

    return that;
}