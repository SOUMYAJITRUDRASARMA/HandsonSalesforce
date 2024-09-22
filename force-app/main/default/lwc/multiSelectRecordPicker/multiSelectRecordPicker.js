import { LightningElement, api, track } from 'lwc';
import getRecordName from '@salesforce/apex/SchemaHelper.getRecordName';

export default class MultiSelectRecordPicker extends LightningElement {
    @api isMultiSelect = !(false)  // Boolean property must default to false ???
    @api objectName = 'Account'
    @api label = 'Accounts'
    @api iconName = 'standard:account'
    @api includeNull = !(false)
    @api value = []
    selectedId
    @track selectedItems = []

    connectedCallback() {
        if(this.value) this.value.forEach(recordId => {
            if (this.isMultiSelect) {
                if (recordId) {
                    getRecordName({ recordId }).then(label => {
                        this.selectedItems = this.selectedItems.filter(item => recordId !== item.name);
                        this.selectedItems.push({
                            type: 'icon',
                            href: `/${recordId}`,
                            recordId: recordId, 
                            name: recordId, label,
                            iconName: this.iconName,
                            alternativeText: this.label,
                            isLink: true
                        });
                        this.sendChangeEvent()
                        // this.selectedItems = JSON.parse(JSON.stringify(this.selectedItems))
                    }).catch(err => console.error(err));
                } else {
                    this.selectedItems = this.selectedItems.filter(item => this.selectedId !== item.name);
                    this.sendChangeEvent()
                }
            }
            this.selectedId = recordId;
        })
    }

    handleChange(evt) {
        let recordId = evt.detail.recordId;
        if (this.isMultiSelect) {
            evt.target.value = null;
            this.refs.picker.clearSelection();
            if (recordId) {
                getRecordName({ recordId }).then(label => {
                    this.selectedItems = this.selectedItems.filter(item => recordId !== item.name);
                    this.selectedItems.push({
                        type: 'icon',
                        href: `/${recordId}`,
                        recordId: recordId, 
                        name: recordId, label,
                        iconName: this.iconName,
                        alternativeText: this.label,
                        isLink: true
                    });
                    this.sendChangeEvent()
                    // this.selectedItems = JSON.parse(JSON.stringify(this.selectedItems))
                }).catch(err => console.error(err));
            } else {
                this.selectedItems = this.selectedItems.filter(item => this.selectedId !== item.name);
                this.sendChangeEvent()
            }
        }
        this.selectedId = recordId;
    }

    handleItemRemove(event) {
        const name = event.detail.item.name;
        this.selectedItems = this.selectedItems.filter(item => name !== item.name);
        this.sendChangeEvent()
    }

    sendChangeEvent() {
        const changeEvent = new CustomEvent('change', {
            detail: {
                recordId: this.selectedItems.map(e => e.recordId)
            }
        });
        this.dispatchEvent(changeEvent);
    }
}