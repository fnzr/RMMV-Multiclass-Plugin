//=============================================================================
// Scene_Menu
// This binds the menu option to a scene
//=============================================================================
(function() {

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
})();