/*:
 * @plugindesc Multiclass
 * @author Self
 */

 (function(){

	var Game_Actor_setup = Game_Actor.prototype.setup;
	Game_Actor.prototype.setup = function(actorId) {
   	 Game_Actor_setup.call(this, actorId);
   	 this.initMulticlass();
	};

	Game_Actor.prototype.initMulticlass = function(){
		this._cp = 0;
	}

	Game_Actor.prototype.cp = function(){
		return this._cp;
	}

	/*	This is a overwrite */
	Game_Actor.prototype.levelUp = function(){
		this._level++;
		this._cp++;
	}

	var pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args){
		pluginCommand.call(this,command,args);

		var actor = $gameActors.actor(1);

		if(command == "PrintCL"){
			$gameMessage.add(String(actor.cp()));
			//$gameMessage.add('?');
		}
	}

//=============================================================================
// Window_MenuCommand
// This creates the menu option.
//=============================================================================

var addOriginalCommands = Window_MenuCommand.prototype.addOriginalCommands;
Window_MenuCommand.prototype.addOriginalCommands = function() {
    addOriginalCommands.call(this);
    this.addMulticlassCommand();
};

Window_MenuCommand.prototype.addMulticlassCommand = function() {    
    var text = "Hawt";
    var enabled = true;
    this.addCommand(text, 'multiclass', enabled);
};

//=============================================================================
// Scene_Menu
// This binds the menu option to a scene
//=============================================================================

var createCommandWindow = Scene_Menu.prototype.createCommandWindow;
Scene_Menu.prototype.createCommandWindow = function() {
    createCommandWindow.call(this);
    this._commandWindow.setHandler('multiclass', this.commandPersonal.bind(this));
};

var onPersonalOk = Scene_Menu.prototype.onPersonalOk;
Scene_Menu.prototype.onPersonalOk = function() {
    if (this._commandWindow.currentSymbol() === 'multiclass') {
      SceneManager.push(Scene_MultiClass);
    } else {
      onPersonalOk.call(this);
    }
};

//=============================================================================
// Scene_MultiClass
//=============================================================================

function Scene_MultiClass() {
    this.initialize.apply(this, arguments);
}

Scene_MultiClass.prototype = Object.create(Scene_MenuBase.prototype);
Scene_MultiClass.prototype.constructor = Scene_MultiClass;

Scene_MultiClass.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

Scene_MultiClass.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    //this.createHelpWindow();
    this.createCommandWindow();
    //this.createStatusWindow();
    //this.createItemWindow();
    //this.createCompareWindow();
    //this.refreshActor();
};

Scene_MultiClass.prototype.createCommandWindow = function() {
    this._commandWindow = new Window_MultiClassCommand();
    var win = this._commandWindow;
    //win.y = this._helpWindow.height;
    win.y = 0;
    //win.setHandler('class', this.commandClass.bind(this));    
    //win.setHandler('cancel', this.popScene.bind(this));
    win.setHandler('pagedown', this.nextActor.bind(this));
    win.setHandler('pageup', this.previousActor.bind(this));
    this.addWindow(win);
};

//=============================================================================
// Window_MultiClassCommand
//=============================================================================

function Window_MultiClassCommand() {
    this.initialize.apply(this, arguments);
}

Window_MultiClassCommand.prototype = Object.create(Window_Command.prototype);
Window_MultiClassCommand.prototype.constructor = Window_MultiClassCommand;

Window_MultiClassCommand.prototype.initialize = function() {
    Window_Command.prototype.initialize.call(this, 0, 0);
};

Window_MultiClassCommand.prototype.windowWidth = function() {
    return 240;
};

Window_MultiClassCommand.prototype.numVisibleRows = function() {
    return 4;
};

Window_MultiClassCommand.prototype.itemTextAlign = function() {
    //return Yanfly.Param.CCCTextAlign;
    return 'left';
};

 })();