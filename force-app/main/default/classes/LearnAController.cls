public with sharing class LearnAController {

    // public enum LearnAField {
    //     Name = 'da'
    // }

    @AuraEnabled(cacheable = true)
    public static Map<String, Object> searchLearnAMultiParam(Map<String, Object> searchParams) {
        String searchQuery = 'SELECT Id, Name, Learn_C__r.Name FROM Learn_A__c';
        Boolean looseMatchMultiPicklist = (Boolean) searchParams.get('Loose_Match_Multi_Picklist__c');
        List<String> conditions = new List<String>();
        List<String> conditionKeys = new List<String>{'Name', 'Phone_Number__c', 'Is_Checked__c', 'Start_Time__c', 'End_Time__c', 'Picklist__c', 'Multi_Picklist__c', 'Learn_C__c'};

        for(String key: conditionKeys) {
            Object value = searchParams.get(key);
            if(value != null) addToCondition(conditions, key, value, looseMatchMultiPicklist);
        }

        if(!conditions.isEmpty()) searchQuery += ' WHERE ' + String.join(conditions, ' AND ');

        System.debug(searchQuery);
        List<Learn_A__c> result = Database.query(searchQuery);
        // return 'Query = ' + searchQuery + '\n , Result = ' + result;

        Map<String, Object> resultWithLogs = new Map<String, Object>();
        resultWithLogs.put('result', result);
        resultWithLogs.put('searchQuery', searchQuery);

        return resultWithLogs;
    }

    // Helper functions ...
    private static void addToCondition(List<String> conditions, String key, Object value, Boolean looseMatchMultiPicklist) {
        String condition = '';
        String escapedValue = String.escapeSingleQuotes(value.toString());
        if(key == 'Start_Time__c') condition = 'Time__c >= ' + escapedValue;
        else if(key == 'End_Time__c') condition = 'Time__c <= ' + escapedValue;
        else if(key == 'Picklist__c' || key == 'Learn_C__c') condition = key + listToStringWithOperator((List<Object>) value);
        else if(key == 'Multi_Picklist__c') {
            if(looseMatchMultiPicklist) condition = key + listToStringWithOperator((List<Object>) value);
            else condition = key + ' = ' + listToStringMultiPicklist((List<Object>) value);
        }
        else if(key == 'Name' || key == 'Phone_Number__c') condition = key + ' LIKE \'%' + escapedValue + '%\'';
        else condition = key + ' = ' + escapedValue;

        conditions.add(condition);
    }

    private static String listToStringWithOperator(List<Object> l) {
        List<String> lFinal = new List<String>();
        for(Object s: l) { 
            String cur = String.escapeSingleQuotes(s.toString());
            if(cur != 'NULL') cur = '\'' + cur + '\'';
            lFinal.add(cur);
        }
        String operator = (lFinal.isEmpty())? ' = null': ' in ';
        String operand = (lFinal.isEmpty())? '': ('(' + String.join(lFinal, ', ') + ')');
        return operator + operand;
    }

    private static String listToStringMultiPicklist(List<Object> l) {
        List<String> lFinal = new List<String>();
        for(Object s: l) lFinal.add(String.escapeSingleQuotes(s.toString()));
        lFinal.sort();
        return '\'' + String.join(lFinal, ';') + '\'';
    }
}