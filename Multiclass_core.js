var multi = {};

(function() {

    var Game_Actor_setup = Game_Actor.prototype.setup;
    Game_Actor.prototype.setup = function (actorId) {
        Game_Actor_setup.call(this, actorId);
        this.initMulticlass();
    };

    Game_Actor.prototype.initMulticlass = function () {
        this._cp = 0;
        this._multiclass = {
            1: 5,
            3: 1,
            4: 2
        };
    }

    Game_Actor.prototype.cp = function () {
        return this._cp;
    }

    Game_Actor.prototype.multiclass = function () {
        return this._multiclass;
    }

    /*	This is a overwrite */
    Game_Actor.prototype.levelUp = function () {
        this._level++;
        this._cp++;
    }

    var pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        pluginCommand.call(this, command, args);

        var actor = $gameActors.actor(1);

        if (command == "PrintCL") {
            $gameMessage.add(String(actor.cp()));
            //$gameMessage.add('?');
        }

        if(command == "PrintClasses"){
            var msg = '';
            for(var classId in actor.multiclass()){
                if(actor.multiclass.hasOwnProperty(classId)) continue;
                msg += $dataClasses[classId].name;
            }
            $gameMessage.add(msg);
        }
    }
})();