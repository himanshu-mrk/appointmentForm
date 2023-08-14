import { LightningElement, api } from 'lwc';
import APPOINTMENTDETAIL_OBJECT from '@salesforce/schema/Appointment_Detail__c';
import CONTACT from '@salesforce/schema/Appointment_Detail__c.Contact__c';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getAvailableTimeSlots from '@salesforce/apex/AppointmentFormHandler.getAvailableTimeSlots';
import createAppointment from '@salesforce/apex/AppointmentFormHandler.createAppointment';

export default class AppointmentForm extends LightningElement {

    contactObjectApi = APPOINTMENTDETAIL_OBJECT; //gets the API name of Appointment Detail object
    contactField = CONTACT; //gets Contact lookup from Appoitment Detail
    privateContactId;
    subject;
    appointmentDateTime = new Date();;
    description;
    isSlotAvailable = false;

    @api
    get contactId() {
        return this.privateContactId;
    }

    set contactId(value) {
        this.privateContactId = value;
    }

    showErrorToast(message) { //method to show error toast
        const evt = new ShowToastEvent({
            title: 'Error',
            message: message,
            variant: 'error',
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);
    }

    showSuccessToast(message) { //method to show success toast
        const event = new ShowToastEvent({
            title: 'Success',
            message: message,
            variant: 'success',
            mode: 'dismissable'
        });
        this.dispatchEvent(event);
    }

    onChangeRecordEditForm(event) {
        this.privateContactId = event.target.value;
        console.log('ContactId = ', this.privateContactId);
    }

    onSubjectChange(event) {
        this.subject = event.target.value;
    }

    handleSave() { //Validates the data from UI and if data is valid using server call save the appointment details
        if (this.privateContactId == undefined || this.privateContactId == '') {
            this.showErrorToast('Please select a Contact to continue');
            return;
        }
        if (this.subject == undefined || this.subject == '') {
            this.showErrorToast('Please add a subject to continue');
            return;
        }
        if (this.appointmentDateTime == undefined || this.appointmentDateTime == '') {
            this.showErrorToast('Please select a Appointment Date and Time to continue');
            return;
        }
        if (this.description == undefined || this.description == '') {
            this.showErrorToast('Please add a description to continue');
            return;
        }
        if(!this.isSlotAvailable){
            this.showErrorToast('The selected slot is not available please select another slot');
            return;
        }

        createAppointment({subject: this.subject, description: this.description, contactId: this.privateContactId, appointmentDateTime: this.appointmentDateTime})
            .then(result => {
                this.refreshComponent();
                this.showSuccessToast('Appointment has been successfully booked');
            })
            .catch(error =>{
                console.log('This is error ', error)
            })

    }
    
    refreshComponent(){ //use to reset the enterned data on UI
        this.subject = '';
        this.description = '';
        this.appointmentDateTime = '';
        this.template.querySelector('.dateTime').value = '';
        this.contactId = '';        
    }

    onDateTimeChange(event) {
        this.appointmentDateTime = new Date(event.target.value);
        this.checkIsAppointmentSlotAvailable();
    }

    checkIsAppointmentSlotAvailable() { //checks that on selected date time is Appointment slot available using server call
        getAvailableTimeSlots({selectedDateTime: this.appointmentDateTime})
            .then(result => {
                console.log('RESULT = ', result);
                if(result){
                    this.isSlotAvailable = true;
                }
                else{
                    this.isSlotAvailable = false;
                }
            })
            .catch(error => {
                console.log('This is error ', error)
            })
    }

    onDescriptionChange(event) {
        this.description = event.target.value;
    }
}