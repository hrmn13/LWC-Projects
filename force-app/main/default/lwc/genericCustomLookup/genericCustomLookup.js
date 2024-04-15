import { LightningElement, api, wire, track } from 'lwc';
import getsObjectList from '@salesforce/apex/GenericCustomLookupCtrl.getsObjectList';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
const DELAY = 300;
export default class GenericCustomLookup extends LightningElement {
    
    searchkey;
    timeoutId;
    hasRecords=false;
    

    @api label = 'Search Account';
    @api placeholder = 'Search Accounts';
    @api sObjectApiName = 'Account';
    
    @track sobjectList = [];
    @track selectedrecords = [];

    @wire (getsObjectList, {
    searchkey : '$searchkey',
    sObjectApiName : '$sObjectApiName'
    }) wired_sObjectResult({data,error}){
        try{
            if(data){
            this.sobjectList = data;
            this.hasRecords = this.sobjectList.length>0 ? true : false;
        }else if(error){
            this.showToast('Error !', JSON.stringify(error), 'error');
        }
        }catch(error){
            console.error(error)
            this.showToast('Error !', JSON.stringify(error), 'error');
        }
        
    }

    changeHandler(event){
        clearTimeout(this.timeoutId);
        let value = event.target.value; 
        this.timeoutId = setTimeout(() => {
           this.searchkey = value
        }, DELAY);
    }

    clickHandler(event){
        
        try{
            let selectedRecordId = event.target.getAttribute('data-recid');
            let selectedrecord = this.sobjectList.find( (currItem) =>
                currItem.Id === selectedRecordId
            );
            if(this.validatePill(selectedRecordId)){
                if(selectedrecord){
                    let pill = {
                        type: 'icon',
                        label: selectedrecord.Name,
                        name: selectedrecord.Id,
                        iconName: 'standard:account',
                        alternativeText: selectedrecord.Name
                    }
            
                    this.selectedrecords = [...this.selectedrecords, pill];
                }  
            }
             
        }catch(error){
            this.showToast('Error !', JSON.stringify(error), 'error');
        }
        
    }

    validatePill(selectedRecordId){
        let isValid = true;

        let duplicateRecord = this.selectedrecords.find( (currItem) =>
                currItem.name === selectedRecordId
        );
        if(duplicateRecord){
            isValid = false;
            this.showToast('Error !', 'Pill already added.', 'error');
        }

        return isValid;

    }

    handleItemRemove(event) {
        const index = event.detail.index;
        this.selectedrecords.splice(index, 1);
    }

    showToast(title, message, variant){
        this.dispatchEvent(new ShowToastEvent({
           title: title,
           message: message,
           variant: variant
       }));
    }

}