import { LightningElement,track,wire } from 'lwc';
import { createRecord, updateRecord, deleteRecord } from 'lightning/uiRecordApi';
import TASK_MANAGER_OBJECT from '@salesforce/schema/Task_Manager__c';
import TASK_ID from '@salesforce/schema/Task_Manager__c.Id';
import TASK_NAME from '@salesforce/schema/Task_Manager__c.Name';
import TASK_DATE from '@salesforce/schema/Task_Manager__c.Task_Date__c';
import TASK_COMPLETED from '@salesforce/schema/Task_Manager__c.Is_Completed__c';
import TASK_COMPLETED_DATE from '@salesforce/schema/Task_Manager__c.Completed_Date__c';
import getInCompleteTaskList from '@salesforce/apex/TaskManagerController.getInCompleteTaskList';
import getCompletedTaskList from '@salesforce/apex/TaskManagerController.getCompletedTaskList';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
export default class ToDoList extends LightningElement {
    
    taskName='';
    taskdate=null;
    @track incompleteTaskList=[];
    @track completedTaskList=[];
    incompleteTaskResult;
    completedTaskResult;
    handleInput(event){
        let {name,value} = event.target;
        if(name === 'taskName'){
            this.taskName = value;
        }else if(name === 'taskDate'){
            this.taskdate = value;
        }
    }

    @wire(getInCompleteTaskList) wire_getInCompleteTaskList(result){
        this.incompleteTaskResult = result;
        let {error,data} = result;
        if(data){
         this.incompleteTaskList = data.map((currItem) => ({
                taskId : currItem.Id,
                taskName : currItem.Name,
                taskDate : currItem.Task_Date__c
        }));
        }else if(error){
            this.showToast('Error',error,'error');
        }
    }

    @wire(getCompletedTaskList) wire_getCompletedTaskList(result){
        this.completedTaskResult = result;
        let {error,data} = result;
        if(data){
         this.completedTaskList = data.map((currItem) => ({
                taskId : currItem.Id,
                taskName : currItem.Name,
                taskDate : currItem.Task_Date__c
        }));
        }else if(error){
            this.showToast('Error',error,'error');
        }
    }

    handleTaskSave(){
            if(!this.taskdate){
                this.taskdate = new Date().toISOString().slice(0,10);
            }
            if(this.validateTask()){
                let inputFields ={}
                inputFields[TASK_NAME.fieldApiName] = this.taskName;
                inputFields[TASK_DATE.fieldApiName] = this.taskdate;
                inputFields[TASK_COMPLETED.fieldApiName] = false;
                inputFields[TASK_COMPLETED_DATE.fieldApiName] = null;
                
                let inputRecord = {
                    apiName : TASK_MANAGER_OBJECT.objectApiName,
                    fields: inputFields
                }

                createRecord(inputRecord).then(()=>{
                    this.showToast('Success','Record Created Successfully','success');
                    refreshApex(this.incompleteTaskResult);
                }).catch((error)=>{
                    this.showToast('Error',error,'error');
                })
            }
    }

    validateTask(){
        let isValidTask = true;
        let element = this.template.querySelector('.taskNameInput');

        if(!this.taskName){
            isValidTask = false;
        }else{
            let matchedTask = this.incompleteTaskList.find(
                                        (currItem) => 
                                            currItem.taskName === this.taskName && 
                                            currItem.taskDate === this.taskdate
                                        );   
            if(matchedTask){
                isValidTask = false; 
                element.setCustomValidity('Task is already available');
            }
        }
        
        if(isValidTask){
            element.setCustomValidity('');
        }

        element.reportValidity();
        return isValidTask;
    }

    deleteIncompleteTask(event){
        let deleteRecordId = event.target.dataset.recordid;
        
        deleteRecord(deleteRecordId).then((result)=>{
                this.showToast('Success','Record Deleted Successfully','success');
                refreshApex(this.incompleteTaskResult);
        }).catch((error)=>{
                this.showToast('Error',error,'error');
        });
        
    }

    completeTask(event){
        let updateRecordId = event.target.dataset.recordid;
        this.updateTask(updateRecordId);  
    }

    updateTask(recordId){
        let inputFields ={};
        inputFields[TASK_ID.fieldApiName] = recordId;
        inputFields[TASK_COMPLETED.fieldApiName] = true;
        inputFields[TASK_COMPLETED_DATE.fieldApiName] = new Date().toISOString().slice(0,10);
        
        const inputRecord = {
            fields: inputFields
        }

        updateRecord(inputRecord).then(()=>{
                this.showToast('Success','Record Updated Successfully','success');
                refreshApex(this.incompleteTaskResult);
                refreshApex(this.completedTaskResult);
        }).catch((error)=>{
                this.showToast('Error',error,'error');
        });
    }

    handleTaskReset(){
        this.resetValues();
    }

    resetValues(){
        this.taskName = '';
        this.taskdate = null;
    }

    dragHandler(event){
        event.dataTransfer.setData("recordid",event.target.dataset.recordid);
    }

    allowDrop(event){
        event.preventDefault();
    }

    dropHandler(event){
        let recordid = event.dataTransfer.getData("recordid");
        this.updateTask(recordid);
    } 

    showToast(title, message, variant){
            this.dispatchEvent(new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        }));
    }
}