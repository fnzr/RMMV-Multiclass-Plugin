var multi = {};


(function() {


    var _DataManager_extractSaveContents = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function (contents) {
        _DataManager_extractSaveContents.call(this,contents);
        $gameActors._data.forEach(function(actor){
            if(!actor) return;
            actor.initMulticlassSkills();
        });
    };


    var _Game_Actor_setup = Game_Actor.prototype.setup;
    Game_Actor.prototype.setup = function (actorId) {
        _Game_Actor_setup.call(this, actorId);
        var classId = this._classId;
        this._multiclass  = {};
        this._multiclass[this._classId] = this._level;
        this._cp = 0;
        //this.increaseLevel(1,3);
        //this.increaseLevel(3,2);
    };

    Game_Actor.prototype.addClass = function(classId){
        if(!this._multiclass[classId]){
            this._multiclass[classId] = 0;
        }
    };

    Game_Actor.prototype.increaseLevel = function(classId, value){
        if(!this._multiclass[classId]){
            this.addClass(classId);
        }
        this._multiclass[classId] += value;
    };

    Game_Actor.prototype.initMulticlassSkills = function(){
        for(var classId in this._multiclass){
            if(classId == this._classId) continue;
            var currentLevel = this._multiclass[classId];
            $dataClasses[classId].learnings.forEach(function(learning){
                if(currentLevel >= learning.level){
                    this.learnSkill(learning.skillId)
                }
            },this);
        }
    };

    Game_Actor.prototype.levelUp = function () {
        this._level++;
        this._cp++;
    };

    Game_Actor.prototype.cp = function () {
        return this._cp;
    };

    Game_Actor.prototype.multiclass = function () {
        return this._multiclass;
    };

    Game_Actor.prototype.getClassLevel = function (classId) {
        return this._multiclass[classId];
    };

    Game_Actor.prototype.upgradeParams = function(classId){
        $dataClasses[classId].params.forEach(function(value, index,paramTable){
            var currentLevel = this._multiclass[classId];
            var previous, current;
            if ($dataClasses[classId].baseParamFormula[index] !== '') {
                var formula = $dataClasses[classId].baseParamFormula[index];
                //Yanfly's function tests level = level || this.level
                //String(level) is a hack because Javascript evaluates 0 == false, so the minimum level we can obtain
                //normally is 1 (this.level)
                previous = this.classBaseParamFormula(formula, index,String(currentLevel-1));
                current = this.classBaseParamFormula(formula, index,currentLevel);
            }else{
                previous = currentLevel == 1 ? 0 : paramTable[index][currentLevel-1];
                current = paramTable[index][currentLevel];
            }
            var increase = current - previous;
            this.setParam(index,this.param(index) + increase);
        },this);
    };

    Game_Actor.prototype.learnSkills = function(classId){
        var currentLevel = this._multiclass[classId];
        $dataClasses[classId].learnings.forEach(function(learning){
            if(currentLevel == learning.level){
                this.learnSkill(learning.skillId)
            }
        },this);
    };

    Game_Actor.prototype.levelUpClass = function(classId){
        if(this._cp > 0) this._cp--;
        this.increaseLevel(classId,1);
        this.upgradeParams(classId);
        this.learnSkills(classId);
    };

    Game_Actor.prototype.paramBase = function(paramId) {
        return this.currentClass().params[paramId][1];
    };

    var pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        pluginCommand.call(this, command, args);

        var actor = $gameActors.actor(1);

        if (command == "PrintCL") {
            $gameMessage.add(String(actor.cp()));
            //$gameMessage.add('?');
        }

        if(command == "GrantLevel"){
            actor.levelUpClass(5);
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