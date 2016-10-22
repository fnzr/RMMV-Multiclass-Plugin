//=============================================================================
// multi.Scene_MultiClass
//=============================================================================
(function () {

    var createCommandWindow = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function () {
        createCommandWindow.call(this);
        this._commandWindow.setHandler('multiclass', this.commandPersonal.bind(this));
    };

    var onPersonalOk = Scene_Menu.prototype.onPersonalOk;
    Scene_Menu.prototype.onPersonalOk = function () {
        if (this._commandWindow.currentSymbol() === 'multiclass') {
            SceneManager.push(multi.Scene_MultiClass);
        } else {
            onPersonalOk.call(this);
        }
    };

    multi.Scene_MultiClass = function () {
        this.initialize.apply(this, arguments);
    }

    multi.Scene_MultiClass.prototype = Object.create(Scene_MenuBase.prototype);
    multi.Scene_MultiClass.prototype.constructor = multi.Scene_MultiClass;

    multi.Scene_MultiClass.prototype.initialize = function () {
        Scene_MenuBase.prototype.initialize.call(this);
    };

    multi.Scene_MultiClass.prototype.create = function () {
        Scene_MenuBase.prototype.create.call(this);
        this.createHelpWindow();
        this.createCommandWindow();
        this.createStatusWindow();
        this.createClassWindow();
        this.createSkillWindow();
        //this.createCompareWindow();
        this.refreshActor();
    };

    multi.Scene_MultiClass.prototype.refreshActor = function() {
        var actor = this.actor();
        this._statusWindow.setActor(actor);
        this._classWindow.setActor(actor);
    }

    multi.Scene_MultiClass.prototype.createCommandWindow = function () {
        this._commandWindow = new Window_MultiClassCommand();
        var win = this._commandWindow;
        win.y = this._helpWindow.height;
        //win.setHandler('class', this.commandClass.bind(this));
        win.setHandler('cancel', this.popScene.bind(this));
        win.setHandler('pagedown', this.nextActor.bind(this));
        win.setHandler('pageup', this.previousActor.bind(this));
        this.addWindow(win);
    };

    multi.Scene_MultiClass.prototype.createStatusWindow = function () {
        var wx = this._commandWindow.width;
        var wy = this._helpWindow.height;
        var ww = Graphics.boxWidth - wx;
        var wh = this._commandWindow.height;
        this._statusWindow = new Window_SkillStatus(wx, wy, ww, wh);
        this.addWindow(this._statusWindow);
    };

    multi.Scene_MultiClass.prototype.createClassWindow = function () {
        var wx = 0;//Graphics.boxWidth / 2;
        var wy = this._helpWindow.height + this._commandWindow.height;
        var ww = this._commandWindow.width;
        var wh = Graphics.boxHeight - (this._commandWindow.height + this._helpWindow.height);
        this._classWindow = new Window_ClassList(wx,wy,ww,wh);
        this.addWindow(this._classWindow);
    };

    multi.Scene_MultiClass.prototype.createSkillWindow = function () {
        var wx = this._classWindow.width;
        var wy = this._classWindow.position.y;
        var ww = Graphics.boxWidth - this._classWindow.width;
        var wh = this._classWindow.height;

        this._skillWindow = new Window_Base(wx,wy,ww,wh);
        this.addWindow(this._skillWindow);
    };

    /**
     * Class List Window
     */
    function Window_ClassList() {
        this.initialize.apply(this, arguments);
    }

    Window_ClassList.prototype = Object.create(Window_Selectable.prototype);
    Window_ClassList.prototype.constructor = Window_ClassList;

    Window_ClassList.prototype.initialize = function(x, y, width, height) {
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
        this._actor = null;
        this._data = [];
    };

    Window_ClassList.prototype.setActor = function(actor) {
        if (this._actor === actor) return;
        this._actor = actor;
        this.refresh();
        this.resetScroll();
    };

    Window_ClassList.prototype.refresh = function() {
        this.makeItemList();
        this.createContents();
        this.drawAllItems();
    };

    Window_ClassList.prototype.makeItemList = function(){
        var c = this._actor.multiclass();
        for(var classId in c){
            if(c.hasOwnProperty(classId)) continue;
            this._data.push($dataClasses[classId].name);
        }
        for(var i =0; i < 5;i++){
            this._data.push(i);
        }
    };

    Window_Base.prototype.createContents = function() {
        this.contents = new Bitmap(this.contentsWidth(), this.contentsHeight());
        this.resetFontSettings();
    };

    Window_Base.prototype.resetFontSettings = function() {
        this.contents.fontFace = this.standardFontFace();
        this.contents.fontSize = this.standardFontSize();
        this.resetTextColor();
    };

    Window_Base.prototype.resetTextColor = function() {
        this.changeTextColor(this.normalColor());
    };

    Window_ClassList.prototype.drawItem = function(index) {
        var item = $dataClasses[this._data[index]];
        if (!item) return;
        this.drawText(this._data[index], x, y, width, 'right');
        this.changePaintOpacity(true);
    };
    /**
     * Main Options Window
     */
    function Window_MultiClassCommand() {
        this.initialize.apply(this, arguments);
    }

    Window_MultiClassCommand.prototype = Object.create(Window_Command.prototype);
    Window_MultiClassCommand.prototype.constructor = Window_MultiClassCommand;

    Window_MultiClassCommand.prototype.initialize = function () {
        Window_Command.prototype.initialize.call(this, 0, 0);
    };

    Window_MultiClassCommand.prototype.windowWidth = function () {
        return 240;
    };

    Window_MultiClassCommand.prototype.numVisibleRows = function () {
        return 4;
    };

    Window_MultiClassCommand.prototype.itemTextAlign = function () {
        //return Yanfly.Param.CCCTextAlign;
        return 'left';
    };

    Window_MultiClassCommand.prototype.makeCommandList = function () {
        this.addCommand('Classes', 'classes', true);
    };

})();