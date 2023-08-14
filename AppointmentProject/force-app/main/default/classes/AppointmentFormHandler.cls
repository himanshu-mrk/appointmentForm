public class AppointmentFormHandler {
    
    
    @AuraEnabled   //getAvailableTimeSlots method is used to check is there any available slot which is active based on the selected Appointment Date Time
    public static Boolean getAvailableTimeSlots(DateTime selectedDateTime){
        Boolean flag = false;
        try {           
            
            List<Appointment_Slot__c> bookedSlots = [SELECT Id, Appointment_Date__c, Start_Time__c, End_Time__c, isActive__c
                                                     FROM Appointment_Slot__c
                                                     WHERE Start_Time__c<=:selectedDateTime AND End_Time__c>=:selectedDateTime
                                                     AND isActive__c = true];
            if(!bookedSlots.isEmpty()){
                flag = true;
            }
        }
        catch (Exception e) {
            System.debug('The following exception has occurred: ' + e.getMessage());
        }
        return flag;
    }
    
    
    @AuraEnabled  //createAppointment method is used to save an Appointment details on Appointment_Detail__c object
    public static void createAppointment(String subject, String description, String contactId, DateTime appointmentDateTime){
        try {
            Date appointmentDate = date.newinstance(appointmentDateTime.year(), appointmentDateTime.month(), appointmentDateTime.day());
            Appointment_Detail__c appointment = new Appointment_Detail__c();
            appointment.Subject__c = subject;
            appointment.Description__c = description;
            appointment.Contact__c = contactId;
            appointment.Appointment_Time__c = appointmentDateTime;
            appointment.Appointment_Date__c = appointmentDate;
            insert appointment;
        }
        catch(DmlException e) {
            System.debug('The following exception has occurred: ' + e.getMessage());
        }
        
    }
}