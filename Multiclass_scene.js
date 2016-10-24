//=============================================================================
// Scene_MultiClass
//=============================================================================
(function () {

    //=============================================================================
// Window_MenuCommand
// This creates the menu option.
//=============================================================================

    var addOriginalCommands = Window_MenuCommand.prototype.addOriginalCommands;
    Window_MenuCommand.prototype.addOriginalCommands = function () {
        this.addMulticlassCommand();
        addOriginalCommands.call(this);
    };

    Window_MenuCommand.prototype.addMulticlassCommand = function () {
        var text = "Hawt";
        var enabled = true;
        this.addCommand(text, 'multiclass', enabled);
    };

    var createCommandWindow = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function () {
        createCommandWindow.call(this);
        this._commandWindow.setHandler('multiclass', this.commandPersonal.bind(this));
    };

    var onPersonalOk = Scene_Menu.prototype.onPersonalOk;
    Scene_Menu.prototype.onPersonalOk = function () {
        if (this._commandWindow.currentSymbol() === 'multiclass') {
            SceneManager.push(Scene_MultiClass);
        } else {
            onPersonalOk.call(this);
        }
    };

    var Scene_MultiClass = function () {
        this.initialize.apply(this, arguments);
    }

    Scene_MultiClass.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_MultiClass.prototype.constructor = Scene_MultiClass;

    Scene_MultiClass.prototype.initialize = function () {
        Scene_MenuBase.prototype.initialize.call(this);
    };

    Scene_MultiClass.prototype.create = function () {
        Scene_MenuBase.prototype.create.call(this);
        this.createHelpWindow();
        this.createCommandWindow();
        this.createStatusWindow();
        this.createClassWindow();
        this.createSkillWindow();
        //this.createCompareWindow();
        this.refreshActor();
    };

    Scene_MultiClass.prototype.refreshActor = function () {
        this._statusWindow.setActor(this.actor());
        this._classWindow.setActor(this.actor());
    }

    Scene_MultiClass.prototype.createCommandWindow = function () {
        this._commandWindow = new Window_MultiClassCommand();
        var win = this._commandWindow;
        win.y = this._helpWindow.height;
        win.setHandler('classes', this.commandClass.bind(this));
        win.setHandler('cancel', this.popScene.bind(this));
        win.setHandler('pagedown', this.nextActor.bind(this));
        win.setHandler('pageup', this.previousActor.bind(this));
        this.addWindow(win);
    };

    Scene_MultiClass.prototype.commandClass = function () {
        this._classWindow.activate();
        this._classWindow.refresh();
        this._classWindow.select(0);
    };

    Scene_MultiClass.prototype.onActorChange = function () {
        this.refreshActor();
        this._commandWindow.activate();
    };

    Scene_MultiClass.prototype.createStatusWindow = function () {
        var wx = this._commandWindow.width;
        var wy = this._helpWindow.height;
        var ww = Graphics.boxWidth - wx;
        var wh = this._commandWindow.height;
        this._statusWindow = new Window_SkillStatus(wx, wy, ww, wh);
        this.addWindow(this._statusWindow);
    };

    Scene_MultiClass.prototype.createClassWindow = function () {
        var wx = 0;//Graphics.boxWidth / 2;
        var wy = this._helpWindow.height + this._commandWindow.height;
        var ww = this._commandWindow.width;
        var wh = Graphics.boxHeight - (this._commandWindow.height + this._helpWindow.height);
        this._classWindow = new Window_ClassList(wx, wy, ww, wh);
        this._classWindow.setHelpWindow(this._helpWindow);
        this._classWindow.setHandler('cancel', this.onClassCancel.bind(this))
        this.addWindow(this._classWindow);
    };

    Scene_MultiClass.prototype.onClassCancel = function () {
        this._classWindow.deselect();
        this._classWindow.deactivate();
        this._commandWindow.activate();
    }

    Scene_MultiClass.prototype.createSkillWindow = function () {
        var wx = this._classWindow.width;
        var wy = this._classWindow.position.y;
        var ww = Graphics.boxWidth - this._classWindow.width;
        var wh = this._classWindow.height;

        this._skillWindow = new Window_Skill(wx, wy, ww, wh);
        this.addWindow(this._skillWindow);

        this._classWindow.setSkillWindow(this._skillWindow);
    };

    function Window_Skill() {
        this.initialize.apply(this, arguments);
        this._lastSelected = -1;
    }

    Window_Skill.prototype = Object.create(Window_Selectable.prototype);
    Window_Skill.prototype.constructor = Window_Skill;

    Window_Skill.prototype.initialize = function (x, y, width, height) {
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    };

    Window_Skill.prototype.refresh = function (classId, level) {
        this.contents.clear();
        var idx = 0;
        $dataClasses[classId].learnings.forEach(function (learning) {
            if (level >= learning.level) {
                var rect = this.itemRect(idx);
                this.drawText($dataSkills[learning.skillId].name, rect.x, rect.y, this.width, 'left');
                idx++;
            }
        }, this);
    };

    Window_Skill.prototype.maxCols = function () {
        return 2;
    };

    /**
     * Class List Window
     */
    function Window_ClassList() {
        this.initialize.apply(this, arguments);
    }

    Window_ClassList.prototype = Object.create(Window_Selectable.prototype);
    Window_ClassList.prototype.constructor = Window_ClassList;

    Window_ClassList.prototype.initialize = function (x, y, width, height) {
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
        this._actor = null;
        this._skillWindow = null;
        this._data = [];
    };

    Window_ClassList.prototype.setSkillWindow = function (skillWindow) {
        this._skillWindow = skillWindow;
    };

    Window_ClassList.prototype.setActor = function (actor) {
        if (this._actor === actor) return;
        this._actor = actor;
        this.contents.clear();
        this.refresh();
        this.resetScroll();
    };

    Window_ClassList.prototype.item = function () {
        return this._data && this.index() >= 0 ? this._data[this.index()] : null;
    };

    Window_ClassList.prototype.refresh = function () {
        this.contents.clear();
        this.buildClassList();
    };

    Window_ClassList.prototype.updateHelp = function () {
        this.setHelpWindowItem($dataClasses[this.item()]);
        this.updateSkill();
    };

    Window_ClassList.prototype.updateSkill = function () {
        if (this.index() == -1) return;
        var classId = this._data[this.index()];
        this._skillWindow.refresh(classId, this._actor.getClassLevel(classId));
    };

    Window_ClassList.prototype.maxItems = function () {
        return this._data ? this._data.length : 1;
    };

    Window_ClassList.prototype.buildClassList = function () {
        this._data = [];
        var idx = 0;
        var classes = this._actor.multiclass();
        for (var classId in classes) {
            var rect = this.itemRect(idx);
            this.drawText($dataClasses[classId].name, rect.x, rect.y, this.width, 'left');
            this.drawText(classes[classId], rect.x, rect.y, rect.width, 'right');
            idx++;
            this._data.push(classId)
        }
    }
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
        //this.addCommand('Level Up', 'levelup', this._actor.cp() > 0);
    };

    Window_Base.prototype.drawActorCP = function (actor, x, y) {
        this.changeTextColor(this.systemColor());
        var dw1 = this.textWidth("CP");
        this.drawText("CP", x, y, dw1);
        this.resetTextColor();
        var cp = Yanfly.Util.toGroup(actor.cp());
        var dw2 = this.textWidth(Yanfly.Util.toGroup(actor.maxLevel()));
        this.drawText(cp, x + dw1, y, dw2, 'right');
    };

    /* This is pretty much copy+paste from YEP_CoreEngine. */
    Window_Base.prototype.drawActorSimpleStatus = function (actor, x, y, width) {
        var lineHeight = this.lineHeight();
        var xpad = Window_Base._faceWidth + (2 * Yanfly.Param.TextPadding);
        var x2 = x + xpad;
        var width2 = Math.max(180, width - xpad - this.textPadding());
        this.drawActorName(actor, x, y);
        this.drawActorLevel(actor, x, y + lineHeight * 1);
        this.drawActorCP(actor, x, y + lineHeight * 2);
        this.drawActorIcons(actor, x, y + lineHeight * 3);
        this.drawActorClass(actor, x2, y, width2);
        this.drawActorHp(actor, x2, y + lineHeight * 1, width2);
        this.drawActorMp(actor, x2, y + lineHeight * 2, width2);
        if (eval(Yanfly.Param.MenuTpGauge)) {
            this.drawActorTp(actor, x2, y + lineHeight * 3, width2);
        }
    };


})();