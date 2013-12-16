/**
 * Menu state
 * @returns {menuState}
 */
function menuState() {
    "use strict";
    var that = Object.create(FM.state()),
        startButton,
        knownIp = false;

    /**
     * Initialize the menu
     */
    that.init = function () {
        Object.getPrototypeOf(that).init();

        var title = FM.gameObject(99);
        FM.spatialComponent(FM.game.getScreenWidth() / 2 - 100, FM.game.getScreenHeight() / 2 - 250, title);
        var renderer = FM.textRendererComponent("A Thing", title);
        renderer.setFormat('#fff', '48px sans-serif', 'middle');
        that.add(title);

        var help = FM.gameObject(99),
            spatial = FM.spatialComponent(FM.game.getScreenWidth() / 2 - 400, FM.game.getScreenHeight() / 2, help),
            renderer = FM.textRendererComponent("Try not to be seen by placing walls with the space bar.", help);
        renderer.setFormat('#fff', '30px sans-serif', 'middle');
        that.add(help);

        help = FM.gameObject(99);
        spatial = FM.spatialComponent(FM.game.getScreenWidth() / 2 - 400, FM.game.getScreenHeight() / 2 - 50, help),
        renderer = FM.textRendererComponent("Reach the eye to win.", help);
        renderer.setFormat('#fff', '30px sans-serif', 'middle');
        that.add(help);

        startButton = FM.gameObject(99);
        FM.spatialComponent(FM.game.getScreenWidth() / 2 - 90, FM.game.getScreenHeight() / 2 + 150, startButton);
        renderer = FM.textRendererComponent("Click to start", startButton);
        renderer.setFormat('#fff', '24px sans-serif', 'middle');
        that.add(startButton);

        //Retrieve IP address and check for its existence
        var hr = new XMLHttpRequest();
        hr.open("POST", "src/web/checkIp.php", false);
        hr.onreadystatechange = function () {
            if (hr.readyState === 4 && hr.status === 200) {
                var gg = hr.responseText;
                if (gg === "true") {
                    knownIp = true;
                }
            }
        };
        hr.send();

        //Check if the IP is known
        if (knownIp) {
            console.log("known ip");
        } else {
            console.log("unknown ip");
        }
    };

    /**
     * Update of the menu state
     */
    that.update = function (dt) {
        Object.getPrototypeOf(that).update(dt);

        if (FM.game.isMouseClicked() && !knownIp) {
                FM.game.switchState(playState());
        } else if (knownIp) {
            startButton.hide();
            var alert = FM.gameObject(99),
            spatial = FM.spatialComponent(FM.game.getScreenWidth() / 2 - 150, FM.game.getScreenHeight() / 2 + 250, alert),
            renderer = FM.textRendererComponent("You already played.", alert);
            renderer.setFormat('#ff1', '30px sans-serif', 'middle');
            that.add(alert);
        }
    };

    return that;
}