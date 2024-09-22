public with sharing class SchemaHelper {
    
    @AuraEnabled(cacheable = true)
    public static List<String> getPickListValues(String objectName, String fieldName) {
        List<String> picklistValues = new List<String>();
        for(Schema.PicklistEntry pe: Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap().get(fieldName).getDescribe().getPicklistValues()) picklistValues.add(pe.getLabel());
        return picklistValues;
    }

    @AuraEnabled(cacheable = true)
    public static string getRecordName(Id recordId) {
        try {
            return (String) Database.query('SELECT Id, Name FROM ' + recordId.getSObjectType().getDescribe().getName() + ' WHERE Id=:recordId')[0]?.get('Name');
        } catch (Exception ex) { throw ex; }
    }

}