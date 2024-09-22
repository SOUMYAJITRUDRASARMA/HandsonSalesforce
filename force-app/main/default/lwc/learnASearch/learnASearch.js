import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getPickListValues from '@salesforce/apex/SchemaHelper.getPickListValues';
import searchLearnAMultiParam from '@salesforce/apex/LearnAController.searchLearnAMultiParam'

import LEARN_A from '@salesforce/schema/Learn_A__c';

import NAME_FIELD from '@salesforce/schema/Learn_A__c.Name';
import CHECKED_FIELD from '@salesforce/schema/Learn_A__c.Is_Checked__c';
import PHONE_NUMBER_FIELD from '@salesforce/schema/Learn_A__c.Phone_Number__c';
import LOCATION_FIELD from '@salesforce/schema/Learn_A__c.Location__c';
import TIME_FIELD from '@salesforce/schema/Learn_A__c.Time__c';
import PICKLIST_FIELD from '@salesforce/schema/Learn_A__c.Picklist__c';
import MULTI_PICKLIST_FIELD from '@salesforce/schema/Learn_A__c.Multi_Picklist__c';
import PARENT_FIELD from '@salesforce/schema/Learn_A__c.Learn_C__c'

// import LEARN_C_FIELD from '@salesforce/schema/Learn_A__c.Learn_C__c';

export default class LearnASearch extends NavigationMixin(LightningElement) {

    @track searchCriteria = {}
    @track enabledSearchCriteria = []
    
    @track picklistValues = []
    @track multiPicklistValues = []

