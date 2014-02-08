/*globals FM */
/**
 * Menu state
 */
var menuState = function () {
    "use strict";
    FM.State.apply(this);
    this.startButton = null;
    this.knownIp = false;
};
menuState.prototype = Object.create(FM.State.prototype);
menuState.prototype.constructor = menuState;
/**
 * Initialize the menu
 */
menuState.prototype.init = function () {
    FM.State.prototype.init.apply(this);

    var title = new FM.GameObject(99);
    title.addComponent(new FM.SpatialComponent(FM.Game.getScreenWidth() / 2 - 100, FM.Game.getScreenHeight() / 2 - 250, title));
    var renderer = title.addComponent(new FM.TextRendererComponent("A Thing", title));
    renderer.setFormat('#fff', '48px sans-serif', 'middle');
    this.add(title);

    var help = new FM.GameObject(99),
        spatial = help.addComponent(new FM.SpatialComponent(FM.Game.getScreenWidth() / 2 - 400, FM.Game.getScreenHeight() / 2, help)),
        renderer = help.addComponent(new FM.TextRendererComponent("Try not to be seen by placing walls with the space bar.", help));
    renderer.setFormat('#fff', '30px sans-serif', 'middle');
    this.add(help);

    help = new FM.GameObject(99);
    spatial = help.addComponent(new FM.SpatialComponent(FM.Game.getScreenWidth() / 2 - 400, FM.Game.getScreenHeight() / 2 - 50, help)),
    renderer = help.addComponent(new FM.TextRendererComponent("Reach the eye to win.", help));
    renderer.setFormat('#fff', '30px sans-serif', 'middle');
    this.add(help);

    this.startButton = new FM.GameObject(99);
    this.startButton.addComponent(new FM.SpatialComponent(FM.Game.getScreenWidth() / 2 - 90, FM.Game.getScreenHeight() / 2 + 150, this.startButton));
    renderer = this.startButton.addComponent(new FM.TextRendererComponent("Click to start", this.startButton));
    renderer.setFormat('#fff', '24px sans-serif', 'middle');
    this.add(this.startButton);

    //Retrieve IP address and check for its existence
    /*var hr = new XMLHttpRequest();
    hr.open("POST", "src/web/checkIp.php", false);
    hr.onreadystatechange = function () {
        if (hr.readyState === 4 && hr.status === 200) {
            var gg = hr.responseText;
            if (gg === "true") {
                knownIp = true;
            }
        }
    };
    hr.send();*/

    //Check if the IP is known
    if (this.knownIp) {
        console.log("known ip");
    } else {
        console.log("unknown ip");
    }
};

/**
 * Update of the menu state
 */
menuState.prototype.update = function (dt) {
    FM.State.prototype.update.apply(this, [dt]);

    if (FM.Game.isMouseClicked() && !this.knownIp) {
            FM.Game.switchState(new playState());
    } else if (this.knownIp) {
        this.startButton.hide();
        var alert = new FM.GameObject(99),
        spatial = alert.addComponent(new FM.SpatialComponent(FM.Game.getScreenWidth() / 2 - 150, FM.Game.getScreenHeight() / 2 + 250, alert)),
        renderer = alert.addComponent(new FM.TextRendererComponent("You already played.", alert));
        renderer.setFormat('#ff1', '30px sans-serif', 'middle');
        this.add(alert);
    }
};