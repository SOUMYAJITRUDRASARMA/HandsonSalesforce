import { api, LightningElement } from 'lwc';

export default class LearnASearchResultCard extends LightningElement {
    @api entity

    navigateToRecordPage() {
        const selectEvent = new CustomEvent('view', {
            detail: this.entity.Id, 
            newTab: false
        });
        this.dispatchEvent(selectEvent);
    }
    
    navigateToRecordPageInNewTab() {
        const selectEvent = new CustomEvent('view', {
            detail: this.entity.Id, 
            newTab: true
        });
        this.dispatchEvent(selectEvent);
    }

    get isParentAvailable() {
        return this.entity.Learn_C__r != null
    }
}