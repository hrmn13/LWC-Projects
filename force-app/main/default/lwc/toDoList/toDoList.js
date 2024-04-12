import { LightningElement,track } from 'lwc';
export default class ToDoList extends LightningElement {
    
    taskName='';
    taskdate=null;
    @track incompleteTaskList=[];
    @track completedTaskList=[];
    handleInput(event){
        let {name,value} = event.target;
        if(name === 'taskName'){
            this.taskName = value;
        }else if(name === 'taskDate'){
            this.taskdate = value;
        }
    }

    handleTaskSave(){
        if(!this.taskName){
            this.template.querySelector('.taskName').setCustomValidity('Please Enter Task Name');
        }else{
            if(!this.taskdate){
                this.taskdate = new Date().toISOString().slice(0,10);
            }
            let task = {
                taskName : this.taskName,
                taskDate : this.taskdate
            }

            if(this.incompleteTaskList.length==0){
                this.incompleteTaskList = [...this.incompleteTaskList, task];
            }else{
                if(this.validateTask(this.incompleteTaskList, task)){
                this.incompleteTaskList = [...this.incompleteTaskList, task];
                let sortedArray = this.sortTasks(this.incompleteTaskList);
                this.incompleteTaskList = [...sortedArray];
                this.resetValues();
            }
            }
            
        }
        
    }

    validateTask(existingTaskArr, inputTask){
        let isValidTask = true;
        let element = this.template.querySelector('.taskNameInput');

        existingTaskArr.find((currItem) => {
            if(currItem.taskName === inputTask.taskName && currItem.taskDate === inputTask.taskDate){
                isValidTask = false;
                element.setCustomValidity('Task is already available');
            }
        });

        if(isValidTask){
            element.setCustomValidity('');
        }

        element.reportValidity();
        return isValidTask;
    }

    deleteIncompleteTask(event){
        let deletedIndex = event.target.dataset.index;
        this.incompleteTaskList.splice(deletedIndex,1);
    }

    completeTask(event){
        //removing
        let deletedIndex = event.target.dataset.index;
        let deletedTask = this.incompleteTaskList.splice(deletedIndex,1); //return deleted array

        this.completedTaskList = [...this.completedTaskList,deletedTask[0]];
        let sortedArray = this.sortTasks(this.completedTaskList);
        this.completedTaskList = [...sortedArray];
    }

    handleTaskReset(){
        this.resetValues();
    }

    sortTasks(inputArr){
        let sortedArray = inputArr.sort((a,b)=>{
            const dateA = new Date(a.taskDate);
            const dateB = new Date(b.taskDate);

            return dateB - dateA;
        });
        return sortedArray;
    }

    resetValues(){
        this.taskName = '';
        this.taskdate = null;
    }

    dragHandler(event){
        event.dataTransfer.setData("index",event.target.dataset.index);
    }

    allowDrop(event){
        event.preventDefault();
    }

    dropHandler(event){
        let index = event.dataTransfer.getData("index");
        let draggedArr = this.incompleteTaskList.splice(index,1);
        this.completedTaskList = [...this.completedTaskList,draggedArr[0]];
        let sortedArr = this.sortTasks(this.completedTaskList);
        this.completedTaskList = [...sortedArr];
    }
}