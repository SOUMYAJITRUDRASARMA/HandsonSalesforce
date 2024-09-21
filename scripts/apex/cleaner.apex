List<String> customObjects = new List<String>{'Learn_A_D_Junction_Object__c', 'Learn_D__c', 'Learn_B__c', 'Learn_A__c', 'Learn_C__c'};
for(String obj: customObjects)
    delete Database.query('SELECT Id FROM ' + obj);