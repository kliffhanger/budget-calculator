var budgetController = (function(){
    var Expenses = function (id,description,value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expenses.prototype.calcPercentage = function(totalIncome){
        if (totalIncome > 0){
        this.percentage = Math.round((this.value / totalIncome)*100);}
        else {
            this.percentage = -1;
        }

    };
    Expenses.prototype.getPecentage = function(){
        return this.percentage;
    };


    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum = sum + cur.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget:0,
        percentage:-1
    };
    return {
        addItem: function(type,des,val) {
            var newItem,ID;
            //create id 
            if (data.allItems[type].length > 0 ){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;}
             else{
                ID = 0;
            } 
            //add to the array based on type
            if(type === 'inc'){
                newItem = new Income(ID,des,val);
            }else{
                newItem = new Expenses(ID,des,val);
            }
            //add the newItem to data
            data.allItems[type].push(newItem);
            //return the newItem
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids,index;
          ids = data.allItems[type].map(function(current){   //map returns new array
            return current.id;

          });  

          index = ids.indexOf(id);
          if (index !== -1) {
              data.allItems[type].splice(index,1);
          }

        },

        calculateBudget: function(){
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            // calculate the budget: income - expense
            data.budget = data.totals.inc - data.totals.exp;
            //calculate the percentage of income
            if(data.totals.inc > 0){
            data.percentage = Math.round((data.totals.exp / data.totals.inc)*100);}
            else{
                data.percentage = -1;
            }
        },

        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });

        },

        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPecentage();
            });
            return allPerc;
        },

        getBudget: function(){
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        test: function () {
            console.log(data);
        }
    }
  
})();

var uiController = (function(){
    var DOMstrings = {
        inputType: '.add__type',
        inputDes: '.add__description',
        inputValue: '.add__value',
        addBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel:'.budget__value',
        incomeLabel:'.budget__income--value',
        expenseLabel:'.budget__expenses--value',
        percentageLabel:'.budget__expenses--percentage',
        container: '.container'

    };
    //get inputs
    return {
        getInputs:function(){
            return{
            type : document.querySelector(DOMstrings.inputType).value,//inc or dec
            dis : document.querySelector(DOMstrings.inputDes).value,
            value :parseFloat( document.querySelector(DOMstrings.inputValue).value)
            };
        },
        addListItem: function(obj, type){
            var html,newHtml,element;

            //create HTML stringsith placeholder
            if(type === 'inc'){
            element=DOMstrings.incomeContainer;
            html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else{
            element = DOMstrings.expensesContainer;
            html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //modify the placeholder
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',obj.value);

            //insert the HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },

        deleteListItem: function(selectorID) {
           var el= document.getElementById(selectorID); //remove a child from parentNode
           el.parentNode.removeChild(el); //both stmt required 

        },

        clearFields: function(){
            var fields, fieldsArr;
            //obtianing input through querySelectorAll in list format
            fields = document.querySelectorAll(DOMstrings.inputDes + ','+ DOMstrings.inputValue);
            //convert list into array using array obj n its slice prototype
            fieldsArr = Array.prototype.slice.call(fields);
            //use a loop to clear 
            fieldsArr.forEach(function(current,index,array){
                current.value = "";
            });
            //get the previous values 'description' n 'value'
            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
          document.querySelector(DOMstrings.budgetLabel).textContent=obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expenseLabel).textContent = obj.totalExp;
        
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },
        getDOMstring : function() {
            return DOMstrings;
        }
    }

})();

var controller = (function(budgetCntrl,uiCntrl){

    var setupEventListener = function() {
        var DOMstrings = uiCntrl.getDOMstring();

        document.querySelector(DOMstrings.addBtn).addEventListener('click', cntrlAddItem);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                cntrlAddItem();
            }
        })
        
        document.querySelector(DOMstrings.container).addEventListener('click', ctrlDeleteItem);
    };

    var updatePercentages = function(){
        //cal percentage
        budgetCntrl.calculatePercentages();

        //read percentage from the budget controller
        var percentages = budgetCntrl.getPercentages();

        //update the ui ith the new percentages
        console.log(percentages);
    };


    var updateBudget = function(){
        //cal the budget
        budgetCntrl.calculateBudget();
        //return the budget
        var budget = budgetCntrl.getBudget();
        //dislay the budget
        uiCntrl.displayBudget(budget);
    };

    var cntrlAddItem = function() {
        var input,newItem;

        //get input from uiController
        input = uiCntrl.getInputs();

        //check for empty values
        if(input.dis !== "" && !isNaN(input.value) && input.value > 0){

            //add budget controllers
            newItem = budgetController.addItem(input.type, input.dis, input.value);

            //ad the item to the UI
            uiCntrl.addListItem(newItem, input.type);

            //clear fields
            uiCntrl.clearFields();

            //cal and update budget
            updateBudget();

            //cal and update percentage
            updatePercentages();
        }

    };

    var ctrlDeleteItem =  function(event) {
        var itemID,splitID,type,ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;  //parentNode--the tags above
        if (itemID) {

            splitID = itemID.split('-'); //finding if inc or exp
            type = splitID[0];
            ID = parseInt(splitID[1]);   //convert as it is string

            //del item from data structure
            budgetCntrl.deleteItem(type, ID);
            //del itm from the UI
            uiCntrl.deleteListItem(itemID);
            //update and show the new budget
            updateBudget();

            //cal and update percentage
            updatePercentages();
        }
     };

    return{
        init: function(){
            console.log('app is running');
            uiCntrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListener();
        }
    };

})(budgetController,uiController);

controller.init();