    @track result = null
    @track errors = []

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: 'pester' // Use 'dismissable' for manual dismissal or 'pester' for auto-dismiss
        });
        this.dispatchEvent(evt);
    }

    connectedCallback() {
        this.handleReset()
        this.addNullToList(this.picklistValues)
    }

    @wire(getPickListValues, {objectName: LEARN_A.objectApiName, fieldName: PICKLIST_FIELD.fieldApiName})
    wiredPicklistValues({error, data}) {
        if(data) data.forEach(e => this.picklistValues.push({label: e, value: e}))
        else if(error) { this.errors.push(error); this.showToast('Error', error.body.message, 'error') }
    }
    
    @wire(getPickListValues, {objectName: LEARN_A.objectApiName, fieldName: MULTI_PICKLIST_FIELD.fieldApiName})
    wiredMultiPicklistValues({error, data}) {
        if(data) data.forEach(e => this.multiPicklistValues.push({label: e, value: e}))
        else if(error) { this.errors.push(error); this.showToast('Error', error.body.message, 'error') }
    }

    handleInputChange(event) {
        console.log('Input change triggered !!!')
        console.log(event)
        const field = event.target.dataset.field
        let value = null
        if(field == CHECKED_FIELD.fieldApiName || field == this.LOOSE_MATCH_MULTI_PICKLIST_FIELD) value = event.target.checked
        else if(field == PICKLIST_FIELD.fieldApiName || field == MULTI_PICKLIST_FIELD.fieldApiName) value = event.detail.value
        else if(field == PARENT_FIELD.fieldApiName) value = event.detail.recordId
        else value = event.target.value

        console.log(this.searchCriteria[field])
        this.searchCriteria[field] = value
        console.log(field)
        console.log(value)
    }

    handleToggleChange(event) {
        const field = event.target.dataset.field
        const value = event.target.checked
        
        if(value) this.enabledSearchCriteria.push(field)
        else this.enabledSearchCriteria = this.enabledSearchCriteria.filter(e => e !== field)
        console.log(`Toggle change -> Field = '${field}' , Value = '${value}' , list = ${this.enabledSearchCriteria}`)
    }

    handleSearch() {
        const searchCriteriaToCall = {}
        this.enabledSearchCriteria.forEach(enabledField => {
            if(enabledField == TIME_FIELD.fieldApiName) {
                searchCriteriaToCall[this.START_TIME_FIELD] = this.searchCriteria[this.START_TIME_FIELD]
                searchCriteriaToCall[this.END_TIME_FIELD] = this.searchCriteria[this.END_TIME_FIELD]
            } else if(typeof(this.searchCriteria[enabledField]) == 'boolean' || this.searchCriteria[enabledField]) {
                searchCriteriaToCall[enabledField] = this.searchCriteria[enabledField]
            }
        })
        console.log('searchCriteriaToCall')
        console.log(JSON.stringify(searchCriteriaToCall))

        searchLearnAMultiParam({searchParams: searchCriteriaToCall})
        .then(result => {
            this.result = result.result
            console.log(result.searchQuery)
            console.log(this.result)
            this.showToast('Success', `Found ${this.result.length} result(s)`, 'success')
        }).catch(error => {
            console.error(error)
            this.showToast('Error', `${error.body.exceptionType}: \n${error.body.stackTrace}`, 'error')
        })
    }

    handleReset() {
        this.searchCriteria = {}
        this.searchCriteria[NAME_FIELD.fieldApiName] = ''
        this.searchCriteria[PHONE_NUMBER_FIELD.fieldApiName] = ''
        this.searchCriteria[CHECKED_FIELD.fieldApiName] = false
        // this.searchCriteria[LOCATION_FIELD.fieldApiName] = false
        this.searchCriteria[this.START_TIME_FIELD] = null
        this.searchCriteria[this.END_TIME_FIELD] = null
        this.searchCriteria[PICKLIST_FIELD.fieldApiName] = []
        this.searchCriteria[MULTI_PICKLIST_FIELD.fieldApiName] = []
        this.searchCriteria[this.LOOSE_MATCH_MULTI_PICKLIST_FIELD] = false
        this.searchCriteria[PARENT_FIELD.fieldApiName] = []

        this.enabledSearchCriteria = [NAME_FIELD.fieldApiName, PHONE_NUMBER_FIELD.fieldApiName, this.LOOSE_MATCH_MULTI_PICKLIST_FIELD]
    }

    navigateToRecordPage(event) {
        const recordId = event.detail;
        const openInNewTab = event.newTab;
        console.log(`Navigating to ID = ${recordId}`)

        const objDetails = {
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: 'Learn__A_c',
                actionName: 'view'
            }
        }

        if(!openInNewTab) this[NavigationMixin.Navigate](objDetails);
        else this[NavigationMixin.GenerateUrl](objDetails).then(url => window.open(url, "_blank"))
    }

    // Helper functions ...
    addNullToList(l) { l.push({label: 'NULL', value: 'NULL', class: 'null-option'}) }


    // Result getters ...
    get notYetSearched() { return this.result === null }
    get resultEmpty() { return this.result !== null && this.result.length == 0 }

    // Custom LWC fields ...
    START_TIME_FIELD = 'Start_' + TIME_FIELD.fieldApiName;
    END_TIME_FIELD = 'End_' + TIME_FIELD.fieldApiName;
    LOOSE_MATCH_MULTI_PICKLIST_FIELD = 'Loose_Match_' + MULTI_PICKLIST_FIELD.fieldApiName;

    // Value getters ...
    get get_NAME_FIELD_value() { return this.searchCriteria[NAME_FIELD.fieldApiName]; }
    get get_CHECKED_FIELD_value() { return this.searchCriteria[CHECKED_FIELD.fieldApiName]; }
    get get_PHONE_NUMBER_FIELD_value() { return this.searchCriteria[PHONE_NUMBER_FIELD.fieldApiName]; }
    get get_LOCATION_FIELD_value() { return this.searchCriteria[LOCATION_FIELD.fieldApiName]; }
    get get_TIME_FIELD_value() { return this.searchCriteria[TIME_FIELD.fieldApiName]; }
    get get_START_TIME_FIELD_value() { return this.searchCriteria[this.START_TIME_FIELD]; }
    get get_END_TIME_FIELD_value() { return this.searchCriteria[this.END_TIME_FIELD]; }
    get get_PICKLIST_FIELD_value() { return this.searchCriteria[PICKLIST_FIELD.fieldApiName]; }
    get get_MULTI_PICKLIST_FIELD_value() { return this.searchCriteria[MULTI_PICKLIST_FIELD.fieldApiName]; }
    get get_LOOSE_MATCH_MULTI_PICKLIST_FIELD_value() { return this.searchCriteria[this.LOOSE_MATCH_MULTI_PICKLIST_FIELD]; }
    get get_PARENT_FIELD_value() { return this.searchCriteria[PARENT_FIELD.fieldApiName]; }

    // Enabled getters ...
    get get_enabled_CHECKED_FIELD_value() { return this.enabledSearchCriteria.includes(CHECKED_FIELD.fieldApiName); }
    get get_enabled_LOCATION_FIELD_value() { return this.enabledSearchCriteria.includes(LOCATION_FIELD.fieldApiName); }
    get get_enabled_TIME_FIELD_value() { return this.enabledSearchCriteria.includes(TIME_FIELD.fieldApiName); }
    get get_enabled_PICKLIST_FIELD_value() { return this.enabledSearchCriteria.includes(PICKLIST_FIELD.fieldApiName); }
    get get_enabled_MULTI_PICKLIST_FIELD_value() { return this.enabledSearchCriteria.includes(MULTI_PICKLIST_FIELD.fieldApiName); }
    get get_enabled_PARENT_FIELD_value() { return this.enabledSearchCriteria.includes(PARENT_FIELD.fieldApiName); }

    // Api field getters ...
    get get_NAME_FIELD() { return NAME_FIELD.fieldApiName; }
    get get_CHECKED_FIELD() { return CHECKED_FIELD.fieldApiName; }
    get get_PHONE_NUMBER_FIELD() { return PHONE_NUMBER_FIELD.fieldApiName; }
    get get_LOCATION_FIELD() { return LOCATION_FIELD.fieldApiName; }
    get get_TIME_FIELD() { return TIME_FIELD.fieldApiName; }
    get get_START_TIME_FIELD() { return this.START_TIME_FIELD; }
    get get_END_TIME_FIELD() { return this.END_TIME_FIELD; }
    get get_PICKLIST_FIELD() { return PICKLIST_FIELD.fieldApiName; }
    get get_MULTI_PICKLIST_FIELD() { return MULTI_PICKLIST_FIELD.fieldApiName; }
    get get_LOOSE_MATCH_MULTI_PICKLIST_FIELD() { return this.LOOSE_MATCH_MULTI_PICKLIST_FIELD; }
    get get_PARENT_FIELD() { return PARENT_FIELD.fieldApiName; }

